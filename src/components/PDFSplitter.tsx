"use client";

import React, { useCallback, useState } from "react";
import Button from "@/components/Button";

interface SplitConfig {
  type: 'single' | 'range' | 'multiple';
  pages: string; // e.g., "1,3,5-7,10"
  watermark?: string;
}

export default function PDFSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    type: 'range',
    pages: '',
    watermark: ''
  });
  const [splitBlobs, setSplitBlobs] = useState<{name: string, blob: Blob}[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setSplitBlobs([]);
    setError("");

    try {
      // Get total pages using pdfjs-dist
      const { getDocument } = await import('pdfjs-dist');

      // Set worker path for pdfjs
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);

    } catch (err) {
      console.error("PDF analysis error:", err);
      setError("Failed to analyze PDF. Please try a different file.");
    }
  }, []);

  // Parse page ranges
  const parsePageRanges = useCallback((pageString: string): number[] => {
    const pages: number[] = [];
    const ranges = pageString.split(',').map(s => s.trim());

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) pages.push(i);
          }
        }
      } else {
        const page = parseInt(range);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          pages.push(page);
        }
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b); // Remove duplicates and sort
  }, [totalPages]);

  // Split PDF
  const splitPDF = useCallback(async () => {
    if (!selectedFile) return;

    let pagesToExtract: number[] = [];

    switch (splitConfig.type) {
      case 'single':
        if (splitConfig.pages) {
          const page = parseInt(splitConfig.pages);
          if (!isNaN(page) && page >= 1 && page <= totalPages) {
            pagesToExtract = [page];
          }
        }
        break;
      case 'range':
      case 'multiple':
        if (splitConfig.pages) {
          pagesToExtract = parsePageRanges(splitConfig.pages);
        }
        break;
    }

    if (pagesToExtract.length === 0) {
      setError("Please specify valid page numbers to extract");
      return;
    }

    setIsSplitting(true);
    setError("");

    try {
      const { PDFDocument } = await import('pdf-lib');

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      const pageIndices = pagesToExtract.map(p => p - 1); // Convert to 0-based indexing

      const pages = await newPdf.copyPages(pdfDoc, pageIndices);
      pages.forEach(page => newPdf.addPage(page));

      // Add watermark if specified
      if (splitConfig.watermark) {
        const pages = newPdf.getPages();
        pages.forEach(page => {
          const { width, height } = page.getSize();
          page.drawText(splitConfig.watermark!, {
            x: width / 2 - (splitConfig.watermark!.length * 6),
            y: height - 50,
            size: 24,
            opacity: 0.3,
          });
        });
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

      const fileName = splitConfig.type === 'single'
        ? `page-${pagesToExtract[0]}-${selectedFile.name}`
        : `pages-${pagesToExtract.join('-')}-${selectedFile.name}`;

      setSplitBlobs([{ name: fileName, blob }]);

    } catch (err) {
      console.error("Split error:", err);
      setError("Failed to split PDF. Please try again.");
    } finally {
      setIsSplitting(false);
    }
  }, [selectedFile, splitConfig, parsePageRanges, totalPages]);

  // Download split PDF
  const downloadSplit = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Splitter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract specific pages or split PDF into multiple documents
        </p>
      </div>

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
      </div>

      {/* File Upload */}
      <div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3-3m0 0l3 3m-3-3v12.75" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop a PDF file here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Extract pages or split documents</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select PDF File
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File Info and Split Options */}
      {selectedFile && totalPages > 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PDF Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pages</p>
                <p className="font-medium text-gray-900 dark:text-white">{totalPages}</p>
              </div>
            </div>
          </div>

          {/* Split Options */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Split Options
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Split Type
                </label>
                <select
                  value={splitConfig.type}
                  onChange={(e) => setSplitConfig(prev => ({
                    ...prev,
                    type: e.target.value as SplitConfig['type']
                  }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="single">Single Page</option>
                  <option value="range">Page Range</option>
                  <option value="multiple">Multiple Pages</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {splitConfig.type === 'single' ? 'Page Number' :
                   splitConfig.type === 'range' ? 'Page Range (e.g., 1-5, 8, 10-12)' :
                   'Page Numbers (e.g., 1,3,5-7,10)'}
                </label>
                <input
                  type="text"
                  value={splitConfig.pages}
                  onChange={(e) => setSplitConfig(prev => ({
                    ...prev,
                    pages: e.target.value
                  }))}
                  placeholder={splitConfig.type === 'single' ? '1' :
                             splitConfig.type === 'range' ? '1-5, 8, 10-12' :
                             '1,3,5-7,10'}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Valid range: 1-{totalPages}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Watermark Text (Optional)
                </label>
                <input
                  type="text"
                  value={splitConfig.watermark || ''}
                  onChange={(e) => setSplitConfig(prev => ({
                    ...prev,
                    watermark: e.target.value
                  }))}
                  placeholder="e.g., CONFIDENTIAL"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Split Button */}
          <div className="text-center">
            <Button
              onClick={splitPDF}
              disabled={isSplitting || !splitConfig.pages.trim()}
            >
              {isSplitting ? "Splitting PDF..." : "Split PDF"}
            </Button>
          </div>
        </div>
      )}

      {/* Download Section */}
      {splitBlobs.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              PDF Split Successfully! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Extracted {splitBlobs.length} page(s) from the original document
            </p>
            {splitBlobs.map((split, index) => (
              <div key={index} className="mb-2">
                <Button
                  onClick={() => downloadSplit(split.blob, split.name)}
                  className="mr-2"
                >
                  📥 Download {split.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mt-8">
        <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">300x250 Rectangle Ad</p>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload a PDF file to analyze its page count</li>
          <li>• Choose split type: Single page, page range, or multiple specific pages</li>
          <li>• Enter page numbers (e.g., "1-5, 8, 10-12" for ranges, "1,3,7" for specific pages)</li>
          <li>• Optionally add watermark text to extracted pages</li>
          <li>• Click "Split PDF" to extract the specified pages</li>
          <li>• Download the new PDF containing only the selected pages</li>
        </ul>
      </div>
    </div>
  );
}
