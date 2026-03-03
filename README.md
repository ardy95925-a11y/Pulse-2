# Pulse - Video Calling App for iPad

A modern, fast video calling application optimized for iPad with WebRTC support, file sharing, and friend contacts. Built with Agora for reliable video/audio streaming.

## 🚀 Features

- **Video & Audio Calls** - Crystal clear calls using WebRTC (Agora SDK)
- **File Sharing** - Drag & drop files to share during calls
- **Screen Sharing** - Share your screen with one click
- **Google Login** - Seamless authentication with Google
- **Contact Management** - Save and manage your friends
- **Call History** - Track recent calls
- **iPad Optimized** - Beautiful, touch-friendly interface
- **Lightweight** - Fast loading and smooth performance

## 📁 Files

- **index.html** - Main application structure
- **styles.css** - Modern, responsive styling with animations
- **firebase-config.js** - Firebase authentication setup
- **auth.js** - User authentication and UI management
- **call.js** - WebRTC call management with Agora SDK

## 🔧 Setup Instructions

### 1. Get Your Agora Account

1. Go to [Agora.io](https://www.agora.io/)
2. Sign up for a free account
3. Create a new project
4. Get your **App ID** from the dashboard
5. Replace `YOUR_AGORA_APP_ID` in `call.js` with your actual App ID

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your domain to authorized redirect URIs
6. Copy your Client ID and replace in `firebase-config.js` (if needed)

### 3. Firebase Setup

Firebase is already configured in the app. The project ID is `pulse-f5e93`. You can:
- Use as-is (shared demo)
- Create your own Firebase project and update credentials in `firebase-config.js`

### 4. Deploy to GitHub Pages

1. Create a new GitHub repository named `pulse`
2. Clone it to your computer
3. Copy all files (index.html, styles.css, *.js) to the repository
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial Pulse commit"
   git push origin main
   ```
5. Go to repository Settings → Pages
6. Set Source to `main` branch
7. Your app will be live at: `https://yourusername.github.io/pulse`

## 🎯 Usage

### For Users

1. **Open the app** - Visit your GitHub Pages URL on iPad
2. **Sign in** - Use Google login or continue as guest
3. **Add friends** - Click "+ Add Friend" and enter their email
4. **Make a call** - Click on a friend's name to start a video call
5. **Share files** - Click the share icon during a call to send files
6. **Share screen** - Click the screen share button to share your screen

### For Developers

#### Firebase Integration

```javascript
// User data is stored in localStorage by default
// For production, enable Firestore to sync across devices:

// Save contact to Firestore
const docRef = await window.firebase.addDoc(
  window.firebase.collection(window.firebase.db, 'contacts'),
  { userId: currentUser.uid, name: contactName }
);

// Load contacts from Firestore
const q = window.firebase.query(
  window.firebase.collection(window.firebase.db, 'contacts'),
  window.firebase.where('userId', '==', currentUser.uid)
);
const snapshot = await window.firebase.getDocs(q);
```

#### Agora Configuration

For production with token authentication:

```javascript
// 1. Set up a backend server to generate tokens
// 2. Fetch token before joining channel:
const token = await fetch('/api/get-agora-token', {
  method: 'POST',
  body: JSON.stringify({ channelName, userId })
}).then(r => r.json());

// 3. Use token in join:
await rtc.client.join(AGORA_APP_ID, channelName, token, userId);
```

#### Custom Server

For file transfer and cloud storage:

```javascript
// Upload files to Firebase Storage
const file = fileList[0];
const storageRef = window.firebase.ref(window.firebase.storage, 
  `calls/${callState.currentChannelName}/${file.name}`
);
await window.firebase.uploadBytes(storageRef, file);
const url = await window.firebase.getDownloadURL(storageRef);

// Send file URL to other user via Agora messaging
```

## 📱 iPad Optimization

- Touch-friendly buttons (56px minimum)
- Full-screen video with safe area support
- Responsive sidebar that collapses on smaller screens
- Smooth animations optimized for iPad performance

## 🔒 Security

- **Google OAuth** - Secure authentication
- **Firebase** - Enterprise-grade security
- **HTTPS only** - GitHub Pages uses HTTPS
- **No credentials stored** - Only user IDs and names locally

### Production Checklist

- [ ] Replace Agora App ID with production key
- [ ] Set up token authentication for Agora
- [ ] Enable Firestore for multi-device sync
- [ ] Add backend server for file transfer
- [ ] Configure CORS for cross-domain requests
- [ ] Set up custom domain (optional)
- [ ] Enable analytics in Firebase

## 🐛 Troubleshooting

**"Permission denied" for camera/microphone**
- Check browser permissions settings
- Refresh the page
- Make sure app is using HTTPS

**Agora connection fails**
- Verify App ID is correct
- Check internet connection
- Make sure both users are in same channel

**Google login not working**
- Clear browser cache
- Check if Google OAuth credentials are correct
- Verify domain is in authorized URIs

**Files not uploading**
- Check Firebase Storage permissions
- Verify storage quota not exceeded
- Check file size limits

## 📈 Performance Tips

- Use Safari on iPad for best performance
- Keep video resolution at 720p for smooth calling
- Disable screen sharing if audio/video lag occurs
- Close other apps to free up memory

## 🚀 Advanced Features (To Implement)

1. **End-to-end encryption** - Add encryption library
2. **Message chat** - Real-time chat during calls
3. **Recordings** - Record calls to cloud storage
4. **Conference calls** - Support 3+ participants
5. **Custom backgrounds** - Virtual backgrounds
6. **Call scheduling** - Calendar integration
7. **Voice messages** - Record audio messages
8. **Group chats** - Create chat groups

## 📄 License

Built as a simple P2P calling solution. Feel free to modify and deploy!

## 🤝 Support

For issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all credentials are correct
4. Test on different networks

---

**Enjoy Pulse! 🎉**
