import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { CaseTimeline } from '@/components/cases/case-timeline'

interface Props {
  params: Promise<{ caseId: string }>
}

export default async function CasePage({ params }: Props) {
  const { caseId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const caseData = await prisma.case.findFirst({
    where: {
      id: caseId,
      organizationId: session.user.organizationId,
    },
    include: {
      decedent: true,
      director: true,
      location: true,
      contacts: {
        include: {
          person: true,
        },
      },
      tasks: {
        include: {
          assignee: true,
        },
        orderBy: [
          { status: 'asc' },
          { dueDate: 'asc' },
          { priority: 'desc' },
        ],
      },
      documents: {
        include: {
          template: true,
          signatureRequest: {
            include: {
              signers: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      signatureRequests: {
        include: {
          document: true,
          signers: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      blockers: {
        where: {
          isResolved: false,
        },
        include: {
          rule: true,
        },
      },
      portalSessions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!caseData) {
    notFound()
  }

  // Fetch directors for reassignment
  const directors = await prisma.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      role: {
        in: ['DIRECTOR', 'MANAGER', 'ADMIN', 'OWNER'],
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  })

  // Fetch template packs for document generation
  const templatePacks = await prisma.templatePack.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
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

  return (
    <CaseTimeline
      caseData={caseData}
      directors={directors}
      templatePacks={templatePacks}
      currentUserId={session.user.id}
    />
  )
}
