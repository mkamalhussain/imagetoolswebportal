"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { pdfModules } from "@/data/pdfModules";
import React, { useState } from 'react';

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

function PDFModuleRenderer({ slug }: PDFModuleRendererProps) {
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

export default function PDFPageClient() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredModules = pdfModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-start py-16 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background blobs/shapes */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:bg-pink-600"></div>
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 dark:bg-purple-600"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 dark:bg-yellow-600"></div>

      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center relative z-10">
        PDF Tools
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-center relative z-10">
        Free Online PDF Tools
      </p>

      {/* Google AdSense Top Banner */}
      <div className="w-full max-w-4xl mb-8 relative z-10">
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>
      </div>

      <div className="w-full max-w-2xl flex items-center mb-16 relative z-10">
        <input
          type="text"
          placeholder="Search PDF Tools"
          className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 transition-colors flex-shrink-0">
          Search
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
        {filteredModules.map((m) => (
          <Link
            key={m.slug}
            href={`/pdf/${m.slug}`}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4" dangerouslySetInnerHTML={{ __html: m.icon || '' }}>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
              {m.title}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {m.description}
            </div>
          </Link>
        ))}
      </div>

      {/* Google AdSense Bottom Banner */}
      <div className="w-full max-w-4xl mt-16 relative z-10">
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
        </div>
      </div>
    </div>
  );
}

export { PDFModuleRenderer };
