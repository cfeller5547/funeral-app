import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { getDownloadUrl } from '@/lib/storage'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find document and verify access
    const document = await prisma.document.findFirst({
      where: {
        id,
        case: {
          organizationId: session.user.organizationId,
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (!document.fileUrl) {
      return NextResponse.json(
        { error: 'Document has no file attached' },
        { status: 404 }
      )
    }

    // Generate signed download URL (valid for 1 hour)
    const url = await getDownloadUrl(document.fileUrl, 3600)

    return NextResponse.json({
      url,
      name: document.name,
      mimeType: document.mimeType,
      size: document.fileSize,
    })
  } catch (error) {
    console.error('Download URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
