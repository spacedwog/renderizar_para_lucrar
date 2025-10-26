# 🚀 Quick Start Guide - Renderizar para Lucrar

Guia rápido para configurar e executar a aplicação React Native.

## ⚡ Instalação Rápida

### 1. Pré-requisitos
```bash
# Verifique se tem Node.js 16+
node --version

# Verifique se tem Git
git --version

# Instale React Native CLI globalmente
npm install -g react-native-cli
# ou
npm install -g @react-native-community/cli
```

### 2. Clone e Configure
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/renderizar-para-lucrar.git
cd renderizar-para-lucrar

# Instale dependências
npm install

# Configure o Git (opcional)
npm run git:setup
```

### 3. Execute a Aplicação
```bash
# Para Android
npm run android

# Para iOS (apenas macOS)
npm run ios

# Ou inicie o Metro e execute manualmente
npm start
npx react-native run-android
```

## 📱 Comandos de Desenvolvimento

### Execução
```bash
npm start                 # Iniciar Metro bundler
npm run android          # Executar no Android
npm run ios              # Executar no iOS
npm run clean            # Limpar cache
```

### Build
```bash
npm run build:android    # Build Android APK
npm run build:ios        # Build iOS
```

### Testes e Qualidade
```bash
npm test                 # Executar testes
npm run lint             # Verificar código
npm run test:coverage    # Testes com cobertura
```

### Git
```bash
npm run git:setup        # Configurar repositório
npm run git:feature      # Criar nova branch
npm run git:commit       # Commit rápido
npm run git:push         # Push para origin
```

## 🛠️ Configuração do Ambiente

### Android
1. Instale Android Studio
2. Configure Android SDK (API 28+)
3. Configure variáveis de ambiente:
   ```bash
   ANDROID_HOME=C:\Users\seu-usuario\AppData\Local\Android\Sdk
   ANDROID_SDK_ROOT=C:\Users\seu-usuario\AppData\Local\Android\Sdk
   ```
4. Adicione ao PATH:
   ```bash
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

### iOS (apenas macOS)
1. Instale Xcode via App Store
2. Instale Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Instale CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

## 🔧 Resolução de Problemas Comuns

### Metro bundler não inicia
```bash
npx react-native start --reset-cache
```

### Erro de build Android
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Problemas com dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de permissões (Linux/macOS)
```bash
sudo chown -R $(whoami) ~/.npm
```

### Limpar completamente o projeto
```bash
# React Native
npx react-native clean

# Node modules
rm -rf node_modules package-lock.json
npm install

# Android
cd android
./gradlew clean
cd ..

# iOS (macOS)
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## 📋 Checklist de Configuração

### ✅ Ambiente
- [ ] Node.js 16+ instalado
- [ ] React Native CLI instalado
- [ ] Android Studio configurado (para Android)
- [ ] Xcode configurado (para iOS/macOS)
- [ ] Emulador/dispositivo conectado

### ✅ Projeto
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Metro bundler iniciando sem erros
- [ ] App executando no emulador/dispositivo

### ✅ Funcionalidades
- [ ] Navegação entre telas funcionando
- [ ] Captura de fotos funcionando
- [ ] Banco de dados SQLite funcionando
- [ ] Visualização AR funcionando
- [ ] Galeria de fotos funcionando

## 🎯 Comandos de Teste

### Testar funcionalidades específicas
```bash
# Testar modelo de dados
npm test PhotoModel

# Testar componentes
npm test ARPhotoRenderer

# Testar banco de dados
npm test DatabaseManager
```

### Debug
```bash
# Debug Android
npx react-native log-android

# Debug iOS
npx react-native log-ios

# Flipper (se configurado)
npx react-native doctor
```

## 📚 Recursos Úteis

### Documentação
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [SQLite Storage](https://github.com/andpor/react-native-sqlite-storage)

### Ferramentas
- [Reactotron](https://github.com/infinitered/reactotron) - Debug tool
- [Flipper](https://fbflipper.com/) - Debug platform
- [Android Studio](https://developer.android.com/studio) - Android IDE

### Comunidade
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Discord React Native](https://discord.gg/react-native)

## 🆘 Suporte

### Problemas conhecidos e soluções

**"Unable to resolve module":**
```bash
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

**"Android Gradle Plugin requires Java 11":**
- Configure JAVA_HOME para JDK 11+
- No Android Studio: File > Project Structure > SDK Location

**"CocoaPods not installed":**
```bash
sudo gem install cocoapods
cd ios && pod install
```

**"Metro encountered an error":**
```bash
watchman watch-del-all
rm -rf /tmp/metro-*
npx react-native start --reset-cache
```

### Contato
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/renderizar-para-lucrar/issues)
- **Email**: dev@renderizarparalucrar.com
- **Docs**: [./docs/](./docs/)

---

**💡 Dica**: Mantenha sempre as dependências atualizadas e consulte a documentação oficial do React Native para resolver problemas específicos da plataforma.