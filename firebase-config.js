// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB98E7T3E3IY4fa6_KLOcoT__CiOcUn3LE",
    authDomain: "pulse-f5e93.firebaseapp.com",
    projectId: "pulse-f5e93",
    storageBucket: "pulse-f5e93.firebasestorage.app",
    messagingSenderId: "26109296510",
    appId: "1:26109296510:web:51ee51db5970e544b13d2f",
    measurementId: "G-JMDX0D9D69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Export for use in other scripts
window.firebase = {
    auth,
    db,
    storage,
    googleProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    ref,
    uploadBytes,
    getDownloadURL
};

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: '26109296510-123456789.apps.googleusercontent.com', // Replace with your actual client ID
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById('googleLoginDiv'),
        {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
        }
    );
}

async function handleGoogleLogin(response) {
    try {
        const credential = response.credential;
        // Decode JWT to get user info
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify({
            uid: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture
        }));

        // Switch to app screen
        switchScreen('appScreen');
        updateUserUI(userData);
        
    } catch (error) {
        console.error('Google login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGoogleSignIn();

    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        switchScreen('appScreen');
        updateUserUI(userData);
    }
});

export { auth, db, storage, googleProvider };
