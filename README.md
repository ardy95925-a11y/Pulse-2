# Pulse - Voice Chat & Messaging App

A modern, minimalist voice chat and messaging application built with Firebase. Perfect for iPad and web browsers.

## Features

✨ **Real-Time Messaging** - Instant message delivery with Firestore  
🎙️ **Voice Chat Rooms** - Join voice calls with friends  
👥 **Friend Management** - Add and manage your friend list  
🔐 **Google Sign-In** - Secure authentication with persistent sessions  
📱 **iPad Optimized** - Beautiful responsive design  
🎨 **Minimalist UI** - Clean interface with smooth animations  

## Quick Start

1. **Download this folder**
2. **Create a GitHub repository** named `pulse`
3. **Push all files to GitHub**
4. **Enable GitHub Pages** in repository Settings
5. **Access at**: `https://yourusername.github.io/pulse/`

## What's Inside

- **index.html** - Complete app with everything included (800+ lines)
- **README.md** - This file
- **.gitignore** - Git ignore rules

That's it! Just one HTML file. No build process needed.

## How It Works

### Sign In
- Click "Sign in with Google"
- Firebase handles the authentication
- Your session persists after reload (no re-login needed)

### Add Friends
- Click the **+** button in the sidebar
- Enter friend's email
- Both of you can now chat

### Send Messages
- Select a friend from the list
- Type a message and press Enter
- Messages sync in real-time

### Voice Call
- Click the phone icon next to a friend's name
- A voice room opens
- Use the mute button to toggle audio
- Click leave to exit

## Firebase Setup

The app uses your existing Firebase project:
- **Project**: pulse-c5322
- **Authentication**: Google Sign-In
- **Database**: Firestore (real-time messages)
- **Realtime DB**: Voice room data

### First Time Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **pulse-c5322**
3. Go to **Authentication → Sign-in method**
4. Make sure **Google** is enabled
5. Go to **Firestore Database** → **Rules**
6. Make sure rules allow your domain

### Example Firestore Rules (for testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **Important**: Use proper security rules in production!

## Deployment

### Option 1: GitHub Pages (Recommended)

```bash
git clone https://github.com/yourusername/pulse.git
cd pulse
git add .
git commit -m "Initial commit"
git push origin main
```

Then go to **Settings → Pages** and enable GitHub Pages.

Your app will be live at: `https://yourusername.github.io/pulse/`

### Option 2: Local Testing

```bash
# Python 3
python -m http.server 8000

# Or Node.js
npx http-server
```

Then open: `http://localhost:8000`

## Customization

### Change App Name
Search for "Pulse" in index.html and replace with your name

### Change Colors
Search for `--primary: #6366f1` and change the hex code

### Change Logo
Replace the `<span class="logo-text">Pulse</span>` text

## Troubleshooting

### "Not signed in after reload"
- Check browser allows localStorage
- Make sure you're using HTTPS (not file://)
- GitHub Pages is HTTPS by default

### "Messages not appearing"
- Check Firestore Rules in Firebase Console
- Make sure the rules allow reads/writes
- Check browser console (F12) for errors

### "Friends list empty"
- Make sure you added a friend first
- Both users must exist in Firestore
- Check the email is exactly correct

### "Login button doesn't work"
- Press F12 to open console
- Check for red error messages
- If "operation-not-supported-in-this-environment", use HTTPS
- If "popup blocked", check browser popup settings

## Browser Support

- ✅ Safari (iOS)
- ✅ Chrome (Desktop)
- ✅ Firefox (Desktop)
- ✅ Edge (Desktop)

## File Structure

```
pulse/
├── index.html          # Complete app (everything included)
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

That's it! Single file app.

## Performance

- **Single HTML file**: 800+ lines
- **No build process** needed
- **Firebase SDK**: Loaded from CDN
- **Mobile optimized**: Touch-friendly buttons
- **Responsive**: Works on iPad, desktop, mobile

## Security Notes

- Firebase credentials are public (client-side config)
- Implement proper Firestore Security Rules
- Don't store sensitive data in client code
- Use environment variables for keys (if deploying elsewhere)

## Next Steps

### Add WebRTC for Real Voice
The app is ready for WebRTC integration. Recommended libraries:
- [Agora](https://www.agora.io/)
- [Twilio](https://www.twilio.com/)
- [Native WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

### Features to Add
- [ ] Video chat
- [ ] Message encryption
- [ ] File sharing
- [ ] Group chats
- [ ] Notifications
- [ ] Dark/light theme toggle

## Support

If something doesn't work:

1. **Open browser console** (F12)
2. **Look for red error messages**
3. **Try the troubleshooting section above**
4. **Check Firebase console** for permission errors

## License

MIT - Use freely for any purpose

## Credits

Built with Firebase and vanilla JavaScript

---

**Ready to chat? Deploy it now! 🚀**
