import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { CaseList } from '@/components/cases/case-list'

export default async function CasesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const cases = await prisma.case.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      decedent: true,
      director: true,
      location: true,
      _count: {
        select: {
          blockers: {
            where: { isResolved: false },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 100,
  })

  const locations = await prisma.location.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  })

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

  return (
    <CaseList
      cases={cases}
      locations={locations}
      directors={directors}
    />
  )
}
