import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getSignatureProvider } from '@/lib/signatures'

const createSignatureRequestSchema = z.object({
  documentId: z.string().min(1),
  signers: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['PRIMARY_CONTACT', 'NEXT_OF_KIN', 'PURCHASER', 'DIRECTOR', 'WITNESS', 'OTHER']),
    order: z.number().int().positive(),
  })).min(1),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const caseId = searchParams.get('caseId')

    const signatureRequests = await prisma.signatureRequest.findMany({
      where: {
        document: {
          case: {
            organizationId: session.user.organizationId,
          },
          ...(documentId && { id: documentId }),
          ...(caseId && { caseId }),
        },
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            tag: true,
            case: {
              select: {
                caseNumber: true,
                decedent: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        signers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: signatureRequests })
  } catch (error) {
    console.error('Failed to fetch signature requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signature requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createSignatureRequestSchema.parse(body)

    // Verify document belongs to organization
    const document = await prisma.document.findFirst({
      where: {
        id: data.documentId,
        case: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        case: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Create signers with IDs
    const signersWithIds = data.signers.map((signer, index) => ({
      ...signer,
      id: `signer-${Date.now()}-${index}`,
    }))

    // Create envelope with signature provider
    const provider = getSignatureProvider()
    const envelope = await provider.createEnvelope(
      document.id,
      document.name,
      signersWithIds
    )

    // Create signature request in database
    const signatureRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.signatureRequest.create({
        data: {
          caseId: document.caseId,
          documentId: document.id,
          providerId: envelope.envelopeId,
          providerName: 'mock',
          status: 'PENDING',
          sentAt: new Date(),
        },
      })

      // Create signer records
      for (const signer of signersWithIds) {
        await tx.signatureRequestSigner.create({
          data: {
            requestId: request.id,
            name: signer.name,
            email: signer.email,
            role: signer.role,
            order: signer.order,
            status: 'SENT',
          },
        })
      }

      // Update document status
      await tx.document.update({
        where: { id: document.id },
        data: { status: 'SENT_FOR_SIGNATURE' },
      })

      return request
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        caseId: document.caseId,
        userId: session.user.id,
        eventType: 'SIGNATURE_REQUESTED',
        entityType: 'SignatureRequest',
        entityId: signatureRequest.id,
        description: `Signature request sent for "${document.name}" to ${data.signers.length} signer(s)`,
      },
    })

    // Fetch full request with relations
    const fullRequest = await prisma.signatureRequest.findUnique({
      where: { id: signatureRequest.id },
      include: {
        document: true,
        signers: true,
      },
    })

    return NextResponse.json({ data: fullRequest })
  } catch (error) {
    console.error('Failed to create signature request:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create signature request' },
      { status: 500 }
    )
  }
}
