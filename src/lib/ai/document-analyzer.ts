import { geminiProModel } from './gemini'

export type DocumentTag =
  | 'GPL'
  | 'CONTRACT'
  | 'AUTHORIZATION_CREMATION'
  | 'AUTHORIZATION_EMBALMING'
  | 'AUTHORIZATION_DISPOSITION'
  | 'PERMIT_BURIAL'
  | 'PERMIT_TRANSIT'
  | 'DEATH_CERTIFICATE'
  | 'ID_VERIFICATION'
  | 'OBITUARY'
  | 'PROGRAM'
  | 'CHECKLIST'
  | 'OTHER'

export interface DocumentAnalysis {
  suggestedTag: DocumentTag
  suggestedName: string
  description: string
  confidence: number

  // Case matching
  possibleCaseMatches?: {
    decedentName: string
    caseNumber?: string
    confidence: number
  }[]

  // Extracted data
  extractedData?: {
    decedentName?: string
    dateOfDeath?: string
    dateOfBirth?: string
    signatures?: { name: string; signed: boolean; date?: string }[]
    issueDate?: string
    expirationDate?: string
    issuingAuthority?: string
  }

  // Compliance relevance
  complianceRelevance?: {
    couldSatisfyRule: boolean
    ruleType?: string
    requiresSignature: boolean
    isSigned: boolean
  }

  // OCR text (for searchability)
  ocrText?: string
}

const DOCUMENT_ANALYSIS_PROMPT = `You are an AI assistant for a funeral home case management system. Analyze the uploaded document image and extract key information.

Your task:
1. IDENTIFY the document type from these categories:
   - GPL (General Price List)
   - CONTRACT (funeral service contract/agreement)
   - AUTHORIZATION_CREMATION (cremation authorization form)
   - AUTHORIZATION_EMBALMING (embalming authorization)
   - AUTHORIZATION_DISPOSITION (disposition authorization)
   - PERMIT_BURIAL (burial permit)
   - PERMIT_TRANSIT (transit/transfer permit)
   - DEATH_CERTIFICATE (death certificate)
   - ID_VERIFICATION (driver's license, ID card, passport)
   - OBITUARY (obituary document)
   - PROGRAM (funeral program/order of service)
   - CHECKLIST (internal checklist)
   - OTHER (if none of the above)

2. EXTRACT key information visible in the document:
   - Decedent name (if visible)
   - Dates (DOB, DOD, issue date, etc.)
   - Signatures (who signed, whether signed, dates)
   - Issuing authority (for permits/certificates)
   - Any case numbers or reference numbers

3. ASSESS compliance relevance:
   - Could this document satisfy a compliance requirement?
   - Does it require a signature?
   - Is it already signed?

4. SUGGEST a descriptive filename

Return ONLY valid JSON:
{
  "suggestedTag": "DEATH_CERTIFICATE",
  "suggestedName": "Death Certificate - John Smith",
  "description": "Official death certificate from State of California",
  "confidence": 0.95,
  "possibleCaseMatches": [
    {
      "decedentName": "John Smith",
      "caseNumber": null,
      "confidence": 0.9
    }
  ],
  "extractedData": {
    "decedentName": "John Smith",
    "dateOfDeath": "2025-01-10",
    "dateOfBirth": "1950-03-15",
    "signatures": [
      { "name": "Dr. Jane Doe", "signed": true, "date": "2025-01-11" }
    ],
    "issueDate": "2025-01-11",
    "issuingAuthority": "California Department of Public Health"
  },
  "complianceRelevance": {
    "couldSatisfyRule": true,
    "ruleType": "DOCUMENT_EXISTS",
    "requiresSignature": true,
    "isSigned": true
  },
  "ocrText": "Full text extracted from document..."
}`

export async function analyzeDocument(
  imageData: string,
  mimeType: string,
  existingCases?: { id: string; decedentName: string; caseNumber: string }[]
): Promise<DocumentAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  let prompt = DOCUMENT_ANALYSIS_PROMPT

  if (existingCases && existingCases.length > 0) {
    prompt += `\n\nEXISTING CASES TO MATCH AGAINST:\n${existingCases
      .map((c) => `- ${c.decedentName} (Case #${c.caseNumber})`)
      .join('\n')}`
  }

  const result = await geminiProModel.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: imageData,
      },
    },
  ])

  const response = result.response.text()

  let jsonStr = response
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr.trim())
    return parsed as DocumentAnalysis
  } catch (error) {
    console.error('Failed to parse document analysis:', response)
    throw new Error('Failed to analyze document. Please try again.')
  }
}

// Analyze multiple documents at once (batch upload)
export async function analyzeDocuments(
  documents: { imageData: string; mimeType: string; filename: string }[],
  existingCases?: { id: string; decedentName: string; caseNumber: string }[]
): Promise<(DocumentAnalysis & { originalFilename: string })[]> {
  const results = await Promise.all(
    documents.map(async (doc) => {
      try {
        const analysis = await analyzeDocument(doc.imageData, doc.mimeType, existingCases)
        return { ...analysis, originalFilename: doc.filename }
      } catch (error) {
        return {
          suggestedTag: 'OTHER' as DocumentTag,
          suggestedName: doc.filename,
          description: 'Failed to analyze document',
          confidence: 0,
          originalFilename: doc.filename,
        }
      }
    })
  )

  return results
}
