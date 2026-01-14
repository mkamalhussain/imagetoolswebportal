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
    url: 'https://freetools.com',
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
    canonical: 'https://freetools.com',
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
    "url": "https://freetools.com",
    "sameAs": [
      "https://twitter.com/FreeToolBoxApp",
      "https://github.com/freetools"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Free Tools",
      "logo": {
        "@type": "ImageObject",
        "url": "https://freetools.com/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://freetools.com/?search={search_term_string}"
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
