import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/');
      return;
    }

    fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/pending', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number, action: 'approve' | 'reject', notes?: string) => {
    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, action, notes }),
      });

      if (res.ok) {
        fetchPendingUsers();
      } else {
        alert('Failed to process request');
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Error processing request');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users" className="card hover:shadow-lg">
          <h2 className="text-xl font-bold mb-2">User Management</h2>
          <p className="text-gray-600">Approve pending users</p>
        </Link>
        <Link href="/admin/communities" className="card hover:shadow-lg">
          <h2 className="text-xl font-bold mb-2">Communities</h2>
          <p className="text-gray-600">Manage villages, cities, countries</p>
        </Link>
        <Link href="/admin/moderation" className="card hover:shadow-lg">
          <h2 className="text-xl font-bold mb-2">Content Moderation</h2>
          <p className="text-gray-600">Review flagged content</p>
        </Link>
      </div>

      {/* Pending Users */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
        
        {loading ? (
          <p>Loading...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-gray-500">No pending users</p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{pendingUser.fullName}</h3>
                    <p className="text-gray-600">{pendingUser.email}</p>
                    <p className="text-sm text-gray-500">
                      {pendingUser.town}, {pendingUser.city}, {pendingUser.country}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Signed up: {new Date(pendingUser.createdAt * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(pendingUser.id, 'approve')}
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Rejection reason (optional):');
                        handleApprove(pendingUser.id, 'reject', notes || undefined);
                      }}
                      className="btn-primary bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                {pendingUser.proofOfResidence && (
                  <div className="mt-2">
                    <a
                      href={pendingUser.proofOfResidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-village-primary text-sm"
                    >
                      View Proof of Residence
                    </a>
                  </div>
                )}
                {pendingUser.identityProof && (
                  <div className="mt-1">
                    <a
                      href={pendingUser.identityProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-village-primary text-sm"
                    >
                      View Identity Proof
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

