import PDFModuleRenderer from "../page";

interface PageProps {
  params: Promise<{ slug: string }>;
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
