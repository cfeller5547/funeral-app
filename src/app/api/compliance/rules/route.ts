import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  conditionType: z.enum(['ALWAYS', 'DISPOSITION_EQUALS', 'SERVICE_TYPE_EQUALS', 'STAGE_GTE', 'STAGE_EQUALS', 'FIELD_PRESENT']),
  conditionField: z.string().optional(),
  conditionValue: z.string().optional(),
  requirementType: z.enum(['DOCUMENT_EXISTS', 'DOCUMENT_SIGNED', 'FIELD_COMPLETED', 'SIGNATURE_COMPLETED']),
  requirementTag: z.enum([
    'GPL', 'CONTRACT', 'AUTHORIZATION_CREMATION', 'AUTHORIZATION_EMBALMING',
    'AUTHORIZATION_DISPOSITION', 'PERMIT_BURIAL', 'PERMIT_TRANSIT',
    'DEATH_CERTIFICATE', 'ID_VERIFICATION', 'OBITUARY', 'PROGRAM', 'CHECKLIST', 'OTHER'
  ]).optional(),
  requirementField: z.string().optional(),
  requiresSigned: z.boolean().default(false),
  severity: z.enum(['BLOCKER', 'WARNING']).default('BLOCKER'),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rules = await prisma.complianceRule.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: {
            blockers: {
              where: { isResolved: false },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ data: rules })
  } catch (error) {
    console.error('Failed to fetch rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createRuleSchema.parse(body)

    const rule = await prisma.complianceRule.create({
      data: {
        organizationId: session.user.organizationId,
        name: data.name,
        description: data.description || null,
        conditionType: data.conditionType,
        conditionField: data.conditionField || null,
        conditionValue: data.conditionValue || null,
        requirementType: data.requirementType,
        requirementTag: data.requirementTag || null,
        requirementField: data.requirementField || null,
        requiresSigned: data.requiresSigned,
        severity: data.severity,
        isActive: data.isActive,
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        eventType: 'RULE_CREATED',
        entityType: 'ComplianceRule',
        entityId: rule.id,
        description: `Compliance rule "${data.name}" created`,
      },
    })

    return NextResponse.json({ data: rule })
  } catch (error) {
    console.error('Failed to create rule:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}
