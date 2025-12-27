import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Chat() {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card">
        <p>Please login to access chat.</p>
        <Link href="/login" className="btn-primary mt-4">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Chat Rooms</h1>

      {loading ? (
        <p>Loading...</p>
      ) : rooms.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">No chat rooms available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/chat/${room.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <h3 className="font-bold text-lg mb-2">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{room.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{room.townName || 'Public'}</span>
                <span className="text-xs px-2 py-1 bg-village-accent rounded">
                  {room.type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 card">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Real-time chat requires Socket.io server setup. 
          See README for Socket.io integration instructions.
        </p>
      </div>
    </div>
  );
}

