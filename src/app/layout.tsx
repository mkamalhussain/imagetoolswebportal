import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
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
  metadataBase: new URL("https://freetoolbox.app"),
  title: {
    default: "FreeToolBox.app | Free Online Tools",
    template: "%s | FreeToolBox",
  },
  description:
    "Free online tools for image editing, audio processing, video editing, and PDF manipulation. Professional quality tools with no signup required. Resize images, create memes, edit audio, trim videos, merge PDFs, and more.",
  keywords: [
    "free online tools",
    "image tools online",
    "audio tools online",
    "video tools online",
    "PDF tools online",
    "no signup required",
    "browser based tools",
    "client-side processing",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://freetoolbox.app",
    title: "Free Tools - Professional Online Image, Audio, Video & PDF Tools",
    description:
      "Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required. Professional quality tools.",
    siteName: "Free Tools",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free Tools - Online Image, Audio, Video & PDF Processing Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Tools - Professional Online Image, Audio, Video & PDF Tools",
    description:
      "Free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required.",
    images: ["/og-image.png"],
    creator: "@FreeToolBoxApp",
    site: "@FreeToolBoxApp",
  },
  alternates: {
    canonical: "https://freetoolbox.app",
  },
  verification: {},
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  other: {
    "google-adsense-account": "ca-pub-2020371901709303",
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
    name: "Free Tools",
    description:
      "Free online tools for image editing, audio processing, video editing, and PDF manipulation",
    url: "https://freetoolbox.app",
    sameAs: ["https://twitter.com/FreeToolBoxApp"],
    publisher: {
      "@type": "Organization",
      name: "Free Tools",
      logo: {
        "@type": "ImageObject",
        url: "https://freetoolbox.app/logo.png",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://freetoolbox.app/?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Online Tools",
      description: "Collection of free online tools for digital content creation",
      numberOfItems: 50,
      itemListElement: [
        {
          "@type": "SoftwareApplication",
          name: "Animated GIF Maker",
          description: "Create animated GIFs from videos with custom effects",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: "Video Trimmer",
          description: "Trim videos with frame-accurate precision",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: "Noise Cleaner",
          description: "Remove background noise from audio recordings",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
      ],
    },
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

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//unpkg.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Layout>{children}</Layout>
      </body>
      <GoogleAnalytics gaId="G-5M890D46V9" />
    </html>
  );
}

