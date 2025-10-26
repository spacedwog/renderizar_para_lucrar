/**
 * Gerenciador de logs para filtrar avisos desnecessários
 */

// Suprimir avisos específicos conhecidos
const SUPPRESS_WARNINGS = [
  'The package.*three.*contains an invalid package.json configuration',
  'SafeAreaView has been deprecated',
  'EXGL: gl.pixelStorei\\(\\) doesn\'t support this parameter yet!'
];

// Função para filtrar logs
export const filterLogs = () => {
  // Capturar console.warn original
  const originalWarn = console.warn;
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Verificar se é um aviso que deve ser suprimido
    const shouldSuppress = SUPPRESS_WARNINGS.some(pattern => 
      new RegExp(pattern, 'i').test(message)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
};

// Função para restaurar logs originais
export const restoreLogs = () => {
  // Esta função pode ser expandida se necessário no futuro
};

export default {
  filterLogs,
  restoreLogs
};