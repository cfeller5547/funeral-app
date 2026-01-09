import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ token: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params
    const body = await request.json()
    const { stepId, completed } = body

    if (!stepId) {
      return NextResponse.json(
        { error: 'Missing stepId' },
        { status: 400 }
      )
    }

    // Find session
    const session = await prisma.familyPortalSession.findUnique({
      where: { token },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 403 }
      )
    }

    // Update progress
    const currentProgress = session.progress as Record<string, unknown>
    const stepsCompleted = (currentProgress._stepsCompleted as Record<string, boolean>) || {}

    const updatedProgress = {
      ...currentProgress,
      _stepsCompleted: {
        ...stepsCompleted,
        [stepId]: completed,
      },
    }

    await prisma.familyPortalSession.update({
      where: { id: session.id },
      data: {
        progress: updatedProgress,
        lastAccessedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update portal progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
