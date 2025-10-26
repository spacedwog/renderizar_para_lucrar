// Minimal types for React Native modules
declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    transaction: (fn: (tx: any) => Promise<void>) => Promise<any>;
    executeSql: (sql: string, params?: any[]) => Promise<any>;
    close: () => Promise<void>;
  }
  
  export function openDatabase(config: {
    name: string;
    version: string;
    displayName: string;
    size: number;
  }): Promise<SQLiteDatabase>;

  export function enablePromise(enable: boolean): void;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  const Icon: any;
  export default Icon;
}