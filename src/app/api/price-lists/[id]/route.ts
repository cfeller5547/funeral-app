import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    return NextResponse.json({ error: 'Price list not found' }, { status: 404 })
  }

  return NextResponse.json({ data: priceList })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['OWNER', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  const { name, effectiveDate, isActive, items } = body

  // Verify ownership
  const existing = await prisma.priceList.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Price list not found' }, { status: 404 })
  }

  // If activating this price list, deactivate others
  if (isActive && !existing.isActive) {
    await prisma.priceList.updateMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      data: { isActive: false },
    })
  }

  // Update price list
  const priceList = await prisma.priceList.update({
    where: { id },
    data: {
      name,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      isActive,
    },
  })

  // If items provided, update them
  if (items) {
    // Delete existing items
    await prisma.priceListItem.deleteMany({
      where: { priceListId: id },
    })

    // Create new items
    await prisma.priceListItem.createMany({
      data: items.map((item: any) => ({
        priceListId: id,
        name: item.name,
        description: item.description || null,
        category: item.category || null,
        price: item.price,
      })),
    })
  }

  const updated = await prisma.priceList.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      },
      _count: {
        select: { items: true },
      },
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!['OWNER', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Verify ownership
  const existing = await prisma.priceList.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Price list not found' }, { status: 404 })
  }

  // Don't allow deleting active price list
  if (existing.isActive) {
    return NextResponse.json(
      { error: 'Cannot delete active price list. Deactivate it first.' },
      { status: 400 }
    )
  }

  await prisma.priceList.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
