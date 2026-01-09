import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { DocumentsClient } from './documents-client'

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch templates
  const templates = await prisma.documentTemplate.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // Fetch packs
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

  // Fetch recent generated documents
  const documents = await prisma.document.findMany({
    where: {
      case: {
        organizationId: session.user.organizationId,
      },
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
    take: 50,
  })

  return (
    <DocumentsClient
      templates={templates}
      packs={packs}
      documents={documents}
    />
  )
}
