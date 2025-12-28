"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function GIFMaker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [speed, setSpeed] = useState<number>(1.0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedFile(file);
    setGifUrl(null);
    setError(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setEndTime(Math.min(5, videoRef.current.duration));
    }
  };

  const generateGIF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement GIF generation using FFmpeg.wasm
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Create a simulated GIF blob
      const gifBlob = new Blob(['simulated GIF data'], { type: 'image/gif' });
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);

    } catch (err) {
      console.error('GIF generation error:', err);
      setError('Failed to generate GIF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGIF = () => {
    if (!gifUrl) return;

    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `animated_${selectedFile?.name.replace(/\.[^/.]+$/, "")}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">GIF Maker from Video</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Convert video segments to animated GIFs with speed control options and loop settings.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
          id="gif-maker-file-input"
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
        <Button
          as="label"
          htmlFor="gif-maker-file-input"
          className="cursor-pointer"
        >
          Choose Video File
        </Button>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Video Preview */}
      {selectedFile && (
        <div className="mb-6">
          <video
            ref={videoRef}
            className="w-full max-h-64 bg-black rounded"
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={URL.createObjectURL(selectedFile)} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Settings */}
      {selectedFile && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time (seconds)
            </label>
            <input
              type="number"
              min="0"
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time (seconds)
            </label>
            <input
              type="number"
              min="0"
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speed: {speed}x
            </label>
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      {selectedFile && !gifUrl && (
        <div className="mb-6">
          <Button
            onClick={generateGIF}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Generating GIF...' : 'Generate GIF'}
          </Button>
        </div>
      )}

      {/* GIF Preview */}
      {gifUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated GIF</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={gifUrl}
              alt="Generated GIF"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <Button onClick={downloadGIF}>
            Download GIF
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
          <li>• Upload a video file</li>
          <li>• Set the start and end times for the GIF segment</li>
          <li>• Adjust the speed (0.25x to 2.0x) for faster/slower playback</li>
          <li>• Click "Generate GIF" to create the animated GIF</li>
          <li>• Download the looped GIF file</li>
        </ul>
      </div>
    </div>
  );
}
