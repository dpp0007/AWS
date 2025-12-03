@echo off
REM Chemistry Avatar Setup Script for Windows
REM This script sets up the offline AI chemistry teacher

echo.
echo 🧪 Chemistry Avatar Setup
echo ==========================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✓ Docker found

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✓ Docker Compose found

REM Check for NVIDIA GPU (optional)
nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ NVIDIA GPU detected
) else (
    echo ⚠ No NVIDIA GPU detected. Ollama will run on CPU (slower).
)

echo.
echo 📦 Step 1: Installing Python dependencies for backend...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Python dependencies installed

echo.
echo 🗄️ Step 2: Building chemistry reaction database...
python ord_processor.py
if %errorlevel% neq 0 (
    echo ❌ Failed to build database
    pause
    exit /b 1
)
echo ✓ Database built

cd ..

echo.
echo 🐳 Step 3: Starting Docker services...
docker-compose up -d ollama backend

echo.
echo ⏳ Waiting for Ollama to start...
timeout /t 10 /nobreak >nul

echo.
echo 📥 Step 4: Pulling Llama 3.2 model (this may take a few minutes)...
docker exec chemistry-ollama ollama pull llama3.2:3b-instruct-q4_K_M

echo.
echo 📦 Step 5: Installing frontend dependencies...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    1. Backend is already running on http://localhost:8000
echo    2. Start frontend: npm run dev
echo    3. Open http://localhost:3000/avatar
echo.
echo 📊 Useful commands:
echo    - Check backend logs: docker logs chemistry-backend
echo    - Check Ollama logs: docker logs chemistry-ollama
echo    - Stop services: docker-compose down
echo    - Restart services: docker-compose restart
echo.
echo 🎓 Test the AI:
echo    curl -X POST http://localhost:8000/chat ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"message\": \"Explain SN2 mechanism\"}"
echo.
pause
