// ========== CHAT & VOICE MODULE ==========
// Handles real-time messaging and voice chat sessions

import { 
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    limit
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Initialize
const firebaseConfig = {
    apiKey: "AIzaSyCW6Utclu2ME1z1AwUj2xwTm_-it-aWFrI",
    authDomain: "pulse-c5322.firebaseapp.com",
    projectId: "pulse-c5322",
    storageBucket: "pulse-c5322.firebasestorage.app",
    messagingSenderId: "700936968948",
    appId: "1:700936968948:web:abe29f631b258516551ca1",
    databaseURL: "https://pulse-c5322-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const database = getDatabase(app);
const auth = getAuth(app);

// ========== GLOBAL STATE ==========
let currentSelectedFriend = null;
let currentVoiceRoom = null;
let messagesUnsubscribe = null;
let friendsUnsubscribe = null;
let muteState = false;

// ========== UI REFERENCES ==========
const friendsList = document.getElementById('friendsList');
const chatView = document.getElementById('chatView');
const voiceView = document.getElementById('voiceView');
const emptyState = document.getElementById('emptyState');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatUserName = document.getElementById('chatUserName');
const chatUserStatus = document.getElementById('chatUserStatus');
const voiceCallBtn = document.getElementById('voiceCallBtn');
const muteBtn = document.getElementById('muteBtn');
const leaveVoiceBtn = document.getElementById('leaveVoiceBtn');
const closeVoiceBtn = document.getElementById('closeVoiceBtn');
const addFriendBtn = document.getElementById('addFriendBtn');
const addFriendModal = document.getElementById('addFriendModal');
const friendEmailInput = document.getElementById('friendEmailInput');
const addFriendSubmitBtn = document.getElementById('addFriendSubmitBtn');
const closeFriendModal = document.getElementById('closeFriendModal');

// ========== FRIENDS MANAGEMENT ==========

export const loadFriends = (userId) => {
    if (friendsUnsubscribe) friendsUnsubscribe();
    
    const q = query(
        collection(firestore, "relationships"),
        where("userId", "==", userId),
        where("status", "==", "accepted")
    );
    
    friendsUnsubscribe = onSnapshot(q, (snapshot) => {
        renderFriendsList(snapshot.docs, userId);
    });
};

const renderFriendsList = async (friendDocs, userId) => {
    friendsList.innerHTML = '';
    
    if (friendDocs.length === 0) {
        friendsList.innerHTML = '<div class="empty-state">No friends yet. Add one!</div>';
        return;
    }
    
    for (const doc of friendDocs) {
        const friendId = doc.data().friendId;
        const friendSnap = await getDoc(doc(firestore, "users", friendId));
        
        if (friendSnap.exists()) {
            const friendData = friendSnap.data();
            const isActive = currentSelectedFriend?.uid === friendId;
            const statusColor = friendData.status === 'online' ? 'online' : 'offline';
            
            const friendElement = document.createElement('div');
            friendElement.className = `friend-item ${isActive ? 'active' : ''}`;
            friendElement.innerHTML = `
                <div class="friend-avatar">${friendData.displayName?.charAt(0).toUpperCase() || 'U'}</div>
                <div class="friend-info">
                    <div class="friend-name">${friendData.displayName || friendData.email}</div>
                    <div class="friend-status">${friendData.status || 'offline'}</div>
                </div>
                ${friendData.status === 'online' ? '<div class="online-indicator"></div>' : ''}
            `;
            
            friendElement.addEventListener('click', () => selectFriend(friendId, friendData));
            friendsList.appendChild(friendElement);
        }
    }
};

export const addFriend = async (friendEmail, userId) => {
    try {
        // Find user by email
        const usersQuery = query(
            collection(firestore, "users"),
            where("email", "==", friendEmail)
        );
        const userDocs = await getDocs(usersQuery);
        
        if (userDocs.empty) {
            alert('User not found');
            return;
        }
        
        const friendId = userDocs.docs[0].id;
        
        if (friendId === userId) {
            alert('Cannot add yourself as a friend');
            return;
        }
        
        // Create relationship
        await setDoc(doc(firestore, "relationships", `${userId}_${friendId}`), {
            userId: userId,
            friendId: friendId,
            status: "accepted",
            createdAt: serverTimestamp()
        });
        
        // Mutual relationship
        await setDoc(doc(firestore, "relationships", `${friendId}_${userId}`), {
            userId: friendId,
            friendId: userId,
            status: "accepted",
            createdAt: serverTimestamp()
        });
        
        alert('Friend added successfully!');
        closeAddFriendModal();
    } catch (error) {
        console.error("Error adding friend:", error);
        alert('Failed to add friend');
    }
};

// ========== MESSAGE MANAGEMENT ==========

export const selectFriend = (friendId, friendData) => {
    currentSelectedFriend = { uid: friendId, ...friendData };
    
    // Update UI
    document.querySelectorAll('.friend-item').forEach(el => {
        el.classList.remove('active');
    });
    event.currentTarget?.classList.add('active');
    
    // Show chat view
    emptyState.classList.add('hidden');
    chatView.classList.remove('hidden');
    voiceView.classList.add('hidden');
    
    // Update header
    chatUserName.textContent = friendData.displayName || friendData.email;
    chatUserStatus.textContent = friendData.status === 'online' ? '● Online' : '● Offline';
    
    // Load messages
    loadMessages(auth.currentUser.uid, friendId);
};

export const loadMessages = (userId, friendId) => {
    if (messagesUnsubscribe) messagesUnsubscribe();
    
    const conversationId = [userId, friendId].sort().join('_');
    const q = query(
        collection(firestore, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "asc"),
        limit(50)
    );
    
    messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        renderMessages(snapshot.docs, userId);
    });
};

const renderMessages = (messageDocs, userId) => {
    messagesContainer.innerHTML = '';
    
    messageDocs.forEach(doc => {
        const data = doc.data();
        const isOwn = data.senderId === userId;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwn ? 'own' : ''}`;
        
        const timestamp = data.timestamp?.toDate?.() || new Date();
        const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-bubble ${isOwn ? 'own' : 'other'}">
                ${escapeHtml(data.text)}
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

export const sendMessage = async (text) => {
    if (!text.trim() || !currentSelectedFriend) return;
    
    try {
        const userId = auth.currentUser.uid;
        const friendId = currentSelectedFriend.uid;
        const conversationId = [userId, friendId].sort().join('_');
        
        await addDoc(collection(firestore, "messages"), {
            conversationId: conversationId,
            senderId: userId,
            senderName: auth.currentUser.displayName || auth.currentUser.email,
            text: text.trim(),
            timestamp: serverTimestamp()
        });
        
        messageInput.value = '';
        messageInput.focus();
    } catch (error) {
        console.error("Error sending message:", error);
        alert('Failed to send message');
    }
};

// ========== VOICE CHAT ==========

export const startVoiceCall = async () => {
    if (!currentSelectedFriend) return;
    
    try {
        const userId = auth.currentUser.uid;
        const friendId = currentSelectedFriend.uid;
        const roomId = [userId, friendId].sort().join('_') + '_' + Date.now();
        
        // Create voice room
        await setDoc(doc(firestore, "voiceRooms", roomId), {
            roomId: roomId,
            initiator: userId,
            participants: [userId, friendId],
            createdAt: serverTimestamp(),
            active: true
        });
        
        // Add current user to room
        await update(ref(database, `voiceRooms/${roomId}/participants/${userId}`), {
            userId: userId,
            userName: auth.currentUser.displayName || auth.currentUser.email,
            joinedAt: Date.now(),
            muted: false
        });
        
        currentVoiceRoom = roomId;
        enterVoiceRoom(roomId, friendId);
    } catch (error) {
        console.error("Error starting voice call:", error);
        alert('Failed to start voice call');
    }
};

const enterVoiceRoom = (roomId, friendId) => {
    chatView.classList.add('hidden');
    voiceView.classList.remove('hidden');
    
    document.getElementById('voiceRoomTitle').textContent = `Voice Chat with ${currentSelectedFriend.displayName}`;
    
    // Simulate participants
    const participantsGrid = document.getElementById('participantsGrid');
    participantsGrid.innerHTML = `
        <div class="participant-card">
            <div class="participant-avatar" id="currentUserAvatar">${auth.currentUser.displayName?.charAt(0).toUpperCase() || 'Y'}</div>
            <div class="participant-info">
                <p>${auth.currentUser.displayName || 'You'}</p>
                <div class="voice-indicator">
                    <div class="bar" style="animation-delay: 0s;"></div>
                    <div class="bar" style="animation-delay: 0.1s;"></div>
                    <div class="bar" style="animation-delay: 0.2s;"></div>
                </div>
            </div>
        </div>
        <div class="participant-card">
            <div class="participant-avatar">${currentSelectedFriend.displayName?.charAt(0).toUpperCase() || 'F'}</div>
            <div class="participant-info">
                <p>${currentSelectedFriend.displayName}</p>
                <div class="voice-indicator">
                    <div class="bar" style="animation-delay: 0s;"></div>
                    <div class="bar" style="animation-delay: 0.1s;"></div>
                    <div class="bar" style="animation-delay: 0.2s;"></div>
                </div>
            </div>
        </div>
    `;
};

export const leaveVoiceCall = async () => {
    if (!currentVoiceRoom) return;
    
    try {
        const userId = auth.currentUser.uid;
        
        // Remove user from room
        await remove(ref(database, `voiceRooms/${currentVoiceRoom}/participants/${userId}`));
        
        currentVoiceRoom = null;
        muteState = false;
        
        // Return to chat view
        voiceView.classList.add('hidden');
        chatView.classList.remove('hidden');
    } catch (error) {
        console.error("Error leaving voice call:", error);
    }
};

export const toggleMute = () => {
    muteState = !muteState;
    muteBtn.classList.toggle('active', muteState);
};

// ========== EVENT LISTENERS ==========

sendMessageBtn.addEventListener('click', () => {
    sendMessage(messageInput.value);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
    }
});

voiceCallBtn.addEventListener('click', startVoiceCall);
leaveVoiceBtn.addEventListener('click', leaveVoiceCall);
closeVoiceBtn.addEventListener('click', leaveVoiceCall);
muteBtn.addEventListener('click', toggleMute);

addFriendBtn.addEventListener('click', () => {
    addFriendModal.classList.remove('hidden');
    friendEmailInput.focus();
});

closeFriendModal.addEventListener('click', () => {
    addFriendModal.classList.add('hidden');
    friendEmailInput.value = '';
});

addFriendSubmitBtn.addEventListener('click', () => {
    if (friendEmailInput.value.trim()) {
        addFriend(friendEmailInput.value.trim(), auth.currentUser.uid);
    }
});

friendEmailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addFriendSubmitBtn.click();
    }
});

// Modal close on background click
addFriendModal.addEventListener('click', (e) => {
    if (e.target === addFriendModal) {
        addFriendModal.classList.add('hidden');
    }
});

// ========== HELPER FUNCTIONS ==========

const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

export { firestore, database, auth };
