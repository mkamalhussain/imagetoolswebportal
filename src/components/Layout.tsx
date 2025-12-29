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
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6 mt-12">
        <div className="max-w-screen-xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Free Tools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
