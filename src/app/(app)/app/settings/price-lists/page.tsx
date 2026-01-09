import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { PriceListsClient } from './price-lists-client'

export default async function PriceListsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const priceLists = await prisma.priceList.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: {
      effectiveDate: 'desc',
    },
  })

  return (
    <PriceListsClient
      priceLists={priceLists}
      canEdit={['OWNER', 'ADMIN', 'MANAGER'].includes(session.user.role)}
    />
  )
}
