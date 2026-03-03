// ========== AUTHENTICATION MODULE ==========
// Handles Google Sign-In, logout, and persistent sessions

// Wait for Firebase to load
function initAuth() {
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

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const firestore = firebase.firestore();

    // Set persistence to LOCAL so user stays logged in
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log("Auth persistence set to LOCAL");
            // Check if user is already logged in
            checkAuthState();
        })
        .catch(err => {
            console.error("Failed to set persistence:", err);
        });

    // ========== AUTH STATE ==========
    let currentUser = null;

    // ========== AUTH FUNCTIONS ==========

    const signInWithGoogle = () => {
        return new Promise((resolve, reject) => {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            auth.signInWithPopup(provider)
                .then(result => {
                    const user = result.user;
                    currentUser = user;
                    
                    // Save user data to Firestore
                    firestore.collection("users").doc(user.uid).set({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || "User",
                        photoURL: user.photoURL || "",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                        status: "online"
                    }, { merge: true })
                    .then(() => {
                        console.log("User data saved to Firestore");
                        resolve(user);
                    })
                    .catch(err => {
                        console.error("Failed to save user data:", err);
                        resolve(user); // Still resolve even if Firestore save fails
                    });
                })
                .catch(error => {
                    console.error("Sign-in error:", error);
                    reject(error);
                });
        });
    };

    const logoutUser = () => {
        return new Promise((resolve, reject) => {
            // Update user status to offline
            if (currentUser) {
                firestore.collection("users").doc(currentUser.uid).set({
                    status: "offline",
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                .then(() => {
                    auth.signOut()
                        .then(() => {
                            currentUser = null;
                            console.log("User logged out");
                            resolve();
                        })
                        .catch(reject);
                })
                .catch(reject);
            } else {
                auth.signOut()
                    .then(() => {
                        currentUser = null;
                        resolve();
                    })
                    .catch(reject);
            }
        });
    };

    const getCurrentUser = () => {
        return currentUser;
    };

    const checkAuthState = () => {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                
                // Update user status to online
                firestore.collection("users").doc(user.uid).set({
                    status: "online",
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
                .catch(err => {
                    console.error("Failed to update user status:", err);
                });
                
                // Transition to app screen
                const authScreen = document.getElementById('authScreen');
                const appScreen = document.getElementById('appScreen');
                const userStatus = document.getElementById('userStatus');
                
                if (authScreen) authScreen.classList.remove('active');
                if (appScreen) appScreen.classList.add('active');
                if (userStatus) userStatus.textContent = `Welcome, ${user.displayName || user.email}`;
                
                // Initialize app features
                if (window.initializeAppFeatures) {
                    window.initializeAppFeatures(user);
                }
            } else {
                currentUser = null;
                
                // Transition to auth screen
                const authScreen = document.getElementById('authScreen');
                const appScreen = document.getElementById('appScreen');
                const userStatus = document.getElementById('userStatus');
                
                if (appScreen) appScreen.classList.remove('active');
                if (authScreen) authScreen.classList.add('active');
                if (userStatus) userStatus.textContent = 'Not logged in';
            }
        });
    };

    // ========== UI ELEMENTS ==========
    const authScreen = document.getElementById('authScreen');
    const appScreen = document.getElementById('appScreen');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const userStatus = document.getElementById('userStatus');

    // ========== EVENT LISTENERS ==========

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            googleSignInBtn.disabled = true;
            const originalText = googleSignInBtn.textContent;
            googleSignInBtn.innerHTML = '<span style="display: inline-block; margin-right: 8px;">⟳</span>Signing in...';
            
            signInWithGoogle()
                .then(user => {
                    console.log("Sign-in successful:", user.email);
                })
                .catch(error => {
                    console.error("Sign-in failed:", error);
                    googleSignInBtn.disabled = false;
                    googleSignInBtn.textContent = originalText;
                    
                    let errorMessage = 'Sign-in failed';
                    if (error.code === 'auth/operation-not-supported-in-this-environment') {
                        errorMessage = 'Please use HTTPS or localhost';
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    alert(errorMessage);
                });
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            signOutBtn.disabled = true;
            logoutUser()
                .then(() => {
                    console.log("Logout successful");
                    signOutBtn.disabled = false;
                })
                .catch(error => {
                    console.error("Logout failed:", error);
                    signOutBtn.disabled = false;
                    alert('Logout failed: ' + error.message);
                });
        });
    }

    // ========== EXPORT TO GLOBAL ==========
    window.authModule = {
        getCurrentUser,
        signInWithGoogle,
        logoutUser,
        checkAuthState,
        auth,
        firestore
    };

    console.log("Auth module initialized");
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
