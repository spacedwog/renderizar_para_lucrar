import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {PhotoModel} from '../models/PhotoModel';

const {width, height} = Dimensions.get('window');

interface ARPhotoRendererProps {
  photo: PhotoModel;
  onClose: () => void;
}

const ARPhotoRenderer = ({photo, onClose}: ARPhotoRendererProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [renderMode, setRenderMode] = useState<'2D' | '3D' | 'AR'>('2D');
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const rotateYAnim = useRef(new Animated.Value(0)).current;

  // Simulação de carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Animação de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  // Atualizar animações quando rotação muda
  useEffect(() => {
    Animated.timing(rotateXAnim, {
      toValue: rotationX,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [rotationX, rotateXAnim]);

  useEffect(() => {
    Animated.timing(rotateYAnim, {
      toValue: rotationY,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [rotationY, rotateYAnim]);

  // PanResponder para gestos de rotação
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt: any, gestureState: any) => {
      if (renderMode === '3D' || renderMode === 'AR') {
        const newRotationY = (gestureState.dx / width) * 360;
        const newRotationX = -(gestureState.dy / height) * 360;
        setRotationY(newRotationY);
        setRotationX(newRotationX);
      }
    },
    onPanResponderRelease: () => {
      // Opcional: retornar à posição original
      // setRotationX(0);
      // setRotationY(0);
    },
  });

  const handleModeChange = (mode: '2D' | '3D' | 'AR') => {
    setRenderMode(mode);
    if (mode === '2D') {
      setRotationX(0);
      setRotationY(0);
      setScale(1);
    } else if (mode === '3D') {
      Alert.alert(
        'Modo 3D Ativado',
        'Arraste para rotacionar a imagem em 3D',
        [{text: 'OK'}]
      );
    } else if (mode === 'AR') {
      Alert.alert(
        'Modo AR Simulado',
        'Esta é uma simulação de AR. Em uma implementação real, seria usado ARCore/ARKit.',
        [{text: 'OK'}]
      );
    }
  };

  const handleZoom = (zoomIn: boolean) => {
    const newScale = zoomIn ? Math.min(scale * 1.2, 3) : Math.max(scale / 1.2, 0.5);
    setScale(newScale);
  };

  const handleReset = () => {
    setRotationX(0);
    setRotationY(0);
    setScale(1);
  };

  const renderLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <Ionicons name="cube" size={64} color="#6366f1" />
        <Text style={styles.loadingTitle}>Processando AR</Text>
        <Text style={styles.loadingSubtitle}>
          Preparando renderização 3D da imagem...
        </Text>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      </View>
    </View>
  );

  const renderARView = () => (
    <View style={styles.arContainer} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.photoContainer,
          {
            opacity: fadeAnim,
            transform: [
              {scale: Animated.multiply(scaleAnim, scale)},
              {
                rotateX: rotateXAnim.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ['-360deg', '360deg'],
                }),
              },
              {
                rotateY: rotateYAnim.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ['-360deg', '360deg'],
                }),
              },
            ],
          },
        ]}>
        <View style={[styles.photo3D, {backgroundColor: '#6366f1'}]}>
          <Text style={styles.photoPlaceholder}>
            📷{'\n'}{photo.name}
          </Text>
          {renderMode === 'AR' && (
            <View style={styles.arOverlay}>
              <Ionicons name="camera" size={32} color="#ffffff" />
              <Text style={styles.arText}>AR ATIVO</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{photo.name}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      {isLoading ? renderLoadingScreen() : renderARView()}

      {/* Controles inferiores */}
      {!isLoading && (
        <View style={styles.controls}>
          {/* Modos de renderização */}
          <View style={styles.modeSelector}>
            {(['2D', '3D', 'AR'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  renderMode === mode && styles.modeButtonActive,
                ]}
                onPress={() => handleModeChange(mode)}>
                <Text
                  style={[
                    styles.modeButtonText,
                    renderMode === mode && styles.modeButtonTextActive,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Controles de zoom */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoom(false)}>
              <Ionicons name="remove" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.scaleText}>{Math.round(scale * 100)}%</Text>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => handleZoom(true)}>
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Informações */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color="#9ca3af" />
            <Text style={styles.infoText}>
              {renderMode === '2D' && 'Modo 2D - Visualização normal'}
              {renderMode === '3D' && 'Modo 3D - Arraste para rotacionar'}
              {renderMode === 'AR' && 'Modo AR - Realidade Aumentada simulada'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  resetButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '70%',
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  arContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo3D: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  photoPlaceholder: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'center',
  },
  arText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  modeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  zoomButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scaleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ARPhotoRenderer;
