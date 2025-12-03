# 🌐 Network Access Guide

This guide explains how to access the Chemistry Avatar application from other devices on your network.

## 📋 Prerequisites

- Backend and frontend running on your main computer
- All devices connected to the same network (WiFi/LAN)
- Firewall configured to allow connections on ports 3000 and 8000

---

## 🚀 Quick Setup

### Step 1: Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for your local IP (usually starts with `192.168.` or `10.`)

### Step 2: No Configuration Needed! 🎉

**The app now auto-detects the correct backend URL!**

When you access the app via:
- `http://localhost:3000` → Uses `http://localhost:8000`
- `http://192.168.1.100:3000` → Uses `http://192.168.1.100:8000`

**Optional:** If you want to force a specific URL, edit `.env`:
```env
NEXT_PUBLIC_BACKEND_URL=http://YOUR_IP:8000
```

### Step 3: Start Backend (Network Mode)

The backend is already configured to accept network connections!

```bash
cd backend
python main.py
```

The backend will run on `0.0.0.0:8000` (accessible from network)

### Step 4: Start Frontend (Network Mode)

```bash
npm run dev -- -H 0.0.0.0
```

This makes the frontend accessible from your network IP.

### Step 5: Access from Other Devices

On any device on the same network, open a browser and go to:

```
http://YOUR_IP:3000
```

Example: `http://192.168.1.100:3000`

**The app will automatically connect to the backend at `http://YOUR_IP:8000`!**

You can verify this by checking the browser console - it will show:
```
🌐 Backend Configuration: { httpUrl: "http://192.168.1.100:8000", ... }
```

---

## 🔧 Troubleshooting

### Can't Connect from Other Devices?

**1. Check Firewall Settings**

Windows:
- Open Windows Defender Firewall
- Click "Allow an app through firewall"
- Add Python and Node.js if not listed
- Allow both Private and Public networks

**2. Verify Backend is Running**

Test from another device:
```
http://YOUR_IP:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "ollama": "connected"
}
```

**3. Verify Frontend is Accessible**

Test from another device:
```
http://YOUR_IP:3000
```

**4. Check Network Configuration**

Make sure all devices are on the same network:
- Same WiFi network
- Not using VPN that isolates devices
- Router allows device-to-device communication

### Backend Connection Errors?

If you see "Failed to fetch" or connection errors:

1. Check `.env` has correct IP:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://YOUR_IP:8000
   ```

2. Restart the frontend after changing `.env`:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. Test backend directly:
   ```bash
   curl http://YOUR_IP:8000/health
   ```

---

## 🔒 Security Notes

**⚠️ Important for Production:**

The current CORS configuration allows all origins (`*`) for easy development. 

For production, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://your-domain.com",
        "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📱 Mobile Access

To access from mobile devices:

1. Connect mobile to same WiFi
2. Open browser on mobile
3. Navigate to: `http://YOUR_IP:3000`
4. Enjoy the avatar on mobile!

---

## 🎯 Quick Reference

| Service | Local URL | Network URL |
|---------|-----------|-------------|
| Frontend | http://localhost:3000 | http://YOUR_IP:3000 |
| Backend | http://localhost:8000 | http://YOUR_IP:8000 |
| Backend Health | http://localhost:8000/health | http://YOUR_IP:8000/health |

---

## 💡 Tips

- **Static IP**: Consider setting a static IP for your computer to avoid changing the URL
- **Port Forwarding**: For internet access (not just local network), configure port forwarding on your router
- **HTTPS**: For production, use HTTPS with proper SSL certificates
- **Performance**: Network access may be slightly slower than localhost

---

## ✅ Verification Checklist

- [ ] Found your computer's IP address
- [ ] Updated `.env` with `NEXT_PUBLIC_BACKEND_URL`
- [ ] Started backend with `python main.py`
- [ ] Started frontend with `npm run dev -- -H 0.0.0.0`
- [ ] Tested backend health endpoint from another device
- [ ] Accessed frontend from another device
- [ ] Avatar loads and responds correctly

---

Need help? Check the main README.md or create an issue!
