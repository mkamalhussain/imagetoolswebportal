import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import AdSense from "@/components/AdSense";
import Layout from "@/components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freetoolbox.app'),
  title: {
    default: "FreeToolBox.app | Free Online Tools",
    template: "%s | FreeToolBox"
  },
  description: "Free online tools for image editing, audio processing, video editing, and PDF manipulation. Professional quality tools with no signup required. Resize images, create memes, edit audio, trim videos, merge PDFs, and more.",
  keywords: [
    // Primary keywords
    "free online tools",
    "image editor online",
    "photo editing free",
    "audio tools online",
    "video editor free",
    "PDF tools online",
    "online image tools",
    "free photo editor",
    "audio processor online",
    "video processing tools",
    "PDF editor free",

    // Tool-specific keywords
    "image resizer",
    "photo converter",
    "meme generator",
    "background remover",
    "image compressor",
    "photo optimizer",
    "GIF maker online",
    "animated GIF creator",
    "image to GIF",
    "video to GIF converter",
    "ASCII art generator",
    "text art converter",
    "image dithering tool",
    "grayscale dithering",
    "EXIF data viewer",
    "image metadata editor",
    "OCR tool online",
    "text recognition",
    "optical character recognition",
    "pixel sorter",
    "glitch art generator",
    "image puzzle maker",
    "jigsaw puzzle creator",
    "format converter",
    "image format changer",
    "hidden message encoder",
    "steganography tool",
    "3D anaglyph creator",
    "anaglyph generator",
    "cartoon converter",
    "image cartoonizer",
    "photo to cartoon",
    "image upscaler",
    "resolution enhancer",
    "photo enlarger",
    "watermark remover",
    "logo remover tool",
    "personality analyzer",
    "handwriting analysis",
    "QR code generator",
    "barcode creator",
    "image mood analyzer",
    "emotion detection",
    "color blindness simulator",
    "accessibility checker",
    "image histogram",
    "color distribution analyzer",
    "grid maker",
    "collage creator",
    "image grid generator",
    "file size predictor",
    "compression calculator",
    "infographic creator",
    "chart generator",
    "perspective correction",
    "horizon leveling",
    "panorama stitcher",
    "photo stitcher",

    // Audio tools
    "podcast clip cutter",
    "audio trimmer",
    "multi-track mixer",
    "audio mixer online",
    "speed changer",
    "pitch shifter",
    "noise cleaner",
    "audio denoiser",
    "background noise remover",
    "waveform generator",
    "audio visualization",
    "tag editor",
    "metadata editor",
    "ID3 tag editor",
    "voice transcriber",
    "speech to text",
    "audio transcription",

    // Video tools
    "video trimmer",
    "clip joiner",
    "video merger",
    "GIF from video",
    "speed changer pro",
    "video speed control",
    "subtitle burner",
    "SRT to video",
    "frame grabber",
    "video thumbnail extractor",
    "audio stripper",
    "video to audio converter",

    // PDF tools
    "PDF compressor",
    "PDF optimizer",
    "PDF merger",
    "PDF combiner",
    "PDF splitter",
    "PDF extractor",
    "text to PDF",
    "document converter",
    "PDF encryption",
    "password protect PDF",
    "PDF form filler",
    "PDF form completion",
    "PDF text extractor",
    "PDF to text converter",

    // Long-tail keywords
    "free image editing tools",
    "online photo editor no signup",
    "best free audio tools",
    "video editing software free",
    "PDF manipulation tools",
    "image processing online",
    "audio editing web app",
    "video converter online free",
    "document tools free",
    "photo effects online",
    "sound processing tools",
    "video trimming software",
    "PDF management tools",

    // Technical keywords
    "client-side processing",
    "browser-based tools",
    "web assembly tools",
    "FFmpeg online",
    "Web Audio API",
    "Canvas API",
    "no upload required",
    "privacy focused tools",
    "secure online tools",
    "GDPR compliant",

    // Popular search terms
    "resize image online",
    "compress photo",
    "create meme",
    "remove background",
    "convert image format",
    "edit audio file",
    "trim video online",
    "merge PDF files",
    "split PDF online",
    "add subtitles to video",
    "extract audio from video",
    "generate QR code",
    "create GIF from video",
    "convert text to PDF",

    // Industry-specific terms
    "content creator tools",
    "social media tools",
    "marketing tools free",
    "graphic design tools",
    "multimedia processing",
    "digital asset management",
    "creative software free",
    "media production tools",
    "post-production tools"
  ],
  authors: [{ name: "FreeToolBox.app Team" }],
  creator: "FreeToolBox.app",
  publisher: "FreeToolBox.app",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Web Tools",
  classification: "Online Tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freetoolbox.app',
    title: 'Free Tools - Professional Online Image, Audio, Video & PDF Tools',
    description: 'Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools.',
    siteName: 'Free Tools',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Free Tools - Online Image, Audio, Video & PDF Processing Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Tools - Professional Online Image, Audio, Video & PDF Tools',
    description: 'Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required.',
    images: ['/og-image.png'],
    creator: '@FreeToolBoxApp',
    site: '@FreeToolBoxApp',
  },
  alternates: {
    canonical: 'https://freetoolbox.app',
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  other: {
    'google-adsense-account': 'ca-pub-xxxxxxxxxxxxxxxx',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Free Tools",
    "description": "Free online tools for image editing, audio processing, video editing, and PDF manipulation",
    "url": "https://freetoolbox.app",
    "sameAs": [
      "https://twitter.com/FreeToolBoxApp",
      "https://github.com/freetools"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Free Tools",
      "logo": {
        "@type": "ImageObject",
        "url": "https://freetoolbox.app/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://freetoolbox.app/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Online Tools",
      "description": "Collection of free online tools for digital content creation",
      "numberOfItems": 50,
      "itemListElement": [
        {
          "@type": "SoftwareApplication",
          "name": "Animated GIF Maker",
          "description": "Create animated GIFs from videos with custom effects",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        },
        {
          "@type": "SoftwareApplication",
          "name": "Video Trimmer",
          "description": "Trim videos with frame-accurate precision",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser"
        },
        {
          "@type": "SoftwareApplication",
          "name": "Noise Cleaner",
          "description": "Remove background noise from audio recordings",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Web Browser"
        }
      ]
    }
  };

  return (
    <html lang="en" itemScope itemType="https://schema.org/WebSite">
      <head>
        {/* Apply theme before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
        
        {/* Viewport meta tag is required */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//unpkg.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Favicon links - multiple formats for browser compatibility */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Free Online Tools',
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
    canonical: 'https://freetoolbox.app',
  },
};

export default function Home() {
  return <HomeClient />;
}
import type { Metadata } from 'next';
import AudioPageClient from './AudioPageClient';

export const metadata: Metadata = {
  title: 'Audio Tools',
  description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed/pitch adjustment, multi-track mixing, format conversion, and more. Free online audio tools with no signup required.',
  keywords: [
    // Core audio keywords
    'audio tools online',
    'audio processing free',
    'audio editor web',
    'online audio processor',
    'free audio tools',
    'sound editing online',
    'audio enhancement tools',
    'audio converter online',

    // Tool-specific keywords
    'podcast clip cutter',
    'audio trimmer online',
    'multi track audio mixer',
    'audio mixer web',
    'speed pitch adjuster',
    'tempo changer online',
    'noise cleaner audio',
    'background noise remover',
    'audio denoiser online',
    'waveform generator',
    'audio visualization tool',
    'metadata tag editor',
    'ID3 tag editor online',
    'voice memo transcriber',
    'speech to text converter',
    'audio transcription online',

    // Technical audio terms
    'audio processing algorithms',
    'sound wave manipulation',
    'frequency analysis',
    'audio spectrum analyzer',
    'voice processing tools',
    'music editing online',
    'podcast editing tools',
    'audio mastering online',
    'sound design tools',
    'audio effects processor',

    // Popular audio searches
    'remove noise from audio',
    'change audio speed online',
    'mix audio tracks free',
    'cut audio file online',
    'convert audio format',
    'transcribe voice recording',
    'edit podcast audio',
    'clean up audio recording',
    'adjust pitch of voice',
    'generate audio waveform',

    // Long-tail keywords
    'free online audio editing tools',
    'web based audio processor',
    'browser audio editor',
    'audio manipulation software free',
    'sound processing tools online',
    'voice enhancement tools',
    'music production tools free',
    'audio post production',
    'sound editing web app',
    'audio file converter online',

    // Industry-specific
    'podcasting tools free',
    'music production online',
    'audio engineering tools',
    'sound design software',
    'voice over tools',
    'audio mixing web app',
    'recording studio online',
    'audio mastering free tools'
  ],
  openGraph: {
    title: 'Audio Tools - Free Online Audio Processing & Editing',
    description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed adjustment, format conversion, and more.',
    type: 'website',
    url: 'https://freetoolbox.app/audio',
  },
  twitter: {
    card: 'summary',
    title: 'Audio Tools - Free Online Audio Processing',
    description: 'Professional audio tools for processing and editing audio files.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/audio',
  },
};

export default function AudioPage() {
  return <AudioPageClient />;
}
import type { Metadata } from 'next';
import VideoPageClient from './VideoPageClient';

export const metadata: Metadata = {
  title: 'Video Tools',
  description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, speed adjustment, and more. Free online video tools with no signup required.',
  keywords: [
    // Core video keywords
    'video tools online',
    'video processing free',
    'video editor web',
    'online video processor',
    'free video tools',
    'video editing online',
    'video manipulation tools',
    'video converter online',

    // Tool-specific keywords
    'video trimmer online',
    'clip cutter free',
    'video clip joiner',
    'video merger online',
    'GIF maker from video',
    'animated GIF creator',
    'video to GIF converter',
    'speed changer pro',
    'video speed control',
    'tempo adjuster video',
    'subtitle burner online',
    'SRT to video converter',
    'add subtitles to video',
    'frame grabber tool',
    'video thumbnail extractor',
    'extract frames from video',
    'audio stripper video',
    'video to audio converter',
    'extract audio from video',

    // Technical video terms
    'video processing algorithms',
    'video compression tools',
    'format conversion video',
    'video encoding online',
    'subtitle embedding',
    'video timeline editor',
    'frame extraction tool',
    'video analysis tools',
    'media processing online',

    // Popular video searches
    'trim video online free',
    'cut video clip online',
    'merge video files',
    'join video clips',
    'create GIF from video',
    'make animated GIF online',
    'change video speed',
    'slow motion video online',
    'add subtitles to video free',
    'burn subtitles into video',
    'extract frames from video',
    'get video thumbnail',
    'convert video to audio',
    'remove audio from video',

    // Long-tail keywords
    'free online video editing tools',
    'web based video processor',
    'browser video editor',
    'video manipulation software free',
    'video processing tools online',
    'video enhancement tools',
    'video conversion web app',
    'video editing free no download',
    'online video cutter',
    'video trimming web tool',
    'GIF creation from video',
    'video speed adjustment online',

    // Industry-specific
    'video production tools free',
    'video editing software online',
    'content creation video tools',
    'social media video tools',
    'video post production online',
    'multimedia editing tools',
    'video processing web app',
    'creative video tools free'
  ],
  openGraph: {
    title: 'Video Tools - Free Online Video Processing & Editing',
    description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, and more.',
    type: 'website',
    url: 'https://freetoolbox.app/video',
  },
  twitter: {
    card: 'summary',
    title: 'Video Tools - Free Online Video Processing',
    description: 'Professional video tools for processing and editing video files.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/video',
  },
};

export default function VideoPage() {
  return <VideoPageClient />;
}
import type { Metadata } from 'next';
import PDFPageClient from './PDFPageClient';

export const metadata: Metadata = {
  title: 'PDF Tools',
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
    url: 'https://freetoolbox.app/pdf',
  },
  twitter: {
    card: 'summary',
    title: 'PDF Tools - Free Online PDF Processing',
    description: 'Professional PDF tools for processing and editing PDF files.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/pdf',
  },
};

export default function PDFPage() {
  return <PDFPageClient />;
}
import type { Metadata } from 'next';
import ModulesClient from './ModulesClient';

export const metadata: Metadata = {
  title: 'All Tools',
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
    url: 'https://freetoolbox.app/modules',
  },
  twitter: {
    title: 'All Tools - Complete Collection of Free Online Tools',
    description: 'Browse 50+ free online tools for creative work. No signup, no limits.',
    images: ['/og-all-tools.png'],
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/modules',
  },
};

export default function AllToolsPage() {
  return <ModulesClient />;
}
import type { Metadata } from 'next';
import HowToClient from './HowToClient';

export const metadata: Metadata = {
  title: 'How To Guides',
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
    url: 'https://freetoolbox.app/how-to',
  },
  twitter: {
    title: 'How To Guides - Step-by-Step Tutorials for All Tools',
    description: 'Learn how to use our free online tools with detailed guides and visual examples.',
    images: ['/og-how-to.png'],
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/how-to',
  },
};

export default function HowToPage() {
  return <HowToClient />;
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About FreeToolBox',
  description: 'Learn about Free Tools - our mission to democratize access to professional digital tools. Discover our commitment to privacy, innovation, and empowering creators worldwide.',
  keywords: [
    'about free tools',
    'online tools company',
    'digital tools platform',
    'creative tools',
    'privacy focused tools',
    'free online tools about'
  ],
  openGraph: {
    title: 'About Us - Free Tools for Creative Work',
    description: 'Learn about Free Tools - our mission to democratize access to professional digital tools. Discover our commitment to privacy, innovation, and empowering creators worldwide.',
    type: 'website',
    url: 'https://freetoolbox.app/about',
  },
  twitter: {
    card: 'summary',
    title: 'About Us - Free Tools for Creative Work',
    description: 'Learn about Free Tools - our mission to democratize access to professional digital tools.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Google AdSense Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-8">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            About FreeToolBox.app
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <img
                  src="/logo.svg"
                  alt="FreeToolBox.app Logo"
                  className="h-20 w-auto"
                />
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Empowering creators with free, powerful online tools
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                FreeToolBox.app was founded with a simple mission: to democratize access to powerful digital tools. We believe that everyone should have access to professional-grade image, audio, video, and PDF processing tools without expensive subscriptions or software purchases.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Whether you're a content creator, marketer, developer, student, or just someone who needs to process media files, our platform provides the tools you need to get the job done efficiently and effectively.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">🖼️ Image Tools</h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    From basic resizing and format conversion to advanced features like background removal, color palette extraction, and creative filters.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">🎵 Audio Tools</h3>
                  <p className="text-green-800 dark:text-green-200">
                    Professional audio processing including noise reduction, speed adjustment, mixing, and metadata editing.
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🎥 Video Tools</h3>
                  <p className="text-purple-800 dark:text-purple-200">
                    Complete video editing suite with trimming, joining, GIF creation, and format conversion.
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">📄 PDF Tools</h3>
                  <p className="text-orange-800 dark:text-orange-200">
                    Comprehensive PDF processing including merging, splitting, compression, and form filling.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Technology</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We leverage cutting-edge web technologies to bring you professional tools directly in your browser:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li><strong>WebAssembly:</strong> High-performance processing for complex operations</li>
                <li><strong>Modern JavaScript:</strong> Efficient algorithms for image and audio processing</li>
                <li><strong>FFmpeg.wasm:</strong> Professional video and audio processing capabilities</li>
                <li><strong>Canvas API:</strong> Real-time visual processing and preview</li>
                <li><strong>Web Audio API:</strong> Advanced audio manipulation and analysis</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                All processing happens locally in your browser, ensuring your files remain private and secure.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your privacy and security are our top priorities. We designed our platform with privacy-first principles:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li><strong>No file storage:</strong> Your files are never stored on our servers</li>
                <li><strong>Client-side processing:</strong> All operations happen in your browser</li>
                <li><strong>GDPR compliant:</strong> We respect your data protection rights</li>
                <li><strong>Open source components:</strong> Transparent and auditable code</li>
                <li><strong>No tracking:</strong> We don't track your usage or collect personal data</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Education & Learning</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Beyond providing tools, we're committed to helping you master them. Our comprehensive "How To" section includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-6">
                <li>Step-by-step guides for every tool</li>
                <li>Visual examples and screenshots</li>
                <li>Pro tips and best practices</li>
                <li>Troubleshooting advice</li>
                <li>Creative use cases and inspiration</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Making professional tools available to everyone, regardless of budget or technical expertise.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protecting your data and respecting your privacy in everything we do.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Continuously improving our tools with the latest web technologies and user feedback.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Get Involved</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We love hearing from our users! Whether you have feedback, feature requests, or just want to share how you're using our tools, we'd love to hear from you.
              </p>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">Ready to start creating?</h3>
                <p className="mb-4 opacity-90">
                  Explore our tools and see what you can create. Every tool is free to use, no sign-up required.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Explore Tools →
                </a>
              </div>
            </section>
          </div>
        </div>

        {/* Google AdSense Bottom Banner */}
        <div className="w-full mt-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn about our privacy practices, data collection policies, and how we protect your information. Free Tools is committed to transparency and GDPR compliance.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR compliance',
    'privacy practices',
    'data collection',
    'user privacy',
    'security policy'
  ],
  openGraph: {
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn about our privacy practices, data collection policies, and how we protect your information. Free Tools is committed to transparency and GDPR compliance.',
    type: 'website',
    url: 'https://freetoolbox.app/privacy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Learn about our privacy practices, data collection policies, and how we protect your information.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Google AdSense Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-8">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Privacy Policy
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to FreeToolBox.app ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By using our services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not collect any personal information from our users. Our services are designed to process your files entirely in your browser, without any data being transmitted to our servers.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2.1 Files Processed</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                When you use our tools, your files are processed locally in your web browser using WebAssembly and JavaScript. Your files never leave your device or get uploaded to our servers.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2.2 Usage Analytics</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not track, collect, or store any usage analytics, browsing patterns, or behavioral data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Since we do not collect any personal information, we do not use your information for any purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not share, sell, or disclose any personal information because we do not collect any.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your privacy and security are our highest priorities. Here's how we protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Client-side processing:</strong> All file processing happens in your browser, not on our servers</li>
                <li><strong>No data storage:</strong> We never store your files or personal information</li>
                <li><strong>No data transmission:</strong> Your files never leave your device</li>
                <li><strong>HTTPS encryption:</strong> Our website uses HTTPS to secure the connection</li>
                <li><strong>Open source:</strong> Our code is transparent and auditable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use third-party services for website hosting and analytics. These services may collect anonymous usage statistics, but we have configured them to minimize data collection.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.1 Hosting</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our website is hosted on Vercel, which provides the infrastructure for our site. Vercel may collect anonymous server logs for security and performance monitoring.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6.2 Google AdSense (Future)</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may implement Google AdSense in the future. Google AdSense uses cookies and similar technologies to serve personalized ads. You can opt out of personalized advertising by visiting Google's Ads Settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Currently, our website does not use cookies or tracking technologies. If we implement them in the future, we will update this policy accordingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Since we do not collect or store personal data, there are no international data transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. GDPR Rights (EU Users)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                As a European user, you have certain rights regarding your personal data. However, since we do not collect any personal information, these rights are automatically fulfilled:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li><strong>Right to access:</strong> We don't have your data to access</li>
                <li><strong>Right to rectification:</strong> No data to correct</li>
                <li><strong>Right to erasure:</strong> No data to delete</li>
                <li><strong>Right to restrict processing:</strong> No processing to restrict</li>
                <li><strong>Right to data portability:</strong> No data to port</li>
                <li><strong>Right to object:</strong> No processing to object to</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>Email: privacy@freetoolbox.app</li>
                <li>Address: [Company Address - To be updated]</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Google AdSense Bottom Banner */}
        <div className="w-full mt-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read our terms of service and usage guidelines. Learn about acceptable use, user responsibilities, and service limitations for Free Tools.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'usage guidelines',
    'service agreement',
    'user terms',
    'acceptable use',
    'legal terms'
  ],
  openGraph: {
    title: 'Terms of Service - Usage Guidelines',
    description: 'Read our terms of service and usage guidelines. Learn about acceptable use, user responsibilities, and service limitations for Free Tools.',
    type: 'website',
    url: 'https://freetoolbox.app/terms-of-service',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - Usage Guidelines',
    description: 'Read our terms of service and usage guidelines for Free Tools.',
  },
  alternates: {
    canonical: 'https://freetoolbox.app/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Google AdSense Top Banner */}
        <div className="w-full mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Terms of Service
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By accessing and using FreeToolBox.app ("we," "us," or "our"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                FreeToolBox.app provides online tools for processing images, audio files, videos, and PDF documents. All processing occurs in your web browser using client-side technologies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Free Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our services are provided free of charge. We reserve the right to modify or discontinue any service at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Responsibilities</h2>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.1 Lawful Use</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You agree to use our services only for lawful purposes. You may not use our services to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>Process illegal, harmful, or offensive content</li>
                <li>Violate intellectual property rights</li>
                <li>Distribute malware or viruses</li>
                <li>Harass, abuse, or harm others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4.2 Content Ownership</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You retain ownership of all content you process through our services. You are responsible for ensuring you have the right to process and modify the files you upload.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Privacy and Data Protection</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which is incorporated into these Terms by reference. Key points:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4">
                <li>All processing occurs in your browser</li>
                <li>Your files are never uploaded to our servers</li>
                <li>We do not store or track your usage</li>
                <li>We do not collect personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Service Availability</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                While we strive to provide reliable service, we do not guarantee uninterrupted access. Our services may be temporarily unavailable due to maintenance, technical issues, or other reasons beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our services are provided "as is" without warranties of any kind. We shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We are not responsible for the quality or accuracy of processed files. Always keep backups of your original files.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The FreeToolBox.app website, software, and branding are owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use open-source libraries and tools, which are subject to their respective licenses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Termination</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We reserve the right to terminate or suspend your access to our services at any time, without notice, for any reason, including violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update these Terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about these Terms, please contact us at legal@freetoolbox.app.
              </p>
            </section>
          </div>
        </div>

        {/* Google AdSense Bottom Banner */}
        <div className="w-full mt-12">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
}
