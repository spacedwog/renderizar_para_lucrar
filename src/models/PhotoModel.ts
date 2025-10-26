export interface PhotoModel {
  id: number;
  uri: string;
  name: string;
  timestamp: string;
  ar_rendered: boolean;
  metadata: PhotoMetadata;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  size: number;
}

export interface UserModel {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface ARSessionModel {
  id: number;
  user_id: number;
  created_at: string;
}

export interface ARRenderModel {
  id: number;
  session_id: number;
  photo_id: number;
  rendered_at: string;
}

export interface PhotoTagModel {
  id: number;
  photo_id: number;
  tag_name: string;
}