import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageProvider, UploadResult, StorageConfig } from './types'

export class S3StorageProvider implements StorageProvider {
  private client: S3Client
  private bucket: string

  constructor(config: StorageConfig) {
    if (!config.bucket) {
      throw new Error('S3 bucket is required')
    }

    this.bucket = config.bucket

    this.client = new S3Client({
      region: config.region || 'us-east-1',
      endpoint: config.endpoint, // For R2 or other S3-compatible services
      credentials: config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
      forcePathStyle: !!config.endpoint, // Required for R2 and MinIO
    })
  }

  async upload(
    file: Buffer,
    filename: string,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    // Generate unique key with date-based path
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const timestamp = Date.now()
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')

    const key = `documents/${year}/${month}/${day}/${timestamp}-${safeFilename}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      Metadata: metadata,
    })

    await this.client.send(command)

    // Generate a signed URL for immediate access
    const url = await this.getSignedUrl(key)

    return {
      key,
      url,
      size: file.length,
      mimeType,
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return getSignedUrl(this.client, command, { expiresIn })
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    await this.client.send(command)
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
      await this.client.send(command)
      return true
    } catch {
      return false
    }
  }
}
