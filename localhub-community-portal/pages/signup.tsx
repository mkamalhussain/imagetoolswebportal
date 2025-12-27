import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    townId: '',
  });
  const [towns, setTowns] = useState<any[]>([]);
  const [proofOfResidence, setProofOfResidence] = useState<File | null>(null);
  const [identityProof, setIdentityProof] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch towns directly (simplified for now)
    fetchTowns();
  }, []);

  const fetchTowns = async () => {
    try {
      // For now, fetch all towns directly (assuming cityId=1 for Sample City)
      const res = await fetch('/api/communities/towns?cityId=1');
      if (res.ok) {
        const data = await res.json();
        setTowns(data.towns || []);
      } else {
        console.error('Failed to fetch towns, trying fallback...');
        // Fallback: create some sample towns for testing
        setTowns([
          { id: 1, name: 'North Town', description: 'Sample town' },
          { id: 2, name: 'South Town', description: 'Sample town' },
          { id: 3, name: 'East Town', description: 'Sample town' },
          { id: 4, name: 'West Town', description: 'Sample town' },
          { id: 5, name: 'Central Town', description: 'Sample town' },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch towns:', error);
      // Fallback: create some sample towns for testing
      setTowns([
        { id: 1, name: 'North Town', description: 'Sample town' },
        { id: 2, name: 'South Town', description: 'Sample town' },
        { id: 3, name: 'East Town', description: 'Sample town' },
        { id: 4, name: 'West Town', description: 'Sample town' },
        { id: 5, name: 'Central Town', description: 'Sample town' },
      ]);
    }
  };

  const handleFileChange = (setter: (file: File | null) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      let proofBase64 = null;
      let identityBase64 = null;

      if (proofOfResidence) {
        proofBase64 = await fileToBase64(proofOfResidence);
        // Remove data URL prefix
        proofBase64 = proofBase64.split(',')[1];
      }

      if (identityProof) {
        identityBase64 = await fileToBase64(identityProof);
        identityBase64 = identityBase64.split(',')[1];
      }

      await signup({
        ...formData,
        townId: Number(formData.townId),
        proofOfResidence: proofBase64 || undefined,
        identityProof: identityBase64 || undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto card">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Account Created!</h1>
        <p className="mb-4">
          Your account has been created successfully. An admin will review your verification documents
          and approve your account soon.
        </p>
        <Link href="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Join LocalHub</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password *
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="input-field"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="townId" className="block text-sm font-medium mb-1">
            Your Town *
          </label>
          <select
            id="townId"
            value={formData.townId}
            onChange={(e) => setFormData({ ...formData, townId: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Select your town</option>
            {towns.map((town) => (
              <option key={town.id} value={town.id}>
                {town.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="proofOfResidence" className="block text-sm font-medium mb-1">
            Proof of Residence (PDF/Image) *
          </label>
          <input
            id="proofOfResidence"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange(setProofOfResidence)}
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a utility bill, ID, or other proof of residence
          </p>
        </div>

        <div>
          <label htmlFor="identityProof" className="block text-sm font-medium mb-1">
            Identity Proof (PDF/Image) *
          </label>
          <input
            id="identityProof"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange(setIdentityProof)}
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a government-issued ID
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-village-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

