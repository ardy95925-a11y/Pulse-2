// ========== MAIN APP MODULE ==========
// Initializes the application and orchestrates all modules

console.log("App.js loaded");

// Wait for Firebase to be initialized
setTimeout(() => {
    const user = firebase.auth().currentUser;
    if (user && window.chatModule) {
        window.chatModule.loadFriends(user.uid);
    }
}, 1000);
