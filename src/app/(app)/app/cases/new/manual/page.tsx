import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { NewCaseForm } from '@/components/cases/new-case-form'

export default async function ManualCasePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const locations = await prisma.location.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      name: true,
      isDefault: true,
    },
    orderBy: {
      name: 'asc',
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
    orderBy: {
      name: 'asc',
    },
  })

  const defaultLocation = locations.find((l) => l.isDefault) || locations[0]

  return (
    <NewCaseForm
      locations={locations}
      directors={directors}
      defaultLocationId={defaultLocation?.id}
      currentUserId={session.user.id}
    />
  )
}
