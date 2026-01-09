import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ token: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params

    // Find session
    const session = await prisma.familyPortalSession.findUnique({
      where: { token },
      include: {
        case: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Mark as completed
    await prisma.familyPortalSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        lastAccessedAt: new Date(),
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.case.organizationId,
        caseId: session.caseId,
        eventType: 'PORTAL_COMPLETED',
        entityType: 'FamilyPortalSession',
        entityId: session.id,
        description: 'Family portal form completed',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to complete portal:', error)
    return NextResponse.json(
      { error: 'Failed to complete portal' },
      { status: 500 }
    )
  }
}
