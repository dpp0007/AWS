# 🤖 AI Chemistry Teacher - Complete Installation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation Methods](#installation-methods)
4. [Verification](#verification)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Overview

This guide will help you install and configure the **offline AI chemistry teaching avatar** for your chemistry lab application.

**What you'll get:**
- 🤖 AI-powered chemistry teacher (Llama 3.2)
- 🎨 3D animated avatar
- 💬 Real-time streaming chat
- 📚 RAG-enhanced with chemistry database
- ⚡ GPU accelerated (optional)
- 🔒 100% offline operation

---

## System Requirements

### Minimum Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 8GB (16GB recommended)
- **Storage**: 12GB free space
- **CPU**: 4+ cores
- **Docker**: Docker Desktop 20.10+
- **Node.js**: 18.0+
- **Python**: 3.11+

### Recommended for Best Performance

- **GPU**: NVIDIA RTX 4060 or better
- **VRAM**: 6GB+
- **RAM**: 16GB+
- **CUDA**: 11.8+ with nvidia-docker2

### Software Dependencies

```bash
# Check versions
docker --version          # Should be 20.10+
node --version           # Should be 18.0+
python --version         # Should be 3.11+
nvidia-smi              # Optional: Check GPU
```

---

## Installation Methods

### Method 1: Automated Setup (Recommended)

**For Windows:**

1. Open Command Prompt or PowerShell
2. Navigate to project directory
3. Run:
   ```bash
   setup-avatar.bat
   ```

**For Linux/Mac:**

1. Open Terminal
2. Navigate to project directory
3. Run:
   ```bash
   chmod +x setup-avatar.sh
   ./setup-avatar.sh
   ```

**What it does:**
- ✅ Checks system requirements
- ✅ Installs Python dependencies
- ✅ Builds chemistry reaction database
- ✅ Starts Docker containers (Ollama + Backend)
- ✅ Downloads Llama 3.2 model (~2GB)
- ✅ Installs Node.js dependencies

**Time required:** 5-10 minutes (depending on internet speed)

---

### Method 2: Manual Installation

#### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Build chemistry database
python ord_processor.py

# Return to root
cd ..
```

#### Step 2: Docker Services

```bash
# Start Ollama and Backend
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Pull AI model (this takes a few minutes)
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M
```

#### Step 3: Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

#### Step 4: Verify Installation

```bash
# Check backend health
curl http://localhost:8000/health

# Check Ollama
curl http://localhost:11434/api/tags

# Open browser
# Navigate to http://localhost:3000/avatar
```

---

### Method 3: Docker-Only Installation

If you want to run everything in Docker:

```bash
# Build and start all services
docker-compose up -d --build

# Pull AI model
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M

# Frontend will be available at http://localhost:3000
# (Uncomment frontend service in docker-compose.yml first)
```

---

## Verification

### Check Services

**1. Backend API**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "ollama": "connected",
  "models": ["llama3.2:3b-instruct-q4_K_M"]
}
```

**2. Ollama Service**
```bash
curl http://localhost:11434/api/tags
```

Expected: List of available models

**3. Frontend**

Open browser: http://localhost:3000

Expected: Chemistry lab homepage loads

**4. Avatar Page**

Navigate to: http://localhost:3000/avatar

Expected:
- 3D avatar visible on left
- Chat interface on right
- "🟢 Online" status indicator
- Quick action buttons at bottom

### Test Chat

1. Go to http://localhost:3000/avatar
2. Type: "Explain the SN2 mechanism"
3. Press Send

Expected:
- Avatar starts animating
- Response streams in real-time
- Chemistry-focused explanation appears

### Check GPU Usage (Optional)

```bash
# Watch GPU in real-time
watch -n 1 nvidia-smi

# Or check once
nvidia-smi
```

Expected: Ollama process using ~6GB VRAM

---

## Usage

### Starting the Application

**Every time you want to use the avatar:**

1. **Start Backend** (if not running):
   ```bash
   docker-compose up -d
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   ```
   http://localhost:3000/avatar
   ```

### Stopping the Application

**Stop Frontend:**
- Press `Ctrl+C` in terminal running `npm run dev`

**Stop Backend:**
```bash
docker-compose down
```

**Stop Everything:**
```bash
docker-compose down
# Press Ctrl+C in frontend terminal
```

---

## Troubleshooting

### Issue: Backend won't start

**Symptoms:**
- `curl http://localhost:8000/health` fails
- Docker container not running

**Solutions:**

```bash
# Check container status
docker ps -a

# View logs
docker logs chemistry-backend

# Restart container
docker-compose restart backend

# Rebuild if needed
docker-compose up -d --build backend
```

---

### Issue: Ollama connection failed

**Symptoms:**
- Backend health shows "ollama: disconnected"
- Chat responses show connection error

**Solutions:**

```bash
# Check Ollama status
docker logs chemistry-ollama

# Test Ollama directly
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose restart ollama

# Check if model is downloaded
docker exec chemistry-ollama ollama list
```

---

### Issue: Model not found

**Symptoms:**
- Error: "model not found"
- Empty model list

**Solutions:**

```bash
# Pull model manually
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M

# Verify model exists
docker exec chemistry-ollama ollama list

# Try alternative model
docker exec chemistry-ollama ollama pull llama3.2:3b
```

---

### Issue: WebSocket connection failed

**Symptoms:**
- Chat shows "🔴 Offline"
- Messages don't send
- Browser console shows WebSocket errors

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for WebSocket errors
   - Check CORS errors

3. **Try HTTP fallback:**
   - The app automatically falls back to HTTP
   - Should still work, just slightly slower

4. **Check firewall:**
   - Ensure port 8000 is not blocked
   - Allow Docker in firewall settings

---

### Issue: Slow responses

**Symptoms:**
- Takes >10 seconds for first token
- Streaming is very slow (<5 tokens/sec)

**Solutions:**

**If you have GPU:**
```bash
# Check GPU is being used
nvidia-smi

# Should show ollama process using GPU
# If not, check NVIDIA Docker setup
```

**If no GPU:**
- This is normal! CPU inference is slower
- Expected: 5-10 tokens/sec
- Consider using smaller model:
  ```bash
  docker exec chemistry-ollama ollama pull llama3.2:1b
  ```

**Optimize settings:**
Edit `backend/main.py`:
```python
options={
    'num_predict': 256,  # Reduce from 512
    'temperature': 0.5,  # Lower temperature
}
```

---

### Issue: Port already in use

**Symptoms:**
- Error: "port 8000 already in use"
- Docker won't start

**Solutions:**

**Option 1: Stop conflicting service**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Stop that service
```

**Option 2: Change port**

Edit `docker-compose.yml`:
```yaml
backend:
  ports:
    - "8001:8000"  # Change to 8001
```

Then update frontend to use new port in `components/StreamingChat.tsx`:
```typescript
const ws = new WebSocket('ws://localhost:8001/ws')
```

---

### Issue: Out of memory

**Symptoms:**
- Docker crashes
- System becomes slow
- "Out of memory" errors

**Solutions:**

1. **Increase Docker memory:**
   - Docker Desktop → Settings → Resources
   - Increase memory to 8GB+

2. **Use smaller model:**
   ```bash
   docker exec chemistry-ollama ollama pull llama3.2:1b
   ```

3. **Close other applications**

4. **Check system resources:**
   ```bash
   docker stats
   ```

---

### Issue: Frontend won't start

**Symptoms:**
- `npm run dev` fails
- Port 3000 already in use

**Solutions:**

```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear Next.js cache
rm -rf .next
npm run dev

# Use different port
npm run dev -- -p 3001
```

---

## Advanced Configuration

### Change AI Model

**Use larger model (better quality, slower):**
```bash
docker exec chemistry-ollama ollama pull llama3.2:7b
```

Edit `backend/main.py`:
```python
model='llama3.2:7b'
```

**Use smaller model (faster, less accurate):**
```bash
docker exec chemistry-ollama ollama pull llama3.2:1b
```

Edit `backend/main.py`:
```python
model='llama3.2:1b'
```

### Customize System Prompt

Edit `backend/main.py` - find `system_prompt` variable:

```python
system_prompt = """You are CHEM, a friendly chemistry teacher...

Your teaching style:
- [Customize this]
- [Add your preferences]
- [Change personality]
"""
```

### Add Chemistry Reactions

Edit `backend/ord_processor.py` - add to `sample_reactions`:

```python
{
    "id": "rxn_009",
    "name": "Your Reaction Name",
    "equation": "A + B → C + D",
    "type": "reaction_type",
    "description": "What happens in this reaction",
    "reactants": ["A", "B"],
    "products": ["C", "D"],
    "observations": "What you would see",
    "mechanism": "Step-by-step mechanism"
}
```

Rebuild database:
```bash
cd backend
python ord_processor.py
docker-compose restart backend
```

### Customize Avatar Appearance

Edit `components/AvatarTeacher.tsx`:

```typescript
// Change colors
<meshStandardMaterial color="#ffdbac" />  // Skin color
<meshStandardMaterial color="#6366f1" />  // Body color

// Change size
<sphereGeometry args={[0.3, 32, 32]} />  // Head size

// Change position
position={[0, -1.5, 0]}  // Avatar position
```

### Configure GPU Settings

Edit `docker-compose.yml`:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1  # Number of GPUs
            capabilities: [gpu]
```

### Enable Frontend Docker

Uncomment in `docker-compose.yml`:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile.frontend
  ports:
    - "3000:3000"
  # ... rest of config
```

Then:
```bash
docker-compose up -d --build
```

---

## Performance Optimization

### For GPU Users

1. **Ensure CUDA is installed:**
   ```bash
   nvidia-smi
   ```

2. **Use quantized models:**
   - Q4_K_M (recommended) - balanced
   - Q5_K_M - better quality
   - Q8_0 - best quality, slower

3. **Monitor GPU usage:**
   ```bash
   watch -n 1 nvidia-smi
   ```

### For CPU Users

1. **Use smaller models:**
   ```bash
   docker exec chemistry-ollama ollama pull llama3.2:1b
   ```

2. **Reduce token limit:**
   Edit `backend/main.py`:
   ```python
   'num_predict': 256  # Instead of 512
   ```

3. **Lower temperature:**
   ```python
   'temperature': 0.5  # Instead of 0.7
   ```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker logs -f chemistry-backend

# Ollama only
docker logs -f chemistry-ollama
```

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop  # Linux
top   # Mac
# Task Manager on Windows
```

### API Health Monitoring

```bash
# Continuous health check
watch -n 5 curl -s http://localhost:8000/health
```

---

## Backup and Restore

### Backup

```bash
# Backup chemistry database
cp backend/ord_faiss.index backend/ord_faiss.index.backup
cp backend/ord_reactions.json backend/ord_reactions.json.backup

# Backup Docker volumes
docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar czf /backup/ollama_backup.tar.gz /data
```

### Restore

```bash
# Restore database
cp backend/ord_faiss.index.backup backend/ord_faiss.index
cp backend/ord_reactions.json.backup backend/ord_reactions.json

# Restore Docker volumes
docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar xzf /backup/ollama_backup.tar.gz -C /
```

---

## Uninstallation

### Remove Everything

```bash
# Stop and remove containers
docker-compose down -v

# Remove images
docker rmi ollama/ollama:latest
docker rmi chemistry-backend

# Remove backend files
rm -rf backend/__pycache__
rm backend/*.index backend/*.json

# Remove node modules (optional)
rm -rf node_modules
rm -rf .next
```

---

## Getting Help

### Check Documentation

- `AVATAR_QUICKSTART.md` - 5-minute setup
- `START_HERE.md` - Comprehensive guide
- `AVATAR_README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details

### Debug Checklist

- [ ] Docker is running
- [ ] Backend container is up: `docker ps`
- [ ] Ollama container is up: `docker ps`
- [ ] Model is downloaded: `docker exec chemistry-ollama ollama list`
- [ ] Backend health is good: `curl http://localhost:8000/health`
- [ ] Frontend is running: `npm run dev`
- [ ] Port 3000 is accessible: http://localhost:3000
- [ ] Avatar page loads: http://localhost:3000/avatar

### Common Commands Reference

```bash
# Start everything
docker-compose up -d && npm run dev

# Stop everything
docker-compose down

# Restart backend
docker-compose restart backend

# View logs
docker-compose logs -f

# Check health
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# List models
docker exec chemistry-ollama ollama list

# Pull new model
docker exec chemistry-ollama ollama pull llama3.2:3b

# Clean rebuild
docker-compose down -v
docker-compose up -d --build
```

---

## Success Checklist

After installation, verify:

- [ ] Backend responds: http://localhost:8000/health
- [ ] Ollama responds: http://localhost:11434/api/tags
- [ ] Frontend loads: http://localhost:3000
- [ ] Avatar page loads: http://localhost:3000/avatar
- [ ] 3D avatar is visible
- [ ] Chat shows "🟢 Online"
- [ ] Can send messages
- [ ] Responses stream in real-time
- [ ] Avatar animates when speaking
- [ ] Responses are chemistry-focused

---

## 🎉 Congratulations!

Your AI chemistry teacher is now installed and ready to use!

**Next steps:**
1. Try asking chemistry questions
2. Customize the avatar appearance
3. Add more chemistry reactions
4. Integrate with your lab experiments

Enjoy teaching chemistry with AI! 🧪✨
