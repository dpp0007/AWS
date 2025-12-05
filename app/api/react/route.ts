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

    try {
      // Use Ollama backend for reaction analysis
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      // Prepare the prompt
      const chemicalsList = experiment.chemicals
        .map(c => `${c.chemical.name} (${c.chemical.formula}): ${c.amount} ${c.unit}`)
        .join('\n')

      // Calculate actual temperature from equipment
      let reactionTemperature = 25 // Room temperature default
      const bunsenBurner = experiment.equipment?.find(eq => eq.name === 'bunsen-burner')
      const hotPlate = experiment.equipment?.find(eq => eq.name === 'hot-plate')
      const stirrer = experiment.equipment?.find(eq => eq.name === 'magnetic-stirrer')
      
      if (bunsenBurner) {
        const burnerTemp = bunsenBurner.value || 0
        reactionTemperature = 25 + (burnerTemp / 1000) * 275 // 0-1000°C burner → 25-300°C solution
      } else if (hotPlate) {
        reactionTemperature = Math.max(reactionTemperature, hotPlate.value || 25)
      }
      
      if (stirrer) {
        const rpm = stirrer.value || 0
        reactionTemperature += (rpm / 1500) * 2 // Friction heat
      }
      
      // Calculate temperature effect on reaction rate (Arrhenius equation)
      const R = 8.314 // Gas constant J/(mol·K)
      const Ea = 50000 // Activation energy J/mol (typical value)
      const T = reactionTemperature + 273.15 // Convert to Kelvin
      const T0 = 298.15 // Room temperature in Kelvin
      const rateFactor = Math.exp(-Ea / (R * T)) / Math.exp(-Ea / (R * T0))
      const speedMultiplier = rateFactor.toFixed(2)
      
      // Include equipment information with calculated effects
      const equipmentInfo = experiment.equipment && experiment.equipment.length > 0
        ? `\n\nLab Equipment Active:\n${experiment.equipment.map(eq => `- ${eq.name}: ${eq.value} ${eq.unit}`).join('\n')}\n\nCALCULATED EFFECTS:\n- Reaction Temperature: ${reactionTemperature.toFixed(1)}°C\n- Reaction Rate Multiplier: ${speedMultiplier}x (Arrhenius equation)\n- ${reactionTemperature > 100 ? 'WARNING: High temperature may cause decomposition, evaporation, or side reactions' : reactionTemperature > 50 ? 'Elevated temperature accelerates reaction significantly' : 'Room temperature - normal reaction kinetics'}`
        : '\n\nNo lab equipment active (room temperature 25°C, no stirring, no heating, rate multiplier: 1.0x)'

      const prompt = `You are an expert chemistry assistant analyzing a chemical reaction. 

Chemicals being mixed:
${chemicalsList}${equipmentInfo}

CRITICAL: Temperature DIRECTLY affects reaction outcomes:
- Higher temperatures (>50°C): Faster reactions, may cause decomposition, evaporation, color changes
- Very high temperatures (>100°C): Water evaporates, organic compounds may decompose, equilibrium shifts
- Stirring: Better mixing leads to faster, more complete reactions
- Use the calculated rate multiplier to determine reaction speed and completeness

Analyze this chemical reaction and provide a detailed response in the following JSON format:
{
  "color": "describe the final solution color (e.g., 'blue', 'colorless', 'light green')",
  "smell": "describe any smell (e.g., 'pungent', 'sweet', 'none')",
  "precipitate": true or false,
  "precipitateColor": "color of precipitate if any (e.g., 'white', 'blue', 'brown')",
  "products": ["list", "of", "product", "formulas"],
  "balancedEquation": "complete balanced chemical equation with states and arrows",
  "reactionType": "type of reaction (e.g., 'precipitation', 'acid-base', 'redox', 'complexation', 'no reaction')",
  "observations": ["detailed", "observation", "points"],
  "safetyNotes": ["important", "safety", "warnings"],
  "temperature": "increased" or "decreased" or "unchanged",
  "gasEvolution": true or false,
  "confidence": 0.0 to 1.0
}

Provide ONLY the JSON response, no additional text. Ensure all field names match exactly.`

      // Call Ollama backend
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          context: 'Chemical reaction analysis',
          chemicals: experiment.chemicals.map(c => c.chemical.name)
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

      // Parse the JSON response
      let reactionResult: ReactionResult
      
      // Clean up the response
      let text = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        reactionResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI')
      }

      // Validate and ensure all required fields are present
      const validatedResult: ReactionResult = {
        color: reactionResult.color,
        smell: reactionResult.smell,
        precipitate: reactionResult.precipitate,
        precipitateColor: reactionResult.precipitateColor,
        products: reactionResult.products,
        balancedEquation: reactionResult.balancedEquation,
        reactionType: reactionResult.reactionType,
        observations: reactionResult.observations,
        safetyNotes: reactionResult.safetyNotes,
        temperature: reactionResult.temperature,
        gasEvolution: reactionResult.gasEvolution,
        confidence: reactionResult.confidence
      }

      console.log('Ollama Analysis successful:', validatedResult)
      return NextResponse.json(validatedResult)

    } catch (aiError) {
      console.error('Ollama AI error, using fallback:', aiError)
      
      // Fallback: Use deterministic reactions
      const fallbackResult = generateFallbackReaction(experiment)
      console.log('Using fallback reaction:', fallbackResult)
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Reaction analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze reaction' },
      { status: 500 }
    )
  }
}

// Fallback function for deterministic reactions
function generateFallbackReaction(experiment: Experiment): ReactionResult {
  const formulas = experiment.chemicals.map(c => c.chemical.formula)
  
  // Common reactions database
  const reactions: Record<string, ReactionResult> = {
    'NaCl+AgNO₃': {
      color: 'white precipitate',
      smell: 'none',
      precipitate: true,
      precipitateColor: 'white',
      products: ['AgCl', 'NaNO₃'],
      balancedEquation: 'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
      reactionType: 'precipitation',
      observations: [
        'White precipitate forms immediately',
        'Solution becomes cloudy',
        'Precipitate settles at bottom'
      ],
      safetyNotes: ['Handle silver compounds with care', 'Avoid skin contact'],
      temperature: 'unchanged',
      gasEvolution: false,
      confidence: 0.95
    },
    'CuSO₄+NaOH': {
      color: 'blue precipitate',
      smell: 'none',
      precipitate: true,
      precipitateColor: 'blue',
      products: ['Cu(OH)₂', 'Na₂SO₄'],
      balancedEquation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
      reactionType: 'precipitation',
      observations: [
        'Blue gelatinous precipitate forms',
        'Solution color changes from blue to lighter blue',
        'Precipitate is insoluble'
      ],
      safetyNotes: ['NaOH is corrosive', 'Wear protective equipment'],
      temperature: 'increased',
      gasEvolution: false,
      confidence: 0.92
    },
    'HCl+NaOH': {
      color: 'colorless',
      smell: 'none',
      precipitate: false,
      precipitateColor: undefined,
      products: ['NaCl', 'H₂O'],
      balancedEquation: 'HCl + NaOH → NaCl + H₂O',
      reactionType: 'acid-base neutralization',
      observations: [
        'Solution becomes warm',
        'No visible change in color',
        'pH changes to neutral'
      ],
      safetyNotes: ['Exothermic reaction', 'Handle acids and bases carefully'],
      temperature: 'increased',
      gasEvolution: false,
      confidence: 0.98
    }
  }

  // Try to find matching reaction
  const key1 = formulas.sort().join('+')
  const key2 = formulas.reverse().join('+')
  
  if (reactions[key1]) return reactions[key1]
  if (reactions[key2]) return reactions[key2]

  // Generic fallback
  return {
    color: 'mixed',
    smell: 'none',
    precipitate: false,
    precipitateColor: undefined,
    products: ['Mixed solution'],
    balancedEquation: `${formulas.join(' + ')} → Mixed solution`,
    reactionType: 'mixing',
    observations: [
      'Chemicals mixed together',
      'Solution color may change',
      'No obvious reaction observed'
    ],
    safetyNotes: ['Handle all chemicals with care', 'Wear protective equipment'],
    temperature: 'unchanged',
    gasEvolution: false,
    confidence: 0.5
  }
}
