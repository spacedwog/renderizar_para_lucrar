import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Ionicons } from '@expo/vector-icons';
import * as THREE from 'three';
import * as Sensors from 'expo-sensors';
import { PhotoModel } from '../models/PhotoModel';

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

      // Criar geometria do cubo/foto
      const geometry = new THREE.BoxGeometry(2, 2, 0.1);
      
      // Criar material com textura (simulando a foto)
      const material = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.8,
      });

      // Criar mesh
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, 0);
      cubeRef.current = cube;
      scene.add(cube);

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

    setIsARActive(!isARActive);
    
    if (!isARActive) {
      Alert.alert(
        'Modo AR Ativado',
        'A câmera será ativada e objetos 3D serão sobrepostos usando sensores do dispositivo.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
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

      {/* GLView para renderização 3D/AR */}
      <GLView
        style={[
          styles.glView,
          { backgroundColor: isARActive ? 'transparent' : '#000000' }
        ]}
        onContextCreate={onContextCreate}
      />

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