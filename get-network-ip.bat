@echo off
echo ========================================
echo   Finding Your Network IP Address
echo ========================================
echo.

echo Your Network IP Addresses:
echo.
ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo   How to Use Network Access:
echo ========================================
echo.
echo 1. Find your IPv4 Address above (e.g., 192.168.1.100)
echo 2. Start backend: cd backend ^&^& python main.py
echo 3. Start frontend: npm run dev -- -H 0.0.0.0
echo 4. Access from any device: http://YOUR_IP:3000
echo.
echo The app will automatically detect and use the correct backend URL!
echo No need to change .env file!
echo.
pause
