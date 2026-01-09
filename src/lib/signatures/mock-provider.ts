import type {
  SignatureProvider,
  Signer,
  EnvelopeResult,
  SigningUrlResult,
  SignatureStatus,
  SignerStatus,
  WebhookEvent,
  WebhookHandler,
  WebhookEventType,
} from './types'

// In-memory storage for mock envelopes
const envelopes = new Map<string, {
  documentId: string
  documentName: string
  signers: Signer[]
  status: SignatureStatus
  signerStatuses: SignerStatus[]
  createdAt: Date
  updatedAt: Date
}>()

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateOverallStatus(signerStatuses: SignerStatus[]): SignatureStatus {
  const statuses = signerStatuses.map((s) => s.status)

  if (statuses.every((s) => s === 'SIGNED')) {
    return 'COMPLETED'
  }
  if (statuses.some((s) => s === 'DECLINED')) {
    return 'DECLINED'
  }
  if (statuses.some((s) => s === 'SIGNED')) {
    return 'PARTIALLY_SIGNED'
  }
  if (statuses.some((s) => s === 'VIEWED')) {
    return 'VIEWED'
  }
  if (statuses.some((s) => s === 'SENT')) {
    return 'SENT'
  }
  return 'DRAFT'
}

export class MockSignatureProvider implements SignatureProvider {
  private simulateDelay = true
  private delayMs = 500
  private webhookHandlers: WebhookHandler[] = []

  constructor(options?: { simulateDelay?: boolean; delayMs?: number }) {
    if (options?.simulateDelay !== undefined) {
      this.simulateDelay = options.simulateDelay
    }
    if (options?.delayMs !== undefined) {
      this.delayMs = options.delayMs
    }
  }

  private async delay(): Promise<void> {
    if (this.simulateDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs))
    }
  }

  /**
   * Register a webhook handler
   */
  onWebhook(handler: WebhookHandler): void {
    this.webhookHandlers.push(handler)
  }

  /**
   * Dispatch a webhook event to all registered handlers
   */
  private async dispatchWebhook(event: WebhookEvent): Promise<void> {
    for (const handler of this.webhookHandlers) {
      try {
        await handler(event)
      } catch (error) {
        console.error('Webhook handler error:', error)
      }
    }
  }

  /**
   * Create a webhook event
   */
  private createEvent(
    type: WebhookEventType,
    envelopeId: string,
    envelope: { documentId: string; signers: Signer[] },
    signerId?: string
  ): WebhookEvent {
    const signer = signerId
      ? envelope.signers.find((s) => s.id === signerId)
      : undefined

    return {
      type,
      timestamp: new Date(),
      envelopeId,
      documentId: envelope.documentId,
      signerId,
      signerEmail: signer?.email,
    }
  }

  async createEnvelope(
    documentId: string,
    documentName: string,
    signers: Signer[]
  ): Promise<EnvelopeResult> {
    await this.delay()

    const envelopeId = generateId()
    const now = new Date()

    const signerStatuses: SignerStatus[] = signers.map((signer) => ({
      signerId: signer.id,
      status: 'SENT',
      sentAt: now,
    }))

    const envelope = {
      documentId,
      documentName,
      signers,
      status: 'SENT' as SignatureStatus,
      signerStatuses,
      createdAt: now,
      updatedAt: now,
    }

    envelopes.set(envelopeId, envelope)

    // Dispatch webhook events
    await this.dispatchWebhook(
      this.createEvent('envelope.sent', envelopeId, envelope)
    )
    for (const signer of signers) {
      await this.dispatchWebhook(
        this.createEvent('signer.sent', envelopeId, envelope, signer.id)
      )
    }

    return {
      envelopeId,
      status: envelope.status,
      signers: signerStatuses,
      createdAt: now,
    }
  }

  async getStatus(envelopeId: string): Promise<EnvelopeResult> {
    await this.delay()

    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    return {
      envelopeId,
      status: envelope.status,
      signers: envelope.signerStatuses,
      createdAt: envelope.createdAt,
    }
  }

  async getSigningUrl(
    envelopeId: string,
    signerId: string
  ): Promise<SigningUrlResult> {
    await this.delay()

    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    const signerExists = envelope.signers.some((s) => s.id === signerId)
    if (!signerExists) {
      throw new Error(`Signer not found: ${signerId}`)
    }

    // Update signer status to viewed
    const signerStatus = envelope.signerStatuses.find((s) => s.signerId === signerId)
    if (signerStatus && signerStatus.status === 'SENT') {
      signerStatus.status = 'VIEWED'
      signerStatus.viewedAt = new Date()
      envelope.status = calculateOverallStatus(envelope.signerStatuses)
      envelope.updatedAt = new Date()
    }

    // Generate a mock signing URL
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Expires in 24 hours

    return {
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mock-sign/${envelopeId}/${signerId}`,
      expiresAt,
    }
  }

  async cancelEnvelope(envelopeId: string, _reason?: string): Promise<void> {
    await this.delay()

    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    envelope.status = 'CANCELLED'
    envelope.updatedAt = new Date()
  }

  async resendNotification(envelopeId: string, signerId: string): Promise<void> {
    await this.delay()

    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    const signerStatus = envelope.signerStatuses.find((s) => s.signerId === signerId)
    if (!signerStatus) {
      throw new Error(`Signer not found: ${signerId}`)
    }

    signerStatus.sentAt = new Date()
  }

  // Mock-specific methods for simulating user actions

  /**
   * Simulate a signer signing the document
   */
  async simulateSign(envelopeId: string, signerId: string): Promise<void> {
    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    const signerStatus = envelope.signerStatuses.find((s) => s.signerId === signerId)
    if (!signerStatus) {
      throw new Error(`Signer not found: ${signerId}`)
    }

    const previousStatus = envelope.status
    signerStatus.status = 'SIGNED'
    signerStatus.signedAt = new Date()
    envelope.status = calculateOverallStatus(envelope.signerStatuses)
    envelope.updatedAt = new Date()

    // Dispatch signer.signed event
    await this.dispatchWebhook(
      this.createEvent('signer.signed', envelopeId, envelope, signerId)
    )

    // Dispatch envelope events based on status change
    if (envelope.status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      await this.dispatchWebhook(
        this.createEvent('envelope.completed', envelopeId, envelope)
      )
    } else if (envelope.status === 'PARTIALLY_SIGNED' && previousStatus !== 'PARTIALLY_SIGNED') {
      await this.dispatchWebhook(
        this.createEvent('envelope.signed', envelopeId, envelope)
      )
    }
  }

  /**
   * Simulate a signer declining to sign
   */
  async simulateDecline(envelopeId: string, signerId: string): Promise<void> {
    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    const signerStatus = envelope.signerStatuses.find((s) => s.signerId === signerId)
    if (!signerStatus) {
      throw new Error(`Signer not found: ${signerId}`)
    }

    signerStatus.status = 'DECLINED'
    envelope.status = calculateOverallStatus(envelope.signerStatuses)
    envelope.updatedAt = new Date()

    // Dispatch events
    await this.dispatchWebhook(
      this.createEvent('signer.declined', envelopeId, envelope, signerId)
    )
    await this.dispatchWebhook(
      this.createEvent('envelope.declined', envelopeId, envelope)
    )
  }

  /**
   * Simulate viewing the document
   */
  async simulateView(envelopeId: string, signerId: string): Promise<void> {
    const envelope = envelopes.get(envelopeId)

    if (!envelope) {
      throw new Error(`Envelope not found: ${envelopeId}`)
    }

    const signerStatus = envelope.signerStatuses.find((s) => s.signerId === signerId)
    if (!signerStatus) {
      throw new Error(`Signer not found: ${signerId}`)
    }

    if (signerStatus.status === 'SENT' || signerStatus.status === 'PENDING') {
      signerStatus.status = 'VIEWED'
      signerStatus.viewedAt = new Date()
      envelope.status = calculateOverallStatus(envelope.signerStatuses)
      envelope.updatedAt = new Date()

      await this.dispatchWebhook(
        this.createEvent('signer.viewed', envelopeId, envelope, signerId)
      )

      if (envelope.status === 'VIEWED') {
        await this.dispatchWebhook(
          this.createEvent('envelope.viewed', envelopeId, envelope)
        )
      }
    }
  }
}

// Export a default instance
export const mockSignatureProvider = new MockSignatureProvider()
