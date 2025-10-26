# 📱 Renderizar para Lucrar

Uma aplicação React Native avançada para renderização de fotos em AR (Realidade Aumentada) com banco de dados SQLite3 normalizado até a 5ª Forma Normal (5NF).

## 🚀 Funcionalidades

### 📸 Captura e Gerenciamento de Fotos
- Captura de fotos via câmera
- Seleção de fotos da galeria
- Galeria de fotos com visualização em grid
- Metadados detalhados das fotos

### 🌟 Renderização AR
- Visualização 2D, 3D e AR das fotos
- Controles de rotação e zoom interativos
- Simulação de realidade aumentada
- Interface intuitiva com gestos

### 🗄️ Banco de Dados SQLite3 (5NF)
- Schema normalizado até a 5ª Forma Normal
- Estatísticas detalhadas do banco
- Backup e restauração de dados
- Logging de atividades

### 🎨 Interface Moderna
- Design Material com ícones
- Navegação fluida entre telas
- Animações suaves
- Interface responsiva

## 🏗️ Arquitetura do Banco de Dados (5NF)

```sql
-- Usuários
users (id, name, email, created_at)

-- Fotos principais
photos (id, uri, name, timestamp)

-- Metadados das fotos (separado para normalização)
photo_metadata (id, photo_id, width, height, size)

-- Sessões de AR
ar_sessions (id, user_id, created_at)

-- Renderizações AR (relacionamento)
ar_renders (id, session_id, photo_id, rendered_at)

-- Tags das fotos
photo_tags (id, photo_id, tag_name)

-- Configurações do sistema
system_config (id, config_key, config_value, updated_at)

-- Logs de atividades
activity_logs (id, user_id, action_type, description, created_at)
```

## 🛠️ Stack Tecnológica

- **Framework**: React Native 0.72.6
- **Linguagem**: TypeScript
- **Banco de Dados**: SQLite3 (react-native-sqlite-storage)
- **Navegação**: React Navigation 6
- **Ícones**: React Native Vector Icons (Material Icons)
- **Câmera**: React Native Image Picker
- **Sistema de Arquivos**: React Native FS
- **Permissões**: React Native Permissions
- **Animações**: React Native Reanimated
- **Gestos**: React Native Gesture Handler

## 📋 Pré-requisitos

- Node.js 16 ou superior
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS - apenas macOS)
- Git

## ⚡ Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/renderizar-para-lucrar.git
cd renderizar-para-lucrar
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o ambiente React Native
```bash
# Para Android
npx react-native run-android

# Para iOS (apenas macOS)
cd ios && pod install && cd ..
npx react-native run-ios
```

### 4. Configure o Git (opcional)
```bash
npm run git:setup
```

## 🎯 Scripts Disponíveis

### Desenvolvimento
```bash
# Iniciar Metro bundler
npm start

# Executar no Android
npm run android

# Executar no iOS
npm run ios

# Limpar cache
npm run clean
```

### Build
```bash
# Build Android
npm run build:android

# Build iOS
npm run build:ios
```

### Git
```bash
# Configurar repositório Git
npm run git:setup

# Criar nova branch
npm run git:feature feature/nome-da-funcionalidade

# Commit rápido
npm run git:commit

# Push para repositório
npm run git:push origin main
```

### Testes e Qualidade
```bash
# Executar testes
npm test

# Lint do código
npm run lint
```

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   └── ARPhotoRenderer.tsx
├── screens/            # Telas da aplicação
│   ├── HomeScreen.tsx
│   ├── CameraScreen.tsx
│   ├── ARViewScreen.tsx
│   ├── GalleryScreen.tsx
│   └── DatabaseScreen.tsx
├── database/           # Gerenciamento do banco de dados
│   ├── DatabaseManager.ts
│   └── PhotoRepository.ts
├── models/             # Modelos de dados
│   └── PhotoModel.ts
└── App.tsx             # Componente principal

docs/                   # Documentação
├── GIT_COMMANDS.md
└── DATABASE_SCHEMA.md

scripts/                # Scripts utilitários
├── git-setup.sh
└── git-setup.bat
```

## 🎮 Como Usar

### 1. Capturar Fotos
1. Abra a aplicação
2. Toque em "Capturar Foto"
3. Escolha "Tirar Foto" ou "Galeria"
4. Selecione/capture uma foto
5. Toque em "Salvar"

### 2. Visualizar em AR
1. Na tela inicial, toque em "Visualização AR"
2. Selecione uma foto da lista
3. Use os controles para alternar entre modos:
   - **2D**: Visualização normal
   - **3D**: Arraste para rotacionar
   - **AR**: Simulação de realidade aumentada
4. Use os controles de zoom (+/-)

### 3. Gerenciar Banco de Dados
1. Toque em "Banco de Dados"
2. Visualize estatísticas do banco
3. Use as opções para:
   - Exportar dados
   - Importar backup
   - Limpar dados

## 🔧 Configuração Avançada

### Permissões Android

Adicione no `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Permissões iOS

Adicione no `ios/projeto/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Este app precisa acessar a câmera para capturar fotos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Este app precisa acessar a galeria para selecionar fotos</string>
```

## 🧪 Testando a Aplicação

### Testes Unitários
```bash
npm test
```

### Testes no Dispositivo
1. Conecte seu dispositivo Android via USB
2. Ative a depuração USB
3. Execute: `npm run android`

### Testes no Emulador
1. Abra o Android Studio
2. Inicie um emulador Android
3. Execute: `npm run android`

## 🚀 Deploy

### Android APK
```bash
# Build de release
cd android
./gradlew assembleRelease

# APK estará em: android/app/build/outputs/apk/release/
```

### iOS App Store
```bash
# Build de release
npm run build:ios

# Ou via Xcode para publicação
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug  
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Desenvolvedor Principal** - [Seu Nome](https://github.com/seu-usuario)

## 🆘 Suporte

### Problemas Comuns

**Erro de build no Android:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Metro bundler não inicia:**
```bash
npx react-native start --reset-cache
```

**Problemas com dependências:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Contato

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/renderizar-para-lucrar/issues)
- **Email**: dev@renderizarparalucrar.com
- **Documentação**: [Docs](./docs/)

## 📊 Status do Projeto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.8.4-blue)

## 🔮 Roadmap

- [ ] Implementação real de ARCore/ARKit
- [ ] Sincronização na nuvem
- [ ] Compartilhamento de fotos AR
- [ ] Filtros e efeitos AR
- [ ] Machine Learning para reconhecimento
- [ ] Sistema de usuários completo
- [ ] API REST para sincronização
- [ ] Temas personalizáveis
- [ ] Suporte offline avançado
- [ ] Análytics e métricas

---

<div align="center">
  <p>Feito com ❤️ para o futuro da realidade aumentada</p>
  <p>🚀 <strong>Renderizar para Lucrar</strong> - Transformando fotos em experiências AR</p>
</div>