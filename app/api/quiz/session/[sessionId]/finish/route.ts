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
    const answers: UserAnswer[] = await request.json()

    const response = await fetch(
      `${backendUrl}/quiz/session/${sessionId}/finish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
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
    console.error('Finish quiz error:', error)
    return NextResponse.json(
      { error: `Failed to finish quiz: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
