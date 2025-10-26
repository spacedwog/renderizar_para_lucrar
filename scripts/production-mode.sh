#!/bin/bash
# Script para configurar o app para produção
# Remove todos os logs de desenvolvimento

echo "🚀 Configurando app para produção..."

# Desabilitar logs no LogManager
echo "🔇 Desabilitando logs de desenvolvimento..."

# Criar backup do LogManager atual
cp src/utils/LogManager.ts src/utils/LogManager.backup.ts

# Substituir por versão de produção (todos os métodos vazios)
cat > src/utils/LogManager.ts << 'EOF'
/**
 * LogManager - Versão de Produção
 * Todos os logs são desabilitados para melhor performance
 */

interface LogConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
}

class LogManager {
  private static config: LogConfig = {
    enabled: false, // SEMPRE DESABILITADO EM PRODUÇÃO
    level: 'error'
  };

  static setConfig(config: Partial<LogConfig>) {
    // Ignorado em produção
  }

  static debug(message: string, ...args: any[]) {
    // Vazio - sem logs em produção
  }

  static info(message: string, ...args: any[]) {
    // Vazio - sem logs em produção
  }

  static warn(message: string, ...args: any[]) {
    // Vazio - sem logs em produção
  }

  static error(message: string, ...args: any[]) {
    // Apenas erros críticos em produção
    if (this.config.enabled) {
      console.error(message, ...args);
    }
  }

  static success(message: string, ...args: any[]) {
    // Vazio - sem logs em produção
  }

  static critical(message: string, ...args: any[]) {
    // Críticos sempre aparecem
    console.error(`🚨 CRITICAL: ${message}`, ...args);
  }

  static disableAll() {
    this.config.enabled = false;
  }

  static enableAll() {
    // Ignorado em produção
  }

  private static shouldLog(level: LogConfig['level']): boolean {
    return false; // Sempre false em produção
  }
}

export default LogManager;
EOF

echo "✅ App configurado para produção!"
echo "📝 Backup salvo em: src/utils/LogManager.backup.ts"
echo "🔄 Execute 'npm start' para testar"