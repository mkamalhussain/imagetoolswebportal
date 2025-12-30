import { PDFModuleRenderer } from "../PDFPageClient";
import { pdfModules } from "@/data/pdfModules";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = pdfModules.find(m => m.slug === slug);

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
      "pdf processing",
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

export default async function PDFToolPage({ params }: PageProps) {
  const { slug } = await params;

  return <PDFModuleRenderer slug={slug} />;
}

export async function generateStaticParams() {
  const slugs = [
    'pdf-compressor',
    'pdf-merger',
    'pdf-splitter',
    'text-to-pdf',
    'pdf-password',
    'pdf-form-filler',
    'pdf-text-extractor'
  ];

  return slugs.map((slug) => ({
    slug,
  }));
}
