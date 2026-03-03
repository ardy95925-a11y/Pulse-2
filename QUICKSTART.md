# Pulse - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Get Agora App ID (2 min)

1. Visit [agora.io](https://www.agora.io/) and sign up (free)
2. Create a new project
3. Copy your **App ID**
4. Open `call.js` and find this line:
   ```javascript
   const AGORA_APP_ID = 'YOUR_AGORA_APP_ID';
   ```
5. Replace `YOUR_AGORA_APP_ID` with your actual ID

### Step 2: Set Up GitHub Pages (2 min)

1. Go to GitHub and create a new repo called `pulse`
2. Clone it: `git clone https://github.com/YOUR_USERNAME/pulse.git`
3. Copy these files into the folder:
   - index.html
   - styles.css
   - firebase-config.js
   - auth.js
   - call.js
   - README.md

4. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Pulse"
   git push
   ```

5. Go to repo Settings → Pages → set Source to "main"

### Step 3: Test on iPad (1 min)

1. Open Safari on your iPad
2. Go to: `https://YOUR_USERNAME.github.io/pulse`
3. Sign in with Google or as guest
4. Add a friend and start calling!

---

## 🎮 How to Use

### Making a Call

1. **Sign In** - Tap Google Login or Continue as Guest
2. **Add Friend** - Tap "+ Add Friend" → enter email
3. **Call** - Tap friend's name to start video call
4. **Controls** - Bottom buttons: Mic, Camera, Share, Files, End Call
5. **End** - Red hang-up button stops the call

### Sharing Files

1. **During a call** - Tap the upload icon
2. **Add files** - Drag & drop or tap to select
3. **Share** - Files are ready to send
4. (In production, files upload to Firebase Storage)

### Share Your Screen

1. Tap the screen icon during a call
2. Select what to share
3. Tap again to stop sharing

---

## 🔧 Configuration

### Firebase (Optional)

The app uses Firebase for authentication. Default config is set for `pulse-f5e93` project.

**To use your own Firebase:**
1. Create project at [firebase.google.com](https://firebase.google.com/)
2. Update credentials in `firebase-config.js`

### Google OAuth (Optional)

For production, update your Google Client ID in `firebase-config.js`:
```javascript
client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
```

### Twilio Alternative

If you prefer Twilio instead of Agora, replace the Agora code in `call.js`:

```javascript
// Add Twilio SDK instead
<script src="https://media.twiliocdn.com/sdk/js/video/releases/2.x.x/twilio-video.min.js"></script>

// Then use Twilio's token-based connection
const room = await Twilio.Video.connect(token, {
  name: 'pulse-' + callState.currentChannelName,
  audio: { name: rtc.localAudioTrack },
  video: { name: rtc.localVideoTrack }
});
```

---

## 📊 Project Structure

```
pulse/
├── index.html          # Main HTML (login + app UI)
├── styles.css          # All styling (iPad optimized)
├── firebase-config.js  # Firebase + Google Auth setup
├── auth.js             # Login, contacts, UI management
├── call.js             # WebRTC + Agora video calls
└── README.md           # Full documentation
```

---

## ✅ Checklist

- [ ] Created Agora account and got App ID
- [ ] Updated `call.js` with Agora App ID
- [ ] Created GitHub repository
- [ ] Pushed all files to GitHub
- [ ] Enabled GitHub Pages
- [ ] Tested on iPad in Safari
- [ ] Successfully made a video call

---

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| "Camera access denied" | Check Safari Settings → Privacy → Camera |
| "Agora connection error" | Verify App ID is correct in `call.js` |
| "Google login fails" | Clear Safari cache or try incognito mode |
| "No sound" | Check device volume isn't muted |
| "Laggy video" | Reduce resolution, close background apps |

---

## 🚀 Next Steps

1. **Test with a friend** - Get real feedback
2. **Custom domain** (optional) - Add your own domain to GitHub Pages
3. **Backend server** (production) - Handle file uploads and Agora tokens
4. **Push notifications** (optional) - Notify friends of incoming calls
5. **Offline support** - Add PWA features for offline mode

---

## 💡 Pro Tips

- **iPad only?** The app works on all devices but UI is optimized for iPad
- **Dark mode?** Add CSS media query for `prefers-color-scheme: dark`
- **Groups calls?** Use Agora's RTM for multi-user calls
- **File storage?** Use Firebase Storage for large files
- **Better UI?** Check out `frontend-design` skill for more polish

---

## 📞 Support Resources

- [Agora Docs](https://docs.agora.io/)
- [Firebase Docs](https://firebase.google.com/docs)
- [GitHub Pages Help](https://docs.github.com/en/pages)
- [WebRTC Guide](https://webrtc.org/)

---

**You're all set! Enjoy Pulse! 🎉**
