import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ token: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params
    const body = await request.json()
    const { step, data } = body

    if (!step || !data) {
      return NextResponse.json(
        { error: 'Missing step or data' },
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

    // Update progress with step data
    const currentProgress = session.progress as Record<string, unknown>
    const updatedProgress = {
      ...currentProgress,
      [step]: data,
    }

    await prisma.familyPortalSession.update({
      where: { id: session.id },
      data: {
        progress: updatedProgress,
        status: 'IN_PROGRESS',
        lastAccessedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save portal data:', error)
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    )
  }
}
