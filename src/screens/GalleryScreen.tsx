import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {PhotoModel} from '../models/PhotoModel';
import {getAllPhotos, deletePhoto} from '../database/PhotoRepository';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2;

const GalleryScreen = () => {
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoModel | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhotos = useCallback(async () => {
    try {
      const photoList = await getAllPhotos();
      setPhotos(photoList);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar fotos');
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handlePhotoPress = useCallback((photo: PhotoModel) => {
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedPhoto(null);
  }, []);

  const handleDeletePhoto = useCallback(async (photo: PhotoModel) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a foto "${photo.name}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photo.id);
              setPhotos((prev: PhotoModel[]) => prev.filter((p: PhotoModel) => p.id !== photo.id));
              handleCloseModal();
              Alert.alert('Sucesso', 'Foto excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir a foto');
              console.error('Erro ao excluir foto:', error);
            }
          },
        },
      ]
    );
  }, [handleCloseModal]);

  const renderPhotoItem = useCallback(({item}: {item: PhotoModel}) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}>
      <Image source={{uri: item.uri}} style={styles.photoThumbnail} />
      <View style={styles.photoOverlay}>
        <View style={styles.photoInfo}>
          <Text style={styles.photoName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.statusIndicator}>
            <Ionicons 
              name={item.ar_rendered ? "checkmark-circle" : "ellipse-outline"} 
              size={12} 
              color={item.ar_rendered ? "#10b981" : "#ffffff"} 
            />
            <Text style={styles.statusText}>
              {item.ar_rendered ? "AR" : ""}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [handlePhotoPress]);

  const renderPhotoModal = () => {
    if (!selectedPhoto) return null;

    return (
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPhoto.name}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Image source={{uri: selectedPhoto.uri}} style={styles.modalPhoto} />

            <View style={styles.modalInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.infoText}>
                  {new Date(selectedPhoto.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons 
                  name={selectedPhoto.ar_rendered ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={selectedPhoto.ar_rendered ? "#10b981" : "#6b7280"} 
                />
                <Text style={[
                  styles.infoText,
                  {color: selectedPhoto.ar_rendered ? "#10b981" : "#6b7280"}
                ]}>
                  {selectedPhoto.ar_rendered ? "Renderizado em AR" : "Não renderizado"}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeletePhoto(selectedPhoto)}>
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Galeria</Text>
        <Text style={styles.subtitle}>
          {photos.length} foto{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="#6366f1" />
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma foto na galeria</Text>
          <Text style={styles.emptySubtitle}>
            Capture algumas fotos para começar
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item: PhotoModel) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderPhotoModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  photoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    margin: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalPhoto: {
    flex: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GalleryScreen;
