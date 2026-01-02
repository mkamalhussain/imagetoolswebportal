import type { Metadata } from 'next';
import PDFPageClient from './PDFPageClient';

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Processing & Editing | FreeToolBox.app',
  description: 'Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, encryption, form filling, text extraction, and more. Free online PDF tools with no signup required.',
  keywords: [
    // Core PDF keywords
    'PDF tools online',
    'PDF processing free',
    'PDF editor web',
    'online PDF processor',
    'free PDF tools',
    'PDF manipulation online',
    'document processing tools',
    'PDF converter online',

    // Tool-specific keywords
    'PDF compressor online',
    'PDF file compression',
    'reduce PDF size',
    'PDF optimizer free',
    'PDF merger online',
    'combine PDF files',
    'merge multiple PDFs',
    'PDF splitter tool',
    'split PDF online',
    'extract PDF pages',
    'text to PDF converter',
    'create PDF from text',
    'document to PDF',
    'PDF encryption tool',
    'password protect PDF',
    'secure PDF online',
    'PDF form filler',
    'fill PDF forms online',
    'PDF form completion',
    'PDF text extractor',
    'extract text from PDF',
    'PDF to text converter',

    // Technical PDF terms
    'PDF processing algorithms',
    'document compression',
    'PDF encryption AES',
    'form field recognition',
    'OCR PDF processing',
    'PDF structure analysis',
    'document manipulation',
    'file format conversion',

    // Popular PDF searches
    'compress PDF online free',
    'merge PDF files online',
    'split PDF into separate files',
    'convert text to PDF online',
    'password protect PDF free',
    'fill PDF form online',
    'extract text from PDF',
    'reduce PDF file size',
    'combine multiple PDFs',
    'split large PDF',
    'create PDF from document',
    'secure PDF with password',

    // Long-tail keywords
    'free online PDF editing tools',
    'web based PDF processor',
    'browser PDF editor',
    'PDF manipulation software free',
    'document processing tools online',
    'PDF optimization tools',
    'PDF conversion web app',
    'PDF editing free no download',
    'online PDF compressor',
    'PDF merging web tool',
    'PDF splitting online tool',
    'text to PDF converter online',

    // Industry-specific
    'document management tools',
    'business document tools',
    'PDF workflow tools',
    'office document processing',
    'legal document tools',
    'contract processing online',
    'form processing tools',
    'document automation online'
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
