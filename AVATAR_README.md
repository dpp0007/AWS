# 🤖 Chemistry Teaching Avatar - Setup Guide

## Overview

This is a **fully offline AI chemistry teacher** that uses:
- **Ollama** with Llama 3.2 (3B model optimized for RTX 4060)
- **RAG Pipeline** with chemistry reaction database
- **Real-time streaming** responses
- **3D Avatar** with Three.js
- **WebSocket** for live communication

## 🚀 Quick Start

### Prerequisites

1. **Docker & Docker Compose** installed
2. **Node.js 18+** and npm
3. **Python 3.11+** (for backend)
4. **NVIDIA GPU** (optional, for faster inference)
   - RTX 4060 or better recommended
   - CUDA drivers installed
   - nvidia-docker2 installed

### Installation

#### Windows:
```bash
# Run the setup script
setup-avatar.bat
```

#### Linux/Mac:
```bash
# Make script executable
chmod +x setup-avatar.sh

# Run the setup script
./setup-avatar.sh
```

#### Manual Setup:

1. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
python ord_processor.py  # Build chemistry database
cd ..
```

2. **Start Docker Services**
```bash
docker-compose up -d
```

3. **Pull Ollama Model**
```bash
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M
```

4. **Install Frontend Dependencies**
```bash
npm install
```

5. **Start Frontend**
```bash
npm run dev
```

6. **Open Browser**
```
http://localhost:3000/avatar
```

## 🎯 Architecture

```
┌─────────────────────────────────────────┐
│  Next.js Frontend (Port 3000)           │
│  ├─ Avatar Page (/avatar)               │
│  ├─ 3D Avatar (Three.js)                │
│  └─ Streaming Chat (WebSocket)          │
└──────────────┬──────────────────────────┘
               │
               │ WebSocket/HTTP
               │
┌──────────────▼──────────────────────────┐
│  FastAPI Backend (Port 8000)            │
│  ├─ Streaming API                       │
│  ├─ RAG Pipeline (FAISS)                │
│  └─ Chemistry Database                  │
└──────────────┬──────────────────────────┘
               │
               │ HTTP API
               │
┌──────────────▼──────────────────────────┐
│  Ollama (Port 11434)                    │
│  └─ Llama 3.2:3b (GPU Accelerated)      │
└─────────────────────────────────────────┘
```

## 📁 File Structure

```
chemistry-avatar/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── rag_pipeline.py      # RAG implementation
│   ├── ord_processor.py     # Database builder
│   ├── requirements.txt     # Python deps
│   └── Dockerfile           # Backend container
├── components/
│   ├── AvatarTeacher.tsx    # 3D avatar
│   └── StreamingChat.tsx    # Chat interface
├── app/
│   └── avatar/
│       └── page.tsx         # Main avatar page
├── docker-compose.yml       # Container orchestration
├── setup-avatar.sh          # Linux/Mac setup
└── setup-avatar.bat         # Windows setup
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/main.py` to customize:
- Model parameters (temperature, top_p, etc.)
- System prompts
- RAG retrieval settings

### Frontend Configuration

Edit `components/StreamingChat.tsx` to customize:
- WebSocket URL
- UI appearance
- Message handling

### Docker Configuration

Edit `docker-compose.yml` to:
- Change ports
- Adjust GPU settings
- Configure volumes

## 🎮 Usage

### Basic Chat

1. Open http://localhost:3000/avatar
2. Type your chemistry question
3. Watch the avatar respond in real-time

### Example Questions

- "Explain the SN2 mechanism step by step"
- "What happens when I mix NaCl and AgNO₃?"
- "How does a Grignard reaction work?"
- "Teach me about acid-base neutralization"

### With Lab Context

The chat automatically receives context from your current experiment:
- Chemicals being used
- Current lab state
- Previous reactions

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs chemistry-backend

# Restart service
docker-compose restart backend
```

### Ollama connection failed

```bash
# Check if Ollama is running
docker logs chemistry-ollama

# Test Ollama directly
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose restart ollama
```

### Model not found

```bash
# Pull the model manually
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M

# List available models
docker exec chemistry-ollama ollama list
```

### WebSocket connection issues

1. Check backend is running: http://localhost:8000/health
2. Check browser console for errors
3. Verify CORS settings in `backend/main.py`

### Slow responses

- **CPU Mode**: 5-10 tokens/sec (normal without GPU)
- **GPU Mode**: 60-80 tokens/sec (with RTX 4060)

To enable GPU:
1. Install NVIDIA drivers
2. Install nvidia-docker2
3. Restart Docker daemon
4. Restart containers

## 📊 Performance

### Expected Performance (RTX 4060)

- **First Token**: <2 seconds
- **Streaming Speed**: 60-80 tokens/sec
- **Avatar FPS**: 60fps
- **Memory Usage**: 
  - VRAM: ~6GB
  - RAM: ~4GB
  - Storage: ~12GB

### Without GPU (CPU Only)

- **First Token**: 3-5 seconds
- **Streaming Speed**: 5-10 tokens/sec
- **Memory Usage**:
  - RAM: ~8GB
  - Storage: ~12GB

## 🔒 Security

- All processing is **100% offline**
- No data sent to external APIs
- No telemetry or tracking
- Local model storage

## 🆘 Support

### Check Service Status

```bash
# All services
docker-compose ps

# Backend health
curl http://localhost:8000/health

# Ollama health
curl http://localhost:11434/api/tags
```

### View Logs

```bash
# Backend logs
docker logs -f chemistry-backend

# Ollama logs
docker logs -f chemistry-ollama

# All logs
docker-compose logs -f
```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild
docker-compose up -d --build
```

## 🎓 Advanced Usage

### Custom Chemistry Database

Edit `backend/ord_processor.py` to add your own reactions:

```python
sample_reactions = [
    {
        "name": "Your Reaction",
        "equation": "A + B → C",
        "description": "...",
        "mechanism": "..."
    }
]
```

Then rebuild:
```bash
cd backend
python ord_processor.py
docker-compose restart backend
```

### Different Models

Try other Ollama models:

```bash
# Larger model (better quality, slower)
docker exec chemistry-ollama ollama pull llama3.2:7b

# Smaller model (faster, less accurate)
docker exec chemistry-ollama ollama pull llama3.2:1b
```

Update `backend/main.py`:
```python
model='llama3.2:7b'  # Change model name
```

### API Integration

Use the backend API directly:

```bash
# HTTP Streaming
curl -N -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain SN2 mechanism"}'

# Reaction Analysis
curl -N -X POST http://localhost:8000/analyze-reaction \
  -H "Content-Type: application/json" \
  -d '{"chemicals": ["NaCl", "AgNO3"]}'
```

## 📈 Monitoring

### GPU Usage

```bash
# Watch GPU usage
watch -n 1 nvidia-smi

# Or in Docker
docker exec chemistry-ollama nvidia-smi
```

### Resource Usage

```bash
# Docker stats
docker stats chemistry-ollama chemistry-backend
```

## 🎉 Success!

If everything is working, you should see:
- ✅ Backend running on http://localhost:8000
- ✅ Ollama running on http://localhost:11434
- ✅ Frontend on http://localhost:3000
- ✅ Avatar page at http://localhost:3000/avatar
- ✅ Real-time streaming responses
- ✅ 3D avatar animating

Enjoy your offline AI chemistry teacher! 🧪✨
