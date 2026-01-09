import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { WelcomeStep } from '@/components/portal/steps/welcome-step'

interface PortalPageProps {
  params: Promise<{ token: string }>
}

export default async function PortalWelcomePage({ params }: PortalPageProps) {
  const { token } = await params

  const session = await prisma.familyPortalSession.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          decedent: true,
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!session || new Date() > session.expiresAt) {
    notFound()
  }

  const decedentName = session.case.decedent
    ? `${session.case.decedent.firstName} ${session.case.decedent.lastName}`
    : 'your loved one'

  return (
    <WelcomeStep
      token={token}
      organizationName={session.case.organization.name}
      decedentName={decedentName}
    />
  )
}
