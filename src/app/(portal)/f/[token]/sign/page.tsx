import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { SignStep } from '@/components/portal/steps/sign-step'

interface SignPageProps {
  params: Promise<{ token: string }>
}

export default async function SignPage({ params }: SignPageProps) {
  const { token } = await params

  const session = await prisma.familyPortalSession.findUnique({
    where: { token },
    include: {
      case: {
        include: {
          decedent: true,
          documents: {
            where: {
              tag: {
                in: ['CONTRACT', 'AUTHORIZATION_CREMATION', 'AUTHORIZATION_DISPOSITION'],
              },
              status: {
                in: ['GENERATED', 'SENT_FOR_SIGNATURE'],
              },
            },
          },
        },
      },
    },
  })

  if (!session || new Date() > session.expiresAt) {
    notFound()
  }

  const documentsToSign = session.case.documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    tag: doc.tag,
    status: doc.status,
  }))

  return <SignStep token={token} documentsToSign={documentsToSign} />
}
