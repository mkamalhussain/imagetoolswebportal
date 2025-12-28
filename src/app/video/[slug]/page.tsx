import VideoModuleRenderer from "@/components/VideoModuleRenderer";

interface PageProps {
  params: Promise<{ slug: string }>;
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
