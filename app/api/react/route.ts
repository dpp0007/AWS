import { NextRequest, NextResponse } from 'next/server'
import { Experiment, ReactionResult } from '@/types/chemistry'

export async function POST(request: NextRequest) {
  try {
    const experiment: Experiment = await request.json()
    
    if (!experiment.chemicals || experiment.chemicals.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 chemicals are required for a reaction' },
        { status: 400 }
      )
    }

    // Use Gemini backend for reaction analysis
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    console.log('Analyzing reaction with backend:', backendUrl)
    
    // Prepare equipment data
    const equipmentData = experiment.equipment?.map(eq => eq.name) || []
    console.log('✓ Equipment being sent to backend:', equipmentData)
    console.log('✓ Chemicals:', experiment.chemicals.map(c => c.chemical.name))
    
    // Call the analyze-reaction endpoint
    const response = await fetch(`${backendUrl}/analyze-reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Analyze reaction',
        context: 'Chemical reaction analysis',
        chemicals: experiment.chemicals.map(c => c.chemical.name),
        equipment: equipmentData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    // Parse the JSON response directly
    const reactionData = await response.json()
    console.log('✓ Reaction analysis received:', reactionData)

    // Validate and ensure all required fields are present
    const validatedResult: ReactionResult = {
      color: reactionData.color || 'unknown',
      smell: reactionData.smell || 'none',
      precipitate: Boolean(reactionData.precipitate),
      precipitateColor: reactionData.precipitateColor || undefined,
      products: Array.isArray(reactionData.products) ? reactionData.products : ['Unknown'],
      balancedEquation: reactionData.balancedEquation || 'Reaction equation unknown',
      reactionType: reactionData.reactionType || 'unknown',
      observations: Array.isArray(reactionData.observations) ? reactionData.observations : ['Reaction occurred'],
      safetyNotes: Array.isArray(reactionData.safetyNotes) ? reactionData.safetyNotes : ['Handle with care'],
      temperature: reactionData.temperature || 'unchanged',
      gasEvolution: Boolean(reactionData.gasEvolution),
      confidence: typeof reactionData.confidence === 'number' ? Math.min(1, Math.max(0, reactionData.confidence)) : 0.5
    }

    console.log('✓ Gemini Analysis successful:', validatedResult)
    return NextResponse.json(validatedResult)

  } catch (error) {
    console.error('Reaction analysis error:', error)
    return NextResponse.json(
      { error: `Failed to analyze reaction: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
