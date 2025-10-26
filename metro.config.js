const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para resolver avisos do Three.js
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ignorar avisos específicos de loaders do Three.js
config.resolver.assetExts.push('glb', 'gltf', 'png', 'jpg');

module.exports = config;