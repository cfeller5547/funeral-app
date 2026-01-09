import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  return NextResponse.json({ data: priceLists })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has permission
  if (!['OWNER', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const { name, effectiveDate, items, copyFromId } = body

  // If copying from another price list
  let itemsToCreate = items || []
  if (copyFromId) {
    const sourcePriceList = await prisma.priceList.findUnique({
      where: { id: copyFromId },
      include: { items: true },
    })

    if (sourcePriceList && sourcePriceList.organizationId === session.user.organizationId) {
      itemsToCreate = sourcePriceList.items.map((item) => ({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
      }))
    }
  }

  const priceList = await prisma.priceList.create({
    data: {
      organizationId: session.user.organizationId,
      name,
      effectiveDate: new Date(effectiveDate),
      isActive: false,
      items: {
        create: itemsToCreate,
      },
    },
    include: {
      items: true,
      _count: {
        select: { items: true },
      },
    },
  })

  return NextResponse.json({ data: priceList })
}
