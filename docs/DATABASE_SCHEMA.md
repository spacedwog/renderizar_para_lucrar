# 🗄️ Database Schema - 5th Normal Form (5NF)

Este documento detalha o schema do banco de dados SQLite3 normalizado até a 5ª Forma Normal (5NF) usado na aplicação Renderizar para Lucrar.

## 📊 Visão Geral

O banco de dados foi projetado seguindo os princípios de normalização até a 5NF para:
- Eliminar redundância de dados
- Garantir integridade referencial
- Otimizar consultas e atualizações
- Facilitar manutenção e escalabilidade

## 🏗️ Estrutura das Tabelas

### 👤 users
Tabela principal de usuários do sistema.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do usuário
- `name`: Nome completo do usuário
- `email`: Email único do usuário
- `created_at`: Data/hora de criação da conta

### 📸 photos
Tabela principal das fotos capturadas.

```sql
CREATE TABLE photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uri TEXT NOT NULL,
    name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único da foto
- `uri`: Caminho/URI da imagem no sistema
- `name`: Nome do arquivo da foto
- `timestamp`: Data/hora da captura

### 📏 photo_metadata
Metadados das fotos (separado para normalização).

```sql
CREATE TABLE photo_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único do metadado
- `photo_id`: Referência à foto (FK)
- `width`: Largura da imagem em pixels
- `height`: Altura da imagem em pixels
- `size`: Tamanho do arquivo em bytes

### 🎭 ar_sessions
Sessões de renderização AR.

```sql
CREATE TABLE ar_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único da sessão
- `user_id`: Referência ao usuário (FK)
- `created_at`: Data/hora de início da sessão

### 🌟 ar_renders
Registros de renderização AR (relacionamento entre sessões e fotos).

```sql
CREATE TABLE ar_renders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    photo_id INTEGER NOT NULL,
    rendered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    render_duration INTEGER DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES ar_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    UNIQUE(session_id, photo_id)
);
```

**Campos:**
- `id`: Identificador único da renderização
- `session_id`: Referência à sessão AR (FK)
- `photo_id`: Referência à foto renderizada (FK)
- `rendered_at`: Data/hora da renderização
- `render_duration`: Duração da renderização em ms

### 🏷️ photo_tags
Tags das fotos (sistema de etiquetagem).

```sql
CREATE TABLE photo_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    tag_name TEXT NOT NULL,
    FOREIGN KEY (photo_id) REFERENCES photos (id) ON DELETE CASCADE,
    UNIQUE(photo_id, tag_name)
);
```

**Campos:**
- `id`: Identificador único da tag
- `photo_id`: Referência à foto (FK)
- `tag_name`: Nome da tag

### ⚙️ system_config
Configurações do sistema.

```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único da configuração
- `config_key`: Chave da configuração
- `config_value`: Valor da configuração
- `updated_at`: Data/hora da última atualização

### 📝 activity_logs
Logs de atividades do sistema.

```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único do log
- `user_id`: Referência ao usuário (FK, pode ser NULL)
- `action_type`: Tipo da ação realizada
- `description`: Descrição detalhada da ação
- `created_at`: Data/hora da ação

## 🔍 Índices

Para otimização de consultas, os seguintes índices são criados:

```sql
-- Índices para otimização de consultas
CREATE INDEX idx_photos_timestamp ON photos (timestamp);
CREATE INDEX idx_ar_renders_photo_id ON ar_renders (photo_id);
CREATE INDEX idx_ar_renders_session_id ON ar_renders (session_id);
CREATE INDEX idx_photo_tags_photo_id ON photo_tags (photo_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs (created_at);
```

## 🔗 Relacionamentos

### Diagrama ER Simplificado

```
users (1) ──── (N) ar_sessions (1) ──── (N) ar_renders (N) ──── (1) photos
                                                                     │
users (1) ──── (N) activity_logs                                    │
                                                                     │
                                      photo_tags (N) ────────────── (1)
                                                                     │
                                    photo_metadata (1) ──────────── (1)
```

### Chaves Estrangeiras

1. **photo_metadata.photo_id** → photos.id
2. **ar_sessions.user_id** → users.id
3. **ar_renders.session_id** → ar_sessions.id
4. **ar_renders.photo_id** → photos.id
5. **photo_tags.photo_id** → photos.id
6. **activity_logs.user_id** → users.id (SET NULL)

## 📐 Normalização (5NF)

### 1ª Forma Normal (1NF)
- ✅ Cada campo contém valores atômicos
- ✅ Não há grupos repetitivos
- ✅ Cada registro é único

### 2ª Forma Normal (2NF)
- ✅ Está em 1NF
- ✅ Não há dependências parciais
- ✅ Todos os atributos não-chave dependem completamente da chave primária

### 3ª Forma Normal (3NF)
- ✅ Está em 2NF
- ✅ Não há dependências transitivas
- ✅ Metadados das fotos separados em tabela própria

### 4ª Forma Normal (4NF)
- ✅ Está em 3NF
- ✅ Sistema de tags separado para evitar dependências multivaloradas
- ✅ Sessões AR e renderizações separadas

### 5ª Forma Normal (5NF)
- ✅ Está em 4NF
- ✅ Dependências de junção decompostas
- ✅ Relacionamento ternário users-sessions-photos decomposto
- ✅ Configurações e logs separados por domínio

## 🔧 Consultas Comuns

### Obter fotos com metadados
```sql
SELECT 
    p.id, p.uri, p.name, p.timestamp,
    pm.width, pm.height, pm.size
FROM photos p
LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
ORDER BY p.timestamp DESC;
```

### Verificar fotos renderizadas em AR
```sql
SELECT 
    p.id, p.name,
    CASE WHEN ar.photo_id IS NOT NULL THEN 1 ELSE 0 END as ar_rendered
FROM photos p
LEFT JOIN (
    SELECT DISTINCT photo_id 
    FROM ar_renders
) ar ON p.id = ar.photo_id;
```

### Obter estatísticas do usuário
```sql
SELECT 
    u.name,
    COUNT(DISTINCT p.id) as total_photos,
    COUNT(DISTINCT ar.photo_id) as rendered_photos,
    COUNT(DISTINCT ars.id) as ar_sessions
FROM users u
LEFT JOIN ar_sessions ars ON u.id = ars.user_id
LEFT JOIN ar_renders ar ON ars.id = ar.session_id
LEFT JOIN photos p ON ar.photo_id = p.id
WHERE u.id = ?
GROUP BY u.id;
```

### Buscar fotos por tags
```sql
SELECT DISTINCT p.*
FROM photos p
INNER JOIN photo_tags pt ON p.id = pt.photo_id
WHERE pt.tag_name LIKE '%search_term%'
ORDER BY p.timestamp DESC;
```

## 🛡️ Integridade e Constraints

### Chaves Primárias
- Todas as tabelas têm chave primária auto-incrementável

### Chaves Únicas
- `users.email`: Email único por usuário
- `system_config.config_key`: Chave de configuração única
- `ar_renders(session_id, photo_id)`: Uma renderização por foto por sessão
- `photo_tags(photo_id, tag_name)`: Tag única por foto

### Cascata e Constraints
- **CASCADE**: Deletar foto remove metadados, tags e renderizações
- **CASCADE**: Deletar usuário remove sessões e renderizações
- **SET NULL**: Deletar usuário mantém logs com user_id NULL

## 📈 Performance

### Estratégias de Otimização

1. **Índices**: Criados nos campos mais consultados
2. **Particionamento**: Por timestamp para logs antigos
3. **Desnormalização controlada**: Views para consultas complexas
4. **Batch Operations**: Para inserções em massa

### Views Recomendadas

```sql
-- View para fotos com informações completas
CREATE VIEW v_photos_complete AS
SELECT 
    p.id, p.uri, p.name, p.timestamp,
    pm.width, pm.height, pm.size,
    CASE WHEN ar.photo_id IS NOT NULL THEN 1 ELSE 0 END as ar_rendered,
    GROUP_CONCAT(pt.tag_name) as tags
FROM photos p
LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
LEFT JOIN (SELECT DISTINCT photo_id FROM ar_renders) ar ON p.id = ar.photo_id
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
GROUP BY p.id;
```

## 🔄 Migração e Versionamento

### Schema Versioning
```sql
-- Tabela de controle de versão
CREATE TABLE schema_version (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version) VALUES ('1.0.0');
```

### Scripts de Migração
- `migration_001_initial.sql`: Schema inicial
- `migration_002_add_indexes.sql`: Adicionar índices
- `migration_003_add_views.sql`: Criar views

## 🧪 Testes de Integridade

### Testes Automatizados
```sql
-- Verificar integridade referencial
PRAGMA foreign_key_check;

-- Verificar constraints
SELECT * FROM photos WHERE id NOT IN (SELECT photo_id FROM photo_metadata);

-- Verificar duplicatas
SELECT photo_id, tag_name, COUNT(*) 
FROM photo_tags 
GROUP BY photo_id, tag_name 
HAVING COUNT(*) > 1;
```

## 📚 Referências

- [SQLite Documentation](https://sqlite.org/docs.html)
- [Database Normalization Theory](https://en.wikipedia.org/wiki/Database_normalization)
- [React Native SQLite Storage](https://github.com/andpor/react-native-sqlite-storage)

---

**Nota**: Este schema foi otimizado para a aplicação Renderizar para Lucrar e pode ser adaptado conforme necessidades específicas do projeto.