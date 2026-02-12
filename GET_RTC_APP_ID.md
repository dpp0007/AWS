# Get Your RTC App ID - Step by Step

## The Problem
Your voice chat is failing because you're using the **Conversational AI App ID** for RTC (voice calling). These are two different services that need two different App IDs.

**Current Setup:**
- ✅ `AGORA_APP_ID` = `30debd2b48994acb8e535193fe9525d8` (Conversational AI - Backend) - CORRECT
- ❌ `NEXT_PUBLIC_AGORA_APP_ID` = `30debd2b48994acb8e535193fe9525d8` (RTC - Frontend) - WRONG, should be different

## Solution: Get a New RTC App ID

### Step 1: Open Agora Console
Go to: https://console.agora.io/

### Step 2: Create New Project
1. Click **"Projects"** in left sidebar
2. Click **"Create"** button
3. Fill in:
   - **Project Name**: `Elixra Voice Chat RTC` (or any name)
   - **Product**: Select **"Agora RTC"** (NOT Conversational AI)
4. Click **"Create"**

### Step 3: Copy Your New App ID
1. Your new project appears in the list
2. Click on it to open
3. You'll see the **App ID** displayed prominently
4. **Copy this App ID** (long alphanumeric string)

### Step 4: Update Your .env File
1. Open `.env` in your project
2. Find this line:
   ```
   NEXT_PUBLIC_AGORA_APP_ID=30debd2b48994acb8e535193fe9525d8
   ```
3. Replace with your new RTC App ID:
   ```
   NEXT_PUBLIC_AGORA_APP_ID=YOUR_NEW_RTC_APP_ID_HERE
   ```
4. Save the file

### Step 5: Restart Dev Server
1. Stop your dev server (Ctrl+C in terminal)
2. Run again: `npm run dev`
3. Go to http://localhost:3000/voicechat
4. Click "Start Voice Chat"
5. ✅ It should work now!

## Verification Checklist
- [ ] Created new project in Agora Console for RTC
- [ ] Copied the new App ID
- [ ] Updated `.env` with new RTC App ID
- [ ] Restarted dev server
- [ ] No more "invalid vendor key" error
- [ ] Microphone permission prompt appears
- [ ] Voice chat connects successfully

## Why Two App IDs?
Agora separates services:
- **Conversational AI**: Creates AI agents that join channels (backend)
- **RTC**: Handles voice/video calling between users and agents (frontend)

Each needs its own App ID for security and billing.

## Still Having Issues?
1. Make sure you created project for **"Agora RTC"** (not Conversational AI)
2. Double-check the App ID is copied correctly (no extra spaces)
3. Verify `.env` file was saved
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try in incognito window
6. Check browser console (F12) for specific errors

---

**Once you have the RTC App ID, update `.env` and restart. Voice chat will work!**
