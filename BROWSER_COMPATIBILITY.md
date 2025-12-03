# 🌐 Browser Compatibility Guide

This document explains which browsers support the voice features in the Chemistry Avatar application.

---

## 📊 Feature Support by Browser

| Browser | Voice Input (Speech Recognition) | Voice Output (Text-to-Speech) | Overall Rating |
|---------|----------------------------------|-------------------------------|----------------|
| **Google Chrome** | ✅ Full Support | ✅ Full Support | ⭐⭐⭐⭐⭐ Recommended |
| **Microsoft Edge** | ✅ Full Support | ✅ Full Support | ⭐⭐⭐⭐⭐ Recommended |
| **Safari** | ❌ Not Supported | ✅ Supported | ⭐⭐⭐ Partial |
| **Brave** | ❌ Not Supported | ✅ Supported | ⭐⭐⭐ Partial |
| **Firefox** | ❌ Not Supported | ✅ Supported | ⭐⭐⭐ Partial |

---

## ✅ Fully Supported Browsers

### Google Chrome (Recommended)
- **Voice Input:** ✅ Yes
- **Voice Output:** ✅ Yes
- **Version:** Chrome 25+
- **Notes:** Best overall experience with Web Speech API

### Microsoft Edge (Recommended)
- **Voice Input:** ✅ Yes
- **Voice Output:** ✅ Yes
- **Version:** Edge 79+ (Chromium-based)
- **Notes:** Same engine as Chrome, excellent support

---

## ⚠️ Partially Supported Browsers

### Safari
- **Voice Input:** ❌ No
- **Voice Output:** ✅ Yes
- **Workaround:** Type your questions instead of using voice input
- **Notes:** Apple has not implemented the Web Speech Recognition API

### Brave
- **Voice Input:** ❌ No (disabled for privacy)
- **Voice Output:** ✅ Yes
- **Workaround:** Type your questions instead of using voice input
- **Notes:** Brave disables speech recognition for privacy reasons

### Firefox
- **Voice Input:** ❌ No
- **Voice Output:** ✅ Yes
- **Workaround:** Type your questions instead of using voice input
- **Notes:** Mozilla has not implemented the Web Speech Recognition API

---

## 🔧 What Works in All Browsers

Even in browsers without voice input support, you can still:

✅ **Type questions** - Full text input works everywhere
✅ **Hear AI responses** - Text-to-speech works in all modern browsers
✅ **See the 3D avatar** - WebGL/Three.js supported everywhere
✅ **Get AI answers** - Backend API works regardless of browser
✅ **Use all features** - Only voice input is affected

---

## 🎯 Recommended Setup

**For Best Experience:**
1. Use **Google Chrome** or **Microsoft Edge**
2. Allow microphone permissions when prompted
3. Ensure stable internet connection (speech recognition uses cloud services)

**If Using Safari/Brave/Firefox:**
1. Type your questions in the text input
2. AI will still speak responses to you
3. All other features work normally

---

## 🔍 Technical Details

### Why doesn't Safari support voice input?

Apple has chosen not to implement the Web Speech Recognition API in Safari. This is a deliberate decision by Apple, not a limitation of our app.

**Alternatives for Safari users:**
- Use Chrome or Edge for voice features
- Type questions manually (works perfectly)
- Use Safari for everything else (avatar, AI, text-to-speech all work)

### Why doesn't Brave support voice input?

Brave disables the Web Speech Recognition API for privacy reasons, as it typically sends audio to cloud services (Google's speech recognition).

**Alternatives for Brave users:**
- Use Chrome or Edge for voice features
- Type questions manually
- Consider using a local speech recognition solution (future feature)

### Why doesn't Firefox support voice input?

Mozilla has not implemented the Web Speech Recognition API. It's been in development but not yet released.

**Alternatives for Firefox users:**
- Use Chrome or Edge for voice features
- Type questions manually
- Wait for Mozilla to implement the API (no ETA)

---

## 🚀 Future Plans

We're exploring options to support more browsers:

- **Local Speech Recognition:** Using browser-based models (no cloud)
- **WebAssembly Solutions:** Offline speech recognition
- **Mobile Apps:** Native speech recognition on iOS/Android

---

## 💡 Quick Troubleshooting

### "Voice input not working in Chrome/Edge"

1. **Check microphone permissions:**
   - Click the 🔒 lock icon in address bar
   - Ensure microphone is "Allowed"
   - Refresh the page

2. **Check internet connection:**
   - Speech recognition requires internet
   - Test your connection

3. **Try incognito/private mode:**
   - Extensions might block microphone
   - Test in clean browser session

### "No sound when AI speaks"

1. **Check volume:**
   - Ensure system volume is up
   - Check browser isn't muted

2. **Check browser settings:**
   - Some browsers block autoplay audio
   - Click anywhere on page first

3. **Try different voice:**
   - Browser might not have voices installed
   - Check system text-to-speech settings

---

## 📱 Mobile Browser Support

| Mobile Browser | Voice Input | Voice Output |
|----------------|-------------|--------------|
| Chrome (Android) | ✅ Yes | ✅ Yes |
| Safari (iOS) | ❌ No | ✅ Yes |
| Edge (Android) | ✅ Yes | ✅ Yes |
| Firefox (Mobile) | ❌ No | ✅ Yes |

---

## 🆘 Need Help?

If you're having browser compatibility issues:

1. Check this guide for your browser
2. Try the recommended browsers (Chrome/Edge)
3. Ensure microphone permissions are granted
4. Test with typing instead of voice input

---

## 📚 Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Compatibility Table](https://caniuse.com/speech-recognition)
- [Chrome Speech Recognition](https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api/)

---

**Last Updated:** December 2024
