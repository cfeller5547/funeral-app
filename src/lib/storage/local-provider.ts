import { mkdir, writeFile, unlink, access } from 'fs/promises'
import { join, dirname } from 'path'
import type { StorageProvider, UploadResult } from './types'

export class LocalStorageProvider implements StorageProvider {
  private basePath: string

  constructor(basePath: string = './uploads') {
    this.basePath = basePath
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

    const key = `${year}/${month}/${day}/${timestamp}-${safeFilename}`
    const fullPath = join(this.basePath, key)

    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true })

    // Write file
    await writeFile(fullPath, file)

    // In local mode, URL is just a relative path that will be served by Next.js
    const url = `/api/storage/${key}`

    return {
      key,
      url,
      size: file.length,
      mimeType,
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the API route
    // In production, this would generate a signed URL with expiration
    const expires = Date.now() + expiresIn * 1000
    return `/api/storage/${key}?expires=${expires}`
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(this.basePath, key)
    try {
      await unlink(fullPath)
    } catch {
      // File might not exist, ignore
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = join(this.basePath, key)
    try {
      await access(fullPath)
      return true
    } catch {
      return false
    }
  }
}
