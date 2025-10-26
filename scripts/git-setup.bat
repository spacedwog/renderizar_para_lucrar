@echo off
REM Script de configuração inicial do Git para o projeto Renderizar para Lucrar
echo 🚀 Configurando repositório Git para Renderizar para Lucrar...

REM Inicializar repositório se não existir
if not exist ".git" (
    echo 📁 Inicializando repositório Git...
    git init
)

REM Configurar informações do usuário
echo 👤 Configurando informações do usuário...
git config user.name "Renderizar Para Lucrar Dev"
git config user.email "dev@renderizarparalucrar.com"

REM Configurar branch principal
git config init.defaultBranch main

REM Adicionar todos os arquivos
echo 📝 Adicionando arquivos ao repositório...
git add .

REM Fazer commit inicial
echo 💾 Fazendo commit inicial...
git commit -m "🎉 Initial commit: React Native app with AR photo rendering and SQLite3 5NF database

Features:
- React Native app with TypeScript
- AR photo rendering with 3D visualization
- SQLite3 database normalized to 5th Normal Form (5NF)
- Photo gallery with metadata management
- Camera integration for photo capture
- Database management with statistics
- Modern UI with Material Icons
- Navigation between screens

Database Schema (5NF):
- users: User management
- photos: Photo storage
- photo_metadata: Photo metadata (width, height, size)
- ar_sessions: AR rendering sessions
- ar_renders: AR rendering records
- photo_tags: Photo tagging system
- system_config: App configuration
- activity_logs: Activity logging

Tech Stack:
- React Native 0.72.6
- TypeScript
- SQLite3 with react-native-sqlite-storage
- React Navigation
- Material Icons
- React Native Image Picker
- React Native FS for file management
- React Native Permissions"

echo ✅ Repositório Git configurado com sucesso!
echo.
echo 📋 Comandos Git disponíveis:
echo   npm run git:setup       - Configurar repositório inicial
echo   npm run git:feature     - Criar nova branch de feature
echo   npm run git:commit      - Adicionar e fazer commit das mudanças
echo   npm run git:push        - Fazer push para o repositório remoto
echo.
echo 🌟 Para continuar:
echo   1. Configure o repositório remoto: git remote add origin [url]
echo   2. Faça push do código: git push -u origin main
echo   3. Instale as dependências: npm install
echo   4. Execute o app: npx react-native run-android