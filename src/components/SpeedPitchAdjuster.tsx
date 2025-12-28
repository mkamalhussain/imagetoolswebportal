"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function SpeedPitchAdjuster() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleAdjust = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement speed/pitch adjustment using Tone.js or Web Audio API
      await new Promise(resolve => setTimeout(resolve, 2500));

      const adjustedBlob = new Blob(['simulated adjusted audio'], { type: 'audio/wav' });
      const url = URL.createObjectURL(adjustedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `adjusted_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Adjustment error:', err);
      setError('Failed to adjust audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Speed/Pitch Adjuster</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Adjust the speed and pitch of your audio files independently.
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

      {/* Controls */}
      {selectedFile && (
        <div className="mb-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speed: {speed.toFixed(1)}x (0.5x - 2.0x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pitch: {pitch.toFixed(1)}x (0.5x - 2.0x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Adjust Button */}
      {selectedFile && (
        <div className="mb-6">
          <Button
            onClick={handleAdjust}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Apply Changes & Download'}
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
          <li>• Adjust speed (0.5x = half speed, 2.0x = double speed)</li>
          <li>• Adjust pitch independently (0.5x = lower pitch, 2.0x = higher pitch)</li>
          <li>• Click "Apply Changes & Download" to process</li>
        </ul>
      </div>
    </div>
  );
}
