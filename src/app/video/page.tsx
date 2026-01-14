import type { Metadata } from "next";
import VideoPageClient from "./VideoPageClient";

export const metadata: Metadata = {
  title: "Video Tools",
  description:
    "Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, speed adjustment, and more. Free online video tools with no signup required.",
  keywords: [
    "video tools online",
    "video processing free",
    "video editor web",
    "video trimmer",
    "clip joiner",
    "gif maker",
    "subtitle burner",
    "frame grabber",
    "audio stripper",
  ],
  openGraph: {
    title: "Video Tools - Free Online Video Processing & Editing",
    description:
      "Professional video tools for processing, editing, and enhancing video files. Trimming, GIF creation, subtitles, and more.",
    type: "website",
    url: "https://freetoolbox.app/video",
  },
  twitter: {
    card: "summary",
    title: "Video Tools - Free Online Video Processing",
    description: "Professional video tools for processing and editing video files.",
  },
  alternates: {
    canonical: "https://freetoolbox.app/video",
  },
};

export default function VideoPage() {
  return <VideoPageClient />;
}

