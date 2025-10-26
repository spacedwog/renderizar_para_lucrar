@echo off
REM Script para restaurar modo de desenvolvimento (Windows)

echo 🔧 Restaurando modo de desenvolvimento...

if exist "src\utils\LogManager.backup.ts" (
    copy "src\utils\LogManager.backup.ts" "src\utils\LogManager.ts" >nul
    echo ✅ Modo de desenvolvimento restaurado!
    echo 🔄 Execute 'npm start' para testar
) else (
    echo ❌ Backup não encontrado!
    echo Execute primeiro o production-mode.bat
)

pause