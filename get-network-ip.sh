#!/bin/bash

echo "========================================"
echo "  Finding Your Network IP Address"
echo "========================================"
echo ""

echo "Your Network IP Addresses:"
echo ""

# Try different methods to get IP
if command -v ip &> /dev/null; then
    ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1
elif command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}'
else
    echo "Could not detect IP automatically"
    echo "Please run: ipconfig (Windows) or ifconfig (Mac/Linux)"
fi

echo ""
echo "========================================"
echo "  How to Use Network Access:"
echo "========================================"
echo ""
echo "1. Find your IP Address above (e.g., 192.168.1.100)"
echo "2. Start backend: cd backend && python main.py"
echo "3. Start frontend: npm run dev -- -H 0.0.0.0"
echo "4. Access from any device: http://YOUR_IP:3000"
echo ""
echo "The app will automatically detect and use the correct backend URL!"
echo "No need to change .env file!"
echo ""
