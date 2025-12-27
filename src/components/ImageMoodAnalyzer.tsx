"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface MoodResult {
  primaryMood: string;
  confidence: number;
  secondaryMoods: string[];
  analysis: {
    brightness: number;
    saturation: number;
    warmth: number;
    complexity: number;
    contrast: number;
  };
  dominantColors: Array<{color: string, percentage: number, name: string}>;
  composition: string;
}

export default function ImageMoodAnalyzer() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Color name mapping
  const getColorName = (r: number, g: number, b: number): string => {
    const colors: Array<{name: string, rgb: [number, number, number]}> = [
      {name: "Red", rgb: [255, 0, 0]},
      {name: "Green", rgb: [0, 255, 0]},
      {name: "Blue", rgb: [0, 0, 255]},
      {name: "Yellow", rgb: [255, 255, 0]},
      {name: "Cyan", rgb: [0, 255, 255]},
      {name: "Magenta", rgb: [255, 0, 255]},
      {name: "White", rgb: [255, 255, 255]},
      {name: "Black", rgb: [0, 0, 0]},
      {name: "Gray", rgb: [128, 128, 128]},
      {name: "Orange", rgb: [255, 165, 0]},
      {name: "Purple", rgb: [128, 0, 128]},
      {name: "Pink", rgb: [255, 192, 203]},
      {name: "Brown", rgb: [165, 42, 42]},
      {name: "Beige", rgb: [245, 245, 220]},
      {name: "Teal", rgb: [0, 128, 128]},
      {name: "Lime", rgb: [0, 255, 0]},
      {name: "Navy", rgb: [0, 0, 128]},
      {name: "Maroon", rgb: [128, 0, 0]},
      {name: "Olive", rgb: [128, 128, 0]},
      {name: "Silver", rgb: [192, 192, 192]},
    ];

    let closestColor = colors[0];
    let minDistance = Infinity;

    colors.forEach(color => {
      const distance = Math.sqrt(
        Math.pow(r - color.rgb[0], 2) +
        Math.pow(g - color.rgb[1], 2) +
        Math.pow(b - color.rgb[2], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    });

    return closestColor.name;
  };

  // Analyze image mood
  const analyzeMood = useCallback(async (imageFile: File) => {
    setIsAnalyzing(true);
    setError("");
    setMoodResult(null);

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

      // Load and draw image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(imageFile);
      });

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Analyze colors
      const colorCounts: Map<string, number> = new Map();
      let totalBrightness = 0;
      let totalSaturation = 0;
      let totalWarmth = 0;
      let pixelCount = data.length / 4;

      // Sample pixels (every 10th pixel for performance)
      for (let i = 0; i < data.length; i += 40) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to HSL for analysis
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lightness = (max + min) / 510; // 0-1
        const saturation = max === 0 ? 0 : (max - min) / max;

        // Calculate warmth (red + yellow vs blue + green)
        const warmth = (r + g * 0.5) / (b + g * 0.5 + 1);

        totalBrightness += lightness;
        totalSaturation += saturation;
        totalWarmth += warmth;

        // Color quantization for dominant colors
        const quantizedR = Math.floor(r / 32) * 32;
        const quantizedG = Math.floor(g / 32) * 32;
        const quantizedB = Math.floor(b / 32) * 32;
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      }

      // Calculate averages
      const avgBrightness = totalBrightness / (pixelCount / 10);
      const avgSaturation = totalSaturation / (pixelCount / 10);
      const avgWarmth = totalWarmth / (pixelCount / 10);

      // Get dominant colors
      const dominantColors = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([colorKey, count]) => {
          const [r, g, b] = colorKey.split(',').map(Number);
          return {
            color: `rgb(${r}, ${g}, ${b})`,
            percentage: Math.round((count / (pixelCount / 10)) * 100),
            name: getColorName(r, g, b)
          };
        });

      // Analyze composition (simple rule of thirds approximation)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const thirdX = canvas.width / 3;
      const thirdY = canvas.height / 3;

      let centerWeight = 0;
      let ruleOfThirdsWeight = 0;

      // Sample pixels around center and rule of thirds points
      for (let y = centerY - 50; y < centerY + 50; y += 10) {
        for (let x = centerX - 50; x < centerX + 50; x += 10) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const index = (y * canvas.width + x) * 4;
            centerWeight += (data[index] + data[index + 1] + data[index + 2]) / 3;
          }
        }
      }

      // Rule of thirds points
      const thirdsPoints = [
        [thirdX, thirdY], [thirdX * 2, thirdY], [thirdX, thirdY * 2], [thirdX * 2, thirdY * 2]
      ];

      thirdsPoints.forEach(([tx, ty]) => {
        for (let y = ty - 25; y < ty + 25; y += 5) {
          for (let x = tx - 25; x < tx + 25; x += 5) {
            if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              const index = (y * canvas.width + x) * 4;
              ruleOfThirdsWeight += (data[index] + data[index + 1] + data[index + 2]) / 3;
            }
          }
        }
      });

      const composition = centerWeight > ruleOfThirdsWeight * 1.2 ? "centered" : "rule-of-thirds";

      // Calculate contrast
      let contrastSum = 0;
      for (let i = 0; i < data.length; i += 40) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        contrastSum += Math.abs(brightness - avgBrightness * 255);
      }
      const contrast = contrastSum / (pixelCount / 10);

      // Calculate complexity (edge detection approximation)
      let complexity = 0;
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const idx = (y * canvas.width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

          // Check neighbors
          const neighbors = [
            ((y - 1) * canvas.width + x) * 4,
            ((y + 1) * canvas.width + x) * 4,
            (y * canvas.width + (x - 1)) * 4,
            (y * canvas.width + (x + 1)) * 4
          ];

          let edgeStrength = 0;
          neighbors.forEach(nidx => {
            const nBrightness = (data[nidx] + data[nidx + 1] + data[nidx + 2]) / 3;
            edgeStrength += Math.abs(brightness - nBrightness);
          });

          complexity += edgeStrength / 4;
        }
      }
      complexity = complexity / (canvas.width * canvas.height);

      // Analyze mood based on factors
      const analysis = {
        brightness: avgBrightness,
        saturation: avgSaturation,
        warmth: avgWarmth,
        complexity,
        contrast: contrast / 255
      };

      let primaryMood = "neutral";
      let confidence = 0.5;
      const secondaryMoods: string[] = [];

      // Mood classification logic
      if (avgBrightness > 0.7 && avgSaturation > 0.6) {
        primaryMood = "cheerful";
        confidence = 0.8;
        secondaryMoods.push("energetic", "vibrant");
      } else if (avgBrightness < 0.3 && avgSaturation < 0.3) {
        primaryMood = "melancholic";
        confidence = 0.8;
        secondaryMoods.push("somber", "introspective");
      } else if (avgWarmth > 1.5 && avgBrightness > 0.6) {
        primaryMood = "warm";
        confidence = 0.7;
        secondaryMoods.push("comforting", "cozy");
      } else if (avgSaturation > 0.7 && complexity > 100) {
        primaryMood = "energetic";
        confidence = 0.75;
        secondaryMoods.push("dynamic", "lively");
      } else if (avgBrightness > 0.5 && avgSaturation > 0.3 && avgWarmth < 1.2) {
        primaryMood = "calm";
        confidence = 0.7;
        secondaryMoods.push("peaceful", "serene");
      } else if (contrast > 150 && complexity < 50) {
        primaryMood = "dramatic";
        confidence = 0.8;
        secondaryMoods.push("striking", "bold");
      } else if (avgWarmth < 0.8 && avgBrightness < 0.4) {
        primaryMood = "cool";
        confidence = 0.7;
        secondaryMoods.push("mysterious", "contemplative");
      }

      // Special cases for dominant colors
      const topColor = dominantColors[0];
      if (topColor) {
        if (topColor.name === "Red" && avgSaturation > 0.6) {
          secondaryMoods.push("passionate");
        } else if (topColor.name === "Blue" && avgBrightness < 0.5) {
          secondaryMoods.push("tranquil");
        } else if (topColor.name === "Green") {
          secondaryMoods.push("natural", "fresh");
        } else if (topColor.name === "Yellow" && avgBrightness > 0.7) {
          secondaryMoods.push("optimistic");
        }
      }

      const result: MoodResult = {
        primaryMood,
        confidence,
        secondaryMoods: secondaryMoods.slice(0, 3),
        analysis,
        dominantColors,
        composition
      };

      setMoodResult(result);
      setSourceUrl(canvas.toDataURL('image/png'));

    } catch (err) {
      console.error("Mood analysis error:", err);
      setError("Failed to analyze image mood. Please try a different image.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setFileName(file.name);
    analyzeMood(file);
  }, [analyzeMood]);

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

  // Clear all
  const clearAll = useCallback(() => {
    setSourceUrl(null);
    setFileName(null);
    setMoodResult(null);
    setError("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  const getMoodEmoji = (mood: string): string => {
    const emojiMap: Record<string, string> = {
      cheerful: "😊",
      melancholic: "😢",
      warm: "🌞",
      energetic: "⚡",
      calm: "😌",
      dramatic: "🎭",
      cool: "❄️",
      neutral: "😐",
      passionate: "❤️",
      tranquil: "🌊",
      natural: "🌿",
      fresh: "💨",
      optimistic: "☀️"
    };
    return emojiMap[mood] || "🤔";
  };

  const getMoodColor = (mood: string): string => {
    const colorMap: Record<string, string> = {
      cheerful: "bg-yellow-100 text-yellow-800 border-yellow-200",
      melancholic: "bg-blue-100 text-blue-800 border-blue-200",
      warm: "bg-orange-100 text-orange-800 border-orange-200",
      energetic: "bg-red-100 text-red-800 border-red-200",
      calm: "bg-green-100 text-green-800 border-green-200",
      dramatic: "bg-purple-100 text-purple-800 border-purple-200",
      cool: "bg-indigo-100 text-indigo-800 border-indigo-200",
      neutral: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colorMap[mood] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Image Mood Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the emotional vibe of your images through AI-powered mood analysis
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

      {/* Results */}
      {moodResult && sourceUrl && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analysis Results
            </h3>
            <Button variant="secondary" onClick={clearAll}>
              Analyze Another Image
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Display */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Uploaded Image</h4>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                />
                {fileName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {fileName}
                  </p>
                )}
              </div>
            </div>

            {/* Mood Analysis */}
            <div className="space-y-4">
              {/* Primary Mood */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Primary Mood</h4>
                <div className={`p-4 rounded-lg border-2 ${getMoodColor(moodResult.primaryMood)}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getMoodEmoji(moodResult.primaryMood)}</span>
                    <div>
                      <h5 className="font-semibold text-lg capitalize">
                        {moodResult.primaryMood}
                      </h5>
                      <p className="text-sm opacity-75">
                        Confidence: {Math.round(moodResult.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Moods */}
              {moodResult.secondaryMoods.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Secondary Moods</h4>
                  <div className="flex flex-wrap gap-2">
                    {moodResult.secondaryMoods.map((mood, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(mood)}`}
                      >
                        {getMoodEmoji(mood)} {mood}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Analysis */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Technical Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Brightness:</span>
                    <span className="ml-2 font-medium">{Math.round(moodResult.analysis.brightness * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Saturation:</span>
                    <span className="ml-2 font-medium">{Math.round(moodResult.analysis.saturation * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Warmth:</span>
                    <span className="ml-2 font-medium">{moodResult.analysis.warmth.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                    <span className="ml-2 font-medium">{Math.round(moodResult.analysis.complexity)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Composition:</span>
                    <span className="ml-2 font-medium capitalize">{moodResult.composition.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Dominant Colors */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dominant Colors</h4>
                <div className="space-y-2">
                  {moodResult.dominantColors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{color.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fun Message */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
            <p className="text-purple-800 dark:text-purple-200 font-medium">
              🤖 <em>Remember: This is a fun analysis, not scientific psychology!</em>
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Analyzes color palette, brightness, saturation, and composition</li>
          <li>• Uses image complexity and contrast to determine mood</li>
          <li>• Applies fun AI-like mood classification based on visual characteristics</li>
          <li>• Results are interpretive and meant for entertainment!</li>
        </ul>
      </div>
    </div>
  );
}
