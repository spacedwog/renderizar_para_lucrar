import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';
import {PhotoModel} from '../models/PhotoModel';
import {savePhoto} from '../database/PhotoRepository';

const CameraScreen = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão negada',
        'É necessário conceder permissão para usar a câmera'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'Images', // String correta para v17
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  }, []);

  const openGallery = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão negada',
        'É necessário conceder permissão para acessar a galeria'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images', // String correta para v17
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  }, []);

  const handleSavePhoto = useCallback(async () => {
    if (!selectedPhoto) {
      Alert.alert('Erro', 'Nenhuma foto selecionada');
      return;
    }

    setIsLoading(true);
    try {
      const photo: PhotoModel = {
        id: Date.now(),
        uri: selectedPhoto,
        name: `photo_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
        ar_rendered: false,
        metadata: {
          width: 0,
          height: 0,
          size: 0,
        },
      };

      await savePhoto(photo);
      Alert.alert('Sucesso', 'Foto salva com sucesso!', [
        {
          text: 'OK',
          onPress: () => setSelectedPhoto(null),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar a foto');
      console.error('Erro ao salvar foto:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPhoto]);

  const handleClearPhoto = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Capturar Foto</Text>
          <Text style={styles.subtitle}>
            Tire uma foto ou selecione da galeria para renderização AR
          </Text>
        </View>

        {selectedPhoto ? (
          <View style={styles.photoContainer}>
            <Image source={{uri: selectedPhoto}} style={styles.selectedPhoto} />
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSavePhoto}
                disabled={isLoading}>
                <Ionicons name="save" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={handleClearPhoto}>
                <Ionicons name="close" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={64} color="#9ca3af" />
              <Text style={styles.placeholderText}>
                Nenhuma foto selecionada
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.captureButton, styles.cameraButton]}
            onPress={handleTakePhoto}>
            <Ionicons name="camera" size={24} color="#ffffff" />
            <Text style={styles.captureButtonText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, styles.galleryButton]}
            onPress={openGallery}>
            <Ionicons name="images" size={24} color="#ffffff" />
            <Text style={styles.captureButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 30,
  },
  selectedPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#6366f1',
  },
  galleryButton: {
    backgroundColor: '#8b5cf6',
  },
  captureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;
