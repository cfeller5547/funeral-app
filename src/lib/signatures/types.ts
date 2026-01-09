export type SignerRole = 'PRIMARY_CONTACT' | 'NEXT_OF_KIN' | 'PURCHASER' | 'DIRECTOR' | 'WITNESS' | 'OTHER'

export interface Signer {
  id: string
  name: string
  email: string
  role: SignerRole
  order: number
}

export type SignatureStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'PARTIALLY_SIGNED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface SignerStatus {
  signerId: string
  status: 'PENDING' | 'SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED'
  signedAt?: Date
  viewedAt?: Date
  sentAt?: Date
}

export interface EnvelopeResult {
  envelopeId: string
  status: SignatureStatus
  signers: SignerStatus[]
  createdAt: Date
}

export interface SigningUrlResult {
  url: string
  expiresAt: Date
}

export interface SignatureProvider {
  /**
   * Create a new signature envelope for a document
   */
  createEnvelope(
    documentId: string,
    documentName: string,
    signers: Signer[]
  ): Promise<EnvelopeResult>

  /**
   * Get the current status of an envelope
   */
  getStatus(envelopeId: string): Promise<EnvelopeResult>

  /**
   * Get a signing URL for a specific signer
   */
  getSigningUrl(envelopeId: string, signerId: string): Promise<SigningUrlResult>

  /**
   * Cancel an envelope
   */
  cancelEnvelope(envelopeId: string, reason?: string): Promise<void>

  /**
   * Resend notification to a signer
   */
  resendNotification(envelopeId: string, signerId: string): Promise<void>

  /**
   * Register a webhook handler for signature events
   */
  onWebhook?(handler: WebhookHandler): void
}

// Webhook event types
export type WebhookEventType =
  | 'envelope.sent'
  | 'envelope.viewed'
  | 'envelope.signed'
  | 'envelope.completed'
  | 'envelope.declined'
  | 'envelope.expired'
  | 'envelope.cancelled'
  | 'signer.sent'
  | 'signer.viewed'
  | 'signer.signed'
  | 'signer.declined'

export interface WebhookEvent {
  type: WebhookEventType
  timestamp: Date
  envelopeId: string
  documentId: string
  signerId?: string
  signerEmail?: string
  data?: Record<string, any>
}

export type WebhookHandler = (event: WebhookEvent) => Promise<void>
