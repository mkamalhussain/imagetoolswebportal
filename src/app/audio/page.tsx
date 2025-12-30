import type { Metadata } from 'next';
import AudioPageClient from './AudioPageClient';

export const metadata: Metadata = {
  title: 'Audio Tools - Free Online Audio Processing & Editing | Free Tools',
  description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed adjustment, format conversion, and more. Free online audio tools with no signup required.',
  keywords: [
    'audio tools',
    'audio processing',
    'audio editor online',
    'noise remover',
    'audio converter',
    'speed changer',
    'audio mixer',
    'free audio tools',
    'online audio processor',
    'sound editing',
    'voice effects',
    'audio enhancement'
  ],
  openGraph: {
    title: 'Audio Tools - Free Online Audio Processing & Editing',
    description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed adjustment, format conversion, and more.',
    type: 'website',
    url: 'https://freetools.com/audio',
  },
  twitter: {
    card: 'summary',
    title: 'Audio Tools - Free Online Audio Processing',
    description: 'Professional audio tools for processing and editing audio files.',
  },
  alternates: {
    canonical: 'https://freetools.com/audio',
  },
};

export default function AudioPage() {
  return <AudioPageClient />;
}
