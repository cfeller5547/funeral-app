import { LocalStorageProvider } from './local-provider'
import { S3StorageProvider } from './s3-provider'
import type { StorageProvider, StorageConfig } from './types'

export type { StorageProvider, UploadResult, StorageConfig } from './types'

let storageInstance: StorageProvider | null = null

export function getStorageProvider(): StorageProvider {
  if (storageInstance) {
    return storageInstance
  }

  const provider = process.env.STORAGE_PROVIDER || 'local'

  const config: StorageConfig = {
    provider: provider as 'local' | 's3' | 'r2',
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
  }

  switch (config.provider) {
    case 's3':
    case 'r2':
      storageInstance = new S3StorageProvider(config)
      break
    case 'local':
    default:
      storageInstance = new LocalStorageProvider(config.localPath)
      break
  }

  return storageInstance
}

// Utility function to get a presigned download URL
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const storage = getStorageProvider()
  return storage.getSignedUrl(key, expiresIn)
}

// Utility function to upload a file
export async function uploadFile(
  file: Buffer,
  filename: string,
  mimeType: string,
  metadata?: Record<string, string>
) {
  const storage = getStorageProvider()
  return storage.upload(file, filename, mimeType, metadata)
}

// Utility function to delete a file
export async function deleteFile(key: string) {
  const storage = getStorageProvider()
  return storage.delete(key)
}
