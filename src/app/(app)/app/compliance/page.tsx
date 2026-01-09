import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ComplianceClient } from './compliance-client'

export default async function CompliancePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch blocked cases
  const blockers = await prisma.blocker.findMany({
    where: {
      case: {
        organizationId: session.user.organizationId,
      },
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
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Fetch compliance rules
  const rules = await prisma.complianceRule.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: {
          blockers: {
            where: { isResolved: false },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return (
    <ComplianceClient
      blockers={blockers}
      rules={rules}
    />
  )
}
