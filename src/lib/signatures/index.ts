export * from './types'
export * from './mock-provider'

import { MockSignatureProvider } from './mock-provider'
import type { SignatureProvider } from './types'

// Get the configured signature provider
// In production, this could return different providers based on environment config
export function getSignatureProvider(): SignatureProvider {
  // For MVP, always use the mock provider
  // In production, this could check for SIGNATURE_PROVIDER env var
  // and return DocuSign, HelloSign, etc.
  return new MockSignatureProvider()
}
