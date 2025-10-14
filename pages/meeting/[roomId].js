// pages/meeting/[roomId].js
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

let socket;

export default function MeetingPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const localVideoContainerRef = useRef(null);

  const [joined, setJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [userRole, setUserRole] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Draggable video state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVideoHidden, setIsVideoHidden] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    // Get user role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);

    // Connect to the signaling server
    socket = io("https://plag-detector-next.onrender.com");

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    });
    pcRef.current = pc;

    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
      console.log("Connection state:", pc.connectionState);
    };

    // FIXED: Proper track event handling
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStream(stream);
        setHasRemoteVideo(true);
        
        // Set up track ended listeners
        event.track.onended = () => {
          console.log("Remote track ended:", event.track.kind);
          if (event.track.kind === 'video') {
            setHasRemoteVideo(false);
          }
        };
      }
    };

    // Get user media and set up local stream
    navigator.mediaDevices
      .getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }, 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      .then((stream) => {
        console.log("Got local stream with tracks:", {
          video: stream.getVideoTracks().length,
          audio: stream.getAudioTracks().length
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
        }
        
        // Add all tracks to peer connection
        stream.getTracks().forEach((track) => {
          console.log("Adding local track:", track.kind, track.readyState);
          pc.addTrack(track, stream);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert("Could not access camera or microphone. Please check permissions.");
      });

    // Join the room
    socket.emit("join-room", roomId);
    setConnectionStatus("Joining room...");

    // Handle user joined event
    socket.on("user-joined", async (userId) => {
      console.log("User joined:", userId);
      setConnectionStatus("Creating offer...");
      
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
        setConnectionStatus("Offer sent");
      } catch (error) {
        console.error("Error creating offer:", error);
        setConnectionStatus("Error creating offer");
      }
    });

    // Handle incoming offer
    socket.on("offer", async ({ offer, from }) => {
      console.log("Received offer from:", from);
      setConnectionStatus("Received offer, creating answer...");
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
        setConnectionStatus("Answer sent");
      } catch (error) {
        console.error("Error handling offer:", error);
        setConnectionStatus("Error handling offer");
      }
    });

    // Handle incoming answer
    socket.on("answer", async ({ answer }) => {
      console.log("Received answer");
      setConnectionStatus("Received answer");
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionStatus("Connected");
      } catch (error) {
        console.error("Error handling answer:", error);
        setConnectionStatus("Error handling answer");
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    // Generate ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    // Set initial position for local video (bottom right corner)
    setPosition({ x: 20, y: 20 });

    setJoined(true);

    return () => {
      cleanupMedia();
    };
  }, [roomId]);

  // Cleanup media resources
  const cleanupMedia = () => {
    console.log("Cleaning up media resources...");
    
    // Stop transcription if active
    if (transcriptionEnabled) {
      setIsTranscribing(false);
      setTranscriptionEnabled(false);
      
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    }

    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      setLocalStream(null);
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
  };

  // Toggle video hide/show
  const toggleVideoHide = () => {
    if (isVideoHidden) {
      // Show video - return to original position
      setIsVideoHidden(false);
    } else {
      // Hide video to the right side - only show 40px
      const container = document.querySelector('.main-video-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const videoRect = localVideoContainerRef.current.getBoundingClientRect();
        
        // Position so only 40px is visible on the right edge
        const hiddenX = containerRect.width - 40;
        const currentY = position.y;
        
        setPosition({ x: hiddenX, y: currentY });
        setIsVideoHidden(true);
      }
    }
  };

  // Draggable video handlers
  const handleMouseDown = (e) => {
    if (isVideoHidden) return; // Don't allow dragging when hidden
    e.preventDefault();
    setIsDragging(true);
    const rect = localVideoContainerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleTouchStart = (e) => {
    if (isVideoHidden) return; // Don't allow dragging when hidden
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = localVideoContainerRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isVideoHidden) return;
    
    const container = document.querySelector('.main-video-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const videoRect = localVideoContainerRef.current.getBoundingClientRect();
    
    const x = Math.max(0, Math.min(
      e.clientX - dragOffset.x,
      containerRect.width - videoRect.width
    ));
    
    const y = Math.max(0, Math.min(
      e.clientY - dragOffset.y,
      containerRect.height - videoRect.height
    ));

    setPosition({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isVideoHidden) return;
    
    const touch = e.touches[0];
    const container = document.querySelector('.main-video-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const videoRect = localVideoContainerRef.current.getBoundingClientRect();
    
    const x = Math.max(0, Math.min(
      touch.clientX - dragOffset.x,
      containerRect.width - videoRect.width
    ));
    
    const y = Math.max(0, Math.min(
      touch.clientY - dragOffset.y,
      containerRect.height - videoRect.height
    ));

    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // Setup audio processing for real-time transcription
  const setupAudioProcessing = async () => {
    if (!localStream) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(localStream);
      mediaStreamSourceRef.current = source;

      // Create script processor for audio processing
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      let audioChunks = [];
      let recordingStartTime = 0;

      processor.onaudioprocess = (event) => {
        if (!isTranscribing) return;

        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 for Whisper API
        const int16Data = convertFloat32ToInt16(inputData);
        audioChunks.push(int16Data);

        // Send audio chunks every 3 seconds for near real-time
        const currentTime = Date.now();
        if (currentTime - recordingStartTime >= 3000) {
          sendAudioToWhisper(audioChunks);
          audioChunks = [];
          recordingStartTime = currentTime;
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      console.log("Audio processing setup complete");
      setIsTranscribing(true);
    } catch (error) {
      console.error("Error setting up audio processing:", error);
    }
  };

  // Convert Float32 to Int16 for Whisper API
  const convertFloat32ToInt16 = (float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  };

  // Send audio to Whisper API for real-time transcription
  const sendAudioToWhisper = async (audioChunks) => {
    try {
      // Combine audio chunks
      const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedData = new Int16Array(totalLength);
      let offset = 0;
      audioChunks.forEach(chunk => {
        combinedData.set(chunk, offset);
        offset += chunk.length;
      });

      // Convert to blob for sending to API
      const audioBlob = new Blob([combinedData.buffer], { type: 'audio/wav' });
      
      // Create FormData for Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const response = await fetch('/api/transcribe-realtime', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim()) {
          const newTranscript = data.text.trim();
          setTranscript(prev => prev + " " + newTranscript);
          
          // Send transcript to interviewer via socket in real-time
          socket.emit('transcript-update', {
            roomId,
            transcript: newTranscript,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Error sending audio to Whisper:", error);
    }
  };

  // Toggle real-time transcription
  const toggleTranscription = async () => {
    if (transcriptionEnabled) {
      // Stop transcription
      setIsTranscribing(false);
      setTranscriptionEnabled(false);
      
      // Clean up audio processing
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
      }
      
      setTranscript("");
    } else {
      // Start transcription
      setTranscriptionEnabled(true);
      await setupAudioProcessing();
    }
  };

  // Listen for transcript updates from candidate (for interviewer)
  useEffect(() => {
    if (!socket) return;

    socket.on('transcript-update', ({ transcript: newTranscript }) => {
      setTranscript(prev => prev + " " + newTranscript);
    });

    return () => {
      socket.off('transcript-update');
    };
  }, []);

  // FIXED: Update remote video when remoteStream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Setting remote video stream");
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.log("Remote video play error:", e));
    }
  }, [remoteStream]);

  // Toggle audio mute/unmute
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // End call and leave meeting - FIXED: Proper cleanup
  const endCall = async () => {
    console.log("Ending call and cleaning up...");
    
    // Clean up media resources first
    cleanupMedia();
    
    // Wait a bit for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirect to appropriate dashboard
    const role = localStorage.getItem('role');
    if (role === 'interviewer') {
      router.push('/dashboard/interviewer');
    } else if (role === 'candidate') {
      router.push('/dashboard/candidate');
    } else {
      router.push('/');
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID ${roomId} copied to clipboard!`);
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header - Compact */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === "Connected" ? "bg-green-500" : 
              connectionStatus.includes("Error") ? "bg-red-500" : "bg-yellow-500"
            }`}></div>
            <h1 className="text-lg font-semibold">Meeting Room</h1>
            <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
              {roomId}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300 capitalize">
              {userRole || 'guest'}
            </span>
            <button
              onClick={copyRoomId}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors duration-200"
            >
              <i className="fas fa-copy mr-1"></i>
              Copy ID
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden main-video-container">
        {/* Remote Video - Main Participant (Full Screen) */}
        <div className="absolute inset-0">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            className="w-full h-full object-cover"
          />
          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-3xl text-gray-400"></i>
                </div>
                <p className="text-gray-400 text-lg">Waiting for participant to join...</p>
                <p className="text-gray-500 text-sm mt-2">Share the Room ID: <strong>{roomId}</strong></p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-white text-sm">Participant</span>
          </div>
        </div>

        {/* Local Video - Draggable Overlay */}
        <div
          ref={localVideoContainerRef}
          className={`absolute w-64 h-48 md:w-80 md:h-60 bg-black rounded-xl overflow-hidden border-2 transition-all duration-300 ${
            isVideoHidden 
              ? 'border-purple-400 border-opacity-60' 
              : isDragging 
                ? 'border-blue-400 border-opacity-80' 
                : 'border-white border-opacity-20'
          } shadow-2xl ${
            isVideoHidden ? 'cursor-default opacity-80' : 'cursor-move'
          } ${isDragging ? 'scale-105 z-50' : 'scale-100 z-40'}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: `translate(0, 0) ${isDragging ? 'scale(1.05)' : 'scale(1)'}`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80">
              <i className="fas fa-video-slash text-2xl text-gray-400"></i>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded text-sm">
            You {isVideoOff && "(Video Off)"}
          </div>
          
          {/* Drag Handle - Only show when not hidden */}
          {!isVideoHidden && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
              <i className="fas fa-arrows-alt mr-1"></i>
              Drag
            </div>
          )}

          {/* Hide/Show Indicator */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
            <i className={`fas ${isVideoHidden ? 'fa-eye' : 'fa-eye-slash'} mr-1`}></i>
            {isVideoHidden ? 'Hidden' : 'Visible'}
          </div>
        </div>

        {/* Connection Status Overlay */}
        {connectionStatus !== "Connected" && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                connectionStatus === "Connected" ? "bg-green-500" : 
                connectionStatus.includes("Error") ? "bg-red-500" : "bg-yellow-500"
              }`}></div>
              <span className="text-sm">{connectionStatus}</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Panel - Collapsible */}
      {(userRole === 'interviewer' || transcriptionEnabled) && (
        <div className={`bg-gray-800 border-t border-gray-700 transition-all duration-300 ${
          showTranscript ? 'max-h-64' : 'max-h-12'
        } overflow-hidden`}>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-750 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-comment-alt text-blue-400"></i>
              <span className="font-medium">Live Transcription</span>
              {isTranscribing && (
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm">Listening...</span>
                </span>
              )}
            </div>
            <i className={`fas fa-chevron-${showTranscript ? 'up' : 'down'} text-gray-400 transition-transform duration-200`}></i>
          </button>
          
          <div className="px-4 pb-4">
            <div className="flex justify-between items-center mb-3">
              {userRole === 'candidate' && (
                <button
                  onClick={toggleTranscription}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    transcriptionEnabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  <i className={`fas ${transcriptionEnabled ? 'fa-stop' : 'fa-microphone'} mr-2`}></i>
                  {transcriptionEnabled ? 'Stop' : 'Start'} Transcription
                </button>
              )}
              <button
                onClick={clearTranscript}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors duration-200"
                disabled={!transcript}
              >
                <i className="fas fa-trash mr-2"></i>
                Clear
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 max-h-32 overflow-y-auto">
              {transcript ? (
                <p className="text-white text-sm leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  {userRole === 'candidate' 
                    ? 'Start transcription to convert your speech to text...'
                    : 'Waiting for candidate speech transcription...'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls - Fixed Bottom */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-t border-gray-700 px-6 py-4">
        <div className="flex justify-center items-center space-x-4 md:space-x-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              isAudioMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            <i className={`fas ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl mb-1`}></i>
            <span className="text-xs mt-1">{isAudioMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} text-xl mb-1`}></i>
            <span className="text-xs mt-1">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>

          {/* Hide/Show Video Toggle */}
          <button
            onClick={toggleVideoHide}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              isVideoHidden 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          >
            <i className={`fas ${isVideoHidden ? 'fa-eye' : 'fa-eye-slash'} text-xl mb-1`}></i>
            <span className="text-xs mt-1">{isVideoHidden ? 'Show' : 'Hide'}</span>
          </button>

          {/* Transcription Toggle (Candidate only) */}
          {userRole === 'candidate' && (
            <button
              onClick={toggleTranscription}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                transcriptionEnabled 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <i className={`fas ${transcriptionEnabled ? 'fa-stop' : 'fa-microphone'} text-xl mb-1`}></i>
              <span className="text-xs mt-1">{transcriptionEnabled ? 'Stop' : 'Transcribe'}</span>
            </button>
          )}

          {/* End Call - Larger and Centered */}
          <button
            onClick={endCall}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
          >
            <i className="fas fa-phone-slash text-xl mb-1"></i>
            <span className="text-xs mt-1">End Call</span>
          </button>

          {/* Transcript Toggle (Interviewer only) */}
          {userRole === 'interviewer' && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-600 hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-comment-alt text-xl mb-1"></i>
              <span className="text-xs mt-1">Transcript</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Optimization Notice */}
      <div className="lg:hidden bg-blue-900 bg-opacity-20 px-4 py-2 text-center">
        <p className="text-blue-300 text-sm">
          {isVideoHidden 
            ? "Your video is partially hidden. Click the eye button to show it fully." 
            : "Tip: Drag your video to move it or hide it to the side"}
        </p>
      </div>
    </div>
  );
}