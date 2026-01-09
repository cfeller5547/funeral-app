import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ReviewStep } from '@/components/portal/steps/review-step'

interface ReviewPageProps {
  params: Promise<{ token: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
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

  return (
    <ReviewStep
      token={token}
      aboutData={(progress.about as Record<string, unknown>) || {}}
      obituaryData={(progress.obituary as Record<string, unknown>) || {}}
      participantsData={(progress.participants as Record<string, unknown>) || {}}
      uploadsData={(progress.uploads as Record<string, unknown>) || {}}
    />
  )
}
