// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB98E7T3E3IY4fa6_KLOcoT__CiOcUn3LE",
    authDomain: "pulse-f5e93.firebaseapp.com",
    projectId: "pulse-f5e93",
    storageBucket: "pulse-f5e93.firebasestorage.app",
    messagingSenderId: "26109296510",
    appId: "1:26109296510:web:51ee51db5970e544b13d2f",
    measurementId: "G-JMDX0D9D69"
};

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    if (typeof google === 'undefined') {
        console.error('Google API not loaded');
        return;
    }

    try {
        google.accounts.id.initialize({
            client_id: '26109296510-cddkg8m5tuhkq2q1d8nf0hu8u0dvr4d0.apps.googleusercontent.com',
            callback: handleGoogleLogin,
            auto_select: false,
            ux_mode: 'popup'
        });

        const googleDiv = document.getElementById('googleLoginDiv');
        if (googleDiv) {
            google.accounts.id.renderButton(
                googleDiv,
                {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signin_with',
                    locale: 'en'
                }
            );
        }
    } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
    }
}

// Handle Google Login Response
function handleGoogleLogin(response) {
    try {
        if (response.credential) {
            const credential = response.credential;
            
            // Decode JWT to get user info
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const userData = JSON.parse(jsonPayload);
            
            // Store user data
            const user = {
                uid: userData.sub,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                isGuest: false
            };

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('loggedInUser', user.email);

            // Switch to app screen
            if (typeof switchScreen === 'function') {
                switchScreen('appScreen');
                updateUserUI(user);
            }
            
            console.log('Google login successful:', userData.email);
        }
    } catch (error) {
        console.error('Google login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Make global for Google callback
window.handleGoogleLogin = handleGoogleLogin;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Google API to load
    setTimeout(() => {
        initializeGoogleSignIn();
    }, 500);

    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            setTimeout(() => {
                if (typeof switchScreen === 'function' && typeof updateUserUI === 'function') {
                    switchScreen('appScreen');
                    updateUserUI(userData);
                }
            }, 300);
        } catch (e) {
            console.error('Failed to restore user session:', e);
        }
    }
});
