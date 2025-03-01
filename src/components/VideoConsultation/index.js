import React, { useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import './index.css';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhone, FaThermometer } from 'react-icons/fa';
import supabase from '../../lib/supabase';

const VideoConsultation = () => {
    const { meeting_id } = useParams();
    const history = useHistory();
    const isDoctor = false; // Explicitly set for patient's component

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    // State
    const [localStream, setLocalStream] = useState(null);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [appointmentDetails, setAppointmentDetails] = useState({
        temperature: null
    });

    const createPeerConnection = () => {
        console.log('Patient: Creating peer connection');
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'webrtc@live.com',
                    credential: 'muazkh'
                }
            ]
        });

        if (localStreamRef.current) {
            console.log('Patient: Adding local tracks to peer connection');
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        pc.ontrack = (event) => {
            console.log('Patient: Received remote track');
            if (remoteVideoRef.current && event.streams[0]) {
                console.log('Patient: Setting remote video stream');
                remoteVideoRef.current.srcObject = event.streams[0];
                setIsConnected(true);
                setConnectionStatus('Connected');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Patient: Sending ICE candidate');
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    meeting_id
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('Patient ICE connection state:', pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log('Patient connection state:', pc.connectionState);
        };

        return pc;
    };

    useEffect(() => {
        const init = async () => {
            try {
                console.log('Patient: Initializing media stream');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socketRef.current = io('https://backend-diagno-1.onrender.com');

                socketRef.current.on('connect', () => {
                    console.log('Patient: Socket connected');
                    socketRef.current.emit('join-room', {
                        meeting_id,
                        role: 'Patient'
                    });
                });

                socketRef.current.on('offer', async ({ offer }) => {
                    console.log('Patient: Received offer');
                    if (!peerConnectionRef.current) {
                        peerConnectionRef.current = createPeerConnection();
                    }

                    try {
                        await peerConnectionRef.current.setRemoteDescription(
                            new RTCSessionDescription(offer)
                        );
                        
                        const answer = await peerConnectionRef.current.createAnswer();
                        await peerConnectionRef.current.setLocalDescription(answer);
                        
                        console.log('Patient: Sending answer');
                        socketRef.current.emit('answer', {
                            answer,
                            meeting_id
                        });
                    } catch (err) {
                        console.error('Patient: Error handling offer:', err);
                    }
                });

                socketRef.current.on('ice-candidate', async ({ candidate }) => {
                    console.log('Patient: Received ICE candidate');
                    if (peerConnectionRef.current) {
                        try {
                            await peerConnectionRef.current.addIceCandidate(
                                new RTCIceCandidate(candidate)
                            );
                            console.log('Patient: Added ICE candidate success');
                        } catch (err) {
                            console.error('Patient: Error adding ICE candidate:', err);
                        }
                    }
                });

            } catch (err) {
                console.error('Patient: Initialization error:', err);
                setError(err.message);
            }
        };

        const fetchAppointmentDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('meeting_id', meeting_id)
                    .single();

                if (error) throw error;

                if (data) {
                    setAppointmentDetails(data);
                }
            } catch (err) {
                console.error('Error fetching appointment details:', err);
            }
        };

        init();
        fetchAppointmentDetails();

        return () => {
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
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        history.push('/');
    };

    if (error) {
        return (
            <div className="video-consultation-container error-state">
                <div className="error-container">
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button className="end-call" onClick={() => history.push('/')}>
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="video-consultation-container">
            <div className="consultation-header">
                <div className="consultation-info">
                    <h2>Patient Consultation</h2>
                    <div className="consultation-status">
                        <div className="status-indicator"></div>
                        <span>{connectionStatus}</span>
                    </div>
                </div>
                <div className="meeting-id">
                    Meeting ID: {meeting_id}
                </div>
            </div>

            <div className="video-grid">
                <div className="main-video-container">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="remote-video"
                    />
                    <div className="vital-signs-overlay">
                        <div className="temperature-display">
                            <FaThermometer className="temp-icon" />
                            <span>{appointmentDetails.temperature ? `${appointmentDetails.temperature}°C` : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="local-video-container">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="local-video"
                    />
                </div>
            </div>

            <div className="controls">
                <button 
                    className="control-button mic-button"
                    onClick={toggleMute}
                >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button 
                    className="control-button camera-button"
                    onClick={toggleVideo}
                >
                    {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
                <button className="control-button end-call" onClick={handleEndCall}>
                    <FaPhone style={{ transform: 'rotate(135deg)' }} />
                </button>
            </div>
        </div>
    );
};

export default VideoConsultation;