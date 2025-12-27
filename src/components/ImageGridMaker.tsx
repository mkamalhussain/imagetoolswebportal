"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface GridConfig {
  rows: number;
  cols: number;
  spacing: number;
  backgroundColor: string;
}

export default function ImageGridMaker() {
  const [images, setImages] = useState<File[]>([]);
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    rows: 2,
    cols: 2,
    spacing: 10,
    backgroundColor: '#ffffff'
  });
  const [generatedGrid, setGeneratedGrid] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate cell dimensions
  const getCellSize = useCallback(() => {
    const totalImages = gridConfig.rows * gridConfig.cols;
    const cellSize = 300; // Base cell size
    return cellSize;
  }, [gridConfig]);

  // Generate grid
  const generateGrid = useCallback(async () => {
    if (images.length === 0) {
      setError("Please add at least one image");
      return;
    }

    setIsGenerating(true);
    setError("");

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

      const cellSize = getCellSize();
      const totalWidth = gridConfig.cols * cellSize + (gridConfig.cols - 1) * gridConfig.spacing;
      const totalHeight = gridConfig.rows * cellSize + (gridConfig.rows - 1) * gridConfig.spacing;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Fill background
      ctx.fillStyle = gridConfig.backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Load and draw images
      const totalCells = gridConfig.rows * gridConfig.cols;
      const imagesToUse = Math.min(images.length, totalCells);

      for (let i = 0; i < imagesToUse; i++) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(images[i]);
        });

        const row = Math.floor(i / gridConfig.cols);
        const col = i % gridConfig.cols;

        const x = col * (cellSize + gridConfig.spacing);
        const y = row * (cellSize + gridConfig.spacing);

        // Calculate dimensions to fit the cell while maintaining aspect ratio
        const scale = Math.min(cellSize / img.width, cellSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image in the cell
        const offsetX = (cellSize - scaledWidth) / 2;
        const offsetY = (cellSize - scaledHeight) / 2;

        ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);

        // Optional: Add border around each cell
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }

      // Generate data URL
      const gridDataUrl = canvas.toDataURL('image/png');
      setGeneratedGrid(gridDataUrl);

    } catch (err) {
      console.error("Grid generation error:", err);
      setError("Failed to generate grid. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [images, gridConfig, getCellSize]);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError("Please select image files only");
      return;
    }

    // Limit to reasonable number
    const maxImages = gridConfig.rows * gridConfig.cols;
    const selectedImages = imageFiles.slice(0, maxImages);

    setImages(selectedImages);
    setError("");
  }, [gridConfig]);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setImages([]);
    setGeneratedGrid(null);
    setError("");
  }, []);

  // Download grid
  const downloadGrid = useCallback(() => {
    if (!generatedGrid) return;

    const link = document.createElement('a');
    link.href = generatedGrid;
    link.download = `image-grid-${gridConfig.rows}x${gridConfig.cols}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedGrid, gridConfig]);

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

  const totalCells = gridConfig.rows * gridConfig.cols;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Grid Maker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create perfect image grids and collages with uniform cell sizes
        </p>
      </div>

      {/* Grid Configuration */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Grid Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rows
            </label>
            <select
              value={gridConfig.rows}
              onChange={(e) => setGridConfig(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Columns
            </label>
            <select
              value={gridConfig.cols}
              onChange={(e) => setGridConfig(prev => ({ ...prev, cols: parseInt(e.target.value) }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Spacing (px)
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={gridConfig.spacing}
              onChange={(e) => setGridConfig(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              {gridConfig.spacing}px
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background
            </label>
            <input
              type="color"
              value={gridConfig.backgroundColor}
              onChange={(e) => setGridConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Grid will have {totalCells} cells ({gridConfig.rows}×{gridConfig.cols})
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Images ({images.length}/{totalCells})
        </h3>

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
            <p>Drop images here, or click to select multiple images</p>
            <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, GIF, WebP</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Images
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

      {/* Image Preview */}
      {images.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Images
            </h3>
            <Button variant="secondary" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button onClick={generateGrid} disabled={isGenerating || images.length === 0}>
              {isGenerating ? "Generating Grid..." : `Generate ${gridConfig.rows}×${gridConfig.cols} Grid`}
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Generated Grid */}
      {generatedGrid && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Generated Grid
            </h3>
            <Button onClick={downloadGrid}>
              📥 Download Grid
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <img
                src={generatedGrid}
                alt="Generated grid"
                className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Canvas for processing (hidden) */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Configure your grid dimensions (rows × columns)</li>
          <li>• Adjust spacing and background color as needed</li>
          <li>• Upload images (they will be automatically fitted to grid cells)</li>
          <li>• Images are scaled to fit while maintaining aspect ratio</li>
          <li>• Perfect for Instagram grids, product displays, and uniform layouts</li>
        </ul>
      </div>
    </div>
  );
}
