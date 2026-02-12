# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

Run this command from the project root:

```powershell
backend/venv/Scripts/pip install -r backend/requirements.txt
```

Or if venv doesn't exist yet:

```powershell
python -m venv backend/venv
backend/venv/Scripts/pip install -r backend/requirements.txt
```

### 2. Run the Backend

```powershell
backend/venv/Scripts/python backend/main.py
```

The server will start at: **http://localhost:8000**

### 3. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Environment Variables

The backend uses these environment variables from `.env`:

```env
GEMINI_API_KEY=AIzaSyDDGW8F1xa_7DNULpfknrqTy2tIUUPxyrA
AGORA_APP_ID=bb1ca613e3b94aa7af3eec189d172e99
AGORA_APP_CERTIFICATE=1128e52b74a944c7b9e5ec04e93425cb
AGORA_CUSTOMER_ID=188c574d56ae405e916449df64e28945
AGORA_CUSTOMER_SECRET=3f7c4ded78e1444fa4ed50ac273cad11
AGORA_LLM_API_KEY=AIzaSyCLEf-v7DVXcfh6PNsOOdFtH6eRz8_G2H0
AGORA_TTS_API_KEY=sk_car_6trWSv23KdCNswkDj7tPdh
AGORA_TTS_MODEL_ID=sonic-3
AGORA_TTS_VOICE_ID=95d51f79-c397-46f9-b49a-23763d3eaa2d
```

## API Endpoints

### Chat Endpoints

- **POST** `/chat` - Stream chat responses
- **POST** `/analyze-reaction` - Analyze chemical reactions
- **POST** `/analyze-molecule` - Analyze molecular structures
- **POST** `/generate-molecule` - Generate 3D molecule structures
- **WebSocket** `/ws` - Real-time streaming chat

### Quiz Endpoints

- **POST** `/quiz/generate` - Generate quiz questions
- **GET** `/quiz/session/{session_id}` - Get quiz session
- **POST** `/quiz/session/{session_id}/submit` - Submit quiz answers

### Health & Status

- **GET** `/` - API status
- **GET** `/health` - Health check

## Troubleshooting

### ModuleNotFoundError: No module named 'fastapi'

**Solution**: Install dependencies:
```powershell
backend/venv/Scripts/pip install -r backend/requirements.txt
```

### Port 8000 already in use

**Solution**: Kill the process using port 8000:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or use a different port:
```powershell
backend/venv/Scripts/python backend/main.py --port 8001
```

### GEMINI_API_KEY not set

**Solution**: Ensure `.env` file has the API key:
```env
GEMINI_API_KEY=your-key-here
```

## Development

### Activate Virtual Environment

```powershell
backend/venv/Scripts/Activate.ps1
```

### Deactivate Virtual Environment

```powershell
deactivate
```

### Install New Package

```powershell
backend/venv/Scripts/pip install package-name
```

### Update requirements.txt

```powershell
backend/venv/Scripts/pip freeze > backend/requirements.txt
```

## Production Deployment

For production, use:

```powershell
backend/venv/Scripts/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or with Gunicorn (Unix-like systems):

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app
```

## Features

- ✅ FastAPI with async support
- ✅ Google Gemini AI integration
- ✅ Real-time WebSocket streaming
- ✅ Chemical reaction analysis
- ✅ Molecular structure generation
- ✅ Quiz generation system
- ✅ CORS enabled for frontend
- ✅ Comprehensive error handling

## Support

For issues:
1. Check the health endpoint: http://localhost:8000/health
2. Review API docs: http://localhost:8000/docs
3. Check console logs for error messages
4. Verify environment variables in `.env`
