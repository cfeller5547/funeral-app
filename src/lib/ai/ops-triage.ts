import { geminiModel } from './gemini'

export interface ExtractedTask {
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  dueTime?: string
  suggestedAssignee?: string
  stage?: 'INTAKE' | 'ARRANGEMENT' | 'DOCUMENTS' | 'SIGNATURES' | 'SERVICE' | 'DISPOSITION' | 'CLOSE'
  tags?: string[]
  confidence: number
}

export interface ExtractedStatusUpdate {
  type: 'WAITING_ON_FAMILY' | 'WAITING_ON_EXTERNAL' | 'READY' | 'BLOCKED' | 'INFO_UPDATE'
  description: string
  suggestedStageMove?: 'INTAKE' | 'ARRANGEMENT' | 'DOCUMENTS' | 'SIGNATURES' | 'SERVICE' | 'DISPOSITION' | 'CLOSE'
  confidence: number
}

export interface ExtractedCaseUpdate {
  field: string
  value: string
  confidence: number
}

export interface OpsTriageResult {
  tasks: ExtractedTask[]
  statusUpdates: ExtractedStatusUpdate[]
  caseUpdates: ExtractedCaseUpdate[]
  suggestedResponse?: string
  summary: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
}

const OPS_TRIAGE_PROMPT = `You are an AI assistant for a funeral home case management system. Your job is to analyze incoming communications (phone call notes, emails, messages) and extract actionable items.

CONTEXT: Funeral home staff are constantly interrupted. Every message needs to become:
1. Tasks (with priority and due dates)
2. Status updates (waiting on family, waiting on external, etc.)
3. Case data updates (service time changed, etc.)

ANALYZE the input and extract:

1. TASKS - Things that need to be done:
   - title: Clear, actionable task description
   - priority: LOW, MEDIUM, HIGH, URGENT
   - dueDate: YYYY-MM-DD (infer from context like "tomorrow", "Friday", etc.)
   - dueTime: HH:MM if specific time mentioned
   - stage: Which case stage this relates to
   - tags: Relevant tags like ["florist", "clergy", "cemetery", etc.]

2. STATUS UPDATES - Changes to case status:
   - type: WAITING_ON_FAMILY, WAITING_ON_EXTERNAL, READY, BLOCKED, INFO_UPDATE
   - description: What we're waiting for or what changed
   - suggestedStageMove: If the case should move to a different stage

3. CASE UPDATES - Direct updates to case data:
   - field: What field to update (serviceDate, serviceTime, serviceLocation, etc.)
   - value: New value

4. SUGGESTED RESPONSE - If this seems like it needs a reply, suggest one

5. SUMMARY - Brief summary of what was communicated

6. URGENCY LEVEL - Overall urgency: low, medium, high, critical

PRIORITY GUIDELINES:
- URGENT: Time-sensitive within hours (service today, body needs to be moved now)
- HIGH: Needs attention today (family arriving, documents needed for tomorrow's service)
- MEDIUM: Needs attention within 2-3 days
- LOW: Can wait a week or more

Return ONLY valid JSON:
{
  "tasks": [
    {
      "title": "Call florist to confirm arrangement",
      "description": "Family requested white lilies changed to roses",
      "priority": "HIGH",
      "dueDate": "2025-01-15",
      "stage": "SERVICE",
      "tags": ["florist", "flowers"],
      "confidence": 0.9
    }
  ],
  "statusUpdates": [
    {
      "type": "WAITING_ON_EXTERNAL",
      "description": "Waiting for death certificate from hospital",
      "confidence": 0.85
    }
  ],
  "caseUpdates": [
    {
      "field": "serviceTime",
      "value": "14:00",
      "confidence": 0.95
    }
  ],
  "suggestedResponse": "I'll update the service time and confirm with the florist about the flower changes. Is there anything else you need?",
  "summary": "Family called to change service time to 2pm and requested different flowers.",
  "urgencyLevel": "medium"
}`

export async function triageOpsMessage(
  message: string,
  context?: {
    caseName?: string
    caseStage?: string
    currentTasks?: string[]
    serviceDate?: string
  }
): Promise<OpsTriageResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  let prompt = OPS_TRIAGE_PROMPT

  if (context) {
    prompt += '\n\nCONTEXT:'
    if (context.caseName) prompt += `\nCase: ${context.caseName}`
    if (context.caseStage) prompt += `\nCurrent Stage: ${context.caseStage}`
    if (context.serviceDate) prompt += `\nService Date: ${context.serviceDate}`
    if (context.currentTasks?.length) {
      prompt += `\nExisting Tasks:\n${context.currentTasks.map((t) => `- ${t}`).join('\n')}`
    }
  }

  prompt += `\n\nToday's date is: ${new Date().toISOString().split('T')[0]}`

  const result = await geminiModel.generateContent([
    prompt,
    `\n\nMESSAGE TO ANALYZE:\n${message}`,
  ])

  const response = result.response.text()

  let jsonStr = response
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  try {
    const parsed = JSON.parse(jsonStr.trim())
    return parsed as OpsTriageResult
  } catch (error) {
    console.error('Failed to parse ops triage result:', response)
    throw new Error('Failed to analyze message. Please try again.')
  }
}

// Batch process multiple messages (e.g., email inbox)
export async function triageMultipleMessages(
  messages: { id: string; content: string; subject?: string; from?: string }[],
  existingCases?: { id: string; decedentName: string; caseNumber: string }[]
): Promise<
  (OpsTriageResult & {
    messageId: string
    suggestedCase?: { id: string; decedentName: string; confidence: number }
  })[]
> {
  const BATCH_PROMPT = `You are an AI assistant for a funeral home. Analyze these messages and for each one:
1. Extract tasks, status updates, and case updates
2. Try to match each message to an existing case based on names mentioned

EXISTING CASES:
${existingCases?.map((c) => `- ${c.decedentName} (ID: ${c.id}, Case #${c.caseNumber})`).join('\n') || 'None provided'}

For each message, return the standard triage result plus a suggestedCase field if you can match it.`

  const results = await Promise.all(
    messages.map(async (msg) => {
      try {
        const fullContent = msg.subject ? `Subject: ${msg.subject}\nFrom: ${msg.from || 'Unknown'}\n\n${msg.content}` : msg.content

        const triage = await triageOpsMessage(fullContent)

        // Try to match to a case based on names in the message
        let suggestedCase = undefined
        if (existingCases) {
          for (const c of existingCases) {
            const nameParts = c.decedentName.toLowerCase().split(' ')
            const messageLC = fullContent.toLowerCase()
            const matchCount = nameParts.filter((part) => messageLC.includes(part)).length
            if (matchCount >= 2 || (nameParts.length === 1 && matchCount === 1)) {
              suggestedCase = {
                id: c.id,
                decedentName: c.decedentName,
                confidence: matchCount / nameParts.length,
              }
              break
            }
          }
        }

        return { ...triage, messageId: msg.id, suggestedCase }
      } catch (error) {
        return {
          messageId: msg.id,
          tasks: [],
          statusUpdates: [],
          caseUpdates: [],
          summary: 'Failed to analyze message',
          urgencyLevel: 'low' as const,
        }
      }
    })
  )

  return results
}
