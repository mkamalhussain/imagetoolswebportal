"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function WaveformGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waveformImage, setWaveformImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setWaveformImage(null);
    setError(null);
  };

  const generateWaveform = async () => {
    if (!selectedFile || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement waveform generation using Canvas API
      // For now, create a simple placeholder waveform
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = 800;
      canvas.height = 200;

      // Clear canvas
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform bars
      ctx.fillStyle = '#3b82f6';
      const barCount = 100;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const height = Math.random() * canvas.height * 0.8 + 20;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        ctx.fillRect(x, y, barWidth - 2, height);
      }

      // Convert to PNG
      const imageData = canvas.toDataURL('image/png');
      setWaveformImage(imageData);

    } catch (err) {
      console.error('Waveform generation error:', err);
      setError('Failed to generate waveform. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadWaveform = () => {
    if (!waveformImage) return;

    const a = document.createElement('a');
    a.href = waveformImage;
    a.download = `waveform_${selectedFile?.name.replace(/\.[^/.]+$/, "")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Waveform Generator</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload audio files and generate visual waveform images in PNG format for thumbnails and previews.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
        <Button
          as="label"
          htmlFor={fileInputRef.current?.id}
          className="cursor-pointer"
        >
          Choose Audio File
        </Button>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Generate Button */}
      {selectedFile && !waveformImage && (
        <div className="mb-6">
          <Button
            onClick={generateWaveform}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Generating...' : 'Generate Waveform'}
          </Button>
        </div>
      )}

      {/* Waveform Preview */}
      {waveformImage && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Waveform</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={waveformImage}
              alt="Audio Waveform"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <Button onClick={downloadWaveform}>
            Download PNG
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
          <li>• Upload an audio file</li>
          <li>• Click "Generate Waveform" to create a visual representation</li>
          <li>• Preview the generated waveform image</li>
          <li>• Download as PNG for use in thumbnails or presentations</li>
        </ul>
      </div>
    </div>
  );
}
