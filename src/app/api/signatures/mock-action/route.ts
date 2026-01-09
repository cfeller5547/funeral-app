import { NextResponse } from 'next/server'
import { MockSignatureProvider } from '@/lib/signatures/mock-provider'

// Create a provider instance with webhook handler
const provider = new MockSignatureProvider({ simulateDelay: true, delayMs: 500 })

// Register webhook handler to forward events to our webhook endpoint
provider.onWebhook(async (event) => {
  try {
    // In a real scenario, this would be called by the external provider
    // For mock mode, we simulate it by calling our own webhook endpoint
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/signatures`

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch (error) {
    console.error('Failed to dispatch webhook:', error)
  }
})

export async function POST(request: Request) {
  try {
    const { action, envelopeId, signerId } = await request.json()

    switch (action) {
      case 'sign':
        await provider.simulateSign(envelopeId, signerId)
        break
      case 'decline':
        await provider.simulateDecline(envelopeId, signerId)
        break
      case 'view':
        await provider.simulateView(envelopeId, signerId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mock action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    )
  }
}
