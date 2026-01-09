import { geminiModel } from './gemini'

export interface ExtractedDecedent {
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  dateOfBirth?: string
  dateOfDeath?: string
  placeOfDeath?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  ssn?: string
  confidence: 'high' | 'medium' | 'low'
}

export interface ExtractedContact {
  firstName?: string
  lastName?: string
  role: 'NEXT_OF_KIN' | 'INFORMANT' | 'PURCHASER' | 'AUTHORIZED_AGENT' | 'CLERGY' | 'OTHER'
  relationship?: string
  phone?: string
  email?: string
  address?: string
  isPrimary: boolean
  confidence: 'high' | 'medium' | 'low'
}

export interface ExtractedService {
  serviceType?: 'TRADITIONAL' | 'MEMORIAL' | 'GRAVESIDE' | 'DIRECT_CREMATION' | 'DIRECT_BURIAL' | 'CELEBRATION_OF_LIFE'
  disposition?: 'BURIAL' | 'CREMATION' | 'ENTOMBMENT' | 'DONATION' | 'TRANSFER'
  serviceDate?: string
  serviceTime?: string
  serviceLocation?: string
  confidence: 'high' | 'medium' | 'low'
}

export interface ExtractedCaseData {
  decedent: ExtractedDecedent
  contacts: ExtractedContact[]
  service: ExtractedService
  notes?: string
  missingInfo: string[]
  questionsForFamily: string[]
  rawConfidenceScores: Record<string, number>
}

const INTAKE_PROMPT = `You are an AI assistant for a funeral home case management system. Your job is to extract structured data from intake notes, phone call transcripts, or other unstructured text about a death case.

Extract the following information and return it as valid JSON:

1. DECEDENT INFORMATION:
   - firstName, middleName, lastName, suffix
   - dateOfBirth (YYYY-MM-DD format)
   - dateOfDeath (YYYY-MM-DD format)
   - placeOfDeath (hospital, home, nursing home, etc.)
   - address, city, state, zipCode
   - ssn (if mentioned - usually partial like XXX-XX-1234)

2. CONTACTS (family members, next of kin, informant):
   - firstName, lastName
   - role: NEXT_OF_KIN, INFORMANT, PURCHASER, AUTHORIZED_AGENT, CLERGY, or OTHER
   - relationship to deceased (wife, son, daughter, etc.)
   - phone, email, address
   - isPrimary: true for the main contact

3. SERVICE DETAILS:
   - serviceType: TRADITIONAL, MEMORIAL, GRAVESIDE, DIRECT_CREMATION, DIRECT_BURIAL, or CELEBRATION_OF_LIFE
   - disposition: BURIAL, CREMATION, ENTOMBMENT, DONATION, or TRANSFER
   - serviceDate, serviceTime, serviceLocation

4. MISSING INFO: List critical information that wasn't found but is typically needed
5. QUESTIONS FOR FAMILY: Suggest questions to ask the family to fill gaps

For each extracted field, provide a confidence level:
- "high": Explicitly stated in the text
- "medium": Inferred with reasonable certainty
- "low": Guessed or very uncertain

IMPORTANT RULES:
- Only extract what is actually in the text - do not fabricate data
- Dates should be in YYYY-MM-DD format
- Phone numbers should be cleaned to digits only
- If a field cannot be determined, omit it (don't include null values)
- Be conservative with confidence levels

Return ONLY valid JSON in this exact structure:
{
  "decedent": {
    "firstName": "...",
    "lastName": "...",
    ...
    "confidence": "high|medium|low"
  },
  "contacts": [
    {
      "firstName": "...",
      "lastName": "...",
      "role": "NEXT_OF_KIN",
      "relationship": "wife",
      "phone": "...",
      "isPrimary": true,
      "confidence": "high|medium|low"
    }
  ],
  "service": {
    "serviceType": "TRADITIONAL",
    "disposition": "BURIAL",
    ...
    "confidence": "high|medium|low"
  },
  "notes": "Any additional relevant notes from the text",
  "missingInfo": ["SSN", "Date of birth", ...],
  "questionsForFamily": ["What is the deceased's date of birth?", ...],
  "rawConfidenceScores": {
    "decedentName": 0.95,
    "dateOfDeath": 0.85,
    ...
  }
}`

export async function parseIntakeNotes(notes: string): Promise<ExtractedCaseData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const result = await geminiModel.generateContent([
    INTAKE_PROMPT,
    `\n\nINTAKE NOTES TO PARSE:\n${notes}`,
  ])

  const response = result.response.text()

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr.trim())
    return parsed as ExtractedCaseData
  } catch (error) {
    console.error('Failed to parse AI response:', response)
    throw new Error('Failed to parse intake notes. Please try again.')
  }
}

// Parse with image attachments (for scanned documents, photos of paperwork)
export async function parseIntakeWithImages(
  notes: string,
  images: { mimeType: string; data: string }[]
): Promise<ExtractedCaseData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const parts: Array<string | { inlineData: { mimeType: string; data: string } }> = [
    INTAKE_PROMPT,
    `\n\nINTAKE NOTES TO PARSE:\n${notes}`,
    '\n\nATTACHED IMAGES/DOCUMENTS (extract any visible information):',
  ]

  // Add images
  for (const image of images) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    })
  }

  const result = await geminiModel.generateContent(parts)
  const response = result.response.text()

  let jsonStr = response
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr.trim())
    return parsed as ExtractedCaseData
  } catch (error) {
    console.error('Failed to parse AI response:', response)
    throw new Error('Failed to parse intake data. Please try again.')
  }
}
