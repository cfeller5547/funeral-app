import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import type { DocumentStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')
    const status = searchParams.get('status') as DocumentStatus | null

    const documents = await prisma.document.findMany({
      where: {
        case: {
          organizationId: session.user.organizationId,
        },
        ...(caseId && { caseId }),
        ...(status && { status }),
      },
      include: {
        template: {
          select: {
            name: true,
            tag: true,
          },
        },
        case: {
          select: {
            caseNumber: true,
            decedent: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({ data: documents })
  } catch (error) {
    console.error('Failed to fetch documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
