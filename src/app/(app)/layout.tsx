import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { AppShell } from '@/components/layout/app-shell'
import { prisma } from '@/lib/db'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch locations for the user's organization
  const locations = await prisma.location.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return <AppShell locations={locations}>{children}</AppShell>
}
