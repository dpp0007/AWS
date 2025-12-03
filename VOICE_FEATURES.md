# 🎤 Voice Features - Speech-to-Text & Text-to-Speech

## ✅ What Was Added

Your AI Chemistry Teacher now has **full voice capabilities**!

### 🎙️ Speech-to-Text (Voice Input)
- Click the **microphone button** to start listening
- Speak your chemistry question
- Your speech is automatically converted to text
- Works using browser's Web Speech API

### 🔊 Text-to-Speech (Voice Output)
- The avatar **automatically speaks** all responses
- Uses natural-sounding voice synthesis
- Avatar animates while speaking
- Click the **speaker button** to stop speaking

## 🎮 How to Use

### Voice Input (Ask Questions by Speaking)

1. **Click the Microphone Button** (🎤)
   - Button turns red and pulses
   - Status shows "🎤 Listening..."
   - Speak your question clearly

2. **Speak Your Question**
   - Example: "Explain the SN2 mechanism"
   - Example: "What is a Grignard reaction?"
   - Example: "How does combustion work?"

3. **Question Appears**
   - Your speech is converted to text
   - Appears in the input field
   - Press Send or Enter

### Voice Output (Hear Responses)

1. **Automatic Speaking**
   - After AI responds, it automatically speaks
   - Status shows "🔊 Speaking..."
   - Avatar animates while speaking

2. **Stop Speaking**
   - Click the **speaker button** (🔊) to stop
   - Or wait for response to finish

## 🎨 Visual Indicators

### Header Status
- **🎤 Listening...** - Voice input active (red mic icon pulsing)
- **🔊 Speaking...** - Avatar is speaking (orange speaker icon pulsing)
- **🟢 Online** - Ready for questions
- **🔴 Offline** - Backend not connected

### Buttons
- **Microphone Button**
  - Gray: Ready to listen
  - Red (pulsing): Currently listening
  - Disabled: When streaming or offline

- **Speaker Button**
  - Orange: Currently speaking (click to stop)
  - Gray: Not speaking (disabled)

- **Send Button**
  - Purple: Ready to send
  - Spinning: Processing response
  - Disabled: When no input or offline

## 🌐 Browser Compatibility

### Speech Recognition (Voice Input)
- ✅ Chrome/Edge (best support)
- ✅ Safari (iOS 14.5+)
- ⚠️ Firefox (limited support)

### Speech Synthesis (Voice Output)
- ✅ All modern browsers
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers

## 🎯 Features

### Voice Input
- **Continuous listening** until you stop
- **Automatic text conversion**
- **Real-time feedback**
- **Multiple language support** (set to English)

### Voice Output
- **Natural-sounding voice**
- **Automatic speaking** after responses
- **Female voice** (chemistry teacher persona)
- **Adjustable rate, pitch, volume**
- **Stop anytime** with speaker button

## 💡 Tips

### For Best Voice Input
1. **Speak clearly** and at normal pace
2. **Reduce background noise**
3. **Use good microphone** (headset recommended)
4. **Wait for red pulse** before speaking
5. **Speak complete questions**

### For Best Voice Output
1. **Use headphones** to avoid echo
2. **Adjust system volume** as needed
3. **Let responses finish** for best experience
4. **Click stop** if response is too long

## 🔧 Troubleshooting

### Voice Input Not Working?

**Check Microphone Permission:**
- Browser will ask for microphone access
- Click "Allow" when prompted
- Check browser settings if blocked

**Browser Not Supported:**
- Use Chrome or Edge for best results
- Update browser to latest version

**Not Hearing Anything:**
- Check microphone is connected
- Check system microphone settings
- Try refreshing the page

### Voice Output Not Working?

**No Sound:**
- Check system volume
- Check browser isn't muted
- Try clicking speaker button to restart

**Wrong Voice:**
- Browser uses system default voice
- Install additional voices in system settings
- Voice selection is automatic

**Speaking Too Fast/Slow:**
- Currently set to normal rate (1.0)
- Can be adjusted in code if needed

## 🎓 Example Conversations

### Voice Conversation Flow

**You:** *Click mic* "What is an SN2 reaction?"

**Avatar:** *Speaks* "Great question! An SN2 reaction is a type of nucleophilic substitution reaction. Let me explain step by step..."

**You:** *Click mic* "Can you give me an example?"

**Avatar:** *Speaks* "Absolutely! A classic example is when hydroxide ion attacks methyl bromide..."

### Hands-Free Mode

1. Click microphone
2. Ask question
3. Listen to response
4. Click microphone again
5. Ask follow-up
6. Repeat!

## 🚀 Advanced Features

### Customization Options

You can customize in `components/StreamingChat.tsx`:

**Voice Settings:**
```typescript
utterance.rate = 1.0    // Speed (0.1 to 10)
utterance.pitch = 1.0   // Pitch (0 to 2)
utterance.volume = 1.0  // Volume (0 to 1)
```

**Recognition Settings:**
```typescript
recognition.continuous = false  // Single vs continuous
recognition.interimResults = false  // Show partial results
recognition.lang = 'en-US'  // Language
```

## 🎉 You're All Set!

Your AI Chemistry Teacher can now:
- ✅ **Listen** to your questions
- ✅ **Speak** the responses
- ✅ **Animate** while speaking
- ✅ **Provide visual feedback**

**Try it now**: http://localhost:3000/avatar

Click the microphone and say "Explain the SN2 mechanism"! 🎤🧪✨
