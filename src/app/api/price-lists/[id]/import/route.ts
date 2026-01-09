import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

interface ParsedItem {
  name: string
  description?: string
  category?: string
  price: number
}

function parseCSV(csvText: string): ParsedItem[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Parse header row
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('item'))
  const descIdx = headers.findIndex((h) => h.includes('desc'))
  const catIdx = headers.findIndex((h) => h.includes('cat') || h.includes('type'))
  const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('cost') || h.includes('amount'))

  if (nameIdx === -1 || priceIdx === -1) {
    throw new Error('CSV must have "name" and "price" columns')
  }

  const items: ParsedItem[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle quoted values with commas
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const name = values[nameIdx]?.replace(/^"|"$/g, '')
    const priceStr = values[priceIdx]?.replace(/[$,"]/g, '')
    const price = parseFloat(priceStr)

    if (name && !isNaN(price)) {
      items.push({
        name,
        description: descIdx !== -1 ? values[descIdx]?.replace(/^"|"$/g, '') : undefined,
        category: catIdx !== -1 ? values[catIdx]?.replace(/^"|"$/g, '') : undefined,
        price,
      })
    }
  }

  return items
}

export async function POST(
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
  const priceList = await prisma.priceList.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })

  if (!priceList) {
    return NextResponse.json({ error: 'Price list not found' }, { status: 404 })
  }

  const body = await request.json()
  const { csvData, replaceExisting } = body

  try {
    const items = parseCSV(csvData)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No valid items found in CSV' },
        { status: 400 }
      )
    }

    if (replaceExisting) {
      await prisma.priceListItem.deleteMany({
        where: { priceListId: id },
      })
    }

    await prisma.priceListItem.createMany({
      data: items.map((item) => ({
        priceListId: id,
        name: item.name,
        description: item.description || null,
        category: item.category || null,
        price: item.price,
      })),
    })

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

    return NextResponse.json({
      data: updated,
      imported: items.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse CSV' },
      { status: 400 }
    )
  }
}
