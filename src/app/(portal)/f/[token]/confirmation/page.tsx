import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ConfirmationStep } from '@/components/portal/steps/confirmation-step'

interface ConfirmationPageProps {
  params: Promise<{ token: string }>
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
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
          location: {
            select: {
              phone: true,
            },
          },
        },
      },
    },
  })

  if (!session) {
    notFound()
  }

  const decedentName = session.case.decedent
    ? `${session.case.decedent.firstName} ${session.case.decedent.lastName}`
    : 'your loved one'

  return (
    <ConfirmationStep
      organizationName={session.case.organization.name}
      organizationPhone={session.case.location?.phone || null}
      organizationEmail={null}
      decedentName={decedentName}
    />
  )
}
