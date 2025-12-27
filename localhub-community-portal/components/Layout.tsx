import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthContext';
import { Home, MessageSquare, ShoppingBag, Wrench, User, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/forums', icon: MessageSquare, label: 'Forums' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { href: '/services', icon: Wrench, label: 'Services' },
  ];

  return (
    <div className="min-h-screen bg-village-light">
      {/* Header */}
      <header className="bg-village-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-village-accent rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-village-dark" />
              </div>
              <span className="text-xl font-bold">LocalHub</span>
            </Link>

            <nav className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-village-accent text-village-dark' : 'hover:bg-village-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}

              {user ? (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-village-accent">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-village-secondary"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.fullName}</span>
                    {user.isVerified && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-lg hover:bg-village-secondary"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-lg hover:bg-village-secondary"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-village-accent">
                  <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-village-secondary">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-secondary">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-village-dark text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p>&copy; 2024 LocalHub Community Portal. Building real-world connections.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

