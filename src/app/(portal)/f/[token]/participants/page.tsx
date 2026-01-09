import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ParticipantsStep } from '@/components/portal/steps/participants-step'

interface ParticipantsPageProps {
  params: Promise<{ token: string }>
}

export default async function ParticipantsPage({ params }: ParticipantsPageProps) {
  const { token } = await params

  const session = await prisma.familyPortalSession.findUnique({
    where: { token },
  })

  if (!session || new Date() > session.expiresAt) {
    notFound()
  }

  const progress = session.progress as Record<string, unknown>
  const participantsData = (progress.participants as Record<string, unknown>) || {}

  return <ParticipantsStep token={token} initialData={participantsData} />
}
