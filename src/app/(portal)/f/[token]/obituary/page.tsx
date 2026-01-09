import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ObituaryStep } from '@/components/portal/steps/obituary-step'

interface ObituaryPageProps {
  params: Promise<{ token: string }>
}

export default async function ObituaryPage({ params }: ObituaryPageProps) {
  const { token } = await params

  const session = await prisma.familyPortalSession.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          decedent: true,
        },
      },
    },
  })

  if (!session || new Date() > session.expiresAt) {
    notFound()
  }

  const progress = session.progress as Record<string, unknown>
  const obituaryData = (progress.obituary as Record<string, unknown>) || {}

  return <ObituaryStep token={token} initialData={obituaryData} />
}
