import type { Metadata } from "next";
import PDFPageClient from "./PDFPageClient";

export const metadata: Metadata = {
  title: "PDF Tools",
  description:
    "Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, encryption, form filling, and more. Free online PDF tools with no signup required.",
  keywords: [
    "PDF tools",
    "PDF compressor",
    "PDF merger",
    "PDF splitter",
    "text to PDF",
    "PDF password",
    "PDF form filler",
    "PDF text extractor",
  ],
  openGraph: {
    title: "PDF Tools - Free Online PDF Processing & Editing",
    description:
      "Professional PDF tools for processing, editing, and manipulating PDF files. Compression, merging, splitting, and more.",
    type: "website",
    url: "https://freetoolbox.app/pdf",
  },
  twitter: {
    card: "summary",
    title: "PDF Tools - Free Online PDF Processing",
    description: "Professional PDF tools for processing and editing PDF files.",
  },
  alternates: {
    canonical: "https://freetoolbox.app/pdf",
  },
};

export default function PDFPage() {
  return <PDFPageClient />;
}

