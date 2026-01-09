export interface UploadResult {
  key: string
  url: string
  size: number
  mimeType: string
}

export interface StorageProvider {
  upload(
    file: Buffer,
    filename: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult>

  getSignedUrl(key: string, expiresIn?: number): Promise<string>

  delete(key: string): Promise<void>

  exists(key: string): Promise<boolean>
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'r2'
  bucket?: string
  region?: string
  endpoint?: string
  accessKeyId?: string
  secretAccessKey?: string
  localPath?: string
}
