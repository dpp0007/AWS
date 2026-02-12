# Agora Conversational AI Integration Documentation

## Overview

This document describes the Agora Conversational AI Engine integration for VidyaMitra's voice chat feature. The integration enables real-time voice interactions between users and an AI-driven chemistry assistant within Agora channels.

## Architecture

### Basic Flow

1. **User joins Agora channel** - User initiates voice chat session
2. **Start AI agent** - Backend creates an agent instance via REST API
3. **Real-time interaction** - User communicates with AI agent through voice
4. **Stop AI agent** - User ends conversation, agent leaves channel
5. **User leaves channel** - Session cleanup

## Prerequisites

### Required Credentials

- **App ID**: Agora project identifier
- **App Certificate**: Used for RTC token generation
- **Customer ID & Secret**: HTTP authentication for REST APIs
- **LLM API Key**: Google Gemini API key
- **TTS API Key**: Cartesia text-to-speech API key
- **TTS Voice ID**: Cartesia voice identifier

### Environment Variables

```env
AGORA_APP_ID=<your_app_id>
AGORA_APP_CERTIFICATE=<your_app_certificate>
AGORA_CUSTOMER_ID=<your_customer_id>
AGORA_CUSTOMER_SECRET=<your_customer_secret>
AGORA_LLM_API_KEY=<your_gemini_api_key>
AGORA_TTS_API_KEY=<your_cartesia_api_key>
AGORA_TTS_VOICE_ID=<your_cartesia_voice_id>
AGORA_TTS_MODEL_ID=sonic-3
AGORA_ASR_LANGUAGE=en-US
AGORA_ASR_VENDOR=ares
```

## API Endpoints

### Start Voice Chat Session

**Endpoint**: `POST /api/voice/chat?action=start`

**Authentication**: Required (NextAuth session)

**Request Body**:
```json
{
  "userProfile": {
    "level": "intermediate",
    "topic": "molecular_bonding",
    "goals": "understand_covalent_bonds"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "channel_name": "voicechat_user_id_timestamp",
    "user_token": "007<appId><expireTimestamp><signature>",
    "user_uid": "1054",
    "agent_id": "A42AH75PJ97EC47HL24JN74TL56VW77L",
    "agent_uid": "2118",
    "status": "RUNNING",
    "created_at": 1770866761
  }
}
```

### Stop Voice Chat Session

**Endpoint**: `POST /api/voice/chat?action=stop`

**Authentication**: Required (NextAuth session)

**Request Body**:
```json
{
  "agentId": "A42AH75PJ97EC47HL24JN74TL56VW77L"
}
```

**Response**:
```json
{
  "success": true,
  "data": {}
}
```

### Get Voice Chat Configuration

**Endpoint**: `GET /api/voice/chat`

**Authentication**: Required (NextAuth session)

**Response**:
```json
{
  "success": true,
  "data": {
    "app_id": "<your_app_id>",
    "features": {
      "voice_chat": true,
      "real_time_response": true,
      "context_aware": true,
      "chemistry_guidance": true
    }
  }
}
```

## REST API Details

### Authentication

All Agora REST API calls use HTTP Basic Authentication:

```
Authorization: Basic <base64_encoded_credentials>
```

Where credentials are: `{AGORA_CUSTOMER_ID}:{AGORA_CUSTOMER_SECRET}`

### RTC Token Generation

Tokens are generated using HMAC-SHA256 signature:

```
Token Format: 007{appId}{expireTimestamp}{signature}
Message to Sign: {appId}{channelName}{uid}{expireTimestamp}
Signature: HMAC-SHA256(message, appCertificate)
Expiration: 24 hours
```

### Join Agent Endpoint

**URL**: `https://api.agora.io/api/conversational-ai-agent/v2/projects/{appId}/join`

**Method**: POST

**Headers**:
```
Authorization: Basic <credentials>
Content-Type: application/json
```

**Request Payload**:

```json
{
  "name": "voicechat_agent_1770866760314",
  "properties": {
    "channel": "voicechat_user_id_timestamp",
    "token": "007<appId><expireTimestamp><signature>",
    "agent_rtc_uid": "2118",
    "remote_rtc_uids": ["1054"],
    "idle_timeout": 300,
    "llm": {
      "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=<api_key>",
      "system_messages": [
        {
          "parts": [
            {
              "text": "You are a VidyaMitra AI Voice Assistant..."
            }
          ],
          "role": "system"
        }
      ],
      "max_history": 32,
      "greeting_message": "Hello! I'm your AI Chemistry Assistant...",
      "failure_message": "I apologize, I'm having trouble processing that...",
      "style": "gemini",
      "ignore_empty": true,
      "params": {
        "model": "gemini-2.0-flash"
      }
    },
    "tts": {
      "vendor": "cartesia",
      "params": {
        "api_key": "<cartesia_api_key>",
        "model_id": "sonic-3",
        "voice": {
          "mode": "id",
          "id": "<voice_id>"
        },
        "output_format": {
          "container": "raw",
          "sample_rate": 16000
        },
        "language": "en"
      }
    },
    "asr": {
      "language": "en-US",
      "vendor": "ares",
      "params": {}
    },
    "turn_detection": {
      "mode": "default",
      "config": {
        "speech_threshold": 0.5,
        "start_of_speech": {
          "mode": "vad",
          "vad_config": {
            "interrupt_duration_ms": 160,
            "speaking_interrupt_duration_ms": 160,
            "prefix_padding_ms": 800
          }
        },
        "end_of_speech": {
          "mode": "semantic",
          "semantic_config": {
            "silence_duration_ms": 320,
            "max_wait_ms": 3000
          }
        }
      }
    },
    "advanced_features": {
      "enable_rtm": true,
      "enable_aivad": false
    },
    "parameters": {
      "silence_config": {
        "timeout_ms": 30000,
        "action": "speak",
        "content": "Are you still there? Feel free to ask me anything about chemistry or science."
      },
      "farewell_config": {
        "graceful_enabled": true,
        "graceful_timeout_seconds": 30
      },
      "data_channel": "rtm",
      "enable_metrics": true,
      "enable_error_message": true
    }
  }
}
```

**Response**:
```json
{
  "agent_id": "A42AH75PJ97EC47HL24JN74TL56VW77L",
  "create_ts": 1770866761,
  "status": "RUNNING"
}
```

### Leave Agent Endpoint

**URL**: `https://api.agora.io/api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave`

**Method**: POST

**Headers**:
```
Authorization: Basic <credentials>
Content-Type: application/json
```

**Response**:
```json
{}
```

## Parameter Reference

### Core Properties

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Unique agent identifier |
| `channel` | string | Yes | Agora channel name |
| `token` | string | Yes | RTC token for agent authentication |
| `agent_rtc_uid` | string | Yes | Agent's unique ID in channel |
| `remote_rtc_uids` | array | Yes | Array of user UIDs to interact with |
| `idle_timeout` | number | Yes | Idle timeout in seconds (300s = 5 min) |

### LLM Configuration (Google Gemini)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Gemini API endpoint with API key |
| `system_messages` | array | Yes | System prompts using Gemini format |
| `max_history` | number | Yes | Max conversation history (32 messages) |
| `greeting_message` | string | Yes | Initial greeting from agent |
| `failure_message` | string | Yes | Message when agent can't respond |
| `style` | string | Yes | Must be "gemini" for Gemini API |
| `ignore_empty` | boolean | Yes | Handle empty responses gracefully |
| `params.model` | string | Yes | Model identifier (gemini-2.0-flash) |

### TTS Configuration (Cartesia)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vendor` | string | Yes | Must be "cartesia" |
| `api_key` | string | Yes | Cartesia API key |
| `model_id` | string | Yes | Model identifier (sonic-3) |
| `voice.mode` | string | Yes | Voice selection mode ("id") |
| `voice.id` | string | Yes | Cartesia voice identifier |
| `output_format.container` | string | Yes | Audio format ("raw") |
| `output_format.sample_rate` | number | Yes | Sample rate in Hz (16000) |
| `language` | string | Yes | Language code ("en") |

### ASR Configuration (ARES)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vendor` | string | Yes | Must be "ares" for ARES ASR |
| `language` | string | Yes | Language code (en-US, zh-CN, etc.) |

### Turn Detection

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | string | Detection mode ("default") |
| `speech_threshold` | number | Speech detection threshold (0.5) |
| `start_of_speech.mode` | string | VAD (Voice Activity Detection) mode |
| `end_of_speech.mode` | string | Semantic silence detection |
| `silence_duration_ms` | number | Silence duration before end (320ms) |
| `max_wait_ms` | number | Max wait time for response (3000ms) |

### Advanced Features

| Parameter | Type | Description |
|-----------|------|-------------|
| `enable_rtm` | boolean | Enable Real-Time Messaging (true) |
| `enable_aivad` | boolean | Enable AI-powered VAD (false) |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `silence_config.timeout_ms` | number | Idle timeout (30000ms = 30s) |
| `silence_config.action` | string | Action on timeout ("speak") |
| `farewell_config.graceful_enabled` | boolean | Graceful shutdown enabled |
| `farewell_config.graceful_timeout_seconds` | number | Graceful timeout (30s) |
| `data_channel` | string | Data channel type ("rtm") |
| `enable_metrics` | boolean | Enable metrics collection |
| `enable_error_message` | boolean | Enable error messages |

## System Message Template

The AI assistant uses a context-aware system message:

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
- Level: [user_level]
- Current Topic: [current_topic]
- Learning Goals: [learning_goals]
```

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthorized | Check Customer ID and Secret |
| 400 | Invalid parameters | Verify all required fields in payload |
| 500 | Internal server error | Check API key validity and format |
| 503 | Service unavailable | Retry with exponential backoff |

### Rate Limits

- **Peak Concurrent Users (PCU)**: 20 per App ID
- Contact Agora support to increase limits

## Implementation Notes

### Token Generation

- Tokens expire after 24 hours
- Generate new tokens for each session
- Use HMAC-SHA256 with app certificate
- Token format: `007{appId}{expireTimestamp}{signature}`

### Channel Naming

- Format: `voicechat_{userId}_{timestamp}`
- Ensures unique channels per session
- Prevents channel conflicts

### UID Assignment

- User UID: `1000 + (hash(userId) % 9000)`
- Agent UID: `2000 + (hash(channelName) % 9000)`
- Ensures unique identifiers within channel

### Idle Timeout

- Set to 300 seconds (5 minutes)
- Agent automatically leaves if idle
- Graceful shutdown with 30-second timeout

## Troubleshooting: Greeting Not Playing

### Issue: Agent starts but doesn't send greeting message

**Root Cause**: Incorrect system message role in Gemini configuration

**Solution**: Ensure system message uses `role: 'system'` not `role: 'user'`

**Correct Format**:
```json
"system_messages": [
  {
    "parts": [{ "text": "You are a helpful assistant..." }],
    "role": "system"
  }
]
```

**Incorrect Format** (causes greeting to not play):
```json
"system_messages": [
  {
    "parts": [{ "text": "You are a helpful assistant..." }],
    "role": "user"
  }
]
```

### Other Greeting Issues

1. **Greeting not heard**: Check TTS configuration
   - Verify Cartesia API key is valid
   - Confirm voice ID exists in Cartesia account
   - Check sample rate is 16000 Hz

2. **Agent connects but silent**: Check ASR configuration
   - Verify ARES vendor is set correctly
   - Confirm language code matches user's language
   - Check microphone permissions in browser

3. **Greeting plays but cut off**: Adjust turn detection
   - Increase `prefix_padding_ms` to 1000ms
   - Increase `silence_duration_ms` to 500ms
   - Increase `max_wait_ms` to 5000ms

## Monitoring & Debugging

### Logs to Monitor

```
Generated RTC token for channel: {channelName} uid: {uid}
Creating agent with URL: {url}
Agent created successfully: {agent_id}
Agent UID: {agentId}
User UID: {userId}
```

### Metrics Enabled

- Real-time metrics collection
- Error message reporting
- Session duration tracking

### Debug Checklist

- [ ] Verify all environment variables are set
- [ ] Check Agora App ID and Certificate are correct
- [ ] Confirm Gemini API key is valid and has quota
- [ ] Verify Cartesia API key and voice ID
- [ ] Check system message role is 'system' not 'user'
- [ ] Confirm greeting_message is not empty
- [ ] Verify TTS vendor is 'cartesia'
- [ ] Check ASR vendor is 'ares'
- [ ] Ensure user microphone permissions are granted
- [ ] Test with browser console open for errors

## Pricing

### ARES ASR Charges

Using ARES for speech-to-text incurs charges under "ARES ASR Task" category. See Agora pricing page for details.

### Cartesia TTS

Text-to-speech charges apply based on characters processed.

## References

- [Agora Conversational AI REST API](https://docs.agora.io/en/conversational-ai/reference/rest-api)
- [Google Gemini API](https://ai.google.dev/docs)
- [Cartesia TTS Documentation](https://docs.cartesia.ai)
- [Agora RTC Token Generation](https://docs.agora.io/en/video-calling/get-started/authentication-workflow)

## Support

For issues or questions:
- Check Agora Console for app configuration
- Verify all environment variables are set
- Review error logs for specific error codes
- Contact Agora technical support for API issues
