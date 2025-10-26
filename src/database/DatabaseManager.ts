import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const DATABASE_NAME = 'RenderizarParaLucrarDB.db';

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
    
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);

    console.log('Banco de dados aberto com sucesso');

    // Executar criação de tabelas
    await database.execAsync(createTablesSQL);
    console.log('Tabelas criadas com sucesso');

    // Inserir dados iniciais
    await database.execAsync(insertInitialDataSQL);
    console.log('Dados iniciais inseridos');

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
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
    const photosResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM photos') as any;
    const totalPhotos = photosResult?.count || 0;

    // Fotos renderizadas (que têm pelo menos uma renderização AR)
    const renderedResult = await db.getFirstAsync(
      'SELECT COUNT(DISTINCT photo_id) as count FROM ar_renders'
    ) as any;
    const renderedPhotos = renderedResult?.count || 0;

    // Total de usuários
    const usersResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM users') as any;
    const totalUsers = usersResult?.count || 0;

    // Total de sessões AR
    const sessionsResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM ar_sessions') as any;
    const totalSessions = sessionsResult?.count || 0;

    // Tamanho do banco (estimativa)
    let databaseSize = '0 KB';
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
      const stats = await FileSystem.getInfoAsync(dbPath);
      if (stats.exists && stats.size) {
        const sizeInKB = Math.round(stats.size / 1024);
        databaseSize = `${sizeInKB} KB`;
      }
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
    
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM activity_logs');
      await db.runAsync('DELETE FROM ar_renders');
      await db.runAsync('DELETE FROM ar_sessions');
      await db.runAsync('DELETE FROM photo_tags');
      await db.runAsync('DELETE FROM photo_metadata');
      await db.runAsync('DELETE FROM photos');
      await db.runAsync('DELETE FROM users WHERE id != 1'); // Manter usuário padrão
      
      // Reset auto-increment
      await db.runAsync('DELETE FROM sqlite_sequence');
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
    const sourcePath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = `${FileSystem.documentDirectory}backup_${timestamp}.db`;
    
    await FileSystem.copyAsync({
      from: sourcePath,
      to: exportPath
    });
    console.log('Banco exportado para:', exportPath);
    
    return exportPath;
  } catch (error) {
    console.error('Erro ao exportar banco:', error);
    throw error;
  }
};

// Função para importar banco de dados
export const importDatabase = async (): Promise<void> => {
  try {
    // Por enquanto, apenas simulamos a importação
    // Em uma implementação real, você usaria um file picker do Expo
    console.log('Funcionalidade de importação será implementada');
    
    // Exemplo de implementação:
    // const result = await DocumentPicker.getDocumentAsync({ type: 'application/x-sqlite3' });
    // if (result.type === 'success') {
    //   const targetPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    //   await closeDatabase();
    //   await FileSystem.copyAsync({ from: result.uri, to: targetPath });
    //   await initializeDatabase();
    // }
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
    const result = await db.getAllAsync(query, params);
    return result;
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
    await db.runAsync(
      'INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)',
      [userId, actionType, description]
    );
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
};