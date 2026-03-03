// WebRTC Call Management with Agora

// Agora Configuration
const AGORA_APP_ID = 'YOUR_AGORA_APP_ID'; // Replace with your Agora App ID
const AGORA_TOKEN = null; // In production, fetch from your backend

let rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    screenShareTrack: null,
};

let callState = {
    isInCall: false,
    remoteUserID: null,
    currentChannelName: null,
    callStartTime: null,
    isAudioOn: true,
    isVideoOn: true,
    isScreenSharing: false,
};

// Initialize Agora Client
async function initAgoraClient() {
    try {
        if (rtc.client) {
            await rtc.client.leave();
        }

        rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp9' });

        rtc.client.on('user-published', handleUserPublished);
        rtc.client.on('user-unpublished', handleUserUnpublished);
        rtc.client.on('user-left', handleUserLeft);

        console.log('Agora client initialized');
    } catch (error) {
        console.error('Failed to initialize Agora client:', error);
    }
}

// Handle user published
async function handleUserPublished(user, mediaType) {
    await rtc.client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        remoteVideoTrack.play('remoteVideo');
        callState.remoteUserID = user.uid;

        // Update call status
        updateCallStatus('Connected');
    }

    if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
    }
}

// Handle user unpublished
async function handleUserUnpublished(user, mediaType) {
    if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        remoteVideoTrack.stop();
    }
}

// Handle user left
function handleUserLeft(user) {
    if (user.uid === callState.remoteUserID) {
        endCall();
    }
}

// Initiate a call
async function initiateCall(contactId, contactName) {
    try {
        // Initialize Agora if needed
        if (!rtc.client) {
            await initAgoraClient();
        }

        // Create channel name from both user IDs
        callState.currentChannelName = `pulse_${Math.min(currentUser.uid, contactId)}_${Math.max(currentUser.uid, contactId)}`;

        // Join the channel
        await rtc.client.join(AGORA_APP_ID, callState.currentChannelName, AGORA_TOKEN, currentUser.uid);

        // Create and publish local tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();

        rtc.localAudioTrack = audioTrack;
        rtc.localVideoTrack = videoTrack;

        await rtc.client.publish([audioTrack, videoTrack]);

        // Play local video
        videoTrack.play('localVideo');

        // Update UI
        callState.isInCall = true;
        callState.callStartTime = Date.now();
        callState.isAudioOn = true;
        callState.isVideoOn = true;

        switchCallState('callState');
        document.getElementById('remoteName').textContent = contactName;
        updateCallStatus('Ringing...');

        // Add to call history
        addToCallHistory(contactId, contactName);

        // Start call timer
        startCallTimer();

        console.log('Call initiated with', contactName);

    } catch (error) {
        console.error('Failed to initiate call:', error);
        alert('Failed to start call. Please check your connection.');
    }
}

// Toggle audio
document.getElementById('toggleAudioBtn').addEventListener('click', async () => {
    if (!rtc.localAudioTrack) return;

    if (callState.isAudioOn) {
        await rtc.localAudioTrack.setEnabled(false);
        callState.isAudioOn = false;
        document.getElementById('toggleAudioBtn').classList.remove('active');
    } else {
        await rtc.localAudioTrack.setEnabled(true);
        callState.isAudioOn = true;
        document.getElementById('toggleAudioBtn').classList.add('active');
    }
});

// Toggle video
document.getElementById('toggleVideoBtn').addEventListener('click', async () => {
    if (!rtc.localVideoTrack) return;

    if (callState.isVideoOn) {
        await rtc.localVideoTrack.setEnabled(false);
        callState.isVideoOn = false;
        document.getElementById('toggleVideoBtn').classList.remove('active');
    } else {
        await rtc.localVideoTrack.setEnabled(true);
        callState.isVideoOn = true;
        document.getElementById('toggleVideoBtn').classList.add('active');
    }
});

// Share screen
document.getElementById('shareScreenBtn').addEventListener('click', async () => {
    try {
        if (callState.isScreenSharing) {
            // Stop screen sharing
            await rtc.screenShareTrack.stop();
            await rtc.client.unpublish(rtc.screenShareTrack);
            await rtc.client.publish(rtc.localVideoTrack);
            
            rtc.localVideoTrack.play('localVideo');
            rtc.screenShareTrack = null;
            callState.isScreenSharing = false;
            document.getElementById('shareScreenBtn').classList.remove('active');
        } else {
            // Start screen sharing
            const screenTrack = await AgoraRTC.createScreenVideoTrack({
                encoderConfig: '1080p'
            });

            await rtc.client.unpublish(rtc.localVideoTrack);
            await rtc.client.publish(screenTrack);

            screenTrack.play('localVideo');
            rtc.screenShareTrack = screenTrack;
            callState.isScreenSharing = true;
            document.getElementById('shareScreenBtn').classList.add('active');

            // Handle when user stops sharing
            screenTrack.on('track-ended', async () => {
                await rtc.client.unpublish(screenTrack);
                await rtc.client.publish(rtc.localVideoTrack);
                rtc.localVideoTrack.play('localVideo');
                rtc.screenShareTrack = null;
                callState.isScreenSharing = false;
                document.getElementById('shareScreenBtn').classList.remove('active');
            });
        }
    } catch (error) {
        console.error('Screen sharing error:', error);
        alert('Failed to share screen. Make sure you have permission.');
    }
});

// File sharing button
document.getElementById('fileShareBtn').addEventListener('click', () => {
    if (!callState.isInCall) {
        alert('Start a call first to share files');
        return;
    }
    document.getElementById('fileShareModal').classList.remove('hidden');
});

// End call
document.getElementById('endCallBtn').addEventListener('click', () => {
    endCall();
});

async function endCall() {
    try {
        if (rtc.localAudioTrack) {
            rtc.localAudioTrack.stop();
            rtc.localAudioTrack.close();
            rtc.localAudioTrack = null;
        }

        if (rtc.localVideoTrack) {
            rtc.localVideoTrack.stop();
            rtc.localVideoTrack.close();
            rtc.localVideoTrack = null;
        }

        if (rtc.screenShareTrack) {
            rtc.screenShareTrack.stop();
            rtc.screenShareTrack.close();
            rtc.screenShareTrack = null;
        }

        if (rtc.client) {
            await rtc.client.leave();
        }

        // Reset call state
        callState.isInCall = false;
        callState.remoteUserID = null;
        callState.currentChannelName = null;
        callState.callStartTime = null;
        callState.isScreenSharing = false;

        // Reset UI
        switchCallState('idleState');
        document.getElementById('toggleAudioBtn').classList.add('active');
        document.getElementById('toggleVideoBtn').classList.add('active');
        document.getElementById('shareScreenBtn').classList.remove('active');
        document.getElementById('callTimer').textContent = '00:00';

        console.log('Call ended');

    } catch (error) {
        console.error('Error ending call:', error);
    }
}

// Call timer
let timerInterval = null;

function startCallTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!callState.isInCall) {
            clearInterval(timerInterval);
            return;
        }

        const elapsed = Date.now() - callState.callStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('callTimer').textContent = display;
    }, 1000);
}

// Switch between call states
function switchCallState(stateId) {
    document.querySelectorAll('.state').forEach(state => {
        state.classList.remove('active');
    });
    document.getElementById(stateId).classList.add('active');
}

// Update call status
function updateCallStatus(status) {
    document.getElementById('callStatus').textContent = status;
}

// Add call to history
function addToCallHistory(contactId, contactName) {
    let history = JSON.parse(localStorage.getItem('callHistory') || '[]');
    
    history.push({
        id: contactId,
        name: contactName,
        timestamp: new Date().toISOString(),
        duration: 0
    });

    // Keep only last 20 calls
    if (history.length > 20) {
        history = history.slice(-20);
    }

    localStorage.setItem('callHistory', JSON.stringify(history));
    window.renderCallHistory?.();
}

// Export functions
window.initiateCall = initiateCall;
window.endCall = endCall;
window.switchCallState = switchCallState;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initAgoraClient();
    } catch (error) {
        console.error('Failed to initialize call system:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (callState.isInCall) {
        await endCall();
    }
});
