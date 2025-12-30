import type { Metadata } from 'next';
import HowToClient from './HowToClient';

export const metadata: Metadata = {
  title: 'How To Guides - Step-by-Step Tutorials for All Tools | Free Tools',
  description: 'Complete step-by-step guides and tutorials for using our free online tools. Learn how to edit images, process audio, edit videos, and manipulate PDFs with detailed instructions and visual examples.',
  keywords: [
    'how to guides',
    'tutorials online',
    'tool instructions',
    'step by step guides',
    'image editing tutorial',
    'video editing guide',
    'audio processing tutorial',
    'PDF tools guide',
    'free tool tutorials',
    'online tool help',
    'user manual',
    'tool documentation'
  ],
  openGraph: {
    title: 'How To Guides - Step-by-Step Tutorials for All Tools',
    description: 'Learn how to use our free online tools with detailed step-by-step guides and visual examples.',
    images: [
      {
        url: '/og-how-to.png',
        width: 1200,
        height: 630,
        alt: 'How To Guides - Step-by-Step Tutorials for Free Online Tools',
      },
    ],
    type: 'website',
    url: 'https://freetools.com/how-to',
  },
  twitter: {
    title: 'How To Guides - Step-by-Step Tutorials for All Tools',
    description: 'Learn how to use our free online tools with detailed guides and visual examples.',
    images: ['/og-how-to.png'],
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://freetools.com/how-to',
  },
};

export default function HowToPage() {
  return <HowToClient />;
}