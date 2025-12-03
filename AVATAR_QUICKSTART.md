# ⚡ Chemistry Avatar - 5 Minute Quickstart

Get your AI chemistry teacher running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:
- [ ] Docker Desktop installed and running
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] 12GB free disk space
- [ ] (Optional) NVIDIA GPU with CUDA drivers

## Installation Steps

### Step 1: Run Setup Script (2 minutes)

**Windows:**
```bash
setup-avatar.bat
```

**Linux/Mac:**
```bash
chmod +x setup-avatar.sh
./setup-avatar.sh
```

This automatically:
- ✅ Installs Python dependencies
- ✅ Builds chemistry database
- ✅ Starts Docker containers
- ✅ Downloads AI model (~2GB)
- ✅ Installs frontend packages

### Step 2: Start Frontend (30 seconds)

```bash
npm run dev
```

### Step 3: Open Browser (10 seconds)

Navigate to:
```
http://localhost:3000/avatar
```

## Verify It's Working

You should see:
- ✅ 3D avatar on the left side
- ✅ Chat interface on the right
- ✅ "🟢 Online" status indicator
- ✅ Quick action buttons at bottom

## Test It

Type in the chat:
```
Explain the SN2 mechanism
```

You should see:
- ✅ Avatar starts animating
- ✅ Response streams in real-time
- ✅ Chemistry-focused explanation

## Troubleshooting

### Backend Not Running?

```bash
# Check status
docker ps

# Start if needed
docker-compose up -d

# Check logs
docker logs chemistry-backend
```

### Model Not Downloaded?

```bash
# Pull model manually
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M
```

### Port Already in Use?

Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8001:8000"  # Change 8000 to 8001
```

### WebSocket Connection Failed?

1. Check backend health: http://localhost:8000/health
2. Check browser console for errors
3. Try HTTP fallback (automatic)

## Performance Tips

### With GPU (Fast)
- 60-80 tokens/sec
- <2 second first response
- Smooth streaming

### Without GPU (Slower)
- 5-10 tokens/sec
- 3-5 second first response
- Still works fine!

To check GPU usage:
```bash
nvidia-smi
```

## What's Next?

1. **Explore**: Try different chemistry questions
2. **Customize**: Edit avatar appearance in `components/AvatarTeacher.tsx`
3. **Expand**: Add more reactions in `backend/ord_processor.py`
4. **Integrate**: Connect with lab experiments

## Quick Commands

```bash
# Start everything
docker-compose up -d && npm run dev

# Stop everything
docker-compose down

# Restart backend
docker-compose restart backend

# View logs
docker-compose logs -f

# Test backend
curl http://localhost:8000/health
```

## Success! 🎉

If you can chat with the avatar and get responses, you're all set!

For more details, see:
- `START_HERE.md` - Comprehensive guide
- `AVATAR_README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details

Enjoy your AI chemistry teacher! 🧪✨
