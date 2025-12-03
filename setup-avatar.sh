#!/bin/bash

# Chemistry Avatar Setup Script
# This script sets up the offline AI chemistry teacher

set -e

echo "🧪 Chemistry Avatar Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check for NVIDIA GPU (optional)
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✓ NVIDIA GPU detected${NC}"
    GPU_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ No NVIDIA GPU detected. Ollama will run on CPU (slower).${NC}"
    GPU_AVAILABLE=false
fi

echo ""
echo "📦 Step 1: Installing Python dependencies for backend..."
cd backend
python3 -m pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

echo ""
echo "🗄️ Step 2: Building chemistry reaction database..."
python3 ord_processor.py
echo -e "${GREEN}✓ Database built${NC}"

cd ..

echo ""
echo "🐳 Step 3: Starting Docker services..."
docker-compose up -d ollama backend

echo ""
echo "⏳ Waiting for Ollama to start..."
sleep 10

echo ""
echo "📥 Step 4: Pulling Llama 3.2 model (this may take a few minutes)..."
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M

echo ""
echo "📦 Step 5: Installing frontend dependencies..."
npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🚀 To start the application:"
echo "   1. Backend is already running on http://localhost:8000"
echo "   2. Start frontend: npm run dev"
echo "   3. Open http://localhost:3000/avatar"
echo ""
echo "📊 Useful commands:"
echo "   - Check backend logs: docker logs chemistry-backend"
echo "   - Check Ollama logs: docker logs chemistry-ollama"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo ""
echo "🎓 Test the AI:"
echo "   curl -X POST http://localhost:8000/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Explain SN2 mechanism\"}'"
echo ""
