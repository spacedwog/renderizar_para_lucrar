// Type declarations for React Native modules

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
  export function DEBUG(debug: boolean): void;
}

declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export const DownloadDirectoryPath: string;
  export function copyFile(sourcePath: string, targetPath: string): Promise<void>;
  export function stat(path: string): Promise<{ size: number }>;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  const Icon: any;
  export default Icon;
}

declare module 'react-native-image-picker' {
  export type MediaType = 'photo' | 'video' | 'mixed';
  
  export interface ImagePickerOptions {
    mediaType: MediaType;
    quality?: number;
    includeBase64?: boolean;
  }
  
  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorMessage?: string;
    assets?: Array<{
      uri?: string;
      width?: number;
      height?: number;
      fileSize?: number;
    }>;
  }
  
  export function launchCamera(
    options: ImagePickerOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;
  
  export function launchImageLibrary(
    options: ImagePickerOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;
}

declare module 'react-native-permissions' {
  export enum RESULTS {
    UNAVAILABLE = 'unavailable',
    DENIED = 'denied',
    LIMITED = 'limited',
    GRANTED = 'granted',
    BLOCKED = 'blocked',
  }
  
  export const PERMISSIONS: {
    ANDROID: {
      CAMERA: string;
      WRITE_EXTERNAL_STORAGE: string;
      READ_EXTERNAL_STORAGE: string;
    };
    IOS: {
      CAMERA: string;
      PHOTO_LIBRARY: string;
    };
  };
  
  export function request(permission: string): Promise<string>;
  export function check(permission: string): Promise<string>;
}