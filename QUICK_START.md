# Pulse App - Quick Start Guide

## 📦 What You Got

4 main JavaScript modules:
1. **auth.js** - Handles Google Sign-In & persistent login sessions
2. **chat.js** - Real-time messaging & voice chat logic  
3. **app.js** - Main app initialization and orchestration
4. **index.html** - Beautiful, responsive UI for iPad/web

Plus:
- **styles.css** - Premium minimalist design (17KB)
- **firebase-config.js** - Firebase SDK initialization

## 🚀 Getting Started in 3 Steps

### Step 1: Create GitHub Repository
```bash
# Create new repo called "pulse" on GitHub
git clone https://github.com/YOUR_USERNAME/pulse.git
cd pulse

# Copy all files from outputs to your repo
cp -r /path/to/outputs/* .

# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Select **main** branch
3. Click **Save**
4. Your app will be live at: `https://YOUR_USERNAME.github.io/pulse/`

### Step 3: Test on iPad
Open `https://YOUR_USERNAME.github.io/pulse/` on your iPad in Safari

## 🎯 How It Works

### Authentication Flow
```
1. User visits site
2. Firebase checks if session exists (persistent login)
3. If no session → Show Google Sign-In button
4. If session exists → Auto-login, show app
5. User signs in → Data saved to Firestore
```

### Message Flow
```
User A types message
→ Sent to Firestore database
→ Firebase triggers real-time listener
→ User B's app updates instantly
→ Both users see full conversation
```

### Voice Call Flow
```
User A clicks phone icon
→ Voice room created in Firestore
→ User B's participant card appears
→ Both users connected in voice room
→ Leave button exits call
```

## 📝 Firebase Firestore Structure

```
users/
  {userId}/
    uid
    email
    displayName
    photoURL
    status (online/offline)
    lastSeen

messages/
  {messageId}/
    conversationId (user1_user2 sorted)
    senderId
    senderName
    text
    timestamp

relationships/
  {userId}_{friendId}/
    userId
    friendId
    status (accepted/pending/blocked)
    createdAt

voiceRooms/
  {roomId}/
    roomId
    initiator
    participants: [userId1, userId2]
    createdAt
    active (true/false)
```

## 🎨 Features You Get

### ✅ Persistent Login
- Sign in once, stay signed in
- Browser auto-logs you back in on reload
- No repeated sign-ins needed

### ✅ Real-Time Messaging
- Type message → Appears instantly for friend
- Full conversation history
- Timestamps on every message
- Automatic scroll to latest

### ✅ Friend Management
- Add friends by email
- Online/offline indicators
- Last seen timestamps
- Status tracking

### ✅ Voice Chat Ready
- Create voice rooms
- Participant tracking
- Mute toggle button
- WebRTC architecture ready
  (You'll add WebRTC library - Agora or Twilio recommended)

### ✅ Beautiful UI
- Dark theme optimized for screens
- Smooth animations
- Responsive grid layout
- iPad-first design
- Touch-friendly buttons

## 🔧 Customization

### Change Colors
Edit `styles.css`:
```css
:root {
    --primary: #6366f1;      /* Change blue to your color */
    --danger: #ef4444;       /* Red for delete buttons */
    --success: #10b981;      /* Green for online status */
}
```

### Add Logo
Replace "Pulse" text in `index.html`:
```html
<span class="logo-text">YourAppName</span>
```

### Change App Title
In `index.html`:
```html
<title>Pulse - Voice Chat</title>
```

## 🐛 Testing Checklist

- [ ] Sign in with Google works
- [ ] After reload, you're still signed in (no login needed)
- [ ] Can add a friend by email
- [ ] Friend appears in friends list
- [ ] Can send message to friend
- [ ] Message appears in conversation
- [ ] Can start voice call (room created, participant appears)
- [ ] Can leave voice call
- [ ] Friend shows online/offline status
- [ ] UI looks good on iPad

## 📱 iPad-Specific Tips

### Viewport Meta Tag (Already Included)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Full Screen Mode
Users can add to home screen for app-like experience

### Safe Area Support
CSS respects notch/home indicator:
```css
padding: max(1rem, env(safe-area-inset-top));
```

## 🔐 Security Notes

### Firebase Rules (You Should Set These)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /messages/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid in resource.data.visibleTo;
    }
    match /relationships/{document=**} {
      allow read, write: if request.auth.uid in resource.data.userIds;
    }
  }
}
```

## 🚨 Troubleshooting

### "Not signed in after reload"
```javascript
// Check browser console (F12 → Console)
// Look for Firebase errors
// Check localStorage is enabled
// Verify auth.js setPersistence is set
```

### "Friends list empty"
```javascript
// Friend must have been added first
// Both users must exist in Firestore
// Check relationships collection
// Verify emails match exactly
```

### "Messages not syncing"
```javascript
// Check Firestore rules allow reads/writes
// Verify conversationId format: "uid1_uid2" (sorted)
// Check messages collection exists
// Look for timestamp field in documents
```

## 📞 Adding WebRTC for Voice

The app is ready for WebRTC. Recommended libraries:

### Option 1: Agora (Easiest)
```html
<script src="https://download.agora.io/sdk/release/AgoraRTC_N-latest.js"></script>
```

### Option 2: Twilio
```bash
npm install twilio-video
```

### Option 3: Native WebRTC
Use browser's built-in WebRTC APIs (more complex)

## 📊 File Sizes

```
index.html          9.3 KB
styles.css         17.0 KB
auth.js             5.2 KB
chat.js            14.0 KB
app.js              1.4 KB
firebase-config.js  1.2 KB
────────────────────────
Total             ~48 KB (before Firebase SDK)
Firebase SDK      ~200 KB (from CDN)
────────────────────────
Total App         ~250 KB
```

## ✨ What Makes This App Special

1. **Zero Build Process** - No webpack, gulp, or npm needed
2. **Persistent Sessions** - Firebase handles auto-login
3. **Real-Time Everything** - Firestore gives you live updates
4. **Mobile-First** - Designed for iPad and tablets
5. **Minimal Dependencies** - Only Firebase (from CDN)
6. **Beautiful Design** - Premium minimalist aesthetic
7. **Scalable Structure** - Easy to add features

## 🎓 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Real-Time Guide](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 🎉 Next Steps

1. **Deploy to GitHub Pages** (5 minutes)
2. **Test on iPad** (2 minutes)
3. **Add a friend and chat** (1 minute)
4. **Add WebRTC library** for voice calls (1-2 hours)
5. **Deploy production** with custom domain (optional)

## 📧 Support

Need help? Check:
1. Browser console for JavaScript errors (F12)
2. Firebase console for database issues
3. GitHub Pages settings
4. This README for common issues

---

**Your voice chat app is ready to deploy! 🚀**
