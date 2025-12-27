"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface PanoramaImage {
  id: string;
  file: File;
  url: string;
  img: HTMLImageElement;
}

export default function PanoramaStitcher() {
  const [images, setImages] = useState<PanoramaImage[]>([]);
  const [stitchedPanorama, setStitchedPanorama] = useState<string | null>(null);
  const [overlapPercentage, setOverlapPercentage] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load images
  const loadImages = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    setError("");
    setCurrentStep("Loading images...");

    try {
      const imagePromises = Array.from(files).map(async (file, index) => {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        return {
          id: `img-${index}-${Date.now()}`,
          file,
          url: URL.createObjectURL(file),
          img
        };
      });

      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages);

      if (loadedImages.length < 2) {
        setError("Please select at least 2 images for panorama stitching");
      }

    } catch (err) {
      console.error("Image loading error:", err);
      setError("Failed to load images. Please try different images.");
    } finally {
      setIsProcessing(false);
      setCurrentStep("");
    }
  }, []);

  // Basic panorama stitching (simplified)
  const stitchPanorama = useCallback(async () => {
    if (images.length < 2) {
      setError("Need at least 2 images to create a panorama");
      return;
    }

    setIsProcessing(true);
    setError("");
    setCurrentStep("Analyzing images...");

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

      // Sort images by filename (assuming they were taken in order)
      const sortedImages = [...images].sort((a, b) =>
        a.file.name.localeCompare(b.file.name)
      );

      setCurrentStep("Calculating dimensions...");

      // Calculate total width (accounting for overlap)
      const firstImage = sortedImages[0].img;
      const overlapPixels = Math.floor(firstImage.width * (overlapPercentage / 100));

      let totalWidth = firstImage.width;
      for (let i = 1; i < sortedImages.length; i++) {
        totalWidth += sortedImages[i].img.width - overlapPixels;
      }

      const canvasHeight = Math.max(...sortedImages.map(img => img.img.height));

      canvas.width = totalWidth;
      canvas.height = canvasHeight;

      setCurrentStep("Stitching images...");

      // Draw first image
      ctx.drawImage(firstImage, 0, 0);

      // Draw subsequent images with overlap
      let currentX = firstImage.width - overlapPixels;

      for (let i = 1; i < sortedImages.length; i++) {
        const img = sortedImages[i].img;

        // Simple alignment - just place with overlap
        // A real implementation would use feature matching
        ctx.drawImage(img, currentX, 0);

        // Blend the overlapping area
        blendOverlap(ctx, currentX, overlapPixels, canvasHeight);

        currentX += img.width - overlapPixels;
      }

      setCurrentStep("Generating panorama...");

      // Generate final panorama
      const panoramaUrl = canvas.toDataURL('image/png');
      setStitchedPanorama(panoramaUrl);

    } catch (err) {
      console.error("Stitching error:", err);
      setError("Failed to stitch panorama. Please try again.");
    } finally {
      setIsProcessing(false);
      setCurrentStep("");
    }
  }, [images, overlapPercentage]);

  // Simple overlap blending
  const blendOverlap = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    overlapWidth: number,
    height: number
  ) => {
    // Create a simple gradient blend
    const gradient = ctx.createLinearGradient(startX, 0, startX + overlapWidth, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, 0, overlapWidth, height);
    ctx.globalCompositeOperation = 'source-over';
  };

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      loadImages(files);
    }
  }, [loadImages]);

  // Remove image
  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setImages([]);
    setStitchedPanorama(null);
    setError("");
  }, []);

  // Download panorama
  const downloadPanorama = useCallback(() => {
    if (!stitchedPanorama) return;

    const link = document.createElement('a');
    link.href = stitchedPanorama;
    link.download = `panorama-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stitchedPanorama]);

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
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panorama Stitcher
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Combine multiple overlapping photos into a single panoramic image
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
              <path d="M12 2l3 3-3 3-3-3 3-3zM36 2l3 3-3 3-3-3 3-3z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 14h36v24H6z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="26" r="8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop multiple overlapping photos here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Select 2-6 images taken in sequence</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? currentStep || "Processing..." : "Select Images"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Image Preview and Settings */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stitching Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image Overlap (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={overlapPercentage}
                  onChange={(e) => setOverlapPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {overlapPercentage}% overlap between images
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={stitchPanorama}
                  disabled={isProcessing || images.length < 2}
                  className="w-full"
                >
                  {isProcessing ? currentStep || "Stitching..." : "Create Panorama"}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Images should be taken in sequence from left to right</p>
              <p>• Ensure 20-40% overlap between adjacent photos</p>
              <p>• Best results with consistent lighting and minimal movement</p>
            </div>
          </div>

          {/* Image Thumbnails */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Images ({images.length})
              </h3>
              <Button variant="secondary" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stitched Panorama */}
          {stitchedPanorama && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Stitched Panorama
                </h3>
                <Button onClick={downloadPanorama}>
                  📥 Download Panorama
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={stitchedPanorama}
                  alt="Stitched panorama"
                  className="w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          )}

          {/* Hidden canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to create great panoramas:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Take photos in sequence from left to right (or right to left)</li>
          <li>• Maintain 20-40% overlap between adjacent photos</li>
          <li>• Keep the camera level and consistent distance from subject</li>
          <li>• Use consistent exposure and white balance</li>
          <li>• Avoid moving objects or changing lighting conditions</li>
          <li>• This tool provides basic stitching - professional results may require specialized software</li>
        </ul>
      </div>
    </div>
  );
}
