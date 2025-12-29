import React from 'react';
import Link from 'next/link';
// import ThemeToggle from '@/components/ThemeToggle'; // Assuming ThemeToggle exists

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 py-3 px-6">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            Free Tools
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/how-to" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors font-medium">
              📚 How To
            </Link>
            <Link href="/modules" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              🛠️ All Tools
            </Link>
            <Link href="/privacy" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-screen-xl mx-auto w-full p-6 sm:p-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-6 mt-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Free Tools</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Empowering creators with free, powerful online tools for image, audio, video, and PDF processing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Home</a></li>
                <li><a href="/modules" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">All Tools</a></li>
                <li><a href="/how-to" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">How To Guides</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/?tab=image" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Image Tools</a></li>
                <li><a href="/audio" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Audio Tools</a></li>
                <li><a href="/video" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Video Tools</a></li>
                <li><a href="/pdf" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">PDF Tools</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Terms of Service</a></li>
                <li><a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">About Us</a></li>
                <li><a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Free Tools. All rights reserved.
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
