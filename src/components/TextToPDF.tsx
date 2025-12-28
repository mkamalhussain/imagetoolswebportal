"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

export default function TextToPDF() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: "Arial",
    fontSize: 14,
    color: "#000000",
    lineHeight: 1.5,
    textAlign: 'left'
  });
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'a3'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const contentRef = useRef<HTMLDivElement>(null);

  // Generate PDF from text
  const generatePDF = useCallback(async () => {
    if (!content.trim()) {
      setError("Please enter some text content");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      // Import html2canvas and jspdf
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Create PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
      });

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Create a temporary element for rendering
      const tempElement = document.createElement('div');
      tempElement.innerHTML = `
        <div style="
          font-family: ${textStyle.fontFamily};
          font-size: ${textStyle.fontSize}px;
          color: ${textStyle.color};
          line-height: ${textStyle.lineHeight};
          text-align: ${textStyle.textAlign};
          padding: 20px;
          max-width: ${pageWidth * 2.8}mm;
          word-wrap: break-word;
        ">
          ${title ? `<h1 style="margin-bottom: 20px; font-size: 24px; text-align: center;">${title}</h1>` : ''}
          <div style="white-space: pre-wrap;">${content.replace(/\n/g, '<br>')}</div>
        </div>
      `;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.width = `${pageWidth * 2.8}mm`;
      document.body.appendChild(tempElement);

      // Convert to canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(tempElement);

      // Calculate scaling to fit page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Convert to blob
      const pdfBlob = pdf.output('blob');
      setGeneratedBlob(pdfBlob);

    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [title, content, textStyle, pageSize, orientation]);

  // Download PDF
  const downloadPDF = useCallback(() => {
    if (!generatedBlob) return;

    const url = URL.createObjectURL(generatedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'text-document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedBlob, title]);

  const fontOptions = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Text to PDF
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert text content into beautifully formatted PDF documents
        </p>
      </div>

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text content here..."
              rows={12}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Page Settings */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Page Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="a3">A3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as typeof orientation)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Text Styling */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Text Styling</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font
                </label>
                <select
                  value={textStyle.fontFamily}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size (px)
                </label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={textStyle.fontSize}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 14 }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={textStyle.color}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alignment
                </label>
                <select
                  value={textStyle.textAlign}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, textAlign: e.target.value as typeof textStyle.textAlign }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={generatePDF}
              disabled={isGenerating || !content.trim()}
            >
              {isGenerating ? "Generating PDF..." : "Generate PDF"}
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Preview
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-96">
            <div
              ref={contentRef}
              className="prose prose-sm dark:prose-invert max-w-none"
              style={{
                fontFamily: textStyle.fontFamily,
                fontSize: `${textStyle.fontSize}px`,
                color: textStyle.color,
                lineHeight: textStyle.lineHeight,
                textAlign: textStyle.textAlign,
              }}
            >
              {title && (
                <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {content || "Enter your text content to see the preview..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
      {generatedBlob && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              PDF Generated Successfully! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your text has been converted to a beautifully formatted PDF
            </p>
            <Button onClick={downloadPDF}>
              📥 Download PDF
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
          <li>• Enter a title (optional) and your text content</li>
          <li>• Customize font, size, color, and alignment</li>
          <li>• Choose page size (A4, Letter, A3) and orientation</li>
          <li>• Preview your text formatting in real-time</li>
          <li>• Click "Generate PDF" to create your document</li>
          <li>• Download the professionally formatted PDF</li>
        </ul>
      </div>
    </div>
  );
}
