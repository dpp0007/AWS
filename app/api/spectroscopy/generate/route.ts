import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { compound, formula } = await request.json()
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    const prompt = `Generate realistic spectroscopy data for ${compound} (${formula}).

Provide:
1. UV-Vis Spectroscopy data:
   - Wavelength range: 200-800 nm
   - Key absorption peaks with wavelengths
   - Transition types (π→π*, n→π*, etc.)

2. IR Spectroscopy data:
   - Wavenumber range: 400-4000 cm⁻¹
   - Functional group peaks
   - Bond types (C-H, O-H, C=O, etc.)

3. NMR Spectroscopy data:
   - Chemical shift range: 0-10 ppm
   - Peak positions for different hydrogen environments
   - Integration and splitting patterns

Format as JSON:
{
  "compound": "${compound}",
  "formula": "${formula}",
  "uvVis": {
    "peaks": [
      {"wavelength": 280, "label": "π→π*", "intensity": "strong"}
    ],
    "description": "..."
  },
  "ir": {
    "peaks": [
      {"wavenumber": 1715, "label": "C=O stretch", "intensity": "strong"}
    ],
    "description": "..."
  },
  "nmr": {
    "peaks": [
      {"shift": 2.1, "label": "CH₃", "integration": 6, "splitting": "singlet"}
    ],
    "description": "..."
  }
}

Be scientifically accurate. Return ONLY valid JSON.`

    // Call Gemini backend
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        context: `Spectroscopy data generation for ${compound}`,
        chemicals: []
      })
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    // Read the streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.token) {
              fullText += data.token
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    
    // Clean up the response
    let text = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }
    
    const data = JSON.parse(text)
    
    return NextResponse.json({ 
      success: true,
      data,
      generatedAt: new Date().toISOString(),
      source: 'ollama'
    })
  } catch (error) {
    console.error('Spectroscopy generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate spectroscopy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
