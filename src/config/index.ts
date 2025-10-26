/**
 * Configurações globais do aplicativo
 */

interface AppConfig {
  isDevelopment: boolean;
  enableLogs: boolean;
  enableDebugMode: boolean;
  enablePerformanceMonitor: boolean;
}

const config: AppConfig = {
  isDevelopment: __DEV__,
  enableLogs: __DEV__, // Logs apenas em desenvolvimento
  enableDebugMode: __DEV__,
  enablePerformanceMonitor: __DEV__,
};

export default config;