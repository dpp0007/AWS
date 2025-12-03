@echo off
echo ========================================
echo   Starting Chemistry Avatar (Network Mode)
echo ========================================
echo.

echo Finding your network IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo.
echo ========================================
echo   Your Network IP: %IP%
echo ========================================
echo.
echo Access the app from any device on your network:
echo   http://%IP%:3000
echo.
echo Backend will be available at:
echo   http://%IP%:8000
echo.
echo ========================================
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python main.py"

timeout /t 3 /nobreak >nul

echo Starting frontend server (network mode)...
start "Frontend Server" cmd /k "npm run dev -- -H 0.0.0.0"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Two windows will open:
echo   1. Backend Server (Python)
echo   2. Frontend Server (Next.js)
echo.
echo Once both are running, access from any device:
echo   http://%IP%:3000
echo.
echo Press any key to exit this window...
pause >nul
