import { geminiModel } from './gemini'
import type { ExtractedCaseData } from './intake-parser'

export interface ParsedEmail {
  caseData: ExtractedCaseData | null
  summary: string
  isNewCaseRequest: boolean
  urgency: 'HIGH' | 'NORMAL' | 'LOW'
  suggestedAction: 'CREATE_CASE' | 'UPDATE_EXISTING' | 'INFORMATIONAL' | 'SPAM'
  possibleCaseNumber?: string
  replyNeeded: boolean
  keyPoints: string[]
}

const EMAIL_PARSER_PROMPT = `You are an AI assistant for a funeral home analyzing incoming emails to extract case information.

Analyze this email and determine:
1. Is this a request for new services (new case)?
2. Is this related to an existing case? (Look for case numbers like FH-2024-0001)
3. What action should be taken?
4. How urgent is this?

For new case requests, extract as much information as possible about:
- Decedent (name, date of death, age, etc.)
- Family contacts (names, phone, email, relationship)
- Service preferences (burial/cremation, religious preferences)
- Any dates mentioned

Return your analysis as JSON with this structure:
{
  "summary": "Brief 1-2 sentence summary of the email",
  "isNewCaseRequest": true/false,
  "urgency": "HIGH" | "NORMAL" | "LOW",
  "suggestedAction": "CREATE_CASE" | "UPDATE_EXISTING" | "INFORMATIONAL" | "SPAM",
  "possibleCaseNumber": "FH-2024-0001 or null if not found",
  "replyNeeded": true/false,
  "keyPoints": ["key point 1", "key point 2"],
  "caseData": {
    // Only if isNewCaseRequest is true
    "decedent": {
      "firstName": "",
      "lastName": "",
      "dateOfDeath": "YYYY-MM-DD or null",
      "dateOfBirth": "YYYY-MM-DD or null",
      "age": number or null,
      "placeOfDeath": ""
    },
    "contacts": [
      {
        "firstName": "",
        "lastName": "",
        "relationship": "",
        "role": "NEXT_OF_KIN" | "PURCHASER" | "INFORMANT" | "OTHER",
        "phone": "",
        "email": "",
        "address": ""
      }
    ],
    "servicePreferences": {
      "disposition": "BURIAL" | "CREMATION" | "ENTOMBMENT" | null,
      "serviceType": "TRADITIONAL" | "MEMORIAL" | "GRAVESIDE" | "DIRECT_CREMATION" | "DIRECT_BURIAL" | "CELEBRATION_OF_LIFE" | null,
      "religiousAffiliation": "",
      "requestedDate": "YYYY-MM-DD or null",
      "specialRequests": ""
    },
    "notes": "Any additional context from the email"
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`

export async function parseInboundEmail(
  subject: string,
  body: string,
  fromEmail: string,
  fromName?: string
): Promise<ParsedEmail> {
  try {
    const prompt = `${EMAIL_PARSER_PROMPT}

Email Details:
From: ${fromName ? `${fromName} <${fromEmail}>` : fromEmail}
Subject: ${subject}

Body:
${body}`

    const result = await geminiModel.generateContent(prompt)
    const response = result.response.text()

    // Clean up the response - remove markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedResponse) as ParsedEmail

    return {
      caseData: parsed.caseData || null,
      summary: parsed.summary || 'Unable to summarize',
      isNewCaseRequest: parsed.isNewCaseRequest || false,
      urgency: parsed.urgency || 'NORMAL',
      suggestedAction: parsed.suggestedAction || 'INFORMATIONAL',
      possibleCaseNumber: parsed.possibleCaseNumber || undefined,
      replyNeeded: parsed.replyNeeded || false,
      keyPoints: parsed.keyPoints || [],
    }
  } catch (error) {
    console.error('Email parsing error:', error)
    return {
      caseData: null,
      summary: 'Failed to parse email',
      isNewCaseRequest: false,
      urgency: 'NORMAL',
      suggestedAction: 'INFORMATIONAL',
      replyNeeded: false,
      keyPoints: [],
    }
  }
}
