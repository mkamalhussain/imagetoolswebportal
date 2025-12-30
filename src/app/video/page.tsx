import type { Metadata } from 'next';
import VideoPageClient from './VideoPageClient';

export const metadata: Metadata = {
  title: 'Video Tools - Free Online Video Processing & Editing | Free Tools',
  description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, and more. Free online video tools with no signup required.',
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
    'online video processor',
    'video editing',
    'clip joiner'
  ],
  openGraph: {
    title: 'Video Tools - Free Online Video Processing & Editing',
    description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, and more.',
    type: 'website',
    url: 'https://freetools.com/video',
  },
  twitter: {
    card: 'summary',
    title: 'Video Tools - Free Online Video Processing',
    description: 'Professional video tools for processing and editing video files.',
  },
  alternates: {
    canonical: 'https://freetools.com/video',
  },
};

export default function VideoPage() {
  return <VideoPageClient />;
}
