import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  // Get organization settings
  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    include: {
      locations: true,
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!organization) {
    redirect('/login')
  }

  // Check if onboarding is already complete
  const settings = organization.settings as Record<string, unknown>
  if (settings?.onboardingComplete) {
    redirect('/app/today')
  }

  return (
    <OnboardingWizard
      organization={{
        id: organization.id,
        name: organization.name,
        timezone: organization.timezone,
        nicheMode: organization.nicheMode,
      }}
      locations={organization.locations}
      users={organization.users}
    />
  )
}
