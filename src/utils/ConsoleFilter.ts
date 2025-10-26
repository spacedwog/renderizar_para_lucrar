/**
 * Console Filter - Suprime avisos conhecidos e desnecessários
 * Especialmente útil para suprimir avisos do EXGL que são normais no Expo
 */

const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Lista de padrões de mensagens para suprimir
const SUPPRESSED_PATTERNS = [
  /EXGL: gl\.pixelStorei\(\) doesn't support this parameter yet!/,
  /SafeAreaView has been deprecated/,
  /MediaTypeOptions have been deprecated/,
  /The package.*three.*contains an invalid package\.json configuration/,
];

// Substituir console.warn para filtrar avisos conhecidos
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  const shouldSuppress = SUPPRESSED_PATTERNS.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalConsoleWarn.apply(console, args);
  }
};

// Filtrar alguns logs específicos também
console.log = (...args: any[]) => {
  const message = args.join(' ');
  const shouldSuppress = SUPPRESSED_PATTERNS.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalConsoleLog.apply(console, args);
  }
};

export default {
  restore: () => {
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  }
};