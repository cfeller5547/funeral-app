import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readFile } from 'fs/promises'
import { join } from 'path'

// This route serves files from local storage during development
// In production with S3/R2, files are served directly via signed URLs

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getServerSession(authOptions)
  const { path } = await params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check expiration if provided
  const url = new URL(request.url)
  const expires = url.searchParams.get('expires')
  if (expires && Date.now() > parseInt(expires)) {
    return NextResponse.json({ error: 'URL expired' }, { status: 403 })
  }

  try {
    const filePath = path.join('/')
    const basePath = process.env.LOCAL_STORAGE_PATH || './uploads'
    const fullPath = join(basePath, filePath)

    // Security: ensure path doesn't escape uploads directory
    const normalizedPath = join(basePath, filePath)
    if (!normalizedPath.startsWith(basePath.replace('./', ''))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const file = await readFile(fullPath)

    // Determine content type from extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    }
    const contentType = contentTypes[ext || ''] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
