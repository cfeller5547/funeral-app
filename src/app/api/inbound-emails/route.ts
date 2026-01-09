import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PENDING'

  const emails = await prisma.inboundEmail.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: status as any,
    },
    orderBy: {
      receivedAt: 'desc',
    },
    take: 50,
  })

  return NextResponse.json({ data: emails })
}
