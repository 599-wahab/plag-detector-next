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

  useEffect(() => {
    if (!roomId) return;

    // Connect to the signaling server
    socket = io("https://plag-detector-next.onrender.com"); // <-- your Render URL

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      });

    socket.emit("join-room", roomId);

    socket.on("user-joined", async (userId) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async ({ offer, from }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error(err);
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    setJoined(true);

    return () => {
      socket.disconnect();
      pc.close();
    };
  }, [roomId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="mb-4 text-xl">Meeting Room: {roomId}</h2>
      <div className="flex space-x-4">
        <video ref={localVideoRef} autoPlay muted className="w-80 h-60 bg-black rounded" />
        <video ref={remoteVideoRef} autoPlay className="w-80 h-60 bg-black rounded" />
      </div>
    </div>
  );
}
