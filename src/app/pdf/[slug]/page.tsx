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
      title: "Tool Not Found | FreeToolBox.app",
      description: "The requested tool could not be found.",
    };
  }

  // Unique meta descriptions for each PDF tool
  const toolDescriptions: Record<string, string> = {
    'pdf-compressor': "Reduce PDF file sizes dramatically with adjustable compression levels. Optimize PDFs for email, web sharing, and storage without losing quality.",
    'pdf-merger': "Combine multiple PDF files into one document with drag-and-drop reordering. Merge reports, presentations, and documents seamlessly online.",
    'pdf-splitter': "Extract specific pages or split large PDFs into multiple smaller documents. Perfect for sharing individual sections or organizing content.",
    'text-to-pdf': "Convert plain text and documents into beautifully formatted PDF files. Create professional PDFs from text content with custom styling options.",
    'pdf-password': "Encrypt PDF files with military-grade AES-256 encryption. Password protect sensitive documents and control access permissions.",
    'pdf-form-filler': "Automatically detect and fill PDF form fields with ease. Complete forms digitally and save time on paperwork and submissions.",
    'pdf-text-extractor': "Extract text content from PDF files and convert to editable formats. Copy text from scanned documents and PDF images with OCR technology.",
  };

  const toolKeywords: Record<string, string[]> = {
    'pdf-compressor': ["pdf compression", "reduce pdf size", "pdf optimizer", "compress pdf online", "pdf file size", "optimize pdf"],
    'pdf-merger': ["merge pdf", "combine pdf files", "pdf combiner", "join pdfs", "pdf merger online", "concatenate pdf"],
    'pdf-splitter': ["split pdf", "pdf splitter online", "extract pdf pages", "divide pdf", "pdf page extractor", "separate pdf"],
    'text-to-pdf': ["text to pdf", "convert text to pdf", "create pdf from text", "text document to pdf", "pdf creator", "document converter"],
    'pdf-password': ["pdf password", "encrypt pdf", "secure pdf", "password protect pdf", "pdf security", "lock pdf"],
    'pdf-form-filler': ["fill pdf form", "pdf forms", "form filler", "complete pdf forms", "digital forms", "pdf form completion"],
    'pdf-text-extractor': ["extract pdf text", "pdf to text", "copy text from pdf", "pdf text converter", "ocr pdf", "text extraction"],
  };

  const description = toolDescriptions[slug] || module.description;
  const additionalKeywords = toolKeywords[slug] || [];

  return {
    title: `${module.title} - Free Online PDF Tool | FreeToolBox.app`,
    description,
    keywords: [
      ...additionalKeywords,
      module.title.toLowerCase(),
      "free online tool",
      "pdf processing",
      "document tools",
      slug.replace(/-/g, ' '),
      "online tool",
      "free tool",
      "no signup required",
      "browser based",
      "web tool",
      "pdf editor"
    ],
    openGraph: {
      title: `${module.title} - Free Online PDF Tool`,
      description,
      type: 'website',
      url: `https://freetoolbox.app/pdf/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${module.title} - Free Online PDF Tool`,
      description,
    },
    alternates: {
      canonical: `https://freetoolbox.app/pdf/${slug}`,
    },
  };
}

export default async function PDFToolPage({ params }: PageProps) {
  const { slug } = await params;
  const module = pdfModules.find(m => m.slug === slug);

  if (!module) {
    return <PDFModuleRenderer slug={slug} />;
  }

  // Schema markup for SoftwareApplication
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": module.title,
    "description": module.description,
    "url": `https://freetoolbox.app/pdf/${slug}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "FreeToolBox.app",
      "url": "https://freetoolbox.app"
    },
    "featureList": [
      "Free PDF processing",
      "No signup required",
      "Browser-based editing",
      "Document security",
      "Multiple PDF operations",
      "Professional document tools"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <PDFModuleRenderer slug={slug} />
    </>
  );
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
