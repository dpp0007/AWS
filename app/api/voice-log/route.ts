import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { type, message, timestamp, level, confidence } = data
    
    // ANSI colors for terminal output
    const colors = {
      reset: "\x1b[0m",
      dim: "\x1b[2m",
      cyan: "\x1b[36m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      blue: "\x1b[34m"
    }

    const timeStr = new Date(timestamp).toLocaleTimeString()
    let logPrefix = `${colors.dim}[${timeStr}]${colors.reset}`
    
    switch (type) {
      case 'TRANSCRIPT':
        console.log(`${logPrefix} ${colors.cyan}🎤 Voice Input:${colors.reset} "${message}" ${confidence ? `${colors.dim}(Confidence: ${(confidence * 100).toFixed(1)}%)${colors.reset}` : ''}`)
        break
      case 'STATUS':
        console.log(`${logPrefix} ${colors.blue}ℹ️  System:${colors.reset} ${message}`)
        break
      case 'AUDIO_LEVEL':
        // Visualize audio level with a bar
        const bars = '█'.repeat(Math.ceil(level * 20))
        console.log(`${logPrefix} ${colors.green}🔊 Level:${colors.reset} ${bars} ${(level * 100).toFixed(0)}%`)
        break
      case 'ERROR':
        console.log(`${logPrefix} ${colors.red}❌ Error:${colors.reset} ${message}`)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
