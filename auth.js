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
    document.getElementById('userName').textContent = userData.name || 'Guest';
    
    const avatarElement = document.getElementById('userAvatar');
    if (userData.picture) {
        avatarElement.src = userData.picture;
    } else {
        // Create initials avatar
        const initials = (userData.name || 'G').split(' ').map(n => n[0]).join('').toUpperCase();
        avatarElement.innerHTML = `<span>${initials}</span>`;
    }

    loadContacts();
    loadCallHistory();
}

// Load contacts from localStorage (or Firebase in production)
function loadContacts() {
    const saved = localStorage.getItem('contacts');
    if (saved) {
        contacts = JSON.parse(saved);
        renderContacts();
    }
}

// Load call history
function loadCallHistory() {
    const saved = localStorage.getItem('callHistory');
    if (saved) {
        callHistory = JSON.parse(saved);
        renderCallHistory();
    }
}

// Render contacts list
function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="empty-state">No contacts yet. Add a friend to start calling.</p>';
        return;
    }

    contactsList.innerHTML = contacts.map((contact, idx) => `
        <div class="contact-item" onclick="initiateCall('${contact.id}', '${contact.name}')">
            <div class="contact-avatar">${contact.name[0].toUpperCase()}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-status">${contact.status || 'Offline'}</div>
            </div>
        </div>
    `).join('');
}

// Render call history
function renderCallHistory() {
    const recentList = document.getElementById('recentList');
    
    if (callHistory.length === 0) {
        recentList.innerHTML = '<p class="empty-state">No recent calls</p>';
        return;
    }

    const recent = callHistory.slice(-5).reverse();
    recentList.innerHTML = recent.map(call => `
        <div class="recent-item" onclick="initiateCall('${call.id}', '${call.name}')">
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
document.getElementById('addContactBtn').addEventListener('click', () => {
    document.getElementById('addContactModal').classList.remove('hidden');
});

document.getElementById('addContactSubmitBtn').addEventListener('click', () => {
    const email = document.getElementById('contactEmail').value.trim();
    
    if (!email) {
        alert('Please enter an email or username');
        return;
    }

    const newContact = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        status: 'Online',
        timestamp: new Date().toISOString()
    };

    contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    document.getElementById('contactEmail').value = '';
    closeModal('addContactModal');
    renderContacts();
});

// Modal management
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.classList.add('hidden');
    });
});

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Guest login
document.getElementById('guestLoginBtn').addEventListener('click', () => {
    const guestUser = {
        uid: 'guest_' + Date.now(),
        email: 'guest@pulse.local',
        name: 'Guest User',
        picture: null
    };

    localStorage.setItem('user', JSON.stringify(guestUser));
    switchScreen('appScreen');
    updateUserUI(guestUser);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('contacts');
    localStorage.removeItem('callHistory');
    
    currentUser = null;
    contacts = [];
    callHistory = [];
    
    switchScreen('loginScreen');
    document.getElementById('contactEmail').value = '';
});

// Click outside modal to close
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// File share modal
document.getElementById('fileShareBtn').addEventListener('click', () => {
    document.getElementById('fileShareModal').classList.remove('hidden');
});

const fileInputZone = document.getElementById('fileInputZone');
const fileInput = document.getElementById('fileInput');

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

function handleFiles(files) {
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
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

    // In a real app, upload files here
    console.log('Files ready to share:', files);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        switchScreen('appScreen');
        updateUserUI(userData);
    }

    // Add contact email input - allow Enter key
    const contactEmailInput = document.getElementById('contactEmail');
    if (contactEmailInput) {
        contactEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addContactSubmitBtn').click();
            }
        });
    }
});

// Export functions
window.switchScreen = switchScreen;
window.updateUserUI = updateUserUI;
window.loadContacts = loadContacts;
window.renderContacts = renderContacts;
window.closeModal = closeModal;
