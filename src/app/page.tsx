import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Free Online Tools - Image, Audio, Video & PDF Processing | No Signup Required',
  description: 'Access 50+ free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools.',
  keywords: [
    'free online tools',
    'image editor online',
    'photo editing free',
    'audio tools online',
    'video editor free',
    'PDF tools online',
    'GIF maker online',
    'noise remover online',
    'video trimmer online',
    'PDF merger free',
    'image converter online',
    'free photo editor',
    'online audio processor',
    'free video tools',
    'PDF editor online',
    'image optimization',
    'audio cleaning',
    'video processing',
    'document tools',
    'image resizer',
    'background remover',
    'meme generator'
  ],
  openGraph: {
    title: 'Free Online Tools - Professional Image, Audio, Video & PDF Processing',
    description: '50+ free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required.',
    images: [
      {
        url: '/og-homepage.png',
        width: 1200,
        height: 630,
        alt: 'Free Tools Homepage - Online Image, Audio, Video & PDF Tools',
      },
    ],
    type: 'website',
  },
  twitter: {
    title: 'Free Online Tools - Image, Audio, Video & PDF Processing',
    description: '50+ free online tools for creative work. No signup, no limits, privacy-first.',
    images: ['/og-homepage.png'],
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://freetools.com',
  },
};

export default function Home() {
  return <HomeClient />;
}