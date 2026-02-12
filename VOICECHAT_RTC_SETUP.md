# Voice Chat - Getting Your RTC App ID

## Quick Start: Get Your RTC App ID in 5 Minutes

### Step 1: Go to Agora Console
1. Visit [Agora Console](https://console.agora.io/)
2. Sign in with your account (or create one if needed)

### Step 2: Create a New Project for RTC
1. Click on "Projects" in the left sidebar
2. Click "Create" button
3. Enter a project name (e.g., "Elixra Voice Chat RTC")
4. Select "Agora RTC" as the product
5. Click "Create"

### Step 3: Get Your App ID
1. Your new project will be created
2. You'll see the **App ID** displayed on the project page
3. Copy this App ID (it's a long alphanumeric string)

### Step 4: Add to Your .env File
1. Open `.env` in your project root
2. Find the line: `NEXT_PUBLIC_AGORA_APP_ID=30debd2b48994acb8e535193fe9525d8`
3. Replace it with your new RTC App ID:
   ```env
   NEXT_PUBLIC_AGORA_APP_ID=your-new-rtc-app-id-here
   ```
4. Save the file

### Step 5: Restart Your Dev Server
1. Stop your Next.js dev server (Ctrl+C)
2. Run it again: `npm run dev`
3. Navigate to `/voicechat`
4. Try the voice chat - it should work now!

## Important Notes

### ⚠️ Do NOT Use the Same App ID
- `AGORA_APP_ID` (backend, Conversational AI) = `30debd2b48994acb8e535193fe9525d8`
- `NEXT_PUBLIC_AGORA_APP_ID` (frontend, RTC) = **Your new RTC App ID**
- These MUST be different

### Why Two App IDs?
Agora separates services by App ID:
- **Conversational AI Engine**: For creating AI agents that join channels
- **RTC (Real-Time Communication)**: For voice/video calling between users and agents

Each service requires its own App ID for security and billing purposes.

### Verification
After adding the RTC App ID:
1. Check browser console (F12) for errors
2. You should NOT see: "invalid vendor key, can not find appid"
3. Microphone permission prompt should appear
4. Voice chat should connect successfully

## Troubleshooting

### Still Getting "invalid vendor key" Error?
1. Double-check you copied the App ID correctly
2. Make sure there are no extra spaces in `.env`
3. Restart the dev server completely
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try in an incognito window

### Can't Find App ID in Console?
1. Make sure you're logged into Agora Console
2. Check you created a project for "Agora RTC" (not Conversational AI)
3. The App ID should be visible on the project overview page
4. If not visible, try refreshing the page

### Still Not Working?
1. Verify both App IDs are in `.env`:
   - `AGORA_APP_ID` (Conversational AI)
   - `NEXT_PUBLIC_AGORA_APP_ID` (RTC)
2. Check that `NEXT_PUBLIC_AGORA_APP_ID` is NOT the same as `AGORA_APP_ID`
3. Ensure you have microphone permissions enabled in browser
4. Check browser console for specific error messages

## Next Steps

Once voice chat is working:
1. Test with different learning profiles (beginner, intermediate, advanced)
2. Try different chemistry topics
3. Test mute/unmute functionality
4. Test ending the session
5. Check agent response quality and latency

## Support

For detailed setup instructions, see: `VOICECHAT_SETUP.md`
For troubleshooting, see: `VOICECHAT_TROUBLESHOOTING.md`
