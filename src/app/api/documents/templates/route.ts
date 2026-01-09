import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const documentTagSchema = z.enum([
  'GPL',
  'CONTRACT',
  'AUTHORIZATION_CREMATION',
  'AUTHORIZATION_EMBALMING',
  'AUTHORIZATION_DISPOSITION',
  'PERMIT_BURIAL',
  'PERMIT_TRANSIT',
  'DEATH_CERTIFICATE',
  'ID_VERIFICATION',
  'OBITUARY',
  'PROGRAM',
  'CHECKLIST',
  'OTHER',
])

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tag: documentTagSchema,
  content: z.string().min(1),
  signatureFields: z.any().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.documentTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.documentTemplate.create({
      data: {
        organizationId: session.user.organizationId,
        name: data.name,
        description: data.description || null,
        tag: data.tag,
        content: data.content,
        signatureFields: data.signatureFields || [],
        isActive: true,
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        eventType: 'TEMPLATE_CREATED',
        entityType: 'DocumentTemplate',
        entityId: template.id,
        description: `Document template "${data.name}" created`,
      },
    })

    return NextResponse.json({ data: template })
  } catch (error) {
    console.error('Failed to create template:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
