export interface Config {
  env: 'development' | 'production';
  database: DatabaseConfig;
  nest: NestConfig;
  swagger: SwaggerConfig;
  auth: AuthConfig;
  storage: S3Config;
}

export interface DatabaseConfig {
  type: string;
  logging: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface NestConfig {
  port: number;
  cors: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface AuthConfig {
  jwtSecret: string;
}

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  video_bucket: string;
  output_bucket: string;
}
