import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { OrganizationSettings } from '@/components/settings/organization-settings'

export default async function OrganizationSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  })

  if (!organization) {
    redirect('/login')
  }

  return (
    <OrganizationSettings
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        timezone: organization.timezone,
        nicheMode: organization.nicheMode,
      }}
    />
  )
}
