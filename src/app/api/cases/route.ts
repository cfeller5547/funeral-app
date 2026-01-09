import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createCaseSchema = z.object({
  locationId: z.string().min(1),
  directorId: z.string().optional(),
  serviceType: z.enum(['TRADITIONAL', 'MEMORIAL', 'GRAVESIDE', 'DIRECT_CREMATION', 'DIRECT_BURIAL', 'CELEBRATION_OF_LIFE']),
  disposition: z.enum(['BURIAL', 'CREMATION', 'ENTOMBMENT', 'DONATION', 'TRANSFER']),
  serviceDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  serviceTime: z.string().optional(),

  decedentFirstName: z.string().min(1),
  decedentMiddleName: z.string().optional(),
  decedentLastName: z.string().min(1),
  decedentSuffix: z.string().optional(),
  decedentDob: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  decedentDod: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  decedentPlaceOfDeath: z.string().optional(),
  decedentAddress: z.string().optional(),
  decedentCity: z.string().optional(),
  decedentState: z.string().optional(),
  decedentZipCode: z.string().optional(),

  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  contactRole: z.enum(['NEXT_OF_KIN', 'INFORMANT', 'PURCHASER', 'AUTHORIZED_AGENT', 'CLERGY', 'OTHER']).optional(),

  notes: z.string().optional(),
})

async function generateCaseNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)

  const lastCase = await prisma.case.findFirst({
    where: {
      organizationId,
      caseNumber: {
        startsWith: year,
      },
    },
    orderBy: {
      caseNumber: 'desc',
    },
    select: {
      caseNumber: true,
    },
  })

  let sequence = 1
  if (lastCase) {
    const lastSequence = parseInt(lastCase.caseNumber.slice(2), 10)
    sequence = lastSequence + 1
  }

  return `${year}${sequence.toString().padStart(4, '0')}`
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createCaseSchema.parse(body)

    // Verify location belongs to organization
    const location = await prisma.location.findFirst({
      where: {
        id: data.locationId,
        organizationId: session.user.organizationId,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
    }

    // Generate case number
    const caseNumber = await generateCaseNumber(session.user.organizationId)

    // Create the case with decedent in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create decedent person record
      const decedent = await tx.person.create({
        data: {
          firstName: data.decedentFirstName,
          middleName: data.decedentMiddleName || null,
          lastName: data.decedentLastName,
          suffix: data.decedentSuffix || null,
          dateOfBirth: data.decedentDob || null,
          dateOfDeath: data.decedentDod || null,
          placeOfDeath: data.decedentPlaceOfDeath || null,
          address: data.decedentAddress || null,
          city: data.decedentCity || null,
          state: data.decedentState || null,
          zipCode: data.decedentZipCode || null,
        },
      })

      // Create the case
      const newCase = await tx.case.create({
        data: {
          caseNumber,
          organizationId: session.user.organizationId,
          locationId: data.locationId,
          directorId: data.directorId || null,
          serviceType: data.serviceType,
          disposition: data.disposition,
          serviceDate: data.serviceDate || null,
          serviceTime: data.serviceTime || null,
          notes: data.notes || null,
          status: 'ACTIVE',
          stage: 'INTAKE',
          decedentId: decedent.id,
        },
        include: {
          decedent: true,
          location: true,
          director: true,
        },
      })

      // Create primary contact if provided
      if (data.contactFirstName && data.contactLastName) {
        const contact = await tx.person.create({
          data: {
            firstName: data.contactFirstName,
            lastName: data.contactLastName,
            phone: data.contactPhone || null,
            email: data.contactEmail || null,
          },
        })

        await tx.caseContact.create({
          data: {
            caseId: newCase.id,
            personId: contact.id,
            role: data.contactRole || 'NEXT_OF_KIN',
            isPrimary: true,
          },
        })
      }

      // Create audit event
      await tx.auditEvent.create({
        data: {
          organizationId: session.user.organizationId,
          caseId: newCase.id,
          userId: session.user.id,
          eventType: 'CASE_CREATED',
          entityType: 'Case',
          entityId: newCase.id,
          description: `Case ${caseNumber} created for ${decedent.firstName} ${decedent.lastName}`,
        },
      })

      return newCase
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Failed to create case:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const locationId = searchParams.get('locationId')
    const directorId = searchParams.get('directorId')

    const cases = await prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(status && { status: status as any }),
        ...(stage && { stage: stage as any }),
        ...(locationId && { locationId }),
        ...(directorId && { directorId }),
      },
      include: {
        decedent: true,
        director: true,
        location: true,
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({ data: cases })
  } catch (error) {
    console.error('Failed to fetch cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}
