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

  const email = await prisma.inboundEmail.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  return NextResponse.json({ data: email })
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

  const body = await request.json()
  const { action, linkedCaseId } = body

  const email = await prisma.inboundEmail.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  })

  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  let updatedEmail

  switch (action) {
    case 'ignore':
      updatedEmail = await prisma.inboundEmail.update({
        where: { id },
        data: {
          status: 'IGNORED',
          processedAt: new Date(),
        },
      })
      break

    case 'link':
      if (!linkedCaseId) {
        return NextResponse.json(
          { error: 'Case ID required for linking' },
          { status: 400 }
        )
      }

      // Verify case belongs to org
      const caseExists = await prisma.case.findFirst({
        where: {
          id: linkedCaseId,
          organizationId: session.user.organizationId,
        },
      })

      if (!caseExists) {
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        )
      }

      updatedEmail = await prisma.inboundEmail.update({
        where: { id },
        data: {
          status: 'LINKED',
          linkedCaseId,
          processedAt: new Date(),
        },
      })

      // Add the email as a note to the case
      await prisma.auditEvent.create({
        data: {
          organizationId: session.user.organizationId,
          caseId: linkedCaseId,
          userId: session.user.id,
          eventType: 'EMAIL_LINKED',
          entityType: 'Case',
          entityId: linkedCaseId,
          description: `Email from ${email.fromName || email.fromEmail}: ${email.subject}`,
          metadata: {
            emailId: email.id,
            fromEmail: email.fromEmail,
          },
        },
      })
      break

    case 'process':
      updatedEmail = await prisma.inboundEmail.update({
        where: { id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      })
      break

    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
  }

  return NextResponse.json({ data: updatedEmail })
}
