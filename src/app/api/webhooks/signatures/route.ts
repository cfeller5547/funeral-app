import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { WebhookEvent } from '@/lib/signatures/types'

// This endpoint handles webhook events from signature providers
// In production, this would verify the webhook signature before processing

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as WebhookEvent

    console.log(`[Signature Webhook] ${event.type}:`, {
      envelopeId: event.envelopeId,
      documentId: event.documentId,
      signerId: event.signerId,
    })

    // Find the signature request by provider ID
    const signatureRequest = await prisma.signatureRequest.findFirst({
      where: {
        providerId: event.envelopeId,
      },
      include: {
        signers: true,
        document: true,
        case: true,
      },
    })

    if (!signatureRequest) {
      console.log(`[Signature Webhook] Request not found for envelope: ${event.envelopeId}`)
      return NextResponse.json({ received: true })
    }

    // Handle different event types
    switch (event.type) {
      case 'envelope.sent':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: {
            status: 'PENDING',
            sentAt: event.timestamp,
          },
        })
        await prisma.document.update({
          where: { id: signatureRequest.documentId },
          data: { status: 'SENT_FOR_SIGNATURE' },
        })
        break

      case 'envelope.viewed':
        // Just log, no status change needed
        break

      case 'envelope.signed':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: { status: 'PARTIALLY_SIGNED' },
        })
        break

      case 'envelope.completed':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: {
            status: 'COMPLETED',
            completedAt: event.timestamp,
          },
        })
        await prisma.document.update({
          where: { id: signatureRequest.documentId },
          data: { status: 'SIGNED' },
        })

        // Create audit event
        await prisma.auditEvent.create({
          data: {
            organizationId: signatureRequest.case.organizationId,
            caseId: signatureRequest.caseId,
            eventType: 'DOCUMENT_SIGNED',
            entityType: 'Document',
            entityId: signatureRequest.documentId,
            description: `Document "${signatureRequest.document.name}" was fully signed`,
            metadata: {
              documentId: signatureRequest.documentId,
              signatureRequestId: signatureRequest.id,
            },
          },
        })

        // Re-evaluate compliance blockers
        await evaluateComplianceForCase(signatureRequest.caseId)
        break

      case 'envelope.declined':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: { status: 'DECLINED' },
        })

        // Create audit event
        await prisma.auditEvent.create({
          data: {
            organizationId: signatureRequest.case.organizationId,
            caseId: signatureRequest.caseId,
            eventType: 'SIGNATURE_DECLINED',
            entityType: 'SignatureRequest',
            entityId: signatureRequest.id,
            description: `Signature request for "${signatureRequest.document.name}" was declined`,
            metadata: {
              signerId: event.signerId,
              signerEmail: event.signerEmail,
            },
          },
        })
        break

      case 'envelope.expired':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: { status: 'EXPIRED' },
        })
        break

      case 'envelope.cancelled':
        await prisma.signatureRequest.update({
          where: { id: signatureRequest.id },
          data: { status: 'VOIDED' },
        })
        break

      case 'signer.sent':
        if (event.signerId) {
          await prisma.signatureRequestSigner.updateMany({
            where: {
              requestId: signatureRequest.id,
              email: event.signerEmail,
            },
            data: { status: 'SENT' },
          })
        }
        break

      case 'signer.viewed':
        if (event.signerId) {
          await prisma.signatureRequestSigner.updateMany({
            where: {
              requestId: signatureRequest.id,
              email: event.signerEmail,
            },
            data: { status: 'VIEWED' },
          })
        }
        break

      case 'signer.signed':
        if (event.signerId) {
          await prisma.signatureRequestSigner.updateMany({
            where: {
              requestId: signatureRequest.id,
              email: event.signerEmail,
            },
            data: {
              status: 'SIGNED',
              signedAt: event.timestamp,
            },
          })
        }
        break

      case 'signer.declined':
        if (event.signerId) {
          await prisma.signatureRequestSigner.updateMany({
            where: {
              requestId: signatureRequest.id,
              email: event.signerEmail,
            },
            data: { status: 'DECLINED' },
          })
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Signature Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Re-evaluate compliance rules for a case after signature completion
async function evaluateComplianceForCase(caseId: string) {
  try {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        organization: {
          include: {
            rules: {
              where: { isActive: true },
            },
          },
        },
        documents: {
          include: {
            signatureRequest: true,
          },
        },
        blockers: {
          where: { isResolved: false },
          include: { rule: true },
        },
      },
    })

    if (!caseData) return

    // Check if any signature-related blockers can now be resolved
    for (const blocker of caseData.blockers) {
      if (
        blocker.rule.requirementType === 'DOCUMENT_SIGNED' ||
        blocker.rule.requirementType === 'SIGNATURE_COMPLETED'
      ) {
        // Find the required document
        const requiredDoc = caseData.documents.find(
          (doc) => doc.tag === blocker.rule.requirementTag
        )

        if (requiredDoc?.status === 'SIGNED') {
          // Resolve the blocker
          await prisma.blocker.update({
            where: { id: blocker.id },
            data: {
              isResolved: true,
              resolvedAt: new Date(),
            },
          })

          console.log(`[Compliance] Resolved blocker: ${blocker.message}`)
        }
      }
    }
  } catch (error) {
    console.error('[Compliance] Error re-evaluating:', error)
  }
}
