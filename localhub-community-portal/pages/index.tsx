import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { MessageSquare, ShoppingBag, Wrench, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    recentPosts: [],
    recentAds: [],
    recentServices: [],
  });

  useEffect(() => {
    if (token) {
      // Fetch recent content
      Promise.all([
        fetch('/api/forums/posts').then((r) => r.json()),
        fetch('/api/marketplace/ads').then((r) => r.json()),
        fetch('/api/services/list').then((r) => r.json()),
      ]).then(([posts, ads, services]) => {
        setStats({
          recentPosts: posts.posts?.slice(0, 5) || [],
          recentAds: ads.ads?.slice(0, 5) || [],
          recentServices: services.services?.slice(0, 5) || [],
        });
      });
    }
  }, [token]);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-village-primary to-village-secondary text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to LocalHub</h1>
        <p className="text-xl mb-6">
          Your hyper-local community portal connecting neighbors, friends, and local businesses.
        </p>
        {user ? (
          <div>
          <p className="text-lg">
            Welcome back, <strong>{user.fullName}</strong>!
            {user.town && <span> from {user.town}</span>}
          </p>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link href="/signup" className="btn-secondary bg-white text-village-primary">
              Join Your Community
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-village-primary">
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link href="/forums" className="card hover:shadow-lg transition-shadow">
          <MessageSquare className="w-8 h-8 text-village-primary mb-2" />
          <h3 className="font-bold text-lg">Forums</h3>
          <p className="text-gray-600 text-sm">Join discussions</p>
        </Link>
        <Link href="/chat" className="card hover:shadow-lg transition-shadow">
          <MessageSquare className="w-8 h-8 text-village-primary mb-2" />
          <h3 className="font-bold text-lg">Chat</h3>
          <p className="text-gray-600 text-sm">Real-time messaging</p>
        </Link>
        <Link href="/marketplace" className="card hover:shadow-lg transition-shadow">
          <ShoppingBag className="w-8 h-8 text-village-primary mb-2" />
          <h3 className="font-bold text-lg">Marketplace</h3>
          <p className="text-gray-600 text-sm">Buy & sell locally</p>
        </Link>
        <Link href="/services" className="card hover:shadow-lg transition-shadow">
          <Wrench className="w-8 h-8 text-village-primary mb-2" />
          <h3 className="font-bold text-lg">Services</h3>
          <p className="text-gray-600 text-sm">Find local services</p>
        </Link>
      </div>

      {/* Recent Activity */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Forum Posts</h2>
              <Link href="/forums" className="text-village-primary text-sm">View All</Link>
            </div>
            <div className="space-y-3">
              {stats.recentPosts.length > 0 ? (
                stats.recentPosts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/forums/post/${post.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <h3 className="font-semibold text-sm">{post.title}</h3>
                    <p className="text-xs text-gray-500">
                      by {post.authorName} • {new Date(post.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent posts</p>
              )}
            </div>
          </div>

          {/* Recent Ads */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Marketplace Ads</h2>
              <Link href="/marketplace" className="text-village-primary text-sm">View All</Link>
            </div>
            <div className="space-y-3">
              {stats.recentAds.length > 0 ? (
                stats.recentAds.map((ad: any) => (
                  <Link
                    key={ad.id}
                    href={`/marketplace/ad/${ad.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <h3 className="font-semibold text-sm">{ad.title}</h3>
                    <p className="text-xs text-gray-500">
                      ${(ad.price / 100).toFixed(2)} • {ad.category}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent ads</p>
              )}
            </div>
          </div>

          {/* Recent Services */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Services</h2>
              <Link href="/services" className="text-village-primary text-sm">View All</Link>
            </div>
            <div className="space-y-3">
              {stats.recentServices.length > 0 ? (
                stats.recentServices.map((service: any) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <h3 className="font-semibold text-sm">{service.title}</h3>
                    <p className="text-xs text-gray-500">
                      {service.category} • {service.averageRating > 0 ? `⭐ ${service.averageRating.toFixed(1)}` : 'New'}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent services</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Info */}
      {!user && (
        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Why LocalHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Verified Identities</h3>
              <p className="text-gray-600">
                All members are verified residents, building trust in your local community.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Real Connections</h3>
              <p className="text-gray-600">
                Connect with neighbors, local businesses, and community members in your area.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your data stays local. No external tracking, no third-party sharing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

