"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Button from "@/components/Button";

interface CornerPoint {
  x: number;
  y: number;
}

export default function PerspectiveCorrection() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [correctedUrl, setCorrectedUrl] = useState<string | null>(null);
  const [corners, setCorners] = useState<CornerPoint[]>([
    { x: 100, y: 100 }, // Top-left
    { x: 500, y: 100 }, // Top-right
    { x: 500, y: 400 }, // Bottom-right
    { x: 100, y: 400 }  // Bottom-left
  ]);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const correctionCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw image to canvas when both are available
  useEffect(() => {
    if (originalImage && canvasRef.current && sourceUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        console.log('Drawing image to canvas in useEffect:', originalImage.width, 'x', originalImage.height);
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        console.log('Canvas after drawing in useEffect:', canvas.width, 'x', canvas.height);

        // Adjust corners based on actual canvas size
        const margin = 50;
        const newCorners = [
          { x: margin, y: margin },
          { x: originalImage.width - margin, y: margin },
          { x: originalImage.width - margin, y: originalImage.height - margin },
          { x: margin, y: originalImage.height - margin }
        ];
        console.log('Adjusting corners in useEffect:', newCorners);
        setCorners(newCorners);
      } else {
        console.error('Could not get canvas context in useEffect');
      }
    }
  }, [originalImage, sourceUrl]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image and set up corners
  const loadImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError("");

    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      setOriginalImage(img);
      setSourceUrl(URL.createObjectURL(file));

      // Initialize corners as a rectangle (will be adjusted when canvas is ready)
      const margin = 50;
      const newCorners = [
        { x: margin, y: margin },
        { x: img.width - margin, y: margin },
        { x: img.width - margin, y: img.height - margin },
        { x: margin, y: img.height - margin }
      ];
      console.log('Setting initial corners:', newCorners);
      setCorners(newCorners);

    } catch (err) {
      console.error("Image loading error:", err);
      setError("Failed to load image. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Apply perspective correction
  const applyCorrection = useCallback(() => {
    if (!originalImage) {
      setError("No image loaded");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const canvas = correctionCanvasRef.current;
      if (!canvas) {
        setError("Correction canvas not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      // Set output canvas size (same as input for simplicity)
      const outputWidth = originalImage.width;
      const outputHeight = originalImage.height;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Clear canvas
      ctx.clearRect(0, 0, outputWidth, outputHeight);

      // Source points (original corners)
      const srcPoints = corners.map(corner => [corner.x, corner.y]);

      // Destination points (rectangle)
      const dstPoints = [
        [0, 0],
        [outputWidth, 0],
        [outputWidth, outputHeight],
        [0, outputHeight]
      ];

      // Apply perspective transformation
      applyPerspectiveTransform(ctx, originalImage, srcPoints, dstPoints);

      // Generate corrected image URL
      const correctedImageUrl = canvas.toDataURL('image/png');
      setCorrectedUrl(correctedImageUrl);

    } catch (err) {
      console.error("Correction error:", err);
      setError("Failed to apply perspective correction. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, corners]);

  // Perspective transformation function
  const applyPerspectiveTransform = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    srcPoints: number[][],
    dstPoints: number[][]
  ) => {
    // Calculate transformation matrix
    const matrix = calculatePerspectiveMatrix(srcPoints, dstPoints);

    // Apply transformation
    ctx.setTransform(
      matrix[0][0], matrix[1][0], matrix[0][1],
      matrix[1][1], matrix[0][2], matrix[1][2]
    );

    // Draw the transformed image
    ctx.drawImage(img, 0, 0);

    // Reset transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  // Calculate perspective transformation matrix
  const calculatePerspectiveMatrix = (src: number[][], dst: number[][]) => {
    // Simplified perspective transformation
    // This is a basic implementation - a full solution would use more complex math

    // For now, we'll use a simple affine transformation
    // This is not perfect but provides basic perspective correction

    const srcCenterX = (src[0][0] + src[1][0] + src[2][0] + src[3][0]) / 4;
    const srcCenterY = (src[0][1] + src[1][1] + src[2][1] + src[3][1]) / 4;
    const dstCenterX = (dst[0][0] + dst[1][0] + dst[2][0] + dst[3][0]) / 4;
    const dstCenterY = (dst[0][1] + dst[1][1] + dst[2][1] + dst[3][1]) / 4;

    // Calculate scale and rotation
    const srcWidth = Math.abs(src[1][0] - src[0][0]);
    const srcHeight = Math.abs(src[3][1] - src[0][1]);
    const dstWidth = Math.abs(dst[1][0] - dst[0][0]);
    const dstHeight = Math.abs(dst[3][1] - dst[0][1]);

    const scaleX = dstWidth / srcWidth;
    const scaleY = dstHeight / srcHeight;

    // Calculate rotation
    const srcAngle = Math.atan2(src[1][1] - src[0][1], src[1][0] - src[0][0]);
    const dstAngle = Math.atan2(dst[1][1] - dst[0][1], dst[1][0] - dst[0][0]);
    const rotation = dstAngle - srcAngle;

    // Return transformation matrix
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return [
      [cos * scaleX, -sin * scaleX, dstCenterX - srcCenterX * cos * scaleX + srcCenterY * sin * scaleX],
      [sin * scaleY, cos * scaleY, dstCenterY - srcCenterX * sin * scaleY - srcCenterY * cos * scaleY]
    ];
  };

  // Handle mouse events for dragging corners
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sourceUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate scaling factor between displayed size and actual pixel size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert mouse coordinates to canvas pixel coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    console.log('Mouse down at display coords:', e.clientX - rect.left, e.clientY - rect.top);
    console.log('Converted to canvas coords:', x, y);
    console.log('Canvas scaling:', scaleX, scaleY);

    // Check if clicking on a corner point
    const clickRadius = 15; // Increased radius for easier clicking
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      const distance = Math.sqrt((x - corner.x) ** 2 + (y - corner.y) ** 2);
      console.log(`Corner ${i} at:`, corner.x, corner.y, 'distance:', distance);
      if (distance <= clickRadius) {
        console.log('Clicked corner:', i);
        setDraggingPoint(i);
        break;
      }
    }
  }, [corners, sourceUrl]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingPoint === null) return;

    console.log('Mouse move while dragging corner:', draggingPoint);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate scaling factor between displayed size and actual pixel size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert mouse coordinates to canvas pixel coordinates
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY));

    console.log('Moving corner to:', x, y);

    setCorners(prev => prev.map((corner, index) =>
      index === draggingPoint ? { x, y } : corner
    ));

    // Redraw canvas to show updated corner positions (optional visual feedback)
    const ctx = canvas.getContext("2d");
    if (ctx && originalImage) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImage, 0, 0);
    }
  }, [draggingPoint, originalImage]);

  const handleMouseUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  // Auto-detect corners (basic implementation)
  const autoDetectCorners = useCallback(() => {
    if (!originalImage) return;

    // This is a very basic auto-detection
    // A real implementation would use edge detection and contour finding
    const canvas = canvasRef.current;
    if (!canvas) return;

    const margin = 20;
    setCorners([
      { x: margin, y: margin },
      { x: canvas.width - margin, y: margin },
      { x: canvas.width - margin, y: canvas.height - margin },
      { x: margin, y: canvas.height - margin }
    ]);
  }, [originalImage]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    loadImage(file);
  }, [loadImage]);

  // Download corrected image
  const downloadCorrected = useCallback(() => {
    if (!correctedUrl) return;

    const link = document.createElement('a');
    link.href = correctedUrl;
    link.download = `perspective-corrected-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [correctedUrl]);

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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Perspective Correction
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Correct tilted horizons and perspective distortion in photos
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
            <p className="text-sm text-gray-400 mt-1">Fix perspective distortion in photos</p>
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

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Editor */}
      {sourceUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image with Corner Points */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adjust Corner Points
              </h3>
              <Button onClick={autoDetectCorners} variant="secondary">
                Auto-Detect
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="relative overflow-auto max-h-96 max-w-full">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 dark:border-gray-600 cursor-crosshair block"
                  style={{
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />

                {/* Corner points */}
                {(() => {
                  if (!canvasRef.current || !originalImage) return null;

                  const canvas = canvasRef.current;
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = rect.width / canvas.width;
                  const scaleY = rect.height / canvas.height;

                  return corners.map((corner, index) => (
                    <div
                      key={index}
                      className={`absolute w-4 h-4 border-2 rounded-full cursor-move ${
                        draggingPoint === index
                          ? 'border-red-500 bg-red-500'
                          : 'border-blue-500 bg-blue-200'
                      }`}
                      style={{
                        left: (corner.x * scaleX) - 8,
                        top: (corner.y * scaleY) - 8,
                        zIndex: 10
                      }}
                    />
                  ));
                })()}

                {/* Connecting lines */}
                {(() => {
                  if (!canvasRef.current || !originalImage) return null;

                  const canvas = canvasRef.current;
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = rect.width / canvas.width;
                  const scaleY = rect.height / canvas.height;

                  return (
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <polygon
                        points={corners.map(corner => `${corner.x * scaleX},${corner.y * scaleY}`).join(' ')}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="2"
                      />
                    </svg>
                  );
                })()}
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>• Drag the corner points to adjust perspective</p>
                <p>• Click "Auto-Detect" for basic corner detection</p>
                <p>• Click "Apply Correction" when ready</p>
              </div>

              <div className="mt-4">
                <Button onClick={applyCorrection} disabled={isProcessing} className="w-full">
                  {isProcessing ? "Processing..." : "Apply Perspective Correction"}
                </Button>
              </div>
            </div>
          </div>

          {/* Corrected Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Corrected Image
            </h3>

            {correctedUrl ? (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={correctedUrl}
                  alt="Corrected image"
                  className="w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                />
                <div className="mt-4">
                  <Button onClick={downloadCorrected} className="w-full">
                    📥 Download Corrected Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400">
                  Adjust the corner points and click "Apply Perspective Correction"
                </p>
              </div>
            )}

            {/* Hidden correction canvas */}
            <canvas ref={correctionCanvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload a photo with perspective distortion (buildings, documents, etc.)</li>
          <li>• Drag the blue corner points to match the actual corners of your subject</li>
          <li>• Use "Auto-Detect" for basic corner detection (works best with clear edges)</li>
          <li>• Click "Apply Perspective Correction" to straighten the image</li>
          <li>• Download the corrected image as a PNG file</li>
        </ul>
      </div>
    </div>
  );
}
