import { NextRequest, NextResponse } from 'next/server'

interface UserAnswer {
  question_id: number
  user_answer: string
  time_taken: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const { sessionId } = params
    const answer: UserAnswer = await request.json()

    const response = await fetch(
      `${backendUrl}/quiz/session/${sessionId}/submit-answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answer)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Submit answer error:', error)
    return NextResponse.json(
      { error: `Failed to submit answer: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
