import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'

export async function POST(
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

  const parsedData = email.parsedData as any

  if (!parsedData?.caseData) {
    return NextResponse.json(
      { error: 'No case data extracted from email' },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { locationId, directorId, overrides } = body

  // Get default location if not specified
  let finalLocationId = locationId
  if (!finalLocationId) {
    const defaultLocation = await prisma.location.findFirst({
      where: {
        organizationId: session.user.organizationId,
        isDefault: true,
      },
      select: { id: true },
    })
    finalLocationId = defaultLocation?.id
  }

  if (!finalLocationId) {
    return NextResponse.json(
      { error: 'No location specified and no default found' },
      { status: 400 }
    )
  }

  // Generate case number
  const year = new Date().getFullYear()
  const count = await prisma.case.count({
    where: { organizationId: session.user.organizationId },
  })
  const caseNumber = `FH-${year}-${String(count + 1).padStart(4, '0')}`

  const caseData = { ...parsedData.caseData, ...overrides }

  try {
    // Create the case with transaction
    const newCase = await prisma.$transaction(async (tx) => {
      // Create decedent person record
      let decedentId: string | null = null
      if (caseData.decedent) {
        const decedent = await tx.person.create({
          data: {
            firstName: caseData.decedent.firstName || 'Unknown',
            lastName: caseData.decedent.lastName || 'Unknown',
            dateOfDeath: caseData.decedent.dateOfDeath
              ? new Date(caseData.decedent.dateOfDeath)
              : null,
            dateOfBirth: caseData.decedent.dateOfBirth
              ? new Date(caseData.decedent.dateOfBirth)
              : null,
            placeOfDeath: caseData.decedent.placeOfDeath || null,
          },
        })
        decedentId = decedent.id
      }

      // Create the case
      const createdCase = await tx.case.create({
        data: {
          caseNumber,
          organizationId: session.user.organizationId,
          locationId: finalLocationId,
          directorId: directorId || session.user.id,
          decedentId,
          status: 'DRAFT',
          stage: 'INTAKE',
          disposition: caseData.servicePreferences?.disposition || 'BURIAL',
          serviceType: caseData.servicePreferences?.serviceType || 'TRADITIONAL',
          notes: caseData.notes || `Created from email: ${email.subject}`,
          serviceDate: caseData.servicePreferences?.requestedDate
            ? new Date(caseData.servicePreferences.requestedDate)
            : null,
        },
      })

      // Create contact records
      if (caseData.contacts && caseData.contacts.length > 0) {
        for (const contact of caseData.contacts) {
          const person = await tx.person.create({
            data: {
              firstName: contact.firstName || 'Unknown',
              lastName: contact.lastName || 'Unknown',
              phone: contact.phone || null,
              email: contact.email || null,
              address: contact.address || null,
            },
          })

          await tx.caseContact.create({
            data: {
              caseId: createdCase.id,
              personId: person.id,
              role: contact.role || 'OTHER',
              isPrimary: contact.role === 'NEXT_OF_KIN',
            },
          })
        }
      }

      // Create audit event
      await tx.auditEvent.create({
        data: {
          organizationId: session.user.organizationId,
          caseId: createdCase.id,
          userId: session.user.id,
          eventType: 'CASE_CREATED',
          entityType: 'Case',
          entityId: createdCase.id,
          description: `Case created from inbound email: ${email.subject}`,
          metadata: {
            emailId: email.id,
            fromEmail: email.fromEmail,
          },
        },
      })

      return createdCase
    })

    // Update the email status
    await prisma.inboundEmail.update({
      where: { id },
      data: {
        status: 'LINKED',
        linkedCaseId: newCase.id,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({
      data: newCase,
      message: 'Case created successfully',
    })
  } catch (error) {
    console.error('Error creating case from email:', error)
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}
