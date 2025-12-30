import ToolGuideClient from './ToolGuideClient';
import { modules } from '@/data/modules';
import { audioModules } from '@/data/audioModules';
import { videoModules } from '@/data/videoModules';
import { pdfModules } from '@/data/pdfModules';
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;

  // Find the tool across all module types
  const allModules = [...modules, ...audioModules, ...videoModules, ...pdfModules];
  const module = allModules.find(m => m.slug === tool);

  if (!module) {
    return {
      title: "Guide Not Found | Free Tools",
      description: "The requested tool guide could not be found.",
    };
  }

  return {
    title: `How to Use ${module.title} | Free Tools`,
    description: `Complete step-by-step guide to using ${module.title}. Learn how to process your files with this free online tool.`,
    keywords: [
      `how to use ${module.title.toLowerCase()}`,
      "tutorial",
      "guide",
      "step by step",
      module.title.toLowerCase(),
      "free online tool",
      "instructions"
    ],
    openGraph: {
      title: `How to Use ${module.title} - Complete Guide`,
      description: `Learn how to use ${module.title} with our detailed step-by-step tutorial.`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `How to Use ${module.title} - Complete Guide`,
      description: `Learn how to use ${module.title} with our detailed step-by-step tutorial.`,
    },
  };
}

export default async function ToolGuidePage({ params }: Props) {
  const { tool } = await params;
  return <ToolGuideClient toolSlug={tool} />;
}