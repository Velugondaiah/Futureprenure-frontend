import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone } from 'react-icons/fa';
import './index.css';
const API_URL = process.env.REACT_APP_API_URL;

const VideoRoom = () => {
    const { meeting_id } = useParams();
    const history = useHistory();
    const isDoctor = true; // Explicitly set for doctor's component

    // Refs
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [error, setError] = useState(null);

    const createPeerConnection = () => {
        console.log('Creating peer connection');
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });

        // Add local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                console.log('Adding track to peer connection');
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate');
                socketRef.current?.emit('ice-candidate', {
                    candidate: event.candidate,
                    meeting_id
                });
            }
        };

        pc.onconnectionstatechange = (event) => {
            console.log('Connection state changed:', pc.connectionState);
            switch(pc.connectionState) {
                case 'connected':
                    setConnectionStatus('Connected');
                    break;
                case 'disconnected':
                    setConnectionStatus('Disconnected');
                    break;
                case 'failed':
                    setConnectionStatus('Connection failed');
                    break;
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track');
            if (remoteVideoRef.current && event.streams[0]) {
                console.log('Setting remote video stream');
                remoteVideoRef.current.srcObject = event.streams[0];
                setConnectionStatus('Connected');
            }
        };

        return pc;
    };

    const initiateCall = async () => {
        try {
            console.log('Initiating call');
            if (!peerConnectionRef.current) {
                peerConnectionRef.current = createPeerConnection();
            }
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            console.log('Sending offer');
            socketRef.current.emit('offer', { offer, meeting_id });
            setConnectionStatus('Waiting for patient to accept...');
        } catch (err) {
            console.error('Error initiating call:', err);
            setError('Failed to initiate call');
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                console.log('Initializing doctor component');
                // Get local stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                console.log('Got local stream');
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Connect to signaling server
                socketRef.current = io(`${API_URL}`);

                socketRef.current.on('connect', () => {
                    console.log('Doctor connecting to room:', meeting_id);
                    socketRef.current.emit('join-room', {
                        meeting_id,
                        role: 'Doctor'
                    });
                });

                socketRef.current.on('user-connected', async ({ userId, role }) => {
                    console.log('User connected:', { userId, role });
                    if (role === 'Patient') {
                        try {
                            peerConnectionRef.current = createPeerConnection();
                            const offer = await peerConnectionRef.current.createOffer();
                            await peerConnectionRef.current.setLocalDescription(offer);
                            
                            console.log('Sending offer to patient');
                            socketRef.current.emit('offer', {
                                offer,
                                meeting_id
                            });
                        } catch (err) {
                            console.error('Error creating offer:', err);
                            setError('Failed to create offer');
                        }
                    }
                });

                socketRef.current.on('answer', async ({ answer, from }) => {
                    console.log('Received answer from patient:', from);
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.setRemoteDescription(
                                new RTCSessionDescription(answer)
                            );
                            setConnectionStatus('Connected');
                        } catch (err) {
                            console.error('Error setting remote description:', err);
                            setError('Failed to establish connection');
                        }
                    }
                });

            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message);
            }
        };

        init();

        return () => {
            console.log('Cleaning up');
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [meeting_id]);

    // Control functions
    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
    };

    return (
        <div className="video-room">
            <div className="status-bar">
                <h2>Doctor Consultation</h2>
                <p>{connectionStatus}</p>
                <p>Meeting ID: {meeting_id}</p>
            </div>
            
            <div className="video-container">
                <div className="remote-video-wrapper">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="remote-video"
                    />
                    {connectionStatus !== 'Connected' && (
                        <div className="waiting-overlay">
                            <p>{connectionStatus}</p>
                        </div>
                    )}
                </div>
                <div className="local-video-wrapper">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="local-video"
                    />
                </div>
            </div>

            {error && (
                <div className="error-overlay">
                    <div className="error-content">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoRoom; 