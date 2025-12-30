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
      title: "Tool Not Found | Free Tools",
      description: "The requested tool could not be found.",
    };
  }

  return {
    title: `${module.title} | Free Tools`,
    description: module.description,
    keywords: [
      module.title.toLowerCase(),
      "free online tool",
      "video processing",
      "audio processing",
      slug.replace('-', ' '),
      "online tool",
      "free tool"
    ],
    openGraph: {
      title: `${module.title} - Free Online Tool`,
      description: module.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${module.title} - Free Online Tool`,
      description: module.description,
    },
  };
}

export default async function VideoToolPage({ params }: PageProps) {
  const { slug } = await params;
  return <VideoModuleRenderer slug={slug} />;
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
