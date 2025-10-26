import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {PhotoModel} from '../models/PhotoModel';
import {getAllPhotos, updatePhotoARStatus} from '../database/PhotoRepository';
import ARPhotoRenderer from '../components/ARPhotoRenderer';

const {width, height} = Dimensions.get('window');

const ARViewScreen = () => {
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoModel | null>(null);
  const [isARActive, setIsARActive] = useState(false);
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

  const handlePhotoSelect = useCallback((photo: PhotoModel) => {
    setSelectedPhoto(photo);
    setIsARActive(true);
  }, []);

  const handleARClose = useCallback(async () => {
    if (selectedPhoto) {
      try {
        await updatePhotoARStatus(selectedPhoto.id, true);
        setPhotos((prev: PhotoModel[]) => 
          prev.map((photo: PhotoModel) => 
            photo.id === selectedPhoto.id 
              ? {...photo, ar_rendered: true}
              : photo
          )
        );
      } catch (error) {
        console.error('Erro ao atualizar status AR:', error);
      }
    }
    setIsARActive(false);
    setSelectedPhoto(null);
  }, [selectedPhoto]);

  const renderPhotoItem = useCallback(({item}: {item: PhotoModel}) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoSelect(item)}
      activeOpacity={0.7}>
      <View style={styles.photoInfo}>
        <Icon name="photo" size={40} color="#6366f1" />
        <View style={styles.photoDetails}>
          <Text style={styles.photoName}>{item.name}</Text>
          <Text style={styles.photoTimestamp}>
            {new Date(item.timestamp).toLocaleDateString('pt-BR')}
          </Text>
          <View style={styles.statusContainer}>
            <Icon 
              name={item.ar_rendered ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={item.ar_rendered ? "#10b981" : "#9ca3af"} 
            />
            <Text style={[
              styles.statusText,
              {color: item.ar_rendered ? "#10b981" : "#9ca3af"}
            ]}>
              {item.ar_rendered ? "Renderizado" : "Não renderizado"}
            </Text>
          </View>
        </View>
      </View>
      <Icon name="3d-rotation" size={24} color="#8b5cf6" />
    </TouchableOpacity>
  ), [handlePhotoSelect]);

  if (isARActive && selectedPhoto) {
    return (
      <ARPhotoRenderer
        photo={selectedPhoto}
        onClose={handleARClose}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visualização AR</Text>
        <Text style={styles.subtitle}>
          Selecione uma foto para visualizar em realidade aumentada
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Icon name="hourglass-empty" size={48} color="#6366f1" />
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="photo-library" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Nenhuma foto encontrada</Text>
          <Text style={styles.emptySubtitle}>
            Capture algumas fotos primeiro para visualizar em AR
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item: PhotoModel) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.infoContainer}>
        <Icon name="info" size={20} color="#6366f1" />
        <Text style={styles.infoText}>
          Toque em uma foto para visualizar em realidade aumentada
        </Text>
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
    gap: 12,
  },
  photoItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoDetails: {
    marginLeft: 16,
    flex: 1,
  },
  photoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  photoTimestamp: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#e0e7ff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
});

export default ARViewScreen;