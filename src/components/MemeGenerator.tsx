"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  topText?: string;
  bottomText?: string;
}

interface TextStyle {
  font: string;
  size: number;
  color: string;
  stroke: string;
  strokeWidth: number;
}

export default function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    font: "Impact",
    size: 48,
    color: "#ffffff",
    stroke: "#000000",
    strokeWidth: 3
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debug: Monitor selectedTemplate state changes
  useEffect(() => {
    console.log('selectedTemplate changed:', selectedTemplate);
  }, [selectedTemplate]);

  // Popular meme templates
  const memeTemplates: MemeTemplate[] = [
    {
      id: "distracted-boyfriend",
      name: "Distracted Boyfriend",
      url: "https://i.imgflip.com/1ur9b0.jpg",
      width: 500,
      height: 500
    },
    {
      id: "drake-hotline-bling",
      name: "Drake Hotline Bling",
      url: "https://i.imgflip.com/30b1gx.jpg",
      width: 500,
      height: 500
    },
    {
      id: "two-buttons",
      name: "Two Buttons",
      url: "https://i.imgflip.com/1g8my4.jpg",
      width: 500,
      height: 500
    },
    {
      id: "change-my-mind",
      name: "Change My Mind",
      url: "https://i.imgflip.com/24y43o.jpg",
      width: 500,
      height: 500
    },
    {
      id: "expanding-brain",
      name: "Expanding Brain",
      url: "https://i.imgflip.com/1jwhww.jpg",
      width: 500,
      height: 500
    },
    {
      id: "this-is-fine",
      name: "This Is Fine",
      url: "https://i.imgflip.com/wxica.jpg",
      width: 500,
      height: 500
    },
    {
      id: "success-kid",
      name: "Success Kid",
      url: "https://i.imgflip.com/1bhk.jpg",
      width: 500,
      height: 500
    },
    {
      id: "mocking-spongebob",
      name: "Mocking SpongeBob",
      url: "https://i.imgflip.com/1otk.jpg",
      width: 500,
      height: 500
    }
  ];

  // Generate meme
  const generateMeme = useCallback(async () => {
    if (!selectedTemplate && !customImage) {
      return;
    }

    setIsGenerating(true);

    // Small delay to ensure canvas is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas ref is null during meme generation");
        setIsGenerating(false);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Canvas context not available during meme generation");
        setIsGenerating(false);
        return;
      }

      const imageUrl = customImage || selectedTemplate?.url;
      if (!imageUrl) return;

      // Load image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
      });

      // Set canvas size
      const maxWidth = 800;
      const maxHeight = 800;
      let { width, height } = img;

      // Scale image to fit within max dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Configure text style
      ctx.font = `${textStyle.size}px ${textStyle.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = textStyle.color;
      ctx.strokeStyle = textStyle.stroke;
      ctx.lineWidth = textStyle.strokeWidth;

      // Draw top text
      if (topText.trim()) {
        const topY = 20;
        ctx.strokeText(topText.toUpperCase(), width / 2, topY);
        ctx.fillText(topText.toUpperCase(), width / 2, topY);
      }

      // Draw bottom text
      if (bottomText.trim()) {
        const bottomY = height - textStyle.size - 20;
        ctx.strokeText(bottomText.toUpperCase(), width / 2, bottomY);
        ctx.fillText(bottomText.toUpperCase(), width / 2, bottomY);
      }

      // Generate data URL
      const memeDataUrl = canvas.toDataURL('image/png');
      setGeneratedMeme(memeDataUrl);

    } catch (error) {
      console.error("Meme generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTemplate, customImage, topText, bottomText, textStyle]);

  // Handle template selection
  const selectTemplate = useCallback((template: MemeTemplate) => {
    console.log('Template selected:', template.name);
    setSelectedTemplate(template);
    // Don't clear customImage - let user choose between template and custom image
    // setCustomImage(null);
    setTopText(template.topText || "");
    setBottomText(template.bottomText || "");
    console.log('Selected template state updated');
  }, []);

  // Handle custom image upload
  const handleImageUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setCustomImage(url);
    setSelectedTemplate(null);
  }, []);

  // Download meme
  const downloadMeme = useCallback(() => {
    if (!generatedMeme) return;

    const link = document.createElement('a');
    link.href = generatedMeme;
    link.download = `meme-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedMeme]);

  // Font options
  const fontOptions = [
    "Impact",
    "Arial Black",
    "Helvetica",
    "Comic Sans MS",
    "Times New Roman",
    "Courier New"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meme Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create hilarious memes with popular templates and custom text
        </p>
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose a Template
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          {memeTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => selectTemplate(template)}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-20 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <span className="text-white font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {template.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Image Upload */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Or upload your own image:</p>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Custom Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
          />
        </div>

        {/* Custom Image Preview */}
        {customImage && !selectedTemplate && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Your Uploaded Image:</h4>
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={customImage}
                  alt="Your uploaded image"
                  className="max-w-full h-auto max-h-64 rounded border border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Input */}
      {(selectedTemplate || customImage) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Your Text
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top Text
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Enter top text..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bottom Text
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Enter bottom text..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
          </div>

          {/* Text Styling Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font
              </label>
              <select
                value={textStyle.font}
                onChange={(e) => setTextStyle(prev => ({ ...prev, font: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <input
                type="range"
                min="24"
                max="72"
                value={textStyle.size}
                onChange={(e) => setTextStyle(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {textStyle.size}px
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={textStyle.color}
                onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Outline Color
              </label>
              <input
                type="color"
                value={textStyle.stroke}
                onChange={(e) => setTextStyle(prev => ({ ...prev, stroke: e.target.value }))}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Outline Width
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={textStyle.strokeWidth}
                onChange={(e) => setTextStyle(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {textStyle.strokeWidth}px
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button onClick={generateMeme} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Meme"}
            </Button>
          </div>
        </div>
      )}

      {/* Generated Meme */}
      {generatedMeme && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Meme
            </h3>
            <Button onClick={downloadMeme}>
              📥 Download Meme
            </Button>
          </div>

          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <img
                src={generatedMeme}
                alt="Generated meme"
                className="max-w-full h-auto rounded border border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

        </div>
      )}

      {/* Canvas for processing (hidden) - always rendered */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Choose from popular meme templates or upload your own image</li>
          <li>• Add top and bottom text (keep it under 50 characters each)</li>
          <li>• Customize font, size, colors, and outline for maximum impact</li>
          <li>• Generate and download your meme instantly</li>
          <li>• Perfect for social media, messaging, and entertainment</li>
        </ul>
      </div>
    </div>
  );
}
