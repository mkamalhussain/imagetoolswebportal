"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
// import ThemeToggle from '@/components/ThemeToggle'; // Assuming ThemeToggle exists
import { modules } from '@/data/modules';
import { audioModules } from '@/data/audioModules';
import { videoModules } from '@/data/videoModules';
import { pdfModules } from '@/data/pdfModules';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Combine all tools for search
  const allTools = useMemo(() => {
    return [
      ...modules.map(tool => ({ ...tool, category: 'image', categorySlug: 'modules' })),
      ...audioModules.map(tool => ({ ...tool, category: 'audio', categorySlug: 'audio' })),
      ...videoModules.map(tool => ({ ...tool, category: 'video', categorySlug: 'video' })),
      ...pdfModules.map(tool => ({ ...tool, category: 'pdf', categorySlug: 'pdf' })),
    ];
  }, [modules, audioModules, videoModules, pdfModules]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = allTools.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.slug.toLowerCase().includes(query)
    ).slice(0, 8); // Limit to 8 results

    return results;
  }, [searchQuery, allTools, modules, audioModules, videoModules, pdfModules]);

  const navigationItems = [
    {
      name: 'Image',
      href: '/modules',
      featured: [
        { name: 'Background Remover', href: '/modules/image-background-changer', icon: '🎨' },
        { name: 'Resize Image', href: '/modules/image-resizer', icon: '📐' },
        { name: 'Compress Image', href: '/modules/image-compressor', icon: '🗜️' },
        { name: 'Remove Watermark', href: '/modules/watermark-remover', icon: '🚫' },
      ],
      other: [
        { name: 'GIF Maker', href: '/modules/animated-gif-maker', icon: '🎬' },
        { name: 'Color Palette', href: '/modules/color-palette-extractor', icon: '🎨' },
        { name: 'QR Code Tool', href: '/modules/qr-code-tool', icon: '📱' },
        { name: 'Meme Generator', href: '/modules/meme-generator', icon: '😂' },
        { name: 'ASCII Art', href: '/modules/image-ascii-art-converter', icon: '🔤' },
        { name: 'All Image Tools', href: '/modules', icon: '🖼️' },
      ]
    },
    {
      name: 'Audio',
      href: '/audio',
      featured: [
        { name: 'Noise Cleaner', href: '/audio/noise-cleaner', icon: '🎵' },
        { name: 'Speed Changer', href: '/audio/speed-pitch-adjuster', icon: '⚡' },
        { name: 'Multi-Track Mixer', href: '/audio/multi-track-mixer', icon: '🎛️' },
      ],
      other: [
        { name: 'Podcast Cutter', href: '/audio/podcast-clip-cutter', icon: '🎙️' },
        { name: 'Tag Editor', href: '/audio/tag-editor-pro', icon: '🏷️' },
        { name: 'Waveform Generator', href: '/audio/waveform-generator', icon: '📊' },
        { name: 'Voice Transcriber', href: '/audio/voice-memo-transcriber', icon: '🎤' },
        { name: 'All Audio Tools', href: '/audio', icon: '🎵' },
      ]
    },
    {
      name: 'Video',
      href: '/video',
      featured: [
        { name: 'Video Trimmer', href: '/video/video-trimmer', icon: '✂️' },
        { name: 'GIF Maker', href: '/video/gif-maker', icon: '🎬' },
        { name: 'Clip Joiner', href: '/video/clip-joiner', icon: '🔗' },
      ],
      other: [
        { name: 'Speed Changer', href: '/video/speed-changer', icon: '⚡' },
        { name: 'Subtitle Burner', href: '/video/subtitle-burner', icon: '📝' },
        { name: 'Frame Grabber', href: '/video/frame-grabber', icon: '📸' },
        { name: 'Audio Stripper', href: '/video/audio-stripper', icon: '🔊' },
        { name: 'All Video Tools', href: '/video', icon: '🎬' },
      ]
    },
    {
      name: 'PDF',
      href: '/pdf',
      featured: [
        { name: 'PDF Compressor', href: '/pdf/pdf-compressor', icon: '🗜️' },
        { name: 'PDF Merger', href: '/pdf/pdf-merger', icon: '🔗' },
        { name: 'PDF Editor', href: '/pdf/pdf-editor', icon: '✏️' },
      ],
      other: [
        { name: 'PDF Splitter', href: '/pdf/pdf-splitter', icon: '✂️' },
        { name: 'Text to PDF', href: '/pdf/text-to-pdf', icon: '📄' },
        { name: 'PDF Password', href: '/pdf/pdf-password', icon: '🔒' },
        { name: 'PDF Form Filler', href: '/pdf/pdf-form-filler', icon: '📝' },
        { name: 'PDF Text Extractor', href: '/pdf/pdf-text-extractor', icon: '📖' },
        { name: 'All PDF Tools', href: '/pdf', icon: '📄' },
      ]
    },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
      {/* Header - Visible on all pages */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
              <img
                src="/logo-small.svg"
                alt="FreeToolBox - Professional Online Tools"
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Home Link */}
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-200">
                🏠 Home
              </Link>

              {/* Category Dropdowns */}
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center gap-1">
                    {item.name}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-3 z-50">
                      <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                          Featured Tools
                        </h3>
                      </div>
                      <div className="px-4 py-2 space-y-1">
                        {item.featured.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <span className="text-base">{tool.icon}</span>
                            <span>{tool.name}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="px-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                          Other Tools
                        </h3>
                      </div>
                      <div className="px-4 py-2 space-y-1">
                        {item.other.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <span className="text-base">{tool.icon}</span>
                            <span>{tool.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* How To Link */}
              <Link href="/how-to" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-200">
                📚 How To
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-48 pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Search Results Dropdown */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-[9999]">
                    {searchResults.map((tool) => (
                      <Link
                        key={`${tool.categorySlug}/${tool.slug}`}
                        href={`/${tool.categorySlug}/${tool.slug}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        onClick={() => {
                          setSearchQuery('');
                        }}
                      >
                        {tool.icon ? (
                          <span 
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6"
                            dangerouslySetInnerHTML={{ __html: tool.icon }}
                          />
                        ) : (
                          <span className="text-base">🔧</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {tool.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {tool.category} Tool
                          </div>
                        </div>
                      </Link>
                    ))}
                    {searchResults.length >= 8 && (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-100 dark:border-gray-600">
                        Showing top 8 results
                      </div>
                    )}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      No tools found for "{searchQuery}"
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const newTheme = !isDarkMode;
                  setIsDarkMode(newTheme);
                  document.documentElement.classList.toggle('dark', newTheme);
                  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'FreeToolBox.app - Professional Online Tools',
                      text: 'Discover 50+ free online tools for image, audio, video, and PDF processing. No signup required!',
                      url: window.location.href,
                    });
                  } else {
                    // Fallback: copy URL to clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      // Could add a toast notification here
                      alert('Link copied to clipboard!');
                    });
                  }
                }}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="Share FreeToolBox.app"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>

              {/* Mobile menu button */}
              <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
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
