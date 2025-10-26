const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações para React Native + Expo
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj');
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx');

module.exports = config;