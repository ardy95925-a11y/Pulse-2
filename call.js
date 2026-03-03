// WebRTC Call Management with Simple WebRTC

let rtc = {
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    screenStream: null,
};

let callState = {
    isInCall: false,
    remoteUserID: null,
    currentChannelName: null,
    callStartTime: null,
    isAudioOn: true,
    isVideoOn: true,
    isScreenSharing: false,
    contactEmail: null,
};

// WebRTC Configuration
const peerConfig = {
    iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
        { urls: ['stun:stun2.l.google.com:19302'] }
    ]
};

// Get user media with error handling
async function getUserMedia() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        return stream;
    } catch (error) {
        console.error('Camera/mic access error:', error);
        if (error.name === 'NotAllowedError') {
            alert('Please allow access to camera and microphone to use Pulse');
        } else if (error.name === 'NotFoundError') {
            alert('Camera or microphone not found');
        }
        throw error;
    }
}

// Initiate a call
async function initiateCall(contactId, contactName, contactEmail) {
    try {
        console.log('Initiating call with:', contactName, contactEmail);

        // Get local stream
        rtc.localStream = await getUserMedia();
        const localVideoEl = document.getElementById('localVideo');
        if (localVideoEl) {
            localVideoEl.srcObject = rtc.localStream;
        }

        // Create peer connection
        rtc.peerConnection = new RTCPeerConnection({ iceServers: peerConfig.iceServers });

        // Add local tracks
        rtc.localStream.getTracks().forEach(track => {
            rtc.peerConnection.addTrack(track, rtc.localStream);
        });

        // Handle remote stream
        rtc.peerConnection.ontrack = (event) => {
            console.log('Remote track received:', event.track.kind);
            rtc.remoteStream = event.streams[0];
            const remoteVideoEl = document.getElementById('remoteVideo');
            if (remoteVideoEl) {
                remoteVideoEl.srcObject = rtc.remoteStream;
            }
            updateCallStatus('Connected');
        };

        // Handle ICE candidates
        rtc.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate:', event.candidate);
                // In production, send via signaling server
            }
        };

        // Create and send offer
        const offer = await rtc.peerConnection.createOffer();
        await rtc.peerConnection.setLocalDescription(offer);
        console.log('Offer created:', offer);

        // Update UI
        callState.isInCall = true;
        callState.callStartTime = Date.now();
        callState.isAudioOn = true;
        callState.isVideoOn = true;
        callState.remoteUserID = contactId;
        callState.contactEmail = contactEmail;

        switchCallState('callState');
        document.getElementById('remoteName').textContent = contactName;
        updateCallStatus('Connecting...');

        // Add to call history
        addToCallHistory(contactId, contactName, contactEmail);

        // Start call timer
        startCallTimer();

        console.log('Call initiated with', contactName);

    } catch (error) {
        console.error('Failed to initiate call:', error);
        alert('Failed to start call: ' + error.message);
        await endCall();
    }
}

// Toggle audio
document.addEventListener('DOMContentLoaded', () => {
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', async () => {
            if (!rtc.localStream) return;

            if (callState.isAudioOn) {
                rtc.localStream.getAudioTracks().forEach(track => track.enabled = false);
                callState.isAudioOn = false;
                toggleAudioBtn.classList.remove('active');
            } else {
                rtc.localStream.getAudioTracks().forEach(track => track.enabled = true);
                callState.isAudioOn = true;
                toggleAudioBtn.classList.add('active');
            }
        });
    }

    // Toggle video
    const toggleVideoBtn = document.getElementById('toggleVideoBtn');
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', async () => {
            if (!rtc.localStream) return;

            if (callState.isVideoOn) {
                rtc.localStream.getVideoTracks().forEach(track => track.enabled = false);
                callState.isVideoOn = false;
                toggleVideoBtn.classList.remove('active');
            } else {
                rtc.localStream.getVideoTracks().forEach(track => track.enabled = true);
                callState.isVideoOn = true;
                toggleVideoBtn.classList.add('active');
            }
        });
    }

    // Share screen
    const shareScreenBtn = document.getElementById('shareScreenBtn');
    if (shareScreenBtn) {
        shareScreenBtn.addEventListener('click', async () => {
            try {
                if (callState.isScreenSharing) {
                    // Stop screen sharing
                    rtc.screenStream.getTracks().forEach(track => track.stop());
                    
                    // Switch back to camera
                    const videoTrack = rtc.localStream.getVideoTracks()[0];
                    const sender = rtc.peerConnection
                        .getSenders()
                        .find(s => s.track && s.track.kind === 'video');
                    
                    if (sender && videoTrack) {
                        await sender.replaceTrack(videoTrack);
                    }
                    
                    rtc.screenStream = null;
                    callState.isScreenSharing = false;
                    shareScreenBtn.classList.remove('active');
                    console.log('Screen sharing stopped');
                } else {
                    // Start screen sharing
                    rtc.screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            cursor: 'always'
                        },
                        audio: false
                    });

                    const screenTrack = rtc.screenStream.getVideoTracks()[0];
                    const sender = rtc.peerConnection
                        .getSenders()
                        .find(s => s.track && s.track.kind === 'video');
                    
                    if (sender) {
                        await sender.replaceTrack(screenTrack);
                    }

                    callState.isScreenSharing = true;
                    shareScreenBtn.classList.add('active');

                    // Handle when user stops sharing via browser dialog
                    screenTrack.onended = async () => {
                        const videoTrack = rtc.localStream.getVideoTracks()[0];
                        if (sender && videoTrack) {
                            await sender.replaceTrack(videoTrack);
                        }
                        rtc.screenStream = null;
                        callState.isScreenSharing = false;
                        shareScreenBtn.classList.remove('active');
                        console.log('Screen sharing ended by user');
                    };

                    console.log('Screen sharing started');
                }
            } catch (error) {
                if (error.name !== 'NotAllowedError') {
                    console.error('Screen sharing error:', error);
                    alert('Failed to share screen: ' + error.message);
                }
            }
        });
    }

    // End call
    const endCallBtn = document.getElementById('endCallBtn');
    if (endCallBtn) {
        endCallBtn.addEventListener('click', () => {
            endCall();
        });
    }
});

// End call
async function endCall() {
    try {
        if (rtc.localStream) {
            rtc.localStream.getTracks().forEach(track => {
                track.stop();
            });
            rtc.localStream = null;
        }

        if (rtc.screenStream) {
            rtc.screenStream.getTracks().forEach(track => track.stop());
            rtc.screenStream = null;
        }

        if (rtc.peerConnection) {
            rtc.peerConnection.close();
            rtc.peerConnection = null;
        }

        const localVideoEl = document.getElementById('localVideo');
        if (localVideoEl) {
            localVideoEl.srcObject = null;
        }

        const remoteVideoEl = document.getElementById('remoteVideo');
        if (remoteVideoEl) {
            remoteVideoEl.srcObject = null;
        }

        // Reset call state
        callState.isInCall = false;
        callState.remoteUserID = null;
        callState.currentChannelName = null;
        callState.callStartTime = null;
        callState.isScreenSharing = false;

        // Reset UI
        switchCallState('idleState');
        const toggleAudioBtn = document.getElementById('toggleAudioBtn');
        const toggleVideoBtn = document.getElementById('toggleVideoBtn');
        const shareScreenBtn = document.getElementById('shareScreenBtn');
        
        if (toggleAudioBtn) toggleAudioBtn.classList.add('active');
        if (toggleVideoBtn) toggleVideoBtn.classList.add('active');
        if (shareScreenBtn) shareScreenBtn.classList.remove('active');
        
        const callTimer = document.getElementById('callTimer');
        if (callTimer) callTimer.textContent = '00:00';

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
        const callTimerEl = document.getElementById('callTimer');
        if (callTimerEl) {
            callTimerEl.textContent = display;
        }
    }, 1000);
}

// Switch between call states
function switchCallState(stateId) {
    document.querySelectorAll('.state').forEach(state => {
        state.classList.remove('active');
    });
    const stateEl = document.getElementById(stateId);
    if (stateEl) {
        stateEl.classList.add('active');
    }
}

// Update call status
function updateCallStatus(status) {
    const callStatusEl = document.getElementById('callStatus');
    if (callStatusEl) {
        callStatusEl.textContent = status;
    }
}

// Add call to history
function addToCallHistory(contactId, contactName, contactEmail) {
    const userId = window.currentUser?.uid || 'guest';
    let history = JSON.parse(localStorage.getItem('callHistory_' + userId) || '[]');
    
    history.push({
        id: contactId,
        name: contactName,
        email: contactEmail,
        timestamp: new Date().toISOString(),
        duration: 0
    });

    // Keep only last 20 calls
    if (history.length > 20) {
        history = history.slice(-20);
    }

    localStorage.setItem('callHistory_' + userId, JSON.stringify(history));
    if (typeof window.renderCallHistory === 'function') {
        window.renderCallHistory();
    }
    console.log('Call added to history');
}

// Export functions
window.initiateCall = initiateCall;
window.endCall = endCall;
window.switchCallState = switchCallState;
window.callState = callState;

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (callState.isInCall) {
        await endCall();
    }
});
