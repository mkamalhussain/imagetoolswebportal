"use client";

import React, { useState, useEffect } from 'react';
import { videoModules } from '@/data/videoModules';
import Link from 'next/link';

interface VideoModuleRendererProps {
  slug: string;
}

export default function VideoModuleRenderer({ slug }: VideoModuleRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const module = videoModules.find(m => m.slug === slug);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        let componentModule;

        switch (slug) {
          case 'video-trimmer':
            componentModule = await import('./VideoTrimmer');
            break;
          case 'clip-joiner':
            componentModule = await import('./ClipJoiner');
            break;
          case 'gif-maker':
            componentModule = await import('./GIFMaker');
            break;
          case 'speed-changer':
            componentModule = await import('./SpeedChanger');
            break;
          case 'subtitle-burner':
            componentModule = await import('./SubtitleBurner');
            break;
          case 'frame-grabber':
            componentModule = await import('./FrameGrabber');
            break;
          case 'audio-stripper':
            componentModule = await import('./AudioStripper');
            break;
          default:
            throw new Error(`Unknown video module: ${slug}`);
        }

        setComponent(() => componentModule.default);
      } catch (err) {
        console.error('Error loading video component:', err);
        setError(`Failed to load ${slug} component`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [slug]);

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Video Tool Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested video tool does not exist.</p>
          <Link href="/video" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Video Tools
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading {module.title}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link href="/video" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Video Tools
          </Link>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Component Not Available</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The {module.title} component is not yet implemented.</p>
          <Link href="/video" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Video Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/video" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block">
            ← Back to Video Tools
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: module.icon || '' }}>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{module.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">{module.description}</p>
            </div>
          </div>
        </div>

        {/* Google AdSense Banner */}
        <div className="w-full mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        <Component />
      </div>
    </div>
  );
}
