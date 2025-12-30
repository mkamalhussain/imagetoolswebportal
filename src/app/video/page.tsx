import type { Metadata } from 'next';
import VideoPageClient from './VideoPageClient';

export const metadata: Metadata = {
  title: 'Video Tools - Free Online Video Processing & Editing | Free Tools',
  description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, and more. Free online video tools with no signup required.',
  keywords: [
    'video tools',
    'video processing',
    'video editor online',
    'video trimmer',
    'GIF maker',
    'video converter',
    'frame grabber',
    'subtitle burner',
    'free video tools',
    'online video processor'
  ],
  openGraph: {
    title: 'Video Tools - Free Online Video Processing & Editing',
    description: 'Professional video tools for processing, editing, and enhancing video files. No signup required.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Video Tools - Free Online Video Processing',
    description: 'Professional video tools for processing and editing video files.',
  },
};

export default function VideoPage() {
  return <VideoPageClient />;
}
