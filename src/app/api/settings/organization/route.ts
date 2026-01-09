import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  timezone: z.string().optional(),
  nicheMode: z.enum(['GENERAL', 'CREMATION_FIRST', 'MULTI_LOCATION', 'REMOVAL_HEAVY']).optional(),
})

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    const organization = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data,
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        eventType: 'SETTINGS_UPDATED',
        entityType: 'Organization',
        entityId: organization.id,
        description: 'Organization settings updated',
      },
    })

    return NextResponse.json({ data: organization })
  } catch (error) {
    console.error('Failed to update organization:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}
