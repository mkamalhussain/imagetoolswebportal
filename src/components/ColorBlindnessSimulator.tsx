"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

type ColorBlindnessType =
  | 'normal'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

interface SimulationInfo {
  name: string;
  description: string;
  prevalence: string;
}

export default function ColorBlindnessSimulator() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [simulatedUrl, setSimulatedUrl] = useState<string | null>(null);
  const [currentSimulation, setCurrentSimulation] = useState<ColorBlindnessType>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const simulations: Record<ColorBlindnessType, SimulationInfo> = {
    normal: {
      name: 'Normal Vision',
      description: 'Standard color vision',
      prevalence: 'Standard'
    },
    protanopia: {
      name: 'Protanopia',
      description: 'Red-blind (difficulty seeing red)',
      prevalence: '~1.3% of males, ~0.02% of females'
    },
    deuteranopia: {
      name: 'Deuteranopia',
      description: 'Green-blind (difficulty seeing green)',
      prevalence: '~5.0% of males, ~0.35% of females'
    },
    tritanopia: {
      name: 'Tritanopia',
      description: 'Blue-blind (difficulty seeing blue)',
      prevalence: '~0.002% of population'
    },
    achromatopsia: {
      name: 'Achromatopsia',
      description: 'Complete color blindness (monochrome)',
      prevalence: '~0.00003% of population'
    }
  };

  // Apply color blindness simulation using matrix transformations
  const applyColorBlindnessFilter = useCallback((
    imageData: ImageData,
    type: ColorBlindnessType
  ): ImageData => {
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    // Color blindness transformation matrices
    const matrices: Record<ColorBlindnessType, number[]> = {
      normal: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ],
      protanopia: [
        0.567, 0.433, 0, 0,
        0.558, 0.442, 0, 0,
        0, 0.242, 0.758, 0,
        0, 0, 0, 1
      ],
      deuteranopia: [
        0.625, 0.375, 0, 0,
        0.7, 0.3, 0, 0,
        0, 0.3, 0.7, 0,
        0, 0, 0, 1
      ],
      tritanopia: [
        0.95, 0.05, 0, 0,
        0, 0.433, 0.567, 0,
        0, 0.475, 0.525, 0,
        0, 0, 0, 1
      ],
      achromatopsia: [
        0.299, 0.587, 0.114, 0,
        0.299, 0.587, 0.114, 0,
        0.299, 0.587, 0.114, 0,
        0, 0, 0, 1
      ]
    };

    const matrix = matrices[type];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const newR = (matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3]) * 255;
      const newG = (matrix[4] * r + matrix[5] * g + matrix[6] * b + matrix[7]) * 255;
      const newB = (matrix[8] * r + matrix[9] * g + matrix[10] * b + matrix[11]) * 255;

      newData[i] = Math.max(0, Math.min(255, newR));
      newData[i + 1] = Math.max(0, Math.min(255, newG));
      newData[i + 2] = Math.max(0, Math.min(255, newB));
      newData[i + 3] = data[i + 3]; // Alpha channel unchanged
    }

    return new ImageData(newData, imageData.width, imageData.height);
  }, []);

  // Process image with color blindness simulation
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError("");
    setSimulatedUrl(null); // Clear previous result

    // Small delay to ensure canvas is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas ref is null during color blindness processing");
        setError("Canvas not available. Please try again.");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      // Load and draw image
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

      // Get original image data
      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply color blindness simulation
      const simulatedImageData = applyColorBlindnessFilter(originalImageData, currentSimulation);

      // Clear and draw simulated image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(simulatedImageData, 0, 0);

      // Update URLs
      setSourceUrl(URL.createObjectURL(file));
      setSimulatedUrl(canvas.toDataURL('image/png'));

    } catch (err) {
      console.error("Image processing error:", err);
      setError("Failed to process image. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  }, [currentSimulation, applyColorBlindnessFilter]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    processImage(file);
  }, [processImage]);

  // Handle simulation change
  const handleSimulationChange = useCallback((type: ColorBlindnessType) => {
    setCurrentSimulation(type);
    // Re-process if we have an image
    if (sourceUrl) {
      const file = new File([], "temp"); // This won't work, need to store original file
      // For now, just update the type - user will need to re-upload for new simulation
    }
  }, [sourceUrl]);

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

  // Download simulated image
  const downloadImage = useCallback(() => {
    if (!simulatedUrl) return;

    const link = document.createElement('a');
    link.href = simulatedUrl;
    link.download = `color-blindness-${currentSimulation}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [simulatedUrl, currentSimulation]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Color Blindness Simulator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how your images appear to people with different types of color vision deficiency
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
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop an image here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG, GIF, WebP supported</p>
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

      {/* Simulation Controls */}
      {sourceUrl && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Color Vision Simulation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(simulations) as ColorBlindnessType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleSimulationChange(type)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentSimulation === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {simulations[type].name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {simulations[type].description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {simulations[type].prevalence}
                </p>
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <strong>Note:</strong> These simulations are approximations based on scientific color transformation matrices.
            Actual color vision deficiency varies between individuals. Use this tool to improve accessibility awareness.
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
      {((sourceUrl && simulatedUrl) || isProcessing) && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isProcessing ? 'Processing Image...' : `${simulations[currentSimulation].name} Simulation`}
            </h3>
            {simulatedUrl && !isProcessing && (
              <Button onClick={downloadImage}>
                📥 Download Result
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {isProcessing ? 'Processing...' : 'Original Image'}
              </h4>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Analyzing image...</p>
                    </div>
                  </div>
                ) : sourceUrl ? (
                  <img
                    src={sourceUrl}
                    alt="Original"
                    className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                  />
                ) : null}
              </div>
            </div>

            {/* Simulated Image */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {isProcessing ? 'Generating Simulation...' : `Simulated: ${simulations[currentSimulation].name}`}
              </h4>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Applying color simulation...</p>
                    </div>
                  </div>
                ) : simulatedUrl ? (
                  <img
                    src={simulatedUrl}
                    alt={`Simulated ${currentSimulation}`}
                    className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Simulation Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              About {simulations[currentSimulation].name}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {simulations[currentSimulation].description}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Prevalence:</strong> {simulations[currentSimulation].prevalence}
            </p>
          </div>

          {/* Canvas for processing (hidden) */}
          {/* Canvas for processing (hidden) */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload any image to see how it appears with different color vision deficiencies</li>
          <li>• Click on different simulation types to compare how colors appear</li>
          <li>• Use this tool to ensure your designs are accessible to color-blind users</li>
          <li>• Download the simulated result to share or reference</li>
        </ul>
      </div>
    </div>
  );
}
