import VideoModuleRenderer from "@/components/VideoModuleRenderer";
import { videoModules } from "@/data/videoModules";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = videoModules.find(m => m.slug === slug);

  if (!module) {
    return {
      title: "Tool Not Found",
      description: "The requested tool could not be found.",
    };
  }

  // Unique meta descriptions for each video tool
  const toolDescriptions: Record<string, string> = {
    'video-trimmer': "Trim videos with frame-accurate precision using an intuitive timeline scrubber. Cut unwanted sections and extract perfect clips for social media and presentations.",
    'clip-joiner': "Merge multiple video clips into seamless sequences with smooth transitions. Combine footage professionally with advanced concatenation tools.",
    'gif-maker': "Convert video segments to high-quality animated GIFs with custom timing and quality controls. Perfect for social media, tutorials, and creative content.",
    'speed-changer': "Adjust video playback speed while maintaining audio pitch for natural results. Create slow-motion effects, time-lapse videos, and speed adjustments.",
    'subtitle-burner': "Permanently embed SRT subtitle files into videos with customizable styling. Create accessible content with professional subtitle integration.",
    'frame-grabber': "Extract individual frames from videos as high-quality images. Capture thumbnails, screenshots, and still images from any video format.",
    'audio-stripper': "Extract audio tracks from video files with high quality. Convert videos to MP3 or other audio formats while preserving sound quality.",
  };

  const toolKeywords: Record<string, string[]> = {
    'video-trimmer': ["video cutter", "trim video online", "video editor", "clip extractor", "video trimming", "cut video free"],
    'clip-joiner': ["video merger", "join videos", "combine clips", "video concatenation", "merge video files", "video joiner online"],
    'gif-maker': ["gif creator", "video to gif", "animated gif maker", "gif from video", "create gif online", "video gif converter"],
    'speed-changer': ["video speed", "slow motion video", "speed up video", "time lapse", "video tempo", "playback speed"],
    'subtitle-burner': ["add subtitles", "subtitle embedder", "srt to video", "burn subtitles", "video subtitles", "caption video"],
    'frame-grabber': ["video frames", "extract frames", "video screenshots", "frame capture", "video thumbnails", "grab video frames"],
    'audio-stripper': ["extract audio", "video to audio", "audio extractor", "video sound", "convert video audio", "audio from video"],
  };

  const description = toolDescriptions[slug] || module.description;
  const additionalKeywords = toolKeywords[slug] || [];

  return {
    title: module.title,
    description,
    keywords: [
      ...additionalKeywords,
      module.title.toLowerCase(),
      "free online tool",
      "video processing",
      "video editing",
      slug.replace(/-/g, ' '),
      "online tool",
      "free tool",
      "no signup required",
      "browser based",
      "web tool",
      "video editor"
    ],
    openGraph: {
      title: `${module.title} - Free Online Video Tool`,
      description,
      type: 'website',
      url: `https://freetoolbox.app/video/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${module.title} - Free Online Video Tool`,
      description,
    },
    alternates: {
      canonical: `https://freetoolbox.app/video/${slug}`,
    },
  };
}

export default async function VideoToolPage({ params }: PageProps) {
  const { slug } = await params;
  const module = videoModules.find(m => m.slug === slug);

  if (!module) {
    return <VideoModuleRenderer slug={slug} />;
  }

  // Schema markup for SoftwareApplication
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": module.title,
    "description": module.description,
    "url": `https://freetoolbox.app/video/${slug}`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "FreeToolBox.app",
      "url": "https://freetoolbox.app"
    },
    "featureList": [
      "Free video processing",
      "No signup required",
      "Browser-based editing",
      "High-quality results",
      "Multiple video formats",
      "Professional video tools"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <h1 className="sr-only">{module.title}</h1>
      <VideoModuleRenderer slug={slug} />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = [
    'video-trimmer',
    'clip-joiner',
    'gif-maker',
    'speed-changer',
    'subtitle-burner',
    'frame-grabber',
    'audio-stripper'
  ];

  return slugs.map((slug) => ({
    slug,
  }));
}
