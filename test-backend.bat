@echo off
REM Quick test script for the backend API

echo Testing Chemistry Avatar Backend...
echo.

echo 1. Testing health endpoint...
curl -s http://localhost:8000/health
echo.
echo.

echo 2. Testing chat endpoint with sample question...
curl -X POST http://localhost:8000/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"What is an SN2 reaction?\"}"
echo.
echo.

echo 3. Testing reaction analysis...
curl -X POST http://localhost:8000/analyze-reaction ^
  -H "Content-Type: application/json" ^
  -d "{\"chemicals\": [\"NaCl\", \"AgNO3\"]}"
echo.
echo.

echo Tests complete!
pause
