import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Forums() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPosts();
      // Fetch categories would go here
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forums/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card">
        <p>Please login to view forums.</p>
        <Link href="/login" className="btn-primary mt-4">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community Forums</h1>
        <Link href="/forums/create" className="btn-primary">
          Create Post
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/forums/post/${post.id}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 line-clamp-2">{post.content}</p>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                    <span>by {post.authorName}</span>
                    <span>•</span>
                    <span>{post.townName}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-village-primary font-bold">{post.likes} likes</div>
                  <div className="text-sm text-gray-500">{post.views} views</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

