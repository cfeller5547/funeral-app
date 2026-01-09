import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { analyzeDocument, analyzeDocuments } from '@/lib/ai'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documents } = body as {
      documents: { imageData: string; mimeType: string; filename: string }[]
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      )
    }

    // Get existing cases for matching
    const existingCases = await prisma.case.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: { in: ['DRAFT', 'ACTIVE'] },
      },
      include: {
        decedent: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limit for performance
    })

    const casesForMatching = existingCases.map((c) => ({
      id: c.id,
      decedentName: c.decedent
        ? `${c.decedent.firstName} ${c.decedent.lastName}`
        : 'Unknown',
      caseNumber: c.caseNumber,
    }))

    // Analyze single document or batch
    if (documents.length === 1) {
      const result = await analyzeDocument(
        documents[0].imageData,
        documents[0].mimeType,
        casesForMatching
      )
      return NextResponse.json({
        documents: [{ ...result, originalFilename: documents[0].filename }],
      })
    }

    const results = await analyzeDocuments(documents, casesForMatching)
    return NextResponse.json({ documents: results })
  } catch (error) {
    console.error('Document analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze documents' },
      { status: 500 }
    )
  }
}
