import type { Metadata } from 'next';
import PDFPageClient from './PDFPageClient';

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Processing & Editing | Free Tools',
  description: 'Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, encryption, form filling, and more. Free online PDF tools with no signup required.',
  keywords: [
    'PDF tools',
    'PDF processing',
    'PDF editor online',
    'PDF compressor',
    'PDF merger',
    'PDF splitter',
    'PDF converter',
    'PDF password',
    'PDF form filler',
    'free PDF tools',
    'online PDF processor',
    'document tools'
  ],
  openGraph: {
    title: 'PDF Tools - Free Online PDF Processing & Editing',
    description: 'Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, encryption, form filling, and more.',
    type: 'website',
    url: 'https://freetools.com/pdf',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Tools - Free Online PDF Processing',
    description: 'Professional PDF tools for processing and editing PDF files.',
  },
  alternates: {
    canonical: 'https://freetools.com/pdf',
  },
};

export default function PDFPage() {
  return <PDFPageClient />;
}
