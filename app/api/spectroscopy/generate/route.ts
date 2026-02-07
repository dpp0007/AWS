import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { compound, formula, techniques } = await request.json()
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    // Call the dedicated spectroscopy endpoint
    const response = await fetch(`${backendUrl}/spectroscopy/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        compound,
        formula,
        techniques: techniques || ["uv-vis", "ir", "nmr"]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Backend returned ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true,
      data,
      generatedAt: new Date().toISOString(),
      source: data.source || 'AI-Generated'
    })
  } catch (error) {
    console.error('Spectroscopy generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate spectroscopy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
