"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
  luminance: number[];
  stats: {
    meanBrightness: number;
    contrast: number;
    dominantColor: string;
  };
}

export default function ImageHistogramViewer() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeChannels, setActiveChannels] = useState({
    red: true,
    green: true,
    blue: true,
    luminance: false
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const histogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate histogram data
  const calculateHistogram = useCallback((imageData: ImageData): HistogramData => {
    const data = imageData.data;
    const red = new Array(256).fill(0);
    const green = new Array(256).fill(0);
    const blue = new Array(256).fill(0);
    const luminance = new Array(256).fill(0);

    let totalBrightness = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      red[r]++;
      green[g]++;
      blue[b]++;

      // Calculate luminance using standard formula
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      luminance[lum]++;

      totalBrightness += (r + g + b) / 3;
      pixelCount++;
    }

    const meanBrightness = totalBrightness / pixelCount;

    // Calculate contrast (standard deviation of brightness)
    let contrastSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      contrastSum += Math.pow(brightness - meanBrightness, 2);
    }
    const contrast = Math.sqrt(contrastSum / pixelCount);

    // Find dominant color
    const maxRed = red.reduce((max, val, idx) => val > red[max] ? idx : max, 0);
    const maxGreen = green.reduce((max, val, idx) => val > green[max] ? idx : max, 0);
    const maxBlue = blue.reduce((max, val, idx) => val > blue[max] ? idx : max, 0);

    const dominantColor = `rgb(${maxRed}, ${maxGreen}, ${maxBlue})`;

    return {
      red,
      green,
      blue,
      luminance,
      stats: {
        meanBrightness: Math.round(meanBrightness),
        contrast: Math.round(contrast),
        dominantColor
      }
    };
  }, []);

  // Draw histogram on canvas
  const drawHistogram = useCallback((data: HistogramData) => {
    const canvas = histogramCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      const x = (i * width) / 8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (i * height) / 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const channels = [
      { name: 'red', data: data.red, color: '#ef4444', active: activeChannels.red },
      { name: 'green', data: data.green, color: '#22c55e', active: activeChannels.green },
      { name: 'blue', data: data.blue, color: '#3b82f6', active: activeChannels.blue },
      { name: 'luminance', data: data.luminance, color: '#f59e0b', active: activeChannels.luminance }
    ];

    // Find maximum value for scaling
    let maxValue = 0;
    channels.forEach(channel => {
      if (channel.active) {
        maxValue = Math.max(maxValue, Math.max(...channel.data));
      }
    });

    if (maxValue === 0) return;

    // Draw histograms
    channels.forEach(channel => {
      if (!channel.active) return;

      ctx.strokeStyle = channel.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const y = height - (channel.data[i] / maxValue) * (height - 20);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Fill area under curve with low opacity
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = channel.color;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const y = height - (channel.data[i] / maxValue) * (height - 20);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw labels
    ctx.fillStyle = '#f9fafb';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // Channel labels at bottom
    const activeChannelsList = channels.filter(c => c.active);
    activeChannelsList.forEach((channel, index) => {
      const x = (index + 1) * width / (activeChannelsList.length + 1);
      ctx.fillStyle = channel.color;
      ctx.fillText(channel.name.toUpperCase(), x, height - 5);
    });
  }, [activeChannels]);

  // Process image
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError("");
    setHistogramData(null); // Clear previous results

    // Small delay to ensure canvas is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas ref is null during histogram processing");
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

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Get image data and calculate histogram
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const histData = calculateHistogram(imageData);

      setHistogramData(histData);
      setSourceUrl(URL.createObjectURL(file));

      // Draw histogram
      setTimeout(() => drawHistogram(histData), 100);

    } catch (err) {
      console.error("Image processing error:", err);
      setError("Failed to analyze image histogram. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  }, [calculateHistogram, drawHistogram]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    processImage(file);
  }, [processImage]);

  // Handle channel toggle
  const toggleChannel = useCallback((channel: keyof typeof activeChannels) => {
    setActiveChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));

    // Redraw histogram when channels change
    if (histogramData) {
      setTimeout(() => {
        const newActiveChannels = { ...activeChannels, [channel]: !activeChannels[channel] };
        const canvas = histogramCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Redraw with new channel settings
            drawHistogramWithChannels(histogramData, newActiveChannels, ctx, canvas.width, canvas.height);
          }
        }
      }, 100);
    }
  }, [histogramData, activeChannels, drawHistogram]);

  // Helper function to draw histogram with specific channels
  const drawHistogramWithChannels = (
    data: HistogramData,
    channels: typeof activeChannels,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    const channelList = [
      { name: 'red', data: data.red, color: '#ef4444', active: channels.red },
      { name: 'green', data: data.green, color: '#22c55e', active: channels.green },
      { name: 'blue', data: data.blue, color: '#3b82f6', active: channels.blue },
      { name: 'luminance', data: data.luminance, color: '#f59e0b', active: channels.luminance }
    ];

    // Find maximum value for scaling
    let maxValue = 0;
    channelList.forEach(channel => {
      if (channel.active) {
        maxValue = Math.max(maxValue, Math.max(...channel.data));
      }
    });

    if (maxValue === 0) return;

    // Draw histograms
    channelList.forEach(channel => {
      if (!channel.active) return;

      ctx.strokeStyle = channel.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const y = height - (channel.data[i] / maxValue) * (height - 20);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    });
  };

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

  // Redraw histogram when channels change
  React.useEffect(() => {
    if (histogramData) {
      setTimeout(() => drawHistogram(histogramData), 50);
    }
  }, [histogramData, activeChannels, drawHistogram]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Histogram Viewer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze the color distribution and brightness levels of your images
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
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Drop an image here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Analyze color distribution and brightness</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? "Analyzing..." : "Select Image"}
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

      {/* Results */}
      {((sourceUrl && histogramData) || isProcessing) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {isProcessing ? 'Processing Image...' : 'Analyzed Image'}
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
                    alt="Analyzed image"
                    className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                  />
                ) : null}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {isProcessing ? 'Calculating Statistics...' : 'Image Statistics'}
              </h4>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Computing statistics...</p>
                    </div>
                  </div>
                ) : histogramData ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Mean Brightness:</span>
                      <span className="font-medium">{histogramData.stats.meanBrightness}/255</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contrast:</span>
                      <span className="font-medium">{histogramData.stats.contrast}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dominant Color:</span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: histogramData.stats.dominantColor }}
                        />
                        <span className="font-medium font-mono text-sm">
                          {histogramData.stats.dominantColor}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Channel Controls */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Histogram Channels</h4>
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(activeChannels).map(([channel, active]) => (
                <button
                  key={channel}
                  onClick={() => toggleChannel(channel as keyof typeof activeChannels)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {channel.charAt(0).toUpperCase() + channel.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Histogram Display */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Color Histogram</h4>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <canvas
                ref={histogramCanvasRef}
                width={800}
                height={300}
                className="w-full h-auto rounded border border-gray-600"
              />
              <div className="mt-2 text-xs text-gray-400 text-center">
                Intensity Levels (0-255) • Higher peaks indicate more pixels at that intensity
              </div>
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload any image to see its color distribution histogram</li>
          <li>• Toggle different color channels (Red, Green, Blue, Luminance) on/off</li>
          <li>• View technical statistics like brightness and contrast</li>
          <li>• Use this tool to understand image exposure and color balance</li>
          <li>• Perfect for photographers and designers analyzing image quality</li>
        </ul>
      </div>
    </div>
  );
}
