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
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.613.764-3.805A9.697 9.697 0 0112 2.25c.83 0 1.637.156 2.399.445m0 0a1.246 1.246 0 000 1.554 12.035 12.035 0 01-1.38 3.01c-2.07 2.676-4.686 4.697-7.247 6.362C3.414 15.541 2.25 17.151 2.25 19.109v1.291m12.75-15l-1.38 3.01A12.035 12.035 0 0112 9.75c-2.676 0-5.227-.887-7.366-2.522L2.25 4.5m12.75 11.551v-.75a3.75 3.75 0 00-3.75-3.75H9.75m3.75 8.25v-.75" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M3.75 18H7.5m-3-6h15m-15 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M9.75 12H7.5" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button className="btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Sign In</button>
          </div>
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
