import AudioModuleRenderer from "@/components/AudioModuleRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
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
