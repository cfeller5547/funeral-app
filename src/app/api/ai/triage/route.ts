import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { triageOpsMessage } from '@/lib/ai'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, caseId } = body as {
      message: string
      caseId?: string
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get case context if provided
    let context = undefined
    if (caseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          decedent: true,
          tasks: {
            where: { status: 'OPEN' },
            select: { title: true },
          },
        },
      })

      if (caseData) {
        context = {
          caseName: caseData.decedent
            ? `${caseData.decedent.firstName} ${caseData.decedent.lastName}`
            : `Case #${caseData.caseNumber}`,
          caseStage: caseData.stage,
          serviceDate: caseData.serviceDate?.toISOString().split('T')[0],
          currentTasks: caseData.tasks.map((t) => t.title),
        }
      }
    }

    const result = await triageOpsMessage(message, context)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Ops triage error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze message' },
      { status: 500 }
    )
  }
}
