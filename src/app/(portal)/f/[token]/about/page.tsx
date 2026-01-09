import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { AboutStep } from '@/components/portal/steps/about-step'

interface AboutPageProps {
  params: Promise<{ token: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
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
  const aboutData = (progress.about as Record<string, unknown>) || {}

  // Pre-populate with decedent data if available
  const initialData = {
    firstName: session.case.decedent?.firstName || '',
    lastName: session.case.decedent?.lastName || '',
    middleName: session.case.decedent?.middleName || '',
    maidenName: '',
    dateOfBirth: session.case.decedent?.dateOfBirth?.toISOString().split('T')[0] || '',
    dateOfDeath: session.case.decedent?.dateOfDeath?.toISOString().split('T')[0] || '',
    placeOfBirth: '',
    placeOfDeath: session.case.decedent?.placeOfDeath || '',
    ...aboutData,
  }

  return <AboutStep token={token} initialData={initialData} />
}
