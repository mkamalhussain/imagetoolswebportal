"use client";

import React, { useCallback, useState } from "react";
import Button from "@/components/Button";

interface ExtractedText {
  page: number;
  text: string;
}

export default function PDFTextExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'html'>('txt');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection and extract text
  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setExtractedTexts([]);
    setError("");
    setIsExtracting(true);

    try {
      // Import PDF.js
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const texts: ExtractedText[] = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        texts.push({
          page: pageNum,
          text: pageText
        });
      }

      setExtractedTexts(texts);

    } catch (err) {
      console.error("Text extraction error:", err);
      setError("Failed to extract text from PDF. The PDF may be image-based or corrupted.");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Generate export content
  const generateExportContent = useCallback(() => {
    if (exportFormat === 'txt') {
      return extractedTexts
        .map(text => `--- Page ${text.page} ---\n${text.text}`)
        .join('\n\n');
    } else {
      // HTML format
      const htmlContent = extractedTexts
        .map(text => `<h2>Page ${text.page}</h2><p>${text.text.replace(/\n/g, '<br>')}</p>`)
        .join('');

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Extracted Text from ${selectedFile?.name || 'PDF'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            p { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>Extracted Text from ${selectedFile?.name || 'PDF'}</h1>
          ${htmlContent}
        </body>
        </html>
      `;
    }
  }, [extractedTexts, exportFormat, selectedFile]);

  // Download extracted text
  const downloadExtracted = useCallback(() => {
    const content = generateExportContent();
    const mimeType = exportFormat === 'txt' ? 'text/plain' : 'text/html';
    const extension = exportFormat === 'txt' ? 'txt' : 'html';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extracted-text-${selectedFile?.name?.replace('.pdf', '') || 'document'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateExportContent, exportFormat, selectedFile]);

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

  const totalTextLength = extractedTexts.reduce((sum, text) => sum + text.text.length, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Text Extractor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract text content from PDF files and export as editable text or HTML
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
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop a PDF file here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Extract text content from PDF documents</p>
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

      {/* Extraction Status */}
      {selectedFile && isExtracting && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 dark:text-blue-300">
            Extracting text from PDF...
          </p>
        </div>
      )}

      {/* Extracted Text */}
      {extractedTexts.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Extracted Text ({extractedTexts.length} pages, {totalTextLength} characters)
              </h3>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Export as:</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'txt' | 'html')}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="html">HTML (.html)</option>
                </select>
                <Button onClick={downloadExtracted}>
                  📥 Download
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {extractedTexts.map((pageText) => (
                <div key={pageText.page} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Page {pageText.page}
                  </h4>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {pageText.text || "(No text found on this page)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Text Found */}
      {selectedFile && !isExtracting && extractedTexts.length > 0 && totalTextLength === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No text content was found in this PDF. The document may be image-based (scanned), contain only images, or use non-standard fonts.
          </p>
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
          <li>• Upload a PDF file with text content</li>
          <li>• The tool will extract text from all pages</li>
          <li>• Choose export format: Plain text or formatted HTML</li>
          <li>• Download the extracted text for editing or further processing</li>
          <li>• Perfect for converting PDFs to editable documents</li>
          <li>• <strong>Note:</strong> Works best with text-based PDFs. Scanned/image PDFs may not extract text.</li>
        </ul>
      </div>
    </div>
  );
}
