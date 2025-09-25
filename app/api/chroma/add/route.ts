import { NextRequest, NextResponse } from 'next/server'
import { addToChroma } from '@/lib/chromaClient'

export async function POST(request: NextRequest) {
  try {
    const { id, content, metadata } = await request.json()

    if (!id || !content) {
      return NextResponse.json(
        { error: 'ID and content are required' },
        { status: 400 }
      )
    }

    await addToChroma(content, metadata || {}, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to ChromaDB:', error)
    return NextResponse.json(
      { error: 'Failed to add to ChromaDB' },
      { status: 500 }
    )
  }
}