// Auth and UI Management

let currentUser = null;
let contacts = [];
let callHistory = [];

// Switch between login and app screens
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Update user UI
function updateUserUI(userData) {
    currentUser = userData;
    console.log('User logged in:', userData);
    
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) {
        userNameEl.textContent = userData.name || userData.email || 'User';
    }
    
    if (userAvatarEl) {
        if (userData.picture) {
            userAvatarEl.src = userData.picture;
            userAvatarEl.style.background = 'none';
        } else {
            const initials = (userData.name || userData.email || 'G').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatarEl.innerHTML = `<span style="font-size: 16px; font-weight: bold; color: white;">${initials}</span>`;
            userAvatarEl.style.background = 'linear-gradient(135deg, #4f46e5, #6366f1)';
        }
    }

    loadContacts();
    loadCallHistory();
}

// Load contacts from localStorage
function loadContacts() {
    const saved = localStorage.getItem('contacts_' + (currentUser?.uid || 'guest'));
    if (saved) {
        try {
            contacts = JSON.parse(saved);
            renderContacts();
        } catch (e) {
            console.error('Failed to load contacts:', e);
            contacts = [];
        }
    }
}

// Load call history
function loadCallHistory() {
    const saved = localStorage.getItem('callHistory_' + (currentUser?.uid || 'guest'));
    if (saved) {
        try {
            callHistory = JSON.parse(saved);
            renderCallHistory();
        } catch (e) {
            console.error('Failed to load call history:', e);
            callHistory = [];
        }
    }
}

// Render contacts list
function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    
    if (!contactsList) return;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="empty-state">No contacts yet. Add a friend to start calling.</p>';
        return;
    }

    contactsList.innerHTML = contacts.map((contact, idx) => `
        <div class="contact-item" onclick="initiateCall('${contact.id}', '${contact.name.replace(/'/g, "\\'")}', '${contact.email || ''}')">
            <div class="contact-avatar">${contact.name[0].toUpperCase()}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-status">Ready to call</div>
            </div>
        </div>
    `).join('');
}

// Render call history
function renderCallHistory() {
    const recentList = document.getElementById('recentList');
    
    if (!recentList) return;
    
    if (callHistory.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No recent calls</p>';
        return;
    }

    const recent = callHistory.slice(-5).reverse();
    recentList.innerHTML = recent.map(call => `
        <div class="recent-item" onclick="initiateCall('${call.id}', '${call.name.replace(/'/g, "\\'")}', '${call.email || ''}')">
            <div class="recent-avatar">${call.name[0].toUpperCase()}</div>
            <div class="recent-info">
                <div class="recent-name">${call.name}</div>
                <div class="contact-status">${formatTime(call.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Format timestamp
function formatTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Add contact
document.addEventListener('DOMContentLoaded', () => {
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            const modal = document.getElementById('addContactModal');
            if (modal) modal.classList.remove('hidden');
        });
    }

    const addContactSubmitBtn = document.getElementById('addContactSubmitBtn');
    if (addContactSubmitBtn) {
        addContactSubmitBtn.addEventListener('click', addNewContact);
    }

    const contactEmailInput = document.getElementById('contactEmail');
    if (contactEmailInput) {
        contactEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNewContact();
            }
        });
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Guest login
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', guestLogin);
    }

    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser && !window.location.hash.includes('logout')) {
        try {
            const userData = JSON.parse(savedUser);
            switchScreen('appScreen');
            updateUserUI(userData);
        } catch (e) {
            console.error('Session restore failed:', e);
        }
    }
});

function addNewContact() {
    const emailInput = document.getElementById('contactEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter an email or username');
        return;
    }

    const name = email.split('@')[0];
    const newContact = {
        id: Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        status: 'Ready to call',
        timestamp: new Date().toISOString()
    };

    // Check if already exists
    if (contacts.find(c => c.email === email)) {
        alert('This contact already exists');
        return;
    }

    contacts.push(newContact);
    const userId = currentUser?.uid || 'guest';
    localStorage.setItem('contacts_' + userId, JSON.stringify(contacts));
    
    emailInput.value = '';
    closeModal('addContactModal');
    renderContacts();
    
    console.log('Contact added:', newContact);
}

// Modal management
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// Logout
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('loggedInUser');
        
        currentUser = null;
        contacts = [];
        callHistory = [];
        
        switchScreen('loginScreen');
        document.getElementById('contactEmail').value = '';
        
        // Sign out from Google
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
        }
        
        console.log('User logged out');
    }
}

// Guest login
function guestLogin() {
    const guestUser = {
        uid: 'guest_' + Date.now(),
        email: 'guest@pulse.local',
        name: 'Guest User',
        picture: null,
        isGuest: true
    };

    localStorage.setItem('user', JSON.stringify(guestUser));
    switchScreen('appScreen');
    updateUserUI(guestUser);
    
    console.log('Guest user logged in');
}

// File share modal
document.addEventListener('DOMContentLoaded', () => {
    const fileShareBtn = document.getElementById('fileShareBtn');
    if (fileShareBtn) {
        fileShareBtn.addEventListener('click', () => {
            if (!window.callState || !window.callState.isInCall) {
                alert('Start a call first to share files');
                return;
            }
            document.getElementById('fileShareModal').classList.remove('hidden');
        });
    }

    const fileInputZone = document.getElementById('fileInputZone');
    const fileInput = document.getElementById('fileInput');

    if (fileInputZone && fileInput) {
        fileInputZone.addEventListener('click', () => fileInput.click());

        fileInputZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputZone.style.borderColor = 'var(--primary)';
            fileInputZone.style.background = 'rgba(79, 70, 229, 0.05)';
        });

        fileInputZone.addEventListener('dragleave', () => {
            fileInputZone.style.borderColor = '';
            fileInputZone.style.background = '';
        });

        fileInputZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputZone.style.borderColor = '';
            fileInputZone.style.background = '';
            
            const files = e.dataTransfer.files;
            handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }
});

function handleFiles(files) {
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
    if (!uploadedFilesDiv) return;
    
    uploadedFilesDiv.innerHTML = '';

    Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
            </svg>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        `;
        uploadedFilesDiv.appendChild(fileItem);
    });

    console.log('Files ready to share:', Array.from(files).map(f => ({ name: f.name, size: f.size })));
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export functions
window.switchScreen = switchScreen;
window.updateUserUI = updateUserUI;
window.loadContacts = loadContacts;
window.renderContacts = renderContacts;
window.closeModal = closeModal;
window.logoutUser = logoutUser;
window.guestLogin = guestLogin;
