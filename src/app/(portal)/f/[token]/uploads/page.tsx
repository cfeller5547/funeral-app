import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { UploadsStep } from '@/components/portal/steps/uploads-step'

interface UploadsPageProps {
  params: Promise<{ token: string }>
}

export default async function UploadsPage({ params }: UploadsPageProps) {
  const { token } = await params

  const session = await prisma.familyPortalSession.findUnique({
    where: { token },
  })

  if (!session || new Date() > session.expiresAt) {
    notFound()
  }

  const progress = session.progress as Record<string, unknown>
  const uploadsData = (progress.uploads as Record<string, unknown>) || {}

  return <UploadsStep token={token} initialData={uploadsData} />
}
