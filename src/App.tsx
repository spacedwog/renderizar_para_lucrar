import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StyleSheet} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ARViewScreen from './screens/ARViewScreen';
import GalleryScreen from './screens/GalleryScreen';
import DatabaseScreen from './screens/DatabaseScreen';

// Import database initialization
import {initializeDatabase} from './database/DatabaseManager';

// Import console filter para suprimir avisos conhecidos
import './utils/ConsoleFilter';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Renderizar para Lucrar'}}
          />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{title: 'Capturar Foto'}}
          />
          <Stack.Screen
            name="ARView"
            component={ARViewScreen}
            options={{title: 'Visualização AR'}}
          />
          <Stack.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{title: 'Galeria'}}
          />
          <Stack.Screen
            name="Database"
            component={DatabaseScreen}
            options={{title: 'Banco de Dados'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;