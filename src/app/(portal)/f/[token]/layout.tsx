import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalProgress } from '@/components/portal/portal-progress'

interface PortalLayoutProps {
  children: React.ReactNode
  params: Promise<{ token: string }>
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { token } = await params

  // Validate token and get session
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

  if (!session) {
    notFound()
  }

  // Check if expired
  if (new Date() > session.expiresAt) {
    return (
      <div className="min-h-screen bg-[#FFFAF0] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Link Expired</h1>
          <p className="text-gray-600">
            This portal link has expired. Please contact {session.case.organization.name} for a new link.
          </p>
        </div>
      </div>
    )
  }

  // Update last accessed
  await prisma.familyPortalSession.update({
    where: { id: session.id },
    data: { lastAccessedAt: new Date() },
  })

  const decedentName = session.case.decedent
    ? `${session.case.decedent.firstName} ${session.case.decedent.lastName}`
    : 'Your Loved One'

  return (
    <div className="min-h-screen bg-[#FFFAF0]">
      <PortalHeader
        organizationName={session.case.organization.name}
        decedentName={decedentName}
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PortalProgress
          token={token}
          currentStatus={session.status}
          progress={session.progress as Record<string, boolean>}
        />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
