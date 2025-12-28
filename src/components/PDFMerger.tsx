"use client";

import React, { useCallback, useState } from "react";
import Button from "@/components/Button";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  order: number;
}

export default function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add PDF files
  const addPDFFiles = useCallback((files: FileList) => {
    const pdfFilesArray = Array.from(files).filter(file =>
      file.type === 'application/pdf'
    );

    if (pdfFilesArray.length === 0) {
      setError("Please select PDF files only");
      return;
    }

    const newPDFFiles: PDFFile[] = pdfFilesArray.map((file, index) => ({
      id: `pdf-${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      order: pdfFiles.length + index
    }));

    setPdfFiles(prev => [...prev, ...newPDFFiles]);
    setError("");
  }, [pdfFiles.length]);

  // Remove PDF file
  const removePDFFile = useCallback((id: string) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  // Move PDF file up/down
  const movePDFFile = useCallback((id: string, direction: 'up' | 'down') => {
    setPdfFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;

      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }

      // Update order numbers
      newFiles.forEach((file, idx) => {
        file.order = idx;
      });

      return newFiles;
    });
  }, []);

  // Merge PDFs
  const mergePDFs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      setError("Please select at least 2 PDF files to merge");
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      const { PDFDocument } = await import('pdf-lib');

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Sort files by order
      const sortedFiles = [...pdfFiles].sort((a, b) => a.order - b.order);

      // Add pages from each PDF
      for (const pdfFile of sortedFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const mergedBlob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });

      setMergedBlob(mergedBlob);

    } catch (err) {
      console.error("Merge error:", err);
      setError("Failed to merge PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles]);

  // Download merged PDF
  const downloadMerged = useCallback(() => {
    if (!mergedBlob) return;

    const url = URL.createObjectURL(mergedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merged-pdf-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [mergedBlob]);

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
      addPDFFiles(files);
    }
  }, [addPDFFiles]);

  const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Merger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Combine multiple PDF files into one document with drag-and-drop reordering
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
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75c0 1.24.775 2.306 1.875 2.75h.75m-3-6.75h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop multiple PDF files here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Files will be merged in the order shown below</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select PDF Files
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files) addPDFFiles(files);
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

      {/* PDF File List */}
      {pdfFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Files to Merge ({pdfFiles.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatFileSize(totalSize)}
            </div>
          </div>

          <div className="space-y-2">
            {pdfFiles
              .sort((a, b) => a.order - b.order)
              .map((pdfFile, index) => (
                <div
                  key={pdfFile.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {index + 1}. {pdfFile.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(pdfFile.size)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => movePDFFile(pdfFile.id, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => movePDFFile(pdfFile.id, 'down')}
                      disabled={index === pdfFiles.length - 1}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removePDFFile(pdfFile.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Merge Button */}
          <div className="text-center">
            <Button
              onClick={mergePDFs}
              disabled={isMerging || pdfFiles.length < 2}
            >
              {isMerging ? "Merging PDFs..." : "Merge PDFs"}
            </Button>
          </div>
        </div>
      )}

      {/* Download Section */}
      {mergedBlob && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              PDFs Merged Successfully! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Combined {pdfFiles.length} PDF files into one document
            </p>
            <Button onClick={downloadMerged}>
              📥 Download Merged PDF
            </Button>
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
          <li>• Upload multiple PDF files by dragging & dropping or clicking to select</li>
          <li>• Use the up/down arrows to reorder files as needed</li>
          <li>• Click "Merge PDFs" to combine all files into one document</li>
          <li>• Download the merged PDF with all pages in the specified order</li>
          <li>• Perfect for combining reports, documents, and presentations</li>
        </ul>
      </div>
    </div>
  );
}
