"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface CompressionResult {
  format: string;
  quality: number;
  size: number;
  dataUrl: string;
  compressionRatio: number;
}

export default function ImageSizePredictor() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [predictions, setPredictions] = useState<CompressionResult[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<CompressionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estimate compressed size based on format and quality
  const estimateCompressedSize = useCallback((originalSize: number, format: string, quality: number): number => {
    let baseRatio: number;

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        // JPEG compression ratios vary significantly with quality
        if (quality >= 0.9) baseRatio = 0.8; // High quality, minimal compression
        else if (quality >= 0.7) baseRatio = 0.6;
        else if (quality >= 0.5) baseRatio = 0.4;
        else if (quality >= 0.3) baseRatio = 0.25;
        else baseRatio = 0.15; // Low quality, high compression
        break;
      case 'webp':
        // WebP generally better compression than JPEG
        baseRatio = quality * 0.6 + 0.1;
        break;
      case 'png':
        // PNG is lossless, but can be large
        baseRatio = 0.7; // Some compression possible
        break;
      default:
        baseRatio = 0.8;
    }

    return Math.round(originalSize * baseRatio);
  }, []);

  // Analyze image and generate predictions
  const analyzeImage = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError("");
    setPredictions([]);
    setSelectedPrediction(null);

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
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      const fileSize = file.size;
      setOriginalImage(file);
      setOriginalSize(fileSize);

      // Generate predictions for different formats and qualities
      const results: CompressionResult[] = [];

      // JPEG predictions at different qualities
      const jpegQualities = [0.3, 0.5, 0.7, 0.9];
      for (const quality of jpegQualities) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const estimatedSize = estimateCompressedSize(fileSize, 'jpeg', quality);

        results.push({
          format: 'JPEG',
          quality: Math.round(quality * 100),
          size: estimatedSize,
          dataUrl,
          compressionRatio: Math.round((1 - estimatedSize / fileSize) * 100)
        });
      }

      // WebP predictions (if supported)
      if (canvas.toDataURL('image/webp').indexOf('image/webp') !== -1) {
        const webpQualities = [0.3, 0.5, 0.7, 0.9];
        for (const quality of webpQualities) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL('image/webp', quality);
          const estimatedSize = estimateCompressedSize(fileSize, 'webp', quality);

          results.push({
            format: 'WebP',
            quality: Math.round(quality * 100),
            size: estimatedSize,
            dataUrl,
            compressionRatio: Math.round((1 - estimatedSize / fileSize) * 100)
          });
        }
      }

      // PNG prediction (lossless)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngSize = estimateCompressedSize(fileSize, 'png', 1);

      results.push({
        format: 'PNG',
        quality: 100,
        size: pngSize,
        dataUrl: pngDataUrl,
        compressionRatio: Math.round((1 - pngSize / fileSize) * 100)
      });

      setPredictions(results);

    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Please try a different image.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [estimateCompressedSize]);

  // Apply selected compression
  const applyCompression = useCallback(async (prediction: CompressionResult) => {
    setSelectedPrediction(prediction);
  }, []);

  // Download compressed image
  const downloadCompressed = useCallback(() => {
    if (!selectedPrediction) return;

    const link = document.createElement('a');
    link.href = selectedPrediction.dataUrl;
    link.download = `compressed-${selectedPrediction.format.toLowerCase()}-q${selectedPrediction.quality}-${Date.now()}.${selectedPrediction.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedPrediction]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    analyzeImage(file);
  }, [analyzeImage]);

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
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  }, [handleFileUpload]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Size Predictor & Reducer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Predict compressed file sizes and optimize images for web delivery
        </p>
      </div>

      {/* Upload Section */}
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
              <path d="M12 10v38m24-38v38M10 12h28v24H10z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 18h16M16 24h16M16 30h8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop an image here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Analyze compression options and file size savings</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Select Image"}
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

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {originalImage && predictions.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Compression Analysis
            </h3>
          </div>

          {/* Original Image Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Original Image</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p><strong>Size:</strong> {formatFileSize(originalSize)}</p>
              <p><strong>Format:</strong> {originalImage.type.split('/')[1].toUpperCase()}</p>
              <p><strong>Dimensions:</strong> {predictions[0]?.dataUrl ? 'Analyzed' : 'Processing...'}</p>
            </div>
          </div>

          {/* Compression Predictions */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Compression Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPrediction === prediction
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => applyCompression(prediction)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {prediction.format}
                    </h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      prediction.compressionRatio > 50
                        ? 'bg-green-100 text-green-800'
                        : prediction.compressionRatio > 25
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prediction.compressionRatio}% smaller
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Quality:</strong> {prediction.quality}%</p>
                    <p><strong>Size:</strong> {formatFileSize(prediction.size)}</p>
                    <p><strong>Savings:</strong> {formatFileSize(originalSize - prediction.size)}</p>
                  </div>

                  {selectedPrediction === prediction && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <Button onClick={downloadCompressed}>
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedPrediction && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Preview: {selectedPrediction.format} (Quality: {selectedPrediction.quality}%)
              </h4>
              <div className="flex justify-center">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={selectedPrediction.dataUrl}
                    alt={`Compressed ${selectedPrediction.format}`}
                    className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {formatFileSize(selectedPrediction.size)} • {selectedPrediction.compressionRatio}% reduction
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Canvas for processing (hidden) */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload any image to see compression predictions</li>
          <li>• Compare file sizes across different formats (JPEG, WebP, PNG)</li>
          <li>• Choose quality levels based on your needs (higher quality = larger files)</li>
          <li>• Perfect for optimizing images for web delivery and bandwidth savings</li>
          <li>• Ideal for email attachments, website images, and mobile app assets</li>
        </ul>
      </div>
    </div>
  );
}
