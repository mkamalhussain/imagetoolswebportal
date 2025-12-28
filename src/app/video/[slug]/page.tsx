import VideoModuleRenderer from "@/components/VideoModuleRenderer";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function VideoToolPage({ params }: PageProps) {
  return <VideoModuleRenderer slug={params.slug} />;
}
