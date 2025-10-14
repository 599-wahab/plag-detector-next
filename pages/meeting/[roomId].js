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

  const [joined, setJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [userRole, setUserRole] = useState(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

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
        video: true, 
        audio: true 
      })
      .then((stream) => {
        console.log("Got local stream with tracks:", {
          video: stream.getVideoTracks().length,
          audio: stream.getAudioTracks().length
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Force play the video
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
        // FIXED: Create offer with proper media directions
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
        // FIXED: Create answer with proper media directions
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

    setJoined(true);

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  // FIXED: Update remote video when remoteStream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Setting remote video stream");
      remoteVideoRef.current.srcObject = remoteStream;
      // Force play the remote video
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

  // End call and leave meeting - redirect to appropriate dashboard
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (socket) {
      socket.disconnect();
    }

    // Redirect to appropriate dashboard based on user role
    const role = localStorage.getItem('role');
    if (role === 'interviewer') {
      router.push('/dashboard/interviewer');
    } else if (role === 'candidate') {
      router.push('/dashboard/candidate');
    } else {
      // Fallback to home if no role found
      router.push('/');
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert(`Room ID ${roomId} copied to clipboard!`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="w-full max-w-6xl mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Meeting Room: {roomId}</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              connectionStatus === "Connected" ? "bg-green-500" : 
              connectionStatus.includes("Error") ? "bg-red-500" : "bg-yellow-500"
            }`}>
              {connectionStatus}
            </span>
            <button
              onClick={copyRoomId}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm transition-colors"
            >
              <i className="fas fa-copy mr-1"></i>
              Copy ID
            </button>
            <span className="text-sm text-gray-300">
              ({userRole || 'Guest'})
            </span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-6xl mb-4">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-64 lg:h-96 object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            You {isVideoOff && "(Video Off)"}
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <i className="fas fa-video-slash text-4xl text-gray-400"></i>
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            className="w-full h-64 lg:h-96 object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            Participant
          </div>
          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <i className="fas fa-user text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-400">Waiting for participant to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all duration-300 ${
            isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          <i className={`fas ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all duration-300 ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'} text-xl`}></i>
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300"
        >
          <i className="fas fa-phone-slash text-xl"></i>
        </button>
      </div>

      {/* Status Info */}
      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>Share the Room ID with others to let them join: <strong>{roomId}</strong></p>
        <p className="mt-1">You will be redirected to your {userRole} dashboard when the call ends.</p>
      </div>

      {/* Debug Info */}
      <div className="mt-2 text-center text-xs text-gray-500">
        <p>Local: {localStream ? `${localStream.getVideoTracks().length} video, ${localStream.getAudioTracks().length} audio tracks` : 'No stream'}</p>
        <p>Remote: {remoteStream ? `${remoteStream.getVideoTracks().length} video, ${remoteStream.getAudioTracks().length} audio tracks` : 'No stream'}</p>
      </div>
    </div>
  );
}