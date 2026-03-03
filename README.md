# Pulse - Voice Chat & Messaging App

A modern, minimalist voice chat and messaging application built for iPad and web browsers. Connect with friends in real-time using Firebase's real-time database and Firestore.

## Features

✨ **Real-Time Messaging** - Instant message delivery with Firestore  
🎙️ **Voice Chat Rooms** - Join voice calls with friends (WebRTC ready)  
👥 **Friend Management** - Add and manage your friend list  
🔐 **Google Sign-In** - Secure authentication with persistent sessions  
📱 **iPad Optimized** - Beautiful responsive design for tablets  
🎨 **Minimalist UI** - Clean, modern interface with smooth animations  

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore, Realtime Database)
- **Hosting**: GitHub Pages (Static Files)
- **Target**: iPad, Web Browsers

## Project Structure

```
pulse/
├── index.html          # Main HTML entry point
├── styles.css          # Global styles & responsive design
├── firebase-config.js  # Firebase configuration
├── auth.js            # Authentication & session management
├── chat.js            # Messaging & voice chat logic
├── app.js             # Main app initialization
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pulse.git
cd pulse
```

### 2. Deploy to GitHub Pages

1. Push the code to GitHub
2. Go to repository Settings → Pages
3. Select branch `main` (or `master`) and save
4. Your app will be live at `https://yourusername.github.io/pulse/`

### 3. Firebase Configuration

The app uses these Firebase services:
- **Authentication**: Google Sign-In
- **Firestore**: Store users, messages, relationships
- **Realtime Database**: Voice room data & live status

Your Firebase config is already embedded in:
- `auth.js` (Authentication)
- `chat.js` (Firestore & Realtime DB)

## Usage

### For Users

1. **Sign In**: Click "Sign in with Google" on the auth screen
2. **Add Friends**: Click the `+` button and enter their email
3. **Send Messages**: Select a friend and start chatting
4. **Voice Call**: Click the phone icon to start a voice call

### Session Persistence

- Your login session **persists** after closing the browser
- You won't need to sign in again after the first time
- Sessions are stored securely with Firebase's local persistence

## Features Explained

### 🔐 Authentication
- Google Sign-In with popup flow
- Automatic session restoration on page load
- User data synced to Firestore
- Last seen tracking & online status

### 💬 Real-Time Messaging
- Messages synced across all devices in real-time
- Conversation history maintained in Firestore
- Messages sorted by timestamp
- Automatic scroll to latest messages

### 🎙️ Voice Chat
- Room-based voice sessions
- Participant tracking
- Mute toggle
- Leave call functionality
- WebRTC-ready architecture (implement your preferred WebRTC library)

### 👥 Friend Management
- Add friends by email
- Mutual friend relationships
- Online/offline status indicators
- Last seen timestamps

## Responsive Design

The app is optimized for:
- **iPad** (Primary target)
- **Tablets** (1024px and above)
- **Desktop** (Fallback support)
- **Mobile** (Limited support)

## Customization

### Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;
    --danger: #ef4444;
    --success: #10b981;
    /* ... more colors ... */
}
```

### Font
The app uses system fonts by default. Change in `styles.css`:

```css
html, body {
    font-family: 'Your Font Here', sans-serif;
}
```

### Firebase Project
To use your own Firebase project:

1. Create a new project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Sign-In in Authentication
3. Create a Firestore database
4. Create a Realtime Database
5. Update `firebaseConfig` in `auth.js` and `chat.js`

## Deployment Checklist

- [x] Code in GitHub repository
- [x] Firebase configured (auth.js, chat.js)
- [x] GitHub Pages enabled in Settings
- [x] Domain configured (optional)
- [x] HTTPS enabled (automatic with GitHub Pages)
- [x] Test on iPad/tablet

## Troubleshooting

### "Not logged in" after refresh
- Check browser allows localStorage
- Verify Firebase persistence config in `auth.js`
- Check browser console for errors

### Messages not appearing
- Verify Firestore database rules allow reads/writes
- Check `conversationId` format is consistent
- Look for errors in browser console

### Friends list empty
- Ensure friends have been added via the `+` button
- Check relationship docs exist in Firestore
- Verify both users exist in `users` collection

### Voice call not working
- WebRTC implementation needed (not included by default)
- Recommend Agora, Twilio, or native WebRTC APIs
- Check browser supports WebRTC

## Browser Support

- ✅ Safari (iOS)
- ✅ Chrome (Desktop)
- ✅ Firefox (Desktop)
- ✅ Edge (Desktop)
- ⚠️ Opera Mini (Limited)

## Performance Optimizations

- Lazy loading of friends on demand
- Limited message history (last 50 messages)
- CSS-only animations (no JavaScript animation libraries)
- Minimal bundle size (no frameworks)
- Service Worker ready (implement for offline support)

## Security Notes

- Firebase credentials are public (client-side config)
- Implement Firebase Security Rules in your console
- Example rules provided in comments
- Never store sensitive data in client code
- Use environment variables if needed (with a build step)

## Future Enhancements

- [ ] WebRTC implementation for P2P voice calls
- [ ] Video chat support
- [ ] Message encryption
- [ ] File sharing
- [ ] Group chats
- [ ] Voice/video recordings
- [ ] Notifications
- [ ] Dark/light theme toggle

## License

MIT License - Feel free to use this project commercially

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Firebase console for errors
3. Check browser console (F12 → Console)
4. Create a GitHub issue

## Credits

Built with Firebase & modern web standards.

---

**Made for iPad. Built for the web.**
