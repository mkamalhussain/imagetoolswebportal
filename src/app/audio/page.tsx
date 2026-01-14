import type { Metadata } from "next";
import AudioPageClient from "./AudioPageClient";

export const metadata: Metadata = {
  title: "Audio Tools",
  description:
    "Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed/pitch adjustment, multi-track mixing, format conversion, and more. Free online audio tools with no signup required.",
  keywords: [
    "audio tools online",
    "audio processing free",
    "audio editor web",
    "online audio processor",
    "noise cleaner",
    "speed pitch adjuster",
    "multi track mixer",
    "waveform generator",
    "tag editor",
    "voice transcriber",
  ],
  openGraph: {
    title: "Audio Tools - Free Online Audio Processing & Editing",
    description:
      "Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed adjustment, format conversion, and more.",
    type: "website",
    url: "https://freetoolbox.app/audio",
  },
  twitter: {
    card: "summary",
    title: "Audio Tools - Free Online Audio Processing",
    description: "Professional audio tools for processing and editing audio files.",
  },
  alternates: {
    canonical: "https://freetoolbox.app/audio",
  },
};

export default function AudioPage() {
  return <AudioPageClient />;
}

