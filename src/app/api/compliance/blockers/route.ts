import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')

    const blockers = await prisma.blocker.findMany({
      where: {
        case: {
          organizationId: session.user.organizationId,
        },
        ...(caseId && { caseId }),
        isResolved: false,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            stage: true,
            decedent: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            requirementType: true,
            severity: true,
          },
        },
      },
      orderBy: [
        { rule: { severity: 'desc' } },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({ data: blockers })
  } catch (error) {
    console.error('Failed to fetch blockers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blockers' },
      { status: 500 }
    )
  }
}
