"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import QRCode from "qrcode";
// @ts-ignore - jsQR doesn't have proper TypeScript types
import jsQR from "jsqr";

export default function QRCodeTool() {
  const [mode, setMode] = useState<'scan' | 'generate'>('generate');
  const [qrText, setQrText] = useState<string>("");
  const [scannedText, setScannedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // jsQR is now imported statically

  // Generate QR Code
  const generateQR = useCallback(async () => {
    console.log("generateQR called with text:", qrText);
    console.log("logoImage available:", !!logoImage);

    if (!qrText.trim()) {
      setError("Please enter text or URL to generate QR code");
      return;
    }

    setIsProcessing(true);
    setError("");
    setQrImageUrl(""); // Clear previous result

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError("Canvas not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      console.log("Generating QR code with text:", qrText);

      // Generate QR code as image data URL
      const qrDataUrl = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log("QR data URL generated, length:", qrDataUrl.length);

      // Load the QR code image
      const qrImg = new Image();
      qrImg.onload = () => {
        console.log("QR image loaded, drawing to canvas");

        // Set canvas size
        canvas.width = 400;
        canvas.height = 400;

        // Clear canvas
        ctx.clearRect(0, 0, 400, 400);

        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, 400, 400);

        // If logo is provided, embed it in the center
        if (logoImage) {
          console.log("Adding logo to QR code");
          const logoSize = 80; // Logo size (20% of QR code)
          const logoX = (400 - logoSize) / 2;
          const logoY = (400 - logoSize) / 2;

          // Create white background for logo
          ctx.fillStyle = 'white';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // Draw logo
          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }

        // Create final data URL
        const finalDataUrl = canvas.toDataURL('image/png');
        console.log("Final QR image URL generated, setting state");
        setQrImageUrl(finalDataUrl);
      };

      qrImg.onerror = () => {
        console.error("Failed to load QR image");
        setError("Failed to load generated QR code");
      };

      qrImg.src = qrDataUrl;

    } catch (err) {
      setError("Failed to generate QR code");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [qrText, logoImage]);

  // Scan QR Code from uploaded image
  const scanQR = useCallback(async (file: File) => {

    setIsProcessing(true);
    setError("");
    setScannedText("");

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError("Canvas not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      // Load image
      const img = new Image();
      img.onload = () => {
        try {
          // Validate image dimensions
          if (img.width === 0 || img.height === 0) {
            setError("Invalid image dimensions");
            return;
          }

          // Set canvas size to match image (with reasonable limits)
          const maxSize = 2048;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          // Clear canvas first
          ctx.clearRect(0, 0, width, height);

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);

          // Validate image data
          if (!imageData || !imageData.data || imageData.data.length === 0) {
            setError("Failed to read image data");
            return;
          }

          // Scan for QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            setScannedText(code.data);
            setQrImageUrl(canvas.toDataURL('image/png'));
          } else {
            setError("No QR code found in the image. Try a clearer image or different angle.");
          }
        } catch (scanError) {
          console.error("QR scan error:", scanError);
          setError("Failed to process the image. Please try a different image.");
        }
      };

      img.onerror = () => {
        setError("Failed to load image. Please try a different image file.");
      };

      img.src = URL.createObjectURL(file);

    } catch (err) {
      console.error("Scan setup error:", err);
      setError("Failed to scan QR code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle file upload for scanning
  const handleFileUpload = useCallback((file: File) => {
    if (mode === 'scan') {
      scanQR(file);
    }
  }, [mode, scanQR]);

  // Handle logo file upload
  const handleLogoUpload = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      setLogoImage(img);
      setLogoFile(file);
    };
    img.src = URL.createObjectURL(file);
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
      const file = files[0];
      if (mode === 'generate' && file.type.startsWith('image/')) {
        handleLogoUpload(file);
      } else if (mode === 'scan' && file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  }, [mode, handleLogoUpload, handleFileUpload]);

  // Download QR code
  const downloadQR = useCallback(() => {
    if (!qrImageUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrImageUrl;
    link.click();
  }, [qrImageUrl]);

  // Clear all
  const clearAll = useCallback(() => {
    setQrText("");
    setScannedText("");
    setQrImageUrl("");
    setLogoImage(null);
    setLogoFile(null);
    setError("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          QR Code Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate QR codes or scan QR codes from images
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setMode('generate')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'generate'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Generate QR
          </button>
          <button
            onClick={() => setMode('scan')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'scan'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Scan QR
          </button>
        </div>
      </div>

      {/* Generate Mode */}
      {mode === 'generate' && (
        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text or URL
            </label>
            <textarea
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="Enter text, URL, or any data to encode in QR code..."
              className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo (Optional) - Will be embedded in center of QR code
            </label>
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
              {logoImage ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={URL.createObjectURL(logoFile!)}
                      alt="Logo preview"
                      className="max-w-20 max-h-20 object-contain"
                    />
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => logoInputRef.current?.click()}>
                      Change Logo
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setLogoImage(null);
                        setLogoFile(null);
                      }}
                    >
                      Remove Logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p>Drop logo image here, or click to select</p>
                  </div>
                  <Button onClick={() => logoInputRef.current?.click()}>
                    Select Logo
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
              className="hidden"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button onClick={generateQR} disabled={isProcessing}>
              {isProcessing ? "Generating..." : "Generate QR Code"}
            </Button>
          </div>
        </div>
      )}

      {/* Scan Mode */}
      {mode === 'scan' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image with QR Code
            </label>
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
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>Drop QR code image here, or click to select</p>
              </div>
              <Button
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Select Image"}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {(qrImageUrl || scannedText || isProcessing) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'generate' ? (isProcessing ? 'Generating QR Code...' : 'Generated QR Code') : 'Scanned QR Code'}
          </h3>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* QR Code Display */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {isProcessing && mode === 'generate' ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Generating QR Code...</p>
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                  />
                )}
              </div>
            </div>

            {/* Text Display */}
            <div className="flex-1">
              {mode === 'generate' && qrText && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Input Text:</h4>
                  <p className="text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {qrText}
                  </p>
                </div>
              )}

              {scannedText && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scanned Text:</h4>
                  <p className="text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {scannedText}
                  </p>
                  {scannedText.startsWith('http') && (
                    <Button
                      variant="secondary"
                      as="a"
                      href={scannedText}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2"
                    >
                      Open Link
                    </Button>
                  )}
                </div>
              )}

              {qrImageUrl && (
                <div className="space-x-2">
                  <Button onClick={downloadQR}>
                    Download QR Code
                  </Button>
                  <Button variant="secondary" onClick={clearAll}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li><strong>Generate:</strong> Enter text or URL, optionally add a logo, and click "Generate QR Code"</li>
          <li><strong>Scan:</strong> Upload an image containing a QR code to extract the data</li>
          <li>• Supports text, URLs, and other data encoded in QR codes</li>
          <li>• Logo embedding helps with branding but may reduce scan reliability</li>
        </ul>
      </div>
    </div>
  );
}
