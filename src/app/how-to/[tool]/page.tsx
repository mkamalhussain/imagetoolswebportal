import ToolGuideClient from './ToolGuideClient';

interface Props {
  params: { tool: string };
}

export default function ToolGuidePage({ params }: Props) {
  return <ToolGuideClient toolSlug={params.tool} />;
}