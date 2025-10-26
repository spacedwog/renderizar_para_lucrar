/**
 * LogManager - Controla logs de desenvolvimento
 * Em produção, pode ser configurado para desabilitar logs
 */

interface LogConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
}

class LogManager {
  private static config: LogConfig = {
    enabled: __DEV__, // Apenas em desenvolvimento
    level: 'warn' // Apenas warnings e erros por padrão
  };

  static setConfig(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  static debug(message: string, ...args: any[]) {
    // Debug logs desabilitados - muito verbosos
    // Descomente a linha abaixo apenas para debugging profundo
    // if (this.config.enabled && this.shouldLog('debug') && __DEV__) {
    //   console.log(`🔧 ${message}`, ...args);
    // }
  }

  static info(message: string, ...args: any[]) {
    if (this.config.enabled && this.shouldLog('info')) {
      // Silencioso em produção - apenas em desenvolvimento
      if (__DEV__) {
        console.log(`ℹ️ ${message}`, ...args);
      }
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.config.enabled && this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.config.enabled && this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  static success(message: string, ...args: any[]) {
    // Success logs apenas para operações importantes
    if (this.config.enabled && __DEV__) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  // Método para logs críticos que sempre aparecem (mesmo em produção)
  static critical(message: string, ...args: any[]) {
    console.error(`🚨 CRITICAL: ${message}`, ...args);
  }

  private static shouldLog(level: LogConfig['level']): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.config.level];
  }

  // Para produção - desabilita todos os logs
  static disableAll() {
    this.config.enabled = false;
  }

  // Para desenvolvimento - habilita logs
  static enableAll() {
    this.config.enabled = true;
  }
}

export default LogManager;