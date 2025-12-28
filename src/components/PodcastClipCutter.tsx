"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function PodcastClipCutter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>('00:00:00');
  const [endTime, setEndTime] = useState<string>('00:00:10');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleTrim = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement audio trimming using Web Audio API or wavesurfer.js
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simulated trimmed audio blob
      const trimmedBlob = new Blob(['simulated trimmed audio'], { type: 'audio/wav' });
      const url = URL.createObjectURL(trimmedBlob);

      // Download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Trimming error:', err);
      setError('Failed to trim audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Podcast Clip Cutter</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an audio file and trim it by specifying start and end times.
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

      {/* Time Selection */}
      {selectedFile && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time (HH:MM:SS)
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="00:00:00"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time (HH:MM:SS)
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="00:00:10"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Trim Button */}
      {selectedFile && (
        <div className="mb-6">
          <Button
            onClick={handleTrim}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Trim and Download'}
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
          <li>• Upload an audio file (MP3, WAV, M4A, etc.)</li>
          <li>• Set the start and end times in HH:MM:SS format</li>
          <li>• Click "Trim and Download" to get your clipped audio</li>
          <li>• The trimmed file will be downloaded automatically</li>
        </ul>
      </div>
    </div>
  );
}
