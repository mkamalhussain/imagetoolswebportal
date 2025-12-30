import type { Metadata } from 'next';
import ModulesClient from './ModulesClient';

export const metadata: Metadata = {
  title: 'All Tools - Complete Collection of Free Online Tools | Free Tools',
  description: 'Browse our complete collection of 50+ free online tools for image editing, audio processing, video editing, and PDF manipulation. No signup required, privacy-first approach.',
  keywords: [
    'all online tools',
    'free tools collection',
    'image tools list',
    'audio tools directory',
    'video tools collection',
    'PDF tools overview',
    'online tool directory',
    'free software tools',
    'web tools collection',
    'image editor',
    'photo tools',
    'audio processor',
    'video editor'
  ],
  openGraph: {
    title: 'All Tools - Complete Collection of Free Online Tools',
    description: 'Browse 50+ free online tools for creative work. Image editing, audio processing, video editing, PDF tools, and more.',
    images: [
      {
        url: '/og-all-tools.png',
        width: 1200,
        height: 630,
        alt: 'All Tools Collection - Free Online Image, Audio, Video & PDF Tools',
      },
    ],
    type: 'website',
    url: 'https://freetools.com/modules',
  },
  twitter: {
    title: 'All Tools - Complete Collection of Free Online Tools',
    description: 'Browse 50+ free online tools for creative work. No signup, no limits.',
    images: ['/og-all-tools.png'],
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://freetools.com/modules',
  },
};

export default function AllToolsPage() {
  return <ModulesClient />;
}