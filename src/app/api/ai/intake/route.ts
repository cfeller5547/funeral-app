import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { parseIntakeNotes, parseIntakeWithImages } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notes, images } = body as {
      notes: string
      images?: { mimeType: string; data: string }[]
    }

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      )
    }

    let result
    if (images && images.length > 0) {
      result = await parseIntakeWithImages(notes, images)
    } else {
      result = await parseIntakeNotes(notes)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI intake parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse intake notes' },
      { status: 500 }
    )
  }
}
