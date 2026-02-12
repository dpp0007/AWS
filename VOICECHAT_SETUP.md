# Voice Chat - Agora Conversational AI Integration

## Overview
The Voice Chat feature integrates Agora's Conversational AI Agent to provide real-time voice-based chemistry learning through interactive conversations with an AI assistant.

## Architecture

### Backend Components

1. **Voice Chat API Route** (`app/api/voice/chat/route.ts`)
   - Manages Agora Conversational AI Agent lifecycle
   - Creates and configures AI agents with custom LLM, TTS, and ASR
   - Handles agent start, stop, and status queries
   - Generates RTC tokens for authentication

2. **Configuration** (`.env`)
   - Agora credentials and API keys
   - LLM, TTS, and ASR vendor settings

### Frontend Components

1. **Voice Chat Page** (`app/voicechat/page.tsx`)
   - Voice session UI with real-time status
   - Agora RTC SDK integration
   - Audio track management (microphone and remote audio)
   - User profile customization (level, topic, goals)

## Configuration

### Critical: Two Separate Agora App IDs Required

The voice chat system requires **two different Agora App IDs**:

1. **Conversational AI App ID** (`AGORA_APP_ID`) - For backend agent creation
   - Used by the backend to create and manage AI agents
   - Requires Conversational AI service enabled
   - Already configured in `.env`

2. **RTC App ID** (`NEXT_PUBLIC_AGORA_APP_ID`) - For frontend voice/video calling
   - Used by the frontend Agora RTC SDK for voice communication
   - **MUST be a separate App ID** from the Conversational AI one
   - Currently **MISSING** - this is why you're getting the "invalid vendor key" error

### Environment Variables

#### Already Configured (Backend - Conversational AI)
```env
# Agora Conversational AI Agent Configuration
AGORA_APP_ID=30debd2b48994acb8e535193fe9525d8
AGORA_APP_CERTIFICATE=ab5d3a31806547bcbc2bdc3095da1487
AGORA_CUSTOMER_ID=3a972abd182f4eefa5c08a0cf2660c7e
AGORA_CUSTOMER_SECRET=0c7e76ab663f4e28aecbd9c7ffaead2b

# LLM Configuration (Using Google Gemini)
AGORA_LLM_API_KEY=AIzaSyDDGW8F1xa_7DNULpfknrqTy2tIUUPxyrA

# TTS Configuration (Using Cartesia)
AGORA_TTS_API_KEY=sk_car_NCDNCDh3vMygmZpB6gEk18
AGORA_TTS_MODEL_ID=sonic-3
AGORA_TTS_VOICE_ID=95d51f79-c397-46f9-b49a-23763d3eaa2d

# ASR Configuration (Using Agora's Ares STT)
AGORA_ASR_VENDOR=ares
AGORA_ASR_LANGUAGE=en-US
```

#### NEEDS TO BE ADDED (Frontend - RTC)
```env
# Agora RTC App ID (MUST be different from AGORA_APP_ID above)
# Get this from Agora Console - create a new project for RTC
NEXT_PUBLIC_AGORA_APP_ID=your-rtc-app-id-here
```

## API Endpoints

### 1. Start Voice Chat Session
```
POST /api/voice/chat?action=start
Authorization: Bearer <session_token>

Request Body:
{
  "userProfile": {
    "level": "intermediate",
    "topic": "Molecular Bonding",
    "goals": "Learn bonding concepts"
  }
}

Response:
{
  "success": true,
  "data": {
    "channel_name": "voicechat_user123_1234567890",
    "user_token": "rtc_token",
    "user_uid": "1234",
    "agent_id": "agent_xyz",
    "agent_uid": "5678",
    "status": "RUNNING",
    "created_at": "2024-02-12T10:30:00Z"
  }
}
```

### 2. Stop Voice Chat Session
```
POST /api/voice/chat?action=stop
Authorization: Bearer <session_token>

Request Body:
{
  "agentId": "agent_xyz"
}

Response:
{
  "success": true,
  "data": {
    "status": "STOPPED"
  }
}
```

### 3. Get Voice Chat Configuration
```
GET /api/voice/chat
Authorization: Bearer <session_token>

Response:
{
  "success": true,
  "data": {
    "app_id": "bb1ca613e3b94aa7af3eec189d172e99",
    "features": {
      "voice_chat": true,
      "real_time_response": true,
      "context_aware": true,
      "chemistry_guidance": true
    }
  }
}
```

## Features

### Voice Interaction
- Natural voice conversations with AI chemistry assistant
- Real-time speech recognition (ASR)
- Intelligent turn detection with VAD and semantic analysis

### Real-time Responses
- Instant AI responses using Google Gemini 2.0 Flash
- Cartesia TTS for natural-sounding voice output
- Conversation history management (32 messages max)

### Personalized Learning
- Context-aware guidance based on user profile
- Customizable learning level (beginner, intermediate, advanced)
- Topic-specific assistance
- Goal-oriented learning paths

### Advanced Features
- Silence detection with timeout prompts
- Graceful session termination
- Error handling and recovery
- Real-time metrics collection

## AI Agent Configuration

### LLM (Language Model)
- **Model**: Google Gemini 2.0 Flash
- **API**: Google Generative AI
- **Max History**: 32 messages
- **Greeting**: "Hello! I'm your VidyaMitra AI Assistant. I'm here to help you learn chemistry and science. What would you like to explore today?"
- **Failure Message**: "I apologize, I'm having trouble processing that. Could you please rephrase your question?"

### TTS (Text-to-Speech)
- **Vendor**: Cartesia
- **Model**: sonic-3
- **Sample Rate**: 16000 Hz
- **Language**: English
- **Voice**: Customizable via AGORA_TTS_VOICE_ID

### ASR (Automatic Speech Recognition)
- **Vendor**: Agora Ares STT
- **Language**: en-US (configurable)
- **Real-time Processing**: Enabled

### Turn Detection
- **Mode**: Default (VAD + Semantic)
- **Speech Threshold**: 0.5
- **Start of Speech**: VAD-based with 800ms prefix padding
- **End of Speech**: Semantic-based with 320ms silence duration
- **Max Wait**: 3000ms

## Usage Flow

1. **User Authentication**
   - User logs in via NextAuth
   - Session token is obtained

2. **Session Initialization**
   - User navigates to `/voicechat`
   - Sets learning profile (level, topic, goals)
   - Clicks "Start Voice Chat"

3. **Backend Processing**
   - Generate unique channel name and UIDs
   - Create RTC tokens for user and agent
   - Create Agora AI agent with system prompt
   - Return session credentials

4. **Frontend Connection**
   - Initialize Agora RTC client
   - Join RTC channel with credentials
   - Create and publish microphone audio track
   - Subscribe to agent's audio track

5. **Voice Conversation**
   - User speaks → Microphone audio sent to Agora
   - Agora ASR converts speech to text
   - Gemini LLM processes text with system context
   - Cartesia TTS converts response to speech
   - Audio played back to user

6. **Session Termination**
   - User clicks "End Chat"
   - Leave RTC channel
   - Stop AI agent
   - Clean up resources

## System Prompt

The AI assistant uses a context-aware system prompt that includes:

```
You are a VidyaMitra AI Voice Assistant, an intelligent conversational guide for chemistry and science learning.
Your role is to help students with:

1. Chemistry Concepts: Explain molecular structures, bonding, reactions, and spectroscopy
2. Lab Guidance: Provide virtual lab experiment guidance and safety tips
3. Problem Solving: Help solve chemistry problems step-by-step
4. Learning Support: Suggest resources and explain difficult concepts
5. Quiz Preparation: Help prepare for chemistry assessments

Guidelines:
- Be encouraging, clear, and educational
- Provide accurate scientific information
- Ask clarifying questions when needed
- Keep responses concise but informative
- Use simple language for complex concepts
- Adapt explanations to the student's level

Student Context:
- Level: [beginner/intermediate/advanced]
- Current Topic: [user-specified topic]
- Learning Goals: [user-specified goals]
```

## Security & Authentication

- JWT token-based authentication via NextAuth
- Agora Basic Auth with customer credentials
- User context validation before session creation
- Secure credential storage via environment variables
- Token expiration: 24 hours

## Troubleshooting

### Error: "AgoraRTCError CAN_NOT_GET_GATEWAY_SERVER: invalid vendor key, can not find appid"

**Cause**: The `NEXT_PUBLIC_AGORA_APP_ID` is missing or incorrect. The frontend is trying to use the wrong App ID for RTC.

**Solution**:
1. Go to [Agora Console](https://console.agora.io/)
2. Create a **new project** specifically for RTC (Voice/Video Calling)
3. Copy the App ID from this new project
4. Add it to `.env`:
   ```env
   NEXT_PUBLIC_AGORA_APP_ID=your-new-rtc-app-id
   ```
5. Restart the development server
6. Try voice chat again

**Why two App IDs?**
- Agora requires separate App IDs for different services
- Conversational AI Engine (backend) uses one App ID
- RTC SDK (frontend voice/video) uses a different App ID
- They cannot be interchanged

### Microphone Access Issues
- Ensure browser has microphone permissions
- Check system microphone settings
- Try refreshing the page

### Connection Failures
- Verify both Agora App IDs are configured in `.env`
- Check internet connection
- Ensure Agora API is accessible
- Check browser console for detailed errors

### Audio Quality Issues
- Check microphone hardware
- Reduce background noise
- Ensure stable internet connection
- Try different browser if issue persists

### Agent Not Responding
- Verify LLM API key is valid
- Check Gemini API quota
- Ensure ASR vendor is configured correctly
- Check agent logs for errors

## Performance Considerations

- **Latency**: ~200-500ms typical response time
- **Bandwidth**: ~50-100 kbps for audio streams
- **Memory**: ~50-100MB per active session
- **Concurrent Sessions**: Limited by Agora plan

## Future Enhancements

- Multi-language support
- Custom voice selection
- Session recording and playback
- Conversation analytics
- Integration with quiz system
- Offline mode support
- Mobile app support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Agora documentation: https://docs.agora.io/
3. Check Google Gemini API docs: https://ai.google.dev/
4. Contact support team

## References

- [Agora Conversational AI Agent](https://docs.agora.io/en/conversational-ai-agent/overview)
- [Google Gemini API](https://ai.google.dev/)
- [Cartesia TTS](https://cartesia.ai/)
- [Agora RTC SDK](https://docs.agora.io/en/video-calling/overview)
