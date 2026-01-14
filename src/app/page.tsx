import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description:
    "Access 50+ professional free online tools for image editing, audio processing, video editing, and PDF manipulation. No signup required. Resize images, create memes, edit audio, trim videos, merge PDFs, and more.",
  keywords: [
    "free online tools",
    "image editor online",
    "audio tools online",
    "video editor free",
    "PDF tools online",
    "no signup required",
    "browser based tools",
    "image resizer",
    "meme generator",
    "audio trimmer",
    "video trimmer",
    "PDF merger",
  ],
  openGraph: {
    title: "Free Online Tools - Professional Image, Audio, Video & PDF Processing",
    description:
      "50+ free online tools for image resizing, conversion, meme creation, audio processing, video editing, and PDF manipulation. No signup required.",
    images: [
      {
        url: "/og-homepage.png",
        width: 1200,
        height: 630,
        alt: "Free Tools Homepage - Online Image, Audio, Video & PDF Tools",
      },
    ],
    type: "website",
    url: "https://freetoolbox.app",
  },
  twitter: {
    title: "Free Online Tools - Image, Audio, Video & PDF Processing",
    description: "50+ free online tools for creative work. No signup, no limits.",
    images: ["/og-homepage.png"],
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://freetoolbox.app",
  },
};

export default function Home() {
  return <HomeClient />;
}

