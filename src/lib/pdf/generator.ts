// PDF Generation utilities
// In production, this would use @react-pdf/renderer or similar
// For MVP, we'll create a mock PDF generation system

export interface MergeFieldContext {
  case: {
    caseNumber: string
    serviceDate?: string | null
    serviceTime?: string | null
    serviceType: string
    disposition: string
    notes?: string | null
  }
  decedent: {
    fullName: string
    firstName: string
    middleName?: string | null
    lastName: string
    suffix?: string | null
    dateOfBirth?: string | null
    dateOfDeath?: string | null
    placeOfDeath?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zipCode?: string | null
  }
  primaryContact?: {
    fullName: string
    firstName: string
    lastName: string
    phone?: string | null
    email?: string | null
    role: string
  }
  organization: {
    name: string
    address?: string | null
    phone?: string | null
    email?: string | null
  }
  location: {
    name: string
    address?: string | null
    phone?: string | null
  }
  currentDate: string
  currentTime: string
}

// Parse merge fields from template content
// Format: {{decedent.fullName}}, {{case.caseNumber}}, etc.
export function parseMergeFields(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const matches: string[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1].trim())
  }
  return [...new Set(matches)]
}

// Apply merge fields to template content
export function applyMergeFields(
  content: string,
  context: MergeFieldContext
): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (_, field: string) => {
    const parts = field.trim().split('.')
    let value: unknown = context

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return `[${field}]` // Field not found
      }
    }

    return value !== null && value !== undefined ? String(value) : ''
  })
}

// Process conditional blocks in template
// Format: {{#if disposition.cremation}}...{{/if}}
export function processConditionals(
  content: string,
  context: MergeFieldContext
): string {
  // Simple conditional processing
  // {{#if fieldPath}}content{{/if}}
  const conditionalRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g

  return content.replace(conditionalRegex, (_, condition: string, innerContent: string) => {
    const parts = condition.trim().split('.')
    let value: unknown = context

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return '' // Condition not met
      }
    }

    // Check for equality conditions like "disposition.cremation"
    if (parts.length === 2 && parts[0] === 'disposition') {
      const dispositionType = parts[1].toUpperCase()
      if ((context.case.disposition as string) === dispositionType) {
        return innerContent
      }
      return ''
    }

    return value ? innerContent : ''
  })
}

// Build merge field context from database objects
export function buildMergeFieldContext(
  caseData: {
    caseNumber: string
    serviceDate: Date | null
    serviceTime: string | null
    serviceType: string
    disposition: string
    notes: string | null
    decedent: {
      firstName: string
      middleName: string | null
      lastName: string
      suffix: string | null
      dateOfBirth: Date | null
      dateOfDeath: Date | null
      placeOfDeath: string | null
      address: string | null
      city: string | null
      state: string | null
      zipCode: string | null
    }
    location: {
      name: string
      address: string | null
      phone: string | null
    }
    organization: {
      name: string
    }
    contacts?: Array<{
      isPrimary: boolean
      role: string
      person: {
        firstName: string
        lastName: string
        phone: string | null
        email: string | null
      }
    }>
  }
): MergeFieldContext {
  const decedent = caseData.decedent
  const primaryContactRel = caseData.contacts?.find(c => c.isPrimary)
  const primaryContact = primaryContactRel?.person

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString() : ''

  return {
    case: {
      caseNumber: caseData.caseNumber,
      serviceDate: caseData.serviceDate ? formatDate(caseData.serviceDate) : null,
      serviceTime: caseData.serviceTime,
      serviceType: caseData.serviceType,
      disposition: caseData.disposition,
      notes: caseData.notes,
    },
    decedent: {
      fullName: [decedent.firstName, decedent.middleName, decedent.lastName, decedent.suffix]
        .filter(Boolean)
        .join(' '),
      firstName: decedent.firstName,
      middleName: decedent.middleName,
      lastName: decedent.lastName,
      suffix: decedent.suffix,
      dateOfBirth: decedent.dateOfBirth ? formatDate(decedent.dateOfBirth) : null,
      dateOfDeath: decedent.dateOfDeath ? formatDate(decedent.dateOfDeath) : null,
      placeOfDeath: decedent.placeOfDeath,
      address: decedent.address,
      city: decedent.city,
      state: decedent.state,
      zipCode: decedent.zipCode,
    },
    primaryContact: primaryContact ? {
      fullName: `${primaryContact.firstName} ${primaryContact.lastName}`,
      firstName: primaryContact.firstName,
      lastName: primaryContact.lastName,
      phone: primaryContact.phone,
      email: primaryContact.email,
      role: primaryContactRel?.role || 'NEXT_OF_KIN',
    } : undefined,
    organization: {
      name: caseData.organization.name,
      address: null,
      phone: null,
      email: null,
    },
    location: {
      name: caseData.location.name,
      address: caseData.location.address,
      phone: caseData.location.phone,
    },
    currentDate: new Date().toLocaleDateString(),
    currentTime: new Date().toLocaleTimeString(),
  }
}

// Generate document from template (mock implementation)
// In production, this would generate actual PDF using @react-pdf/renderer
export async function generateDocument(
  templateContent: string,
  context: MergeFieldContext
): Promise<{ content: string; format: string }> {
  // Process conditionals first
  let processed = processConditionals(templateContent, context)

  // Then apply merge fields
  processed = applyMergeFields(processed, context)

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    content: processed,
    format: 'html', // In production, would be 'pdf'
  }
}

// Extract signature field positions from template
export interface SignatureField {
  id: string
  label: string
  signerRole: string // Who should sign: 'PRIMARY_CONTACT', 'DIRECTOR', etc.
  required: boolean
}

export function extractSignatureFields(content: string): SignatureField[] {
  // Format: {{signature:fieldId:label:role:required}}
  const regex = /\{\{signature:([^:]+):([^:]+):([^:]+):([^}]+)\}\}/g
  const fields: SignatureField[] = []
  let match

  while ((match = regex.exec(content)) !== null) {
    fields.push({
      id: match[1],
      label: match[2],
      signerRole: match[3],
      required: match[4].toLowerCase() === 'true',
    })
  }

  return fields
}
