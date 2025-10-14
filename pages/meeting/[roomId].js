import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MeetingRoom() {
  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    if (roomId) {
      console.log(`Joined room: ${roomId}`);
    }
  }, [roomId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold">
        Welcome to Meeting Room: {roomId}
      </h1>
    </div>
  );
}
