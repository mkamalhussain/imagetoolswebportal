import type { Metadata } from 'next';
import PDFPageClient from './PDFPageClient';

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Processing & Editing | Free Tools',
  description: 'Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, encryption, and more. Free online PDF tools with no signup required.',
  keywords: [
    'PDF tools',
    'PDF processing',
    'PDF editor online',
    'PDF compressor',
    'PDF merger',
    'PDF splitter',
    'PDF converter',
    'free PDF tools',
    'online PDF processor'
  ],
  openGraph: {
    title: 'PDF Tools - Free Online PDF Processing & Editing',
    description: 'Professional PDF tools for processing, editing, and manipulating PDF files. No signup required.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Tools - Free Online PDF Processing',
    description: 'Professional PDF tools for processing and editing PDF files.',
  },
};

export default function PDFPage() {
  return <PDFPageClient />;
}
