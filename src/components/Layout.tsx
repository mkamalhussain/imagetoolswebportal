import React from 'react';
import Link from 'next/link';
// import ThemeToggle from '@/components/ThemeToggle'; // Assuming ThemeToggle exists

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
      {/* Header - Visible on all pages */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 py-4 px-6 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
            <img
              src="/logo-small.svg"
              alt="FreeToolBox - Professional Online Tools"
              className="h-9 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
              🏠 Home
            </Link>
            <Link href="/how-to" className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
              📚 How To
            </Link>
            <Link href="/modules" className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
              🛠️ All Tools
            </Link>
            <Link href="/privacy" className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
              Privacy Policy
            </Link>
          </nav>
          {/* Mobile menu button - can be expanded later */}
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer - Visible on all pages */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-6 mt-auto">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo-small.svg"
                  alt="FreeToolBox.app"
                  className="h-6 w-auto"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empowering creators with free, powerful online tools for image, audio, video, and PDF processing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Home</Link></li>
                <li><Link href="/modules" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">All Tools</Link></li>
                <li><Link href="/how-to" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">How To Guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/?tab=image" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Image Tools</Link></li>
                <li><Link href="/audio" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Audio Tools</Link></li>
                <li><Link href="/video" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Video Tools</Link></li>
                <li><Link href="/pdf" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">PDF Tools</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Terms of Service</Link></li>
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} FreeToolBox.app. All rights reserved.
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-xs">GDPR Compliant</span>
                <span className="text-xs">🔒 Privacy First</span>
                <span className="text-xs">🌍 No Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
