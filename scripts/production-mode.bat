@echo off
REM Script para configurar o app para produção (Windows)
REM Remove todos os logs de desenvolvimento

echo 🚀 Configurando app para produção...

REM Desabilitar logs no LogManager
echo 🔇 Desabilitando logs de desenvolvimento...

REM Criar backup do LogManager atual
copy "src\utils\LogManager.ts" "src\utils\LogManager.backup.ts" >nul

REM Criar versão de produção
(
echo /**
echo  * LogManager - Versão de Produção
echo  * Todos os logs são desabilitados para melhor performance
echo  */
echo.
echo interface LogConfig {
echo   enabled: boolean;
echo   level: 'debug' ^| 'info' ^| 'warn' ^| 'error';
echo }
echo.
echo class LogManager {
echo   private static config: LogConfig = {
echo     enabled: false, // SEMPRE DESABILITADO EM PRODUÇÃO
echo     level: 'error'
echo   };
echo.
echo   static setConfig^(config: Partial^<LogConfig^>^) {
echo     // Ignorado em produção
echo   }
echo.
echo   static debug^(message: string, ...args: any[]^) {
echo     // Vazio - sem logs em produção
echo   }
echo.
echo   static info^(message: string, ...args: any[]^) {
echo     // Vazio - sem logs em produção
echo   }
echo.
echo   static warn^(message: string, ...args: any[]^) {
echo     // Vazio - sem logs em produção
echo   }
echo.
echo   static error^(message: string, ...args: any[]^) {
echo     // Apenas erros críticos
echo     if ^(this.config.enabled^) {
echo       console.error^(message, ...args^);
echo     }
echo   }
echo.
echo   static success^(message: string, ...args: any[]^) {
echo     // Vazio - sem logs em produção
echo   }
echo.
echo   static critical^(message: string, ...args: any[]^) {
echo     // Críticos sempre aparecem
echo     console.error^(`🚨 CRITICAL: ${message}`, ...args^);
echo   }
echo.
echo   static disableAll^(^) {
echo     this.config.enabled = false;
echo   }
echo.
echo   static enableAll^(^) {
echo     // Ignorado em produção
echo   }
echo.
echo   private static shouldLog^(level: LogConfig['level']^): boolean {
echo     return false; // Sempre false em produção
echo   }
echo }
echo.
echo export default LogManager;
) > "src\utils\LogManager.ts"

echo ✅ App configurado para produção!
echo 📝 Backup salvo em: src\utils\LogManager.backup.ts
echo 🔄 Execute 'npm start' para testar
pause