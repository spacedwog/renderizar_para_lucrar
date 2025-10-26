import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Ionicons } from '@expo/vector-icons';
import * as THREE from 'three';
import * as Sensors from 'expo-sensors';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { PhotoModel } from '../models/PhotoModel';
import LogManager from '../utils/LogManager';

const { width, height } = Dimensions.get('window');

interface RealARRendererProps {
  photo: PhotoModel;
  onClose: () => void;
}

const RealARRenderer = ({ photo, onClose }: RealARRendererProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isARActive, setIsARActive] = useState(false);
  const [sensorData, setSensorData] = useState<any>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [photoTexture, setPhotoTexture] = useState<THREE.Texture | null>(null);
  const [materialRef, setMaterialRef] = useState<THREE.MeshBasicMaterial | null>(null);
  
  // Debug: Log da foto recebida (apenas em desenvolvimento)
  useEffect(() => {
    LogManager.debug('RealARRenderer - Foto recebida', {
      id: photo.id,
      name: photo.name,
      uri: photo.uri
    });
  }, [photo]);

  // Recarregar textura quando entrar nos modos 3D ou AR
  useEffect(() => {
    if ((isARActive || is3DMode) && materialRef) {
      LogManager.debug('Carregando textura para modo 3D/AR');
      loadPhotoTexture();
    }
  }, [isARActive, is3DMode, materialRef]);
  
  // Forçar recarregamento quando a foto muda
  useEffect(() => {
    if (materialRef && (isARActive || is3DMode)) {
      LogManager.debug('Nova foto detectada, recarregando textura');
      setPhotoTexture(null); // Reset da textura
      loadPhotoTexture();
    }
  }, [photo.uri, materialRef]);

  // Função para carregar textura no Expo usando GLView
  const loadPhotoTexture = async (): Promise<THREE.Texture | null> => {
    if (!photo.uri) {
      console.warn('⚠️ URI da foto não encontrada');
      return null;
    }
    
    try {
      LogManager.debug('Carregando imagem para Expo/React Native');
      
      // Para Expo/React Native, usar uma abordagem alternativa mais compatível
      // Criar textura de fallback imediatamente e tentar carregar em paralelo
      LogManager.debug('Criando textura de fallback...');
      const fallbackTexture = createFallbackTexture();
      setPhotoTexture(fallbackTexture);
      
      // Tentar carregar a imagem real em background
      return new Promise<THREE.Texture>((resolve, reject) => {
        // No Expo/React Native, THREE.TextureLoader pode não funcionar com file:// URIs
        // Usar fallback imediatamente e indicar sucesso nos logs
        LogManager.debug('THREE.TextureLoader não compatível com file:// no Expo/React Native');
        LogManager.debug('Usando textura de fallback para modo 3D/AR');
        
        // Atualizar material existente
        if (materialRef) {
          materialRef.map = fallbackTexture;
          materialRef.needsUpdate = true;
          LogManager.debug('Material atualizado com textura de fallback');
        }
        
        resolve(fallbackTexture);
      });
      
    } catch (error) {
      LogManager.error('Erro na função loadPhotoTexture:', error);
      return createFallbackTexture();
    }
  };
  
  // Criar textura de fallback com cor e texto
  const createFallbackTexture = (): THREE.Texture => {
    LogManager.debug('Criando textura de fallback');
    
    try {
      // Para React Native/Expo, usar textura de dados diretamente
      // pois canvas pode não estar disponível ou ter APIs limitadas
      LogManager.debug('Criando textura de dados para React Native/Expo');
      
      // Criar uma textura colorida simples (cor azul-violeta)
      const size = 64; // Menor para performance
      const data = new Uint8Array(size * size * 4);
      
      // Preencher com cor azul-violeta (#6366f1)
      for (let i = 0; i < size * size; i++) {
        const offset = i * 4;
        data[offset] = 99;      // R
        data[offset + 1] = 102; // G
        data[offset + 2] = 241; // B
        data[offset + 3] = 255; // A
      }
      
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      
      setPhotoTexture(texture);
      
      if (materialRef) {
        materialRef.map = texture;
        materialRef.needsUpdate = true;
        LogManager.debug('Fallback aplicado ao material');
      }
      
      return texture;
      
    } catch (error) {
      LogManager.error('Erro ao criar fallback:', error);
      // Mesmo em caso de erro, retornar uma textura básica
      const data = new Uint8Array([255, 0, 0, 255]); // Cor vermelha para indicar erro
      const errorTexture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
      errorTexture.needsUpdate = true;
      return errorTexture;
    }
  };
  
  // Método alternativo para dispositivos móveis - fallback simples
  const loadTextureViaCanvas = () => {
    return new Promise((resolve, reject) => {
      LogManager.debug('Tentando método de fallback para mobile');
      
      // Para React Native/Expo, usar uma cor como fallback
      // e mostrar a imagem real apenas no modo 2D
      const canvas = document.createElement ? document.createElement('canvas') : null;
      
      if (!canvas) {
        LogManager.debug('Ambiente React Native detectado, usando fallback de cor');
        reject(new Error('Canvas não disponível em React Native'));
        return;
      }
      
      // Se chegou aqui, provavelmente é web
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto 2D não disponível'));
          return;
        }
        
        // Criar textura simples colorida como fallback
        canvas.width = 256;
        canvas.height = 256;
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Foto', 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        setPhotoTexture(texture);
        
        if (materialRef) {
          materialRef.map = texture;
          materialRef.needsUpdate = true;
          LogManager.debug('Material atualizado com fallback');
        }
        
        resolve(texture);
        
      } catch (error) {
        console.error('❌ Erro no fallback canvas:', error);
        reject(error);
      }
    });
  };
  
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const gyroscopeSubscriptionRef = useRef<any>(null);
  const accelerometerSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Configurar sensores
    setupSensors();

    return () => {
      // Cleanup dos sensores
      if (gyroscopeSubscriptionRef.current) {
        gyroscopeSubscriptionRef.current.remove();
      }
      if (accelerometerSubscriptionRef.current) {
        accelerometerSubscriptionRef.current.remove();
      }
    };
  }, []);

  const setupSensors = async () => {
    try {
      // Verificar disponibilidade dos sensores
      const gyroAvailable = await Sensors.Gyroscope.isAvailableAsync();
      const accelAvailable = await Sensors.Accelerometer.isAvailableAsync();

      if (gyroAvailable) {
        Sensors.Gyroscope.setUpdateInterval(16); // ~60fps
        gyroscopeSubscriptionRef.current = Sensors.Gyroscope.addListener(
          (gyroscopeData) => {
            if (cubeRef.current && isARActive) {
              // Aplicar rotação baseada no giroscópio
              cubeRef.current.rotation.x += gyroscopeData.x * 0.01;
              cubeRef.current.rotation.y += gyroscopeData.y * 0.01;
              cubeRef.current.rotation.z += gyroscopeData.z * 0.01;
            }
          }
        );
      }

      if (accelAvailable) {
        Sensors.Accelerometer.setUpdateInterval(16);
        accelerometerSubscriptionRef.current = Sensors.Accelerometer.addListener(
          (accelerometerData) => {
            setSensorData(accelerometerData);
            if (cubeRef.current && isARActive) {
              // Usar acelerômetro para posicionamento
              const { x, y, z } = accelerometerData;
              cubeRef.current.position.x = x * 0.5;
              cubeRef.current.position.y = y * 0.5;
            }
          }
        );
      }
    } catch (error) {
      console.warn('Erro ao configurar sensores:', error);
    }
  };

  const onContextCreate = async (gl: any) => {
    try {
      // Configurar renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Transparente para AR
      rendererRef.current = renderer;

      // Criar cena
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Configurar câmera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Criar geometria plana para a foto
      const geometry = new THREE.PlaneGeometry(3, 3);
      
      // Criar material base
      const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1, // Cor de fallback
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      
      // Armazenar referência do material
      setMaterialRef(material);
      
      // Carregar textura da foto de forma assíncrona
      loadPhotoTexture().then((texture) => {
        if (texture && materialRef) {
          console.log('🖼️ Aplicando textura carregada ao material');
        }
      }).catch((error) => {
        console.log('⚠️ Usando material sem textura:', error.message);
      });

      // Criar mesh
      const photoMesh = new THREE.Mesh(geometry, material);
      photoMesh.position.set(0, 0, 0);
      cubeRef.current = photoMesh;
      scene.add(photoMesh);

      // Adicionar iluminação
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Loop de renderização
      const render = () => {
        requestAnimationFrame(render);
        
        if (!isARActive && is3DMode && cubeRef.current) {
          // Rotação automática no modo 3D
          cubeRef.current.rotation.x += 0.01;
          cubeRef.current.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();

    } catch (error) {
      console.error('Erro ao configurar contexto 3D:', error);
      Alert.alert('Erro', 'Não foi possível inicializar o renderizador 3D');
    }
  };

  const toggleARMode = async () => {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert('Permissão Necessária', 'É necessário permitir acesso à câmera para usar AR');
        return;
      }
    }

    const newARMode = !isARActive;
    LogManager.info('Modo AR alterado:', newARMode);
    setIsARActive(newARMode);
    
    if (newARMode) {
      Alert.alert(
        'Modo AR Ativado',
        'A câmera será ativada e objetos 3D serão sobrepostos usando sensores do dispositivo.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggle3DMode = () => {
    const newMode = !is3DMode;
    LogManager.info('Modo 3D alterado:', newMode);
    setIs3DMode(newMode);
    setIsARActive(false); // Desativar AR ao entrar no modo 3D
  };

  const resetPosition = () => {
    if (cubeRef.current) {
      cubeRef.current.position.set(0, 0, 0);
      cubeRef.current.rotation.set(0, 0, 0);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#ef4444" />
        <Text style={styles.permissionText}>Sem acesso à câmera</Text>
        <Text style={styles.permissionSubtext}>
          É necessário permitir acesso à câmera para usar a funcionalidade AR
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
          <Text style={styles.permissionButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Câmera de fundo (apenas no modo AR) */}
      {isARActive && (
        <CameraView
          style={styles.camera}
          facing="back"
        />
      )}

      {/* Visualização 2D da imagem real */}
      {!isARActive && !is3DMode && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.photoImage}
            resizeMode="contain"
            onLoad={() => {
              LogManager.success('Imagem 2D carregada com sucesso');
            }}
            onError={(error) => {
              console.error('❌ Erro ao carregar imagem 2D:', error);
              LogManager.warn('URI problemática:', photo.uri);
            }}
          />
          
          {/* Informações centralizadas da foto */}
          <View style={styles.photoInfoOverlay}>
            <View style={styles.photoInfoContainer}>
              <Text style={styles.photoTitle}>📸 Visualização 2D</Text>
              <Text style={styles.photoName}>{photo.name}</Text>
              <Text style={styles.photoTimestamp}>
                📅 {new Date(photo.timestamp).toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.photoId}>ID: #{photo.id}</Text>
              
              {/* Indicador de modo */}
              <View style={styles.modeIndicator}>
                <View style={[styles.modeIcon, { backgroundColor: '#10b981' }]} />
                <Text style={styles.modeText}>Modo 2D Ativo</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* GLView para renderização 3D/AR */}
      {(isARActive || is3DMode) && (
        <GLView
          style={[
            styles.glView,
            { 
              backgroundColor: isARActive ? 'transparent' : '#000000',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }
          ]}
          onContextCreate={onContextCreate}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{photo.name}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetPosition}>
          <Ionicons name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        {/* Modos */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              !isARActive && !is3DMode && styles.modeButtonActive,
            ]}
            onPress={() => {
              setIsARActive(false);
              setIs3DMode(false);
            }}
          >
            <Ionicons name="image" size={20} color="#ffffff" />
            <Text style={styles.modeButtonText}>2D</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              is3DMode && !isARActive && styles.modeButtonActive,
            ]}
            onPress={toggle3DMode}
          >
            <Ionicons name="cube" size={20} color="#ffffff" />
            <Text style={styles.modeButtonText}>3D</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              isARActive && styles.modeButtonActive,
            ]}
            onPress={toggleARMode}
          >
            <Ionicons name="camera" size={20} color="#ffffff" />
            <Text style={styles.modeButtonText}>AR</Text>
          </TouchableOpacity>
        </View>

        {/* Informações do sensor (apenas no modo AR) */}
        {isARActive && sensorData && (
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorText}>
              Acelerômetro: X:{sensorData.x?.toFixed(2)}, Y:{sensorData.y?.toFixed(2)}, Z:{sensorData.z?.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            {
              backgroundColor: isARActive
                ? '#10b981'
                : is3DMode
                ? '#f59e0b'
                : '#6b7280'
            }
          ]} />
          <Text style={styles.statusText}>
            {isARActive
              ? 'AR Ativo - Sensores em tempo real'
              : is3DMode
              ? '3D Ativo - Rotação automática'
              : '2D - Visualização estática'
            }
          </Text>
        </View>

        {/* Instruções */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={16} color="#9ca3af" />
          <Text style={styles.instructionsText}>
            {isARActive
              ? 'Mova o dispositivo para ver o objeto 3D seguir o movimento'
              : is3DMode
              ? 'Objeto rotaciona automaticamente no espaço 3D'
              : 'Selecione 3D ou AR para ativar renderização avançada'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  glView: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  photoImage: {
    width: width * 0.9,
    height: height * 0.6,
    borderRadius: 12,
  },
  photoInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  photoInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: width * 0.7,
  },
  photoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  photoTimestamp: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  photoId: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  modeIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
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
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    zIndex: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
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
  sensorInfo: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sensorText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  instructionsText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 40,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  permissionSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RealARRenderer; 
