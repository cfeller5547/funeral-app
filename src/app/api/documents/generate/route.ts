import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import {
  buildMergeFieldContext,
  generateDocument,
  extractSignatureFields,
} from '@/lib/pdf/generator'

const generateDocSchema = z.object({
  caseId: z.string().min(1),
  templateId: z.string().optional(),
  packId: z.string().optional(),
}).refine(
  (data) => data.templateId || data.packId,
  { message: 'Either templateId or packId must be provided' }
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = generateDocSchema.parse(body)

    // Fetch the case with all related data
    const caseData = await prisma.case.findFirst({
      where: {
        id: data.caseId,
        organizationId: session.user.organizationId,
      },
      include: {
        decedent: true,
        location: true,
        organization: true,
        contacts: {
          include: {
            person: true,
          },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (!caseData.decedent) {
      return NextResponse.json({ error: 'Case has no decedent record' }, { status: 400 })
    }

    // Build the merge field context
    const context = buildMergeFieldContext({
      ...caseData,
      decedent: caseData.decedent,
    })

    // Generate documents
    const generatedDocuments = []

    if (data.templateId) {
      // Generate single document
      const template = await prisma.documentTemplate.findFirst({
        where: {
          id: data.templateId,
          organizationId: session.user.organizationId,
        },
      })

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }

      const result = await generateDocument(template.content, context)
      const signatureFields = extractSignatureFields(template.content)

      // Create document record
      const document = await prisma.document.create({
        data: {
          caseId: data.caseId,
          templateId: template.id,
          name: template.name,
          tag: template.tag,
          status: 'GENERATED',
          version: 1,
          metadata: {
            content: result.content,
            format: result.format,
            generatedAt: new Date().toISOString(),
          },
        },
      })

      generatedDocuments.push({
        document,
        signatureFields,
      })
    } else if (data.packId) {
      // Generate pack of documents
      const pack = await prisma.templatePack.findFirst({
        where: {
          id: data.packId,
          organizationId: session.user.organizationId,
        },
        include: {
          items: {
            include: {
              template: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          taskTemplates: true,
        },
      })

      if (!pack) {
        return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
      }

      for (const packItem of pack.items) {
        const template = packItem.template
        const result = await generateDocument(template.content, context)
        const signatureFields = extractSignatureFields(template.content)

        const document = await prisma.document.create({
          data: {
            caseId: data.caseId,
            templateId: template.id,
            name: template.name,
            tag: template.tag,
            status: 'GENERATED',
            version: 1,
            metadata: {
              content: result.content,
              format: result.format,
              generatedAt: new Date().toISOString(),
            },
          },
        })

        generatedDocuments.push({
          document,
          signatureFields,
        })
      }

      // Create tasks associated with the pack if any
      if (pack.taskTemplates && pack.taskTemplates.length > 0) {
        for (const taskTemplate of pack.taskTemplates) {
          await prisma.task.create({
            data: {
              caseId: data.caseId,
              title: taskTemplate.title,
              status: 'OPEN',
              priority: taskTemplate.priority,
              stage: taskTemplate.stage,
            },
          })
        }
      }
    }

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        organizationId: session.user.organizationId,
        caseId: data.caseId,
        userId: session.user.id,
        eventType: 'DOCUMENT_GENERATED',
        entityType: 'Document',
        entityId: generatedDocuments[0]?.document.id || '',
        description: `${generatedDocuments.length} document(s) generated for case ${caseData.caseNumber}`,
      },
    })

    return NextResponse.json({
      data: {
        documents: generatedDocuments,
        caseNumber: caseData.caseNumber,
      },
    })
  } catch (error) {
    console.error('Failed to generate documents:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate documents' },
      { status: 500 }
    )
  }
}
