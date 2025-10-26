import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

// Configuração do SQLite
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'RenderizarParaLucrarDB.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAYNAME = 'Renderizar Para Lucrar Database';
const DATABASE_SIZE = 200000;

let database: SQLite.SQLiteDatabase;

// Schema normalizado até a 5ª Forma Normal (5NF)
const createTablesSQL = `
  -- Tabela de usuários
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela principal de fotos
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uri TEXT NOT NULL,
    name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de metadados das fotos (separada para normalização)
  CREATE TABLE IF NOT EXISTS photo_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE
  );

  -- Tabela de sessões AR
  CREATE TABLE IF NOT EXISTS ar_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  -- Tabela de renderizações AR (relacionamento entre sessões e fotos)
  CREATE TABLE IF NOT EXISTS ar_renders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    rendered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    render_duration INTEGER DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES ar_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    UNIQUE(session_id, photo_id)
  );

  -- Tabela de tags (separada para normalização)
  CREATE TABLE IF NOT EXISTS photo_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    UNIQUE(photo_id, tag_name)
  );

  -- Tabela de configurações do sistema
  CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de logs de atividades
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  );

  -- Índices para otimização
  CREATE INDEX IF NOT EXISTS idx_photos_timestamp ON photos (timestamp);
  CREATE INDEX IF NOT EXISTS idx_ar_renders_photo_id ON ar_renders (photo_id);
  CREATE INDEX IF NOT EXISTS idx_ar_renders_session_id ON ar_renders (session_id);
  CREATE INDEX IF NOT EXISTS idx_photo_tags_photo_id ON photo_tags (photo_id);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs (created_at);
`;

// Dados iniciais
const insertInitialDataSQL = `
  INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Usuario Padrão', 'usuario@exemplo.com');
  INSERT OR IGNORE INTO system_config (config_key, config_value) VALUES 
    ('app_version', '1.0.0'),
    ('ar_quality', 'high'),
    ('auto_backup', 'true'),
    ('max_photos', '1000');
`;

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Inicializando banco de dados...');
    
    database = await SQLite.openDatabase({
      name: DATABASE_NAME,
      version: DATABASE_VERSION,
      displayName: DATABASE_DISPLAYNAME,
      size: DATABASE_SIZE,
    });

    console.log('Banco de dados aberto com sucesso');

    // Executar criação de tabelas
    await database.executeSql(createTablesSQL);
    console.log('Tabelas criadas com sucesso');

    // Inserir dados iniciais
    await database.executeSql(insertInitialDataSQL);
    console.log('Dados iniciais inseridos');

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.close();
    console.log('Banco de dados fechado');
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    throw new Error('Banco de dados não está inicializado');
  }
  return database;
};

// Função para obter estatísticas do banco
export const getDatabaseStats = async () => {
  try {
    const db = getDatabase();
    
    // Total de fotos
    const photosResult = await db.executeSql('SELECT COUNT(*) as count FROM photos');
    const totalPhotos = photosResult[0].rows.item(0).count;

    // Fotos renderizadas (que têm pelo menos uma renderização AR)
    const renderedResult = await db.executeSql(
      'SELECT COUNT(DISTINCT photo_id) as count FROM ar_renders'
    );
    const renderedPhotos = renderedResult[0].rows.item(0).count;

    // Total de usuários
    const usersResult = await db.executeSql('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].rows.item(0).count;

    // Total de sessões AR
    const sessionsResult = await db.executeSql('SELECT COUNT(*) as count FROM ar_sessions');
    const totalSessions = sessionsResult[0].rows.item(0).count;

    // Tamanho do banco (estimativa)
    let databaseSize = '0 KB';
    try {
      const dbPath = `${RNFS.DocumentDirectoryPath}/${DATABASE_NAME}`;
      const stats = await RNFS.stat(dbPath);
      const sizeInKB = Math.round(stats.size / 1024);
      databaseSize = `${sizeInKB} KB`;
    } catch (error) {
      console.log('Não foi possível obter o tamanho do banco:', error);
    }

    return {
      totalPhotos,
      renderedPhotos,
      totalUsers,
      totalSessions,
      databaseSize,
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
};

// Função para limpar todos os dados
export const clearAllData = async (): Promise<void> => {
  try {
    const db = getDatabase();
    
    await db.transaction(async (tx) => {
      await tx.executeSql('DELETE FROM activity_logs');
      await tx.executeSql('DELETE FROM ar_renders');
      await tx.executeSql('DELETE FROM ar_sessions');
      await tx.executeSql('DELETE FROM photo_tags');
      await tx.executeSql('DELETE FROM photo_metadata');
      await tx.executeSql('DELETE FROM photos');
      await tx.executeSql('DELETE FROM users WHERE id != 1'); // Manter usuário padrão
      
      // Reset auto-increment
      await tx.executeSql('DELETE FROM sqlite_sequence');
    });

    console.log('Todos os dados foram limpos');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
};

// Função para exportar banco de dados
export const exportDatabase = async (): Promise<string> => {
  try {
    const sourcePath = `${RNFS.DocumentDirectoryPath}/${DATABASE_NAME}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = `${RNFS.DownloadDirectoryPath}/backup_${timestamp}.db`;
    
    await RNFS.copyFile(sourcePath, exportPath);
    console.log('Banco exportado para:', exportPath);
    
    return exportPath;
  } catch (error) {
    console.error('Erro ao exportar banco:', error);
    throw error;
  }
};

// Função para importar banco de dados
export const importDatabase = async (importPath?: string): Promise<void> => {
  try {
    // Por enquanto, apenas simulamos a importação
    // Em uma implementação real, você usaria um file picker
    console.log('Funcionalidade de importação será implementada');
    
    // Exemplo de implementação:
    // const sourcePath = importPath || await selectFile();
    // const targetPath = `${RNFS.DocumentDirectoryPath}/${DATABASE_NAME}`;
    // await closeDatabase();
    // await RNFS.copyFile(sourcePath, targetPath);
    // await initializeDatabase();
  } catch (error) {
    console.error('Erro ao importar banco:', error);
    throw error;
  }
};

// Função para executar queries personalizadas
export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    const db = getDatabase();
    const result = await db.executeSql(query, params);
    
    const rows: any[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      rows.push(result[0].rows.item(i));
    }
    
    return rows;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
};

// Função para logging de atividades
export const logActivity = async (
  userId: number | null,
  actionType: string,
  description: string
): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(
      'INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)',
      [userId, actionType, description]
    );
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
};