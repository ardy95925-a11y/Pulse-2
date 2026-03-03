// ========== MAIN APP MODULE ==========
// Initializes the application and orchestrates all modules

import { 
    getCurrentUser, 
    onAuthChange,
    auth as authModule,
    firestore as firestoreModule
} from './auth.js';
import { 
    loadFriends,
    firestore,
    database,
    auth
} from './chat.js';

// ========== APP INITIALIZATION ==========

let isAppInitialized = false;

const initializeApp = (user) => {
    if (!user) {
        // User not logged in
        isAppInitialized = false;
        return;
    }
    
    if (isAppInitialized) return; // Prevent re-initialization
    
    console.log("Initializing app for user:", user.email);
    
    // Load user's friends list
    loadFriends(user.uid);
    
    isAppInitialized = true;
};

// ========== STARTUP ==========

// Listen to auth changes and initialize app
onAuthChange((user) => {
    if (user) {
        initializeApp(user);
    }
});

// ========== APP STATE MANAGEMENT ==========

export const getAppState = () => ({
    isInitialized: isAppInitialized,
    currentUser: getCurrentUser()
});

// ========== GLOBAL ERROR HANDLING ==========

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log("App.js loaded successfully");
