import {PhotoModel, PhotoMetadata} from '../models/PhotoModel';
import {getDatabase, logActivity} from './DatabaseManager';

// Função para salvar uma foto
export const savePhoto = async (photo: PhotoModel): Promise<number> => {
  try {
    const db = getDatabase();
    
    return await db.withTransactionAsync(async () => {
      // Inserir foto principal
      const photoResult = await db.runAsync(
        'INSERT INTO photos (uri, name, timestamp) VALUES (?, ?, ?)',
        [photo.uri, photo.name, photo.timestamp]
      );
      
      const photoId = photoResult.lastInsertRowId;
      
      // Inserir metadados
      await db.runAsync(
        'INSERT INTO photo_metadata (photo_id, width, height, size) VALUES (?, ?, ?, ?)',
        [photoId, photo.metadata.width, photo.metadata.height, photo.metadata.size]
      );
      
      // Log da atividade
      await logActivity(1, 'PHOTO_SAVED', `Foto salva: ${photo.name}`);
      
      console.log('Foto salva com sucesso:', photoId);
      return photoId;
    });
  } catch (error) {
    console.error('Erro ao salvar foto:', error);
    throw error;
  }
};

// Função para obter todas as fotos
export const getAllPhotos = async (): Promise<PhotoModel[]> => {
  try {
    const db = getDatabase();
    
    const result = await db.getAllAsync(`
      SELECT 
        p.id,
        p.uri,
        p.name,
        p.timestamp,
        pm.width,
        pm.height,
        pm.size,
        CASE WHEN ar.photo_id IS NOT NULL THEN 1 ELSE 0 END as ar_rendered
      FROM photos p
      LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
      LEFT JOIN (
        SELECT DISTINCT photo_id 
        FROM ar_renders
      ) ar ON p.id = ar.photo_id
      ORDER BY p.timestamp DESC
    `);
    
    const photos: PhotoModel[] = result.map((row: any) => ({
      id: row.id,
      uri: row.uri,
      name: row.name,
      timestamp: row.timestamp,
      ar_rendered: row.ar_rendered === 1,
      metadata: {
        width: row.width || 0,
        height: row.height || 0,
        size: row.size || 0,
      },
    }));
    
    return photos;
  } catch (error) {
    console.error('Erro ao obter fotos:', error);
    throw error;
  }
};

// Função para obter uma foto por ID
export const getPhotoById = async (id: number): Promise<PhotoModel | null> => {
  try {
    const db = getDatabase();
    
    const row = await db.getFirstAsync(`
      SELECT 
        p.id,
        p.uri,
        p.name,
        p.timestamp,
        pm.width,
        pm.height,
        pm.size,
        CASE WHEN ar.photo_id IS NOT NULL THEN 1 ELSE 0 END as ar_rendered
      FROM photos p
      LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
      LEFT JOIN (
        SELECT DISTINCT photo_id 
        FROM ar_renders
        WHERE photo_id = ?
      ) ar ON p.id = ar.photo_id
      WHERE p.id = ?
    `, [id, id]) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id,
      uri: row.uri,
      name: row.name,
      timestamp: row.timestamp,
      ar_rendered: row.ar_rendered === 1,
      metadata: {
        width: row.width || 0,
        height: row.height || 0,
        size: row.size || 0,
      },
    };
  } catch (error) {
    console.error('Erro ao obter foto por ID:', error);
    throw error;
  }
};

// Função para deletar uma foto
export const deletePhoto = async (id: number): Promise<void> => {
  try {
    const db = getDatabase();
    
    await db.withTransactionAsync(async () => {
      // Obter nome da foto para log
      const photoResult = await db.getFirstAsync('SELECT name FROM photos WHERE id = ?', [id]) as any;
      const photoName = photoResult ? photoResult.name : 'Desconhecida';
      
      // Deletar foto (cascade irá deletar registros relacionados)
      await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
      
      // Log da atividade
      await logActivity(1, 'PHOTO_DELETED', `Foto deletada: ${photoName}`);
    });
    
    console.log('Foto deletada com sucesso:', id);
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    throw error;
  }
};

// Função para atualizar status de renderização AR
export const updatePhotoARStatus = async (photoId: number, rendered: boolean): Promise<void> => {
  try {
    const db = getDatabase();
    
    if (rendered) {
      // Criar sessão AR se não existir
      let sessionId = 1;
      
      const sessionResult = await db.getFirstAsync(
        'SELECT id FROM ar_sessions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1'
      ) as any;
      
      if (!sessionResult) {
        const newSessionResult = await db.runAsync(
          'INSERT INTO ar_sessions (user_id) VALUES (1)'
        );
        sessionId = newSessionResult.lastInsertRowId;
      } else {
        sessionId = sessionResult.id;
      }
      
      // Inserir renderização AR
      await db.runAsync(
        'INSERT OR IGNORE INTO ar_renders (session_id, photo_id) VALUES (?, ?)',
        [sessionId, photoId]
      );
      
      // Log da atividade
      await logActivity(1, 'AR_RENDER', `Foto renderizada em AR: ID ${photoId}`);
    }
    
    console.log('Status AR atualizado para foto:', photoId);
  } catch (error) {
    console.error('Erro ao atualizar status AR:', error);
    throw error;
  }
};

// Função para adicionar tag a uma foto
export const addPhotoTag = async (photoId: number, tagName: string): Promise<void> => {
  try {
    const db = getDatabase();
    
    await db.runAsync(
      'INSERT OR IGNORE INTO photo_tags (photo_id, tag_name) VALUES (?, ?)',
      [photoId, tagName.toLowerCase().trim()]
    );
    
    // Log da atividade
    await logActivity(1, 'TAG_ADDED', `Tag adicionada: ${tagName} para foto ID ${photoId}`);
    
    console.log('Tag adicionada à foto:', photoId, tagName);
  } catch (error) {
    console.error('Erro ao adicionar tag:', error);
    throw error;
  }
};

// Função para obter tags de uma foto
export const getPhotoTags = async (photoId: number): Promise<string[]> => {
  try {
    const db = getDatabase();
    
    const result = await db.getAllAsync(
      'SELECT tag_name FROM photo_tags WHERE photo_id = ? ORDER BY tag_name',
      [photoId]
    );
    
    return result.map((row: any) => row.tag_name);
  } catch (error) {
    console.error('Erro ao obter tags da foto:', error);
    throw error;
  }
};

// Função para buscar fotos por tag
export const searchPhotosByTag = async (tagName: string): Promise<PhotoModel[]> => {
  try {
    const db = getDatabase();
    
    const result = await db.getAllAsync(`
      SELECT DISTINCT
        p.id,
        p.uri,
        p.name,
        p.timestamp,
        pm.width,
        pm.height,
        pm.size,
        CASE WHEN ar.photo_id IS NOT NULL THEN 1 ELSE 0 END as ar_rendered
      FROM photos p
      LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
      LEFT JOIN (
        SELECT DISTINCT photo_id 
        FROM ar_renders
      ) ar ON p.id = ar.photo_id
      INNER JOIN photo_tags pt ON p.id = pt.photo_id
      WHERE pt.tag_name LIKE ?
      ORDER BY p.timestamp DESC
    `, [`%${tagName.toLowerCase().trim()}%`]);
    
    const photos: PhotoModel[] = result.map((row: any) => ({
      id: row.id,
      uri: row.uri,
      name: row.name,
      timestamp: row.timestamp,
      ar_rendered: row.ar_rendered === 1,
      metadata: {
        width: row.width || 0,
        height: row.height || 0,
        size: row.size || 0,
      },
    }));
    
    return photos;
  } catch (error) {
    console.error('Erro ao buscar fotos por tag:', error);
    throw error;
  }
};

// Função para obter fotos renderizadas em AR
export const getRenderedPhotos = async (): Promise<PhotoModel[]> => {
  try {
    const db = getDatabase();
    
    const result = await db.getAllAsync(`
      SELECT 
        p.id,
        p.uri,
        p.name,
        p.timestamp,
        pm.width,
        pm.height,
        pm.size,
        1 as ar_rendered
      FROM photos p
      INNER JOIN ar_renders ar ON p.id = ar.photo_id
      LEFT JOIN photo_metadata pm ON p.id = pm.photo_id
      ORDER BY ar.rendered_at DESC
    `);
    
    const photos: PhotoModel[] = result.map((row: any) => ({
      id: row.id,
      uri: row.uri,
      name: row.name,
      timestamp: row.timestamp,
      ar_rendered: true,
      metadata: {
        width: row.width || 0,
        height: row.height || 0,
        size: row.size || 0,
      },
    }));
    
    return photos;
  } catch (error) {
    console.error('Erro ao obter fotos renderizadas:', error);
    throw error;
  }
};