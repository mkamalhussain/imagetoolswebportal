import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Marketplace() {
  const { token } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });

  useEffect(() => {
    if (token) {
      fetchAds();
    }
  }, [token, filters]);

  const fetchAds = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/marketplace/ads?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card">
        <p>Please login to view marketplace.</p>
        <Link href="/login" className="btn-primary mt-4">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Link href="/marketplace/create" className="btn-primary">
          Post Ad
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input-field"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : ads.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">No ads found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Link
              key={ad.id}
              href={`/marketplace/ad/${ad.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className={`${ad.isPremium ? 'bg-yellow-100 border-2 border-yellow-400' : ''} p-4 rounded-lg`}>
                <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ad.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-village-primary font-bold text-xl">
                    ${(ad.price / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">{ad.category}</span>
                </div>
                    <p className="text-xs text-gray-500 mt-2">by {ad.sellerName} • {ad.townName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

