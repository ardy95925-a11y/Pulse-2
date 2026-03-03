// ========== CHAT & VOICE MODULE ==========
// Handles real-time messaging and voice chat sessions

function initChat() {
    const firestore = firebase.firestore();
    const database = firebase.database();
    const auth = firebase.auth();

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

    const loadFriends = (userId) => {
        if (friendsUnsubscribe) friendsUnsubscribe();
        
        friendsUnsubscribe = firestore.collection("relationships")
            .where("userId", "==", userId)
            .where("status", "==", "accepted")
            .onSnapshot(snapshot => {
                renderFriendsList(snapshot.docs, userId);
            }, error => {
                console.error("Error loading friends:", error);
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
            try {
                const friendSnap = await firestore.collection("users").doc(friendId).get();
                
                if (friendSnap.exists()) {
                    const friendData = friendSnap.data();
                    const isActive = currentSelectedFriend?.uid === friendId;
                    
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
            } catch (error) {
                console.error("Error loading friend data:", error);
            }
        }
    };

    const addFriend = async (friendEmail, userId) => {
        try {
            // Find user by email
            const userDocs = await firestore.collection("users")
                .where("email", "==", friendEmail)
                .get();
            
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
            await firestore.collection("relationships").doc(`${userId}_${friendId}`).set({
                userId: userId,
                friendId: friendId,
                status: "accepted",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Mutual relationship
            await firestore.collection("relationships").doc(`${friendId}_${userId}`).set({
                userId: friendId,
                friendId: userId,
                status: "accepted",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('Friend added successfully!');
            closeAddFriendModal();
        } catch (error) {
            console.error("Error adding friend:", error);
            alert('Failed to add friend: ' + error.message);
        }
    };

    // ========== MESSAGE MANAGEMENT ==========

    const selectFriend = (friendId, friendData) => {
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

    const loadMessages = (userId, friendId) => {
        if (messagesUnsubscribe) messagesUnsubscribe();
        
        const conversationId = [userId, friendId].sort().join('_');
        
        messagesUnsubscribe = firestore.collection("messages")
            .where("conversationId", "==", conversationId)
            .orderBy("timestamp", "asc")
            .limit(50)
            .onSnapshot(snapshot => {
                renderMessages(snapshot.docs, userId);
            }, error => {
                console.error("Error loading messages:", error);
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

    const sendMessage = async (text) => {
        if (!text.trim() || !currentSelectedFriend) return;
        
        try {
            const userId = auth.currentUser.uid;
            const friendId = currentSelectedFriend.uid;
            const conversationId = [userId, friendId].sort().join('_');
            
            await firestore.collection("messages").add({
                conversationId: conversationId,
                senderId: userId,
                senderName: auth.currentUser.displayName || auth.currentUser.email,
                text: text.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            messageInput.value = '';
            messageInput.focus();
        } catch (error) {
            console.error("Error sending message:", error);
            alert('Failed to send message: ' + error.message);
        }
    };

    // ========== VOICE CHAT ==========

    const startVoiceCall = async () => {
        if (!currentSelectedFriend) return;
        
        try {
            const userId = auth.currentUser.uid;
            const friendId = currentSelectedFriend.uid;
            const roomId = [userId, friendId].sort().join('_') + '_' + Date.now();
            
            // Create voice room
            await firestore.collection("voiceRooms").doc(roomId).set({
                roomId: roomId,
                initiator: userId,
                participants: [userId, friendId],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                active: true
            });
            
            currentVoiceRoom = roomId;
            enterVoiceRoom(roomId, friendId);
        } catch (error) {
            console.error("Error starting voice call:", error);
            alert('Failed to start voice call: ' + error.message);
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
                <div class="participant-avatar">${auth.currentUser.displayName?.charAt(0).toUpperCase() || 'Y'}</div>
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

    const leaveVoiceCall = async () => {
        if (!currentVoiceRoom) return;
        
        try {
            const userId = auth.currentUser.uid;
            
            // Remove room or mark as inactive
            await firestore.collection("voiceRooms").doc(currentVoiceRoom).update({
                active: false
            });
            
            currentVoiceRoom = null;
            muteState = false;
            
            // Return to chat view
            voiceView.classList.add('hidden');
            chatView.classList.remove('hidden');
        } catch (error) {
            console.error("Error leaving voice call:", error);
        }
    };

    const toggleMute = () => {
        muteState = !muteState;
        muteBtn.classList.toggle('active', muteState);
    };

    // ========== EVENT LISTENERS ==========

    sendMessageBtn?.addEventListener('click', () => {
        sendMessage(messageInput.value);
    });

    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(messageInput.value);
        }
    });

    voiceCallBtn?.addEventListener('click', startVoiceCall);
    leaveVoiceBtn?.addEventListener('click', leaveVoiceCall);
    closeVoiceBtn?.addEventListener('click', leaveVoiceCall);
    muteBtn?.addEventListener('click', toggleMute);

    addFriendBtn?.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
        friendEmailInput.focus();
    });

    closeFriendModal?.addEventListener('click', () => {
        addFriendModal.classList.add('hidden');
        friendEmailInput.value = '';
    });

    addFriendSubmitBtn?.addEventListener('click', () => {
        if (friendEmailInput.value.trim()) {
            addFriend(friendEmailInput.value.trim(), auth.currentUser.uid);
        }
    });

    friendEmailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addFriendSubmitBtn.click();
        }
    });

    // Modal close on background click
    addFriendModal?.addEventListener('click', (e) => {
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

    const closeAddFriendModal = () => {
        addFriendModal.classList.add('hidden');
        friendEmailInput.value = '';
    };

    // ========== EXPORT TO GLOBAL ==========
    window.chatModule = {
        loadFriends,
        selectFriend,
        sendMessage,
        startVoiceCall,
        leaveVoiceCall,
        toggleMute
    };

    console.log("Chat module initialized");
}

// Make this function available when auth is ready
window.initializeAppFeatures = (user) => {
    if (user && window.chatModule) {
        window.chatModule.loadFriends(user.uid);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}
