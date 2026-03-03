// ========== AUTHENTICATION MODULE ==========
// Handles Google Sign-In, logout, and persistent sessions

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCW6Utclu2ME1z1AwUj2xwTm_-it-aWFrI",
    authDomain: "pulse-c5322.firebaseapp.com",
    projectId: "pulse-c5322",
    storageBucket: "pulse-c5322.firebasestorage.app",
    messagingSenderId: "700936968948",
    appId: "1:700936968948:web:abe29f631b258516551ca1",
    measurementId: "G-LPHD13EJQP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Set persistence to LOCAL so user stays logged in
setPersistence(auth, browserLocalPersistence).catch(err => {
    console.error("Failed to set persistence:", err);
});

// Global auth state
let currentUser = null;

// Initialize Google Auth
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ========== AUTH FUNCTIONS ==========

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Save user data to Firestore
        await setDoc(doc(firestore, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "User",
            photoURL: user.photoURL || "",
            createdAt: new Date(),
            lastSeen: new Date(),
            status: "online"
        }, { merge: true });
        
        currentUser = user;
        return user;
    } catch (error) {
        console.error("Sign-in error:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        // Update user status to offline
        if (currentUser) {
            await setDoc(doc(firestore, "users", currentUser.uid), {
                status: "offline",
                lastSeen: new Date()
            }, { merge: true });
        }
        
        await signOut(auth);
        currentUser = null;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

export const getCurrentUser = () => {
    return currentUser;
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            
            // Update user status to online
            try {
                await setDoc(doc(firestore, "users", user.uid), {
                    status: "online",
                    lastSeen: new Date()
                }, { merge: true });
            } catch (err) {
                console.error("Failed to update user status:", err);
            }
        } else {
            currentUser = null;
        }
        
        callback(user);
    });
};

// ========== UI ELEMENTS ==========
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userStatus = document.getElementById('userStatus');

// ========== EVENT LISTENERS ==========

googleSignInBtn.addEventListener('click', async () => {
    try {
        googleSignInBtn.disabled = true;
        googleSignInBtn.textContent = 'Signing in...';
        
        await signInWithGoogle();
        
        // Transition to app screen
        authScreen.classList.remove('active');
        appScreen.classList.add('active');
    } catch (error) {
        console.error("Sign-in failed:", error);
        googleSignInBtn.disabled = false;
        googleSignInBtn.textContent = 'Sign in with Google';
        alert('Sign-in failed: ' + (error.message || 'Unknown error'));
    }
});

signOutBtn.addEventListener('click', async () => {
    try {
        signOutBtn.disabled = true;
        await logoutUser();
        
        // Transition to auth screen
        appScreen.classList.remove('active');
        authScreen.classList.add('active');
        
        signOutBtn.disabled = false;
    } catch (error) {
        console.error("Logout failed:", error);
        signOutBtn.disabled = false;
        alert('Logout failed: ' + (error.message || 'Unknown error'));
    }
});

// ========== AUTO-LOGIN ON PAGE LOAD ==========
onAuthChange((user) => {
    if (user) {
        // User is logged in - show app
        authScreen.classList.remove('active');
        appScreen.classList.add('active');
        userStatus.textContent = `Welcome, ${user.displayName || user.email}`;
    } else {
        // User is logged out - show auth
        appScreen.classList.remove('active');
        authScreen.classList.add('active');
        userStatus.textContent = 'Not logged in';
    }
});

export { auth, firestore };
