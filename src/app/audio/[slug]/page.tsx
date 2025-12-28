import AudioModuleRenderer from "@/components/AudioModuleRenderer";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function AudioToolPage({ params }: PageProps) {
  return <AudioModuleRenderer slug={params.slug} />;
}
