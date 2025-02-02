import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    
    // Use the text parameter
    const processedText = text.trim()
    
    return NextResponse.json({ result: processedText })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process request"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 