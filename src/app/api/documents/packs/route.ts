import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createPackSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  templateIds: z.array(z.string()).min(1),
  associatedTasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packs = await prisma.templatePack.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        items: {
          include: {
            template: {
              select: {
                id: true,
                name: true,
                tag: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ data: packs })
  } catch (error) {
    console.error('Failed to fetch packs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packs' },
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
    const data = createPackSchema.parse(body)

    // Verify all templates belong to the organization
    const templates = await prisma.documentTemplate.findMany({
      where: {
        id: { in: data.templateIds },
        organizationId: session.user.organizationId,
      },
    })

    if (templates.length !== data.templateIds.length) {
      return NextResponse.json(
        { error: 'One or more templates not found' },
        { status: 400 }
      )
    }

    // Create pack with templates in transaction
    const pack = await prisma.$transaction(async (tx) => {
      const newPack = await tx.templatePack.create({
        data: {
          organizationId: session.user.organizationId,
          name: data.name,
          description: data.description || null,
        },
      })

      // Create pack-template relations with order
      for (let i = 0; i < data.templateIds.length; i++) {
        await tx.templatePackItem.create({
          data: {
            packId: newPack.id,
            templateId: data.templateIds[i],
            order: i + 1,
          },
        })
      }

      return newPack
    })

    // Fetch with relations for response
    const fullPack = await prisma.templatePack.findUnique({
      where: { id: pack.id },
      include: {
        items: {
          include: {
            template: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        eventType: 'TEMPLATE_PACK_CREATED',
        entityType: 'TemplatePack',
        entityId: pack.id,
        description: `Template pack "${data.name}" created with ${data.templateIds.length} templates`,
      },
    })

    return NextResponse.json({ data: fullPack })
  } catch (error) {
    console.error('Failed to create pack:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create pack' },
      { status: 500 }
    )
  }
}
