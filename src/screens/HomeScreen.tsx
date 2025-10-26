import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const menuOptions = [
    {
      title: 'Capturar Foto',
      subtitle: 'Tire uma foto para renderização AR',
      icon: 'camera-alt',
      onPress: () => navigation.navigate('Camera'),
      color: '#10b981',
    },
    {
      title: 'Visualização AR',
      subtitle: 'Visualize fotos em realidade aumentada',
      icon: '3d-rotation',
      onPress: () => navigation.navigate('ARView'),
      color: '#8b5cf6',
    },
    {
      title: 'Galeria',
      subtitle: 'Visualize fotos capturadas',
      icon: 'photo-library',
      onPress: () => navigation.navigate('Gallery'),
      color: '#f59e0b',
    },
    {
      title: 'Banco de Dados',
      subtitle: 'Gerenciar dados SQLite3',
      icon: 'storage',
      onPress: () => navigation.navigate('Database'),
      color: '#ef4444',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Renderizar para Lucrar</Text>
          <Text style={styles.subtitle}>
            Aplicação de renderização AR com SQLite3
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, {borderLeftColor: option.color}]}
              onPress={option.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuContent}>
                <View style={[styles.iconContainer, {backgroundColor: option.color}]}>
                  <Icon name={option.icon} size={24} color="#ffffff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{option.title}</Text>
                  <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desenvolvido com React Native e SQLite3
          </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default HomeScreen;