import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { uploadFile } from '@/lib/storage'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const caseId = formData.get('caseId') as string | null
    const tag = formData.get('tag') as string | null
    const name = formData.get('name') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB' },
        { status: 400 }
      )
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to storage
    const result = await uploadFile(buffer, file.name, file.type, {
      organizationId: session.user.organizationId,
      uploadedBy: session.user.id,
      caseId: caseId || '',
    })

    // If caseId provided, create a Document record
    let document = null
    if (caseId) {
      // Verify case belongs to organization
      const caseRecord = await prisma.case.findFirst({
        where: {
          id: caseId,
          organizationId: session.user.organizationId,
        },
      })

      if (caseRecord) {
        document = await prisma.document.create({
          data: {
            caseId,
            name: name || file.name,
            tag: (tag as any) || 'OTHER',
            status: 'UPLOADED',
            fileUrl: result.key,
            fileSize: result.size,
            mimeType: result.mimeType,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        key: result.key,
        url: result.url,
        size: result.size,
        mimeType: result.mimeType,
      },
      document,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
