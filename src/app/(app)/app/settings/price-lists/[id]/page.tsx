import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { PriceListEditorClient } from './price-list-editor-client'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PriceListEditorPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    redirect('/login')
  }

  const priceList = await prisma.priceList.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      items: {
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      },
    },
  })

  if (!priceList) {
    notFound()
  }

  return (
    <PriceListEditorClient
      priceList={priceList}
      canEdit={['OWNER', 'ADMIN', 'MANAGER'].includes(session.user.role)}
    />
  )
}
