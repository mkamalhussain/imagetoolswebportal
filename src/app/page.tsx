import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'FreeToolBox.app - Free Online Tools - Image, Audio, Video & PDF Processing | No Signup Required',
  description: 'Access 50+ professional free online tools for image editing, audio processing, video editing, and PDF manipulation. No signup required. Resize images, create memes, edit audio, trim videos, merge PDFs, and more.',
  keywords: [
    // Core keywords
    'free online tools',
    'image editor online',
    'photo editing free',
    'audio tools online',
    'video editor free',
    'PDF tools online',
    'online image tools',
    'free photo editor',
    'audio processor online',
    'video processing tools',
    'PDF editor free',

    // Popular tools
    'image resizer online',
    'photo converter free',
    'meme generator online',
    'background remover tool',
    'GIF maker from video',
    'noise remover online',
    'video trimmer free',
    'PDF merger online',
    'image compressor',
    'photo optimizer',
    'ASCII art converter',
    'image dithering',
    'EXIF data viewer',
    'OCR text recognition',
    'pixel art generator',
    'image puzzle maker',
    'format converter online',
    'steganography tool',
    '3D anaglyph maker',
    'cartoon photo converter',
    'image upscaler online',
    'watermark remover',
    'handwriting analyzer',
    'QR code maker',
    'mood analyzer photo',
    'color blind simulator',
    'histogram analyzer',

    // Audio specific
    'podcast clip cutter',
    'multi track mixer',
    'speed pitch adjuster',
    'audio noise cleaner',
    'waveform visualizer',
    'metadata tag editor',
    'voice memo transcriber',

    // Video specific
    'video clip joiner',
    'subtitle burner online',
    'frame grabber tool',
    'audio extractor video',

    // PDF specific
    'PDF compressor online',
    'PDF merger free',
    'PDF splitter tool',
    'text to PDF converter',
    'PDF password protector',
    'PDF form filler online',
    'PDF text extractor',

    // Long-tail keywords
    'free image editing tools no signup',
    'online photo editor professional',
    'best free audio processing tools',
    'video editing software free online',
    'PDF manipulation tools free',
    'image processing web app',
    'audio editing online free',
    'video converter browser based',
    'document processing tools',
    'photo effects and filters online',
    'sound processing web tools',
    'video trimming online free',
    'PDF management online tools',
    'creative tools free no download',
    'multimedia processing online',
    'digital content creation tools',
    'media editing free tools',
    'graphic design web tools',
    'content creator free tools',

    // Technical keywords
    'client side image processing',
    'browser based audio tools',
    'web assembly video tools',
    'FFmpeg web tools',
    'Web Audio API tools',
    'Canvas API image tools',
    'privacy focused editing',
    'secure online processing',
    'GDPR compliant tools',
    'no file upload required',

    // Popular search terms
    'resize image free online',
    'compress photo online',
    'make meme online free',
    'remove background from image',
    'convert image to different format',
    'edit audio file online',
    'trim video free online',
    'merge PDF files online',
    'split PDF into pages',
    'add subtitles to video online',
    'extract audio from video free',
    'generate QR code online',
    'create animated GIF online',
    'convert text file to PDF online',

    // Industry terms
    'content creation tools',
    'social media editing tools',
    'marketing content tools',
    'graphic design free tools',
    'multimedia production tools',
    'digital asset processing',
    'creative software alternatives',
    'media production web tools',
    'post production online tools'
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