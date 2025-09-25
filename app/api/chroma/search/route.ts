import { NextRequest, NextResponse } from 'next/server'
import { searchChroma } from '@/lib/chromaClient'

export async function POST(request: NextRequest) {
  try {
    const { query, nResults = 5 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const results = await searchChroma(query, nResults)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching ChromaDB:', error)
    return NextResponse.json(
      { error: 'Failed to search ChromaDB' },
      { status: 500 }
    )
  }
}