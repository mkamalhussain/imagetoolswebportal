import AudioModuleRenderer from "@/components/AudioModuleRenderer";
import { audioModules } from "@/data/audioModules";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = audioModules.find(m => m.slug === slug);

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

export default async function AudioToolPage({ params }: PageProps) {
  const { slug } = await params;
  return <AudioModuleRenderer slug={slug} />;
}

export async function generateStaticParams() {
  const slugs = [
    'podcast-clip-cutter',
    'multi-track-mixer',
    'speed-pitch-adjuster',
    'noise-cleaner',
    'waveform-generator',
    'tag-editor-pro',
    'voice-memo-transcriber'
  ];

  return slugs.map((slug) => ({
    slug,
  }));
}
