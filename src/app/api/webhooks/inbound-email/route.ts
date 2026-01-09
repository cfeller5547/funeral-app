import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseInboundEmail } from '@/lib/ai/email-parser'

// This endpoint receives inbound emails from email providers
// (SendGrid Inbound Parse, Mailgun, etc.)
// The format depends on the provider - this is a generic implementation

interface InboundEmailPayload {
  from: string
  fromName?: string
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    contentType: string
    size: number
    content?: string // Base64
  }>
  // Headers for extracting organization
  headers?: Record<string, string>
}

export async function POST(request: Request) {
  try {
    // Parse the incoming email
    // Different providers send data differently - this handles JSON format
    const contentType = request.headers.get('content-type') || ''
    let payload: InboundEmailPayload

    if (contentType.includes('application/json')) {
      payload = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      // Handle form data from providers like SendGrid
      const formData = await request.formData()
      payload = {
        from: formData.get('from') as string || '',
        to: formData.get('to') as string || '',
        subject: formData.get('subject') as string || '',
        text: formData.get('text') as string || formData.get('plain') as string || '',
        html: formData.get('html') as string || '',
      }

      // Parse from field to extract name and email
      const fromMatch = payload.from.match(/^(.+?)\s*<(.+?)>$/)
      if (fromMatch) {
        payload.fromName = fromMatch[1].replace(/"/g, '')
        payload.from = fromMatch[2]
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      )
    }

    // Determine the organization from the "to" address
    // Format: intake@org-slug.funeralops.app or similar
    const toAddress = payload.to.toLowerCase()
    let organizationId: string | null = null

    // Try to find org from email domain/address
    const orgSlugMatch = toAddress.match(/intake@(.+?)\./)
    if (orgSlugMatch) {
      const org = await prisma.organization.findUnique({
        where: { slug: orgSlugMatch[1] },
        select: { id: true },
      })
      organizationId = org?.id || null
    }

    // Fallback: use a default organization (for demo purposes)
    if (!organizationId) {
      const defaultOrg = await prisma.organization.findFirst({
        select: { id: true },
      })
      organizationId = defaultOrg?.id || null
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Could not determine organization' },
        { status: 400 }
      )
    }

    // Parse the email with AI
    const emailBody = payload.text || payload.html?.replace(/<[^>]*>/g, '') || ''
    const parsedData = await parseInboundEmail(
      payload.subject,
      emailBody,
      payload.from,
      payload.fromName
    )

    // Store the inbound email
    const inboundEmail = await prisma.inboundEmail.create({
      data: {
        organizationId,
        fromEmail: payload.from,
        fromName: payload.fromName || null,
        subject: payload.subject,
        bodyText: payload.text || null,
        bodyHtml: payload.html || null,
        attachments: payload.attachments || [],
        status: 'PENDING',
        parsedData: parsedData as any,
      },
    })

    // If it's a high urgency email, we could trigger notifications here
    if (parsedData.urgency === 'HIGH') {
      console.log(`[Inbound Email] High urgency email received: ${inboundEmail.id}`)
      // TODO: Send notification to staff
    }

    return NextResponse.json({
      received: true,
      emailId: inboundEmail.id,
      summary: parsedData.summary,
      suggestedAction: parsedData.suggestedAction,
    })
  } catch (error) {
    console.error('[Inbound Email] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}
