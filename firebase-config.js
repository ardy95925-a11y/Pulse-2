// ========== FIREBASE CONFIGURATION ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCW6Utclu2ME1z1AwUj2xwTm_-it-aWFrI",
    authDomain: "pulse-c5322.firebaseapp.com",
    projectId: "pulse-c5322",
    storageBucket: "pulse-c5322.firebasestorage.app",
    messagingSenderId: "700936968948",
    appId: "1:700936968948:web:abe29f631b258516551ca1",
    measurementId: "G-LPHD13EJQP",
    databaseURL: "https://pulse-c5322-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

// Persist auth state
auth.setPersistence = () => {
    localStorage.setItem('firebase-auth-persistence', 'true');
};

export { app, auth, firestore, database };
