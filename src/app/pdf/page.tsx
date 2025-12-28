"use client";

import dynamic from "next/dynamic";

// Dynamic imports for PDF tools
const PDFCompressor = dynamic(() => import("@/components/PDFCompressor"), { ssr: false });
const PDFMerger = dynamic(() => import("@/components/PDFMerger"), { ssr: false });
const PDFSplitter = dynamic(() => import("@/components/PDFSplitter"), { ssr: false });
const TextToPDF = dynamic(() => import("@/components/TextToPDF"), { ssr: false });
const PDFPassword = dynamic(() => import("@/components/PDFPassword"), { ssr: false });
const PDFFormFiller = dynamic(() => import("@/components/PDFFormFiller"), { ssr: false });
const PDFTextExtractor = dynamic(() => import("@/components/PDFTextExtractor"), { ssr: false });

interface PDFModuleRendererProps {
  slug: string;
}

export default function PDFModuleRenderer({ slug }: PDFModuleRendererProps) {
  // Google AdSense placeholder component
  const AdPlaceholder = ({ size }: { size: string }) => (
    <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center my-6">
      <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{size}</p>
    </div>
  );

  const renderModule = () => {
    switch (slug) {
      case "pdf-compressor":
        return <PDFCompressor />;
      case "pdf-merger":
        return <PDFMerger />;
      case "pdf-splitter":
        return <PDFSplitter />;
      case "text-to-pdf":
        return <TextToPDF />;
      case "pdf-password":
        return <PDFPassword />;
      case "pdf-form-filler":
        return <PDFFormFiller />;
      case "pdf-text-extractor":
        return <PDFTextExtractor />;
      default:
        return <p className="text-gray-700">This PDF tool is coming soon.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Google AdSense Header */}
        <AdPlaceholder size="728x90 Banner Ad" />

        {/* PDF Tool Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {renderModule()}
        </div>

        {/* Google AdSense Footer */}
        <AdPlaceholder size="728x90 Banner Ad" />
      </div>
    </div>
  );
}
