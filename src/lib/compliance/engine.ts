import { prisma } from '@/lib/db'
import type { CaseStage, ConditionType, RequirementType, DocumentTag, RuleSeverity } from '@prisma/client'

export interface EvaluationContext {
  caseId: string
  organizationId: string
  disposition: string
  serviceType: string | null
  stage: CaseStage
  documents: {
    tag: DocumentTag
    status: string
    signatureRequest?: {
      status: string
    } | null
  }[]
  fields: Record<string, unknown>
}

export interface BlockerResult {
  ruleId: string
  ruleName: string
  message: string
  severity: RuleSeverity
  requirementType: RequirementType
  fixAction?: string
  fixUrl?: string
}

interface ComplianceRule {
  id: string
  name: string
  description: string | null
  conditionType: ConditionType
  conditionField: string | null
  conditionValue: string | null
  requirementType: RequirementType
  requirementTag: DocumentTag | null
  requirementField: string | null
  requiresSigned: boolean
  severity: RuleSeverity
  isActive: boolean
}

// Stage ordering for comparison
const STAGE_ORDER: Record<CaseStage, number> = {
  INTAKE: 1,
  ARRANGEMENT: 2,
  DOCUMENTS: 3,
  SIGNATURES: 4,
  SERVICE: 5,
  DISPOSITION: 6,
  CLOSE: 7,
}

function stageGte(current: CaseStage, required: CaseStage): boolean {
  return STAGE_ORDER[current] >= STAGE_ORDER[required]
}

/**
 * Evaluate if a rule's condition is met for the given context
 */
function evaluateCondition(
  rule: ComplianceRule,
  context: EvaluationContext
): boolean {
  switch (rule.conditionType) {
    case 'ALWAYS':
      return true

    case 'DISPOSITION_EQUALS':
      return context.disposition === rule.conditionValue

    case 'SERVICE_TYPE_EQUALS':
      return context.serviceType === rule.conditionValue

    case 'STAGE_EQUALS':
      return context.stage === rule.conditionValue

    case 'STAGE_GTE':
      return stageGte(context.stage, rule.conditionValue as CaseStage)

    case 'FIELD_PRESENT':
      if (rule.conditionField) {
        return rule.conditionField in context.fields && context.fields[rule.conditionField] != null
      }
      return false

    default:
      return false
  }
}

/**
 * Check if the requirement is satisfied for the given context
 */
function checkRequirement(
  rule: ComplianceRule,
  context: EvaluationContext
): boolean {
  switch (rule.requirementType) {
    case 'DOCUMENT_EXISTS': {
      if (!rule.requirementTag) return true
      return context.documents.some((doc) => doc.tag === rule.requirementTag)
    }

    case 'DOCUMENT_SIGNED': {
      if (!rule.requirementTag) return true
      const doc = context.documents.find((d) => d.tag === rule.requirementTag)
      if (!doc) return false
      // If requiresSigned is true, check signature status
      if (rule.requiresSigned) {
        return doc.signatureRequest?.status === 'COMPLETED'
      }
      // Otherwise just check document exists and is signed or uploaded
      return doc.status === 'SIGNED' || doc.signatureRequest?.status === 'COMPLETED'
    }

    case 'FIELD_COMPLETED': {
      if (!rule.requirementField) return true
      return rule.requirementField in context.fields && context.fields[rule.requirementField] != null
    }

    case 'SIGNATURE_COMPLETED': {
      if (!rule.requirementTag) return true
      const doc = context.documents.find((d) => d.tag === rule.requirementTag)
      return doc?.signatureRequest?.status === 'COMPLETED'
    }

    default:
      return true
  }
}

/**
 * Generate a fix action and URL for a blocker
 */
function generateFixAction(
  rule: ComplianceRule,
  context: EvaluationContext
): { action: string; url: string } | null {
  switch (rule.requirementType) {
    case 'DOCUMENT_EXISTS':
      return {
        action: `Generate ${rule.requirementTag || 'required'} document`,
        url: `/app/cases/${context.caseId}?tab=documents`,
      }

    case 'DOCUMENT_SIGNED':
    case 'SIGNATURE_COMPLETED':
      return {
        action: `Get ${rule.requirementTag || 'document'} signed`,
        url: `/app/cases/${context.caseId}?tab=signatures`,
      }

    case 'FIELD_COMPLETED':
      return {
        action: `Complete ${rule.requirementField || 'required'} field`,
        url: `/app/cases/${context.caseId}`,
      }

    default:
      return null
  }
}

/**
 * Evaluate all compliance rules for a case and return blockers
 */
export async function evaluateCompliance(
  context: EvaluationContext
): Promise<BlockerResult[]> {
  // Fetch active rules for the organization
  const rules = await prisma.complianceRule.findMany({
    where: {
      organizationId: context.organizationId,
      isActive: true,
    },
  })

  const blockers: BlockerResult[] = []

  for (const rule of rules) {
    // Check if the condition applies to this case
    if (!evaluateCondition(rule, context)) {
      continue
    }

    // Check if the requirement is satisfied
    if (!checkRequirement(rule, context)) {
      const fixInfo = generateFixAction(rule, context)

      blockers.push({
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.description || `Missing requirement: ${rule.requirementTag || rule.requirementField || 'unknown'}`,
        severity: rule.severity,
        requirementType: rule.requirementType,
        fixAction: fixInfo?.action,
        fixUrl: fixInfo?.url,
      })
    }
  }

  return blockers
}

/**
 * Build evaluation context from a case ID
 */
export async function buildEvaluationContext(
  caseId: string
): Promise<EvaluationContext | null> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      documents: {
        include: {
          signatureRequest: true,
        },
      },
      decedent: true,
    },
  })

  if (!caseData) {
    return null
  }

  // Build a fields object from case and decedent data
  const fields: Record<string, unknown> = {
    // Case fields
    caseNumber: caseData.caseNumber,
    disposition: caseData.disposition,
    serviceType: caseData.serviceType,
    // Decedent fields
    ...(caseData.decedent && {
      'decedent.firstName': caseData.decedent.firstName,
      'decedent.lastName': caseData.decedent.lastName,
      'decedent.dateOfBirth': caseData.decedent.dateOfBirth,
      'decedent.dateOfDeath': caseData.decedent.dateOfDeath,
      'decedent.ssn': caseData.decedent.ssn,
    }),
  }

  return {
    caseId: caseData.id,
    organizationId: caseData.organizationId,
    disposition: caseData.disposition,
    serviceType: caseData.serviceType,
    stage: caseData.stage,
    documents: caseData.documents.map((doc) => ({
      tag: doc.tag,
      status: doc.status,
      signatureRequest: doc.signatureRequest,
    })),
    fields,
  }
}

/**
 * Sync blockers to the database based on current evaluation
 */
export async function syncBlockers(caseId: string): Promise<void> {
  const context = await buildEvaluationContext(caseId)

  if (!context) {
    throw new Error(`Case not found: ${caseId}`)
  }

  const currentBlockers = await evaluateCompliance(context)

  // Get existing unresolved blockers
  const existingBlockers = await prisma.blocker.findMany({
    where: {
      caseId,
      isResolved: false,
    },
  })

  // Find blockers to create (new ones that don't exist)
  const blockersToCreate = currentBlockers.filter(
    (b) => !existingBlockers.some((e) => e.ruleId === b.ruleId)
  )

  // Find blockers to resolve (existing ones that are no longer violations)
  const blockersToResolve = existingBlockers.filter(
    (e) => !currentBlockers.some((b) => b.ruleId === e.ruleId)
  )

  // Create new blockers
  for (const blocker of blockersToCreate) {
    await prisma.blocker.create({
      data: {
        caseId,
        ruleId: blocker.ruleId,
        message: blocker.message,
        fixAction: blocker.fixAction || null,
        fixUrl: blocker.fixUrl || null,
        isResolved: false,
      },
    })
  }

  // Resolve old blockers
  for (const blocker of blockersToResolve) {
    await prisma.blocker.update({
      where: { id: blocker.id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    })
  }
}

/**
 * Check if a case can advance to a given stage
 */
export async function canAdvanceToStage(
  caseId: string,
  targetStage: CaseStage
): Promise<{ canAdvance: boolean; blockers: BlockerResult[] }> {
  const context = await buildEvaluationContext(caseId)

  if (!context) {
    return { canAdvance: false, blockers: [] }
  }

  // Temporarily set stage to target to evaluate what would block
  const testContext = { ...context, stage: targetStage }
  const blockers = await evaluateCompliance(testContext)

  // Filter to only BLOCKER severity (not WARNING) for stage advancement
  const hardBlockers = blockers.filter((b) => b.severity === 'BLOCKER')

  return {
    canAdvance: hardBlockers.length === 0,
    blockers: hardBlockers,
  }
}

/**
 * Check if a case can be closed
 */
export async function canCloseCase(
  caseId: string
): Promise<{ canClose: boolean; blockers: BlockerResult[] }> {
  const result = await canAdvanceToStage(caseId, 'CLOSE')
  return {
    canClose: result.canAdvance,
    blockers: result.blockers,
  }
}
