// Type declarations for Expo and React Navigation
declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';
  
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  
  export const Ionicons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const AntDesign: ComponentType<IconProps>;
  export const Entypo: ComponentType<IconProps>;
  export const EvilIcons: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
  export const Foundation: ComponentType<IconProps>;
  export const MaterialCommunityIcons: ComponentType<IconProps>;
  export const Octicons: ComponentType<IconProps>;
  export const SimpleLineIcons: ComponentType<IconProps>;
  export const Zocial: ComponentType<IconProps>;
}

declare module '@react-navigation/native' {
  export * from '@react-navigation/native/lib/typescript/src';
}

declare module '@react-navigation/stack' {
  export * from '@react-navigation/stack/lib/typescript/src';
}

declare module 'expo-image-picker' {
  export interface ImagePickerOptions {
    mediaTypes?: 'Images' | 'Videos' | 'All';
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
  }

  export interface ImagePickerAsset {
    uri: string;
    width?: number;
    height?: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets?: ImagePickerAsset[];
  }

  export interface PermissionResponse {
    granted: boolean;
    canAskAgain?: boolean;
    expires?: string;
  }

  export const MediaTypeOptions: {
    Images: 'Images';
    Videos: 'Videos';
    All: 'All';
  };

  export function requestCameraPermissionsAsync(): Promise<PermissionResponse>;
  export function requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
}

declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
    getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
    getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
    withTransactionAsync<T>(callback: () => Promise<T>): Promise<T>;
    closeAsync(): Promise<void>;
  }

  export function openDatabaseAsync(databaseName: string): Promise<SQLiteDatabase>;
}

declare module 'expo-file-system' {
  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
  }

  export const documentDirectory: string;
  export const bundleDirectory: string;
  export const cacheDirectory: string;

  export function getInfoAsync(fileUri: string): Promise<FileInfo>;
  export function copyAsync(options: { from: string; to: string }): Promise<void>;
  export function deleteAsync(fileUri: string): Promise<void>;
  export function makeDirectoryAsync(fileUri: string, options?: { intermediates?: boolean }): Promise<void>;
}

declare module 'expo-sharing' {
  export interface SharingOptions {
    mimeType?: string;
    dialogTitle?: string;
    UTI?: string;
  }

  export function shareAsync(uri: string, options?: SharingOptions): Promise<void>;
  export function isAvailableAsync(): Promise<boolean>;
}