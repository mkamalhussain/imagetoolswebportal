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
  metadataBase: new URL('https://freetools.com'),
  title: {
    default: "Free Tools - Professional Online Image, Audio, Video & PDF Tools",
    template: "%s | Free Tools"
  },
  description: "Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools powered by modern web technologies.",
  keywords: [
    "free online tools",
    "image editor",
    "photo editing",
    "audio tools",
    "video editor",
    "PDF tools",
    "image converter",
    "GIF maker",
    "noise remover",
    "video trimmer",
    "PDF merger",
    "online image tools",
    "free photo editor",
    "audio processor",
    "video processing",
    "image resizer",
    "photo converter",
    "meme generator",
    "background remover"
  ],
  authors: [{ name: "Free Tools Team" }],
  creator: "Free Tools",
  publisher: "Free Tools",
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
    creator: '@FreeToolsOnline',
    site: '@FreeToolsOnline',
  },
  alternates: {
    canonical: 'https://freetools.com',
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
      "https://twitter.com/FreeToolsOnline",
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
        {/* Essential Meta Tags */}
        <meta name="description" content="Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools." />
        <meta name="keywords" content="free online tools, image editor, photo editing, audio tools, video editor, PDF tools, image converter, GIF maker, noise remover, video trimmer, PDF merger" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Free Tools Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://freetools.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://freetools.com" />
        <meta property="og:title" content="Free Tools - Professional Online Image, Audio, Video & PDF Tools" />
        <meta property="og:description" content="Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools." />
        <meta property="og:image" content="https://freetools.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Free Tools" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://freetools.com" />
        <meta property="twitter:title" content="Free Tools - Professional Online Image, Audio, Video & PDF Tools" />
        <meta property="twitter:description" content="Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required." />
        <meta property="twitter:image" content="https://freetools.com/og-image.png" />
        <meta name="twitter:creator" content="@FreeToolsOnline" />
        <meta name="twitter:site" content="@FreeToolsOnline" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//unpkg.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

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
