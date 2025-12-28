"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function SpeedChanger() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const applySpeedChange = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement speed changing using Web Video API
      await new Promise(resolve => setTimeout(resolve, 2500));

      const changedBlob = new Blob(['simulated speed changed video'], { type: 'video/mp4' });
      const url = URL.createObjectURL(changedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `speed_${speed}x_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Speed change error:', err);
      setError('Failed to change video speed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const previewSpeed = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const resetPreview = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Speed Changer Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Adjust video playback speed while preserving audio pitch for natural-sounding results.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
          id="speed-changer-file-input"
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
          htmlFor="speed-changer-file-input"
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
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full max-h-64"
              controls
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex gap-2">
            <Button onClick={previewSpeed}>
              Preview Speed ({speed}x)
            </Button>
            <Button onClick={resetPreview} className="bg-gray-500 hover:bg-gray-600">
              Reset Preview
            </Button>
          </div>
        </div>
      )}

      {/* Speed Controls */}
      {selectedFile && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playback Speed: {speed}x
              </label>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0.25x (Slow)</span>
                <span>1x (Normal)</span>
                <span>4x (Fast)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audio Pitch Preservation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="preserve-pitch"
                  checked={preservePitch}
                  onChange={(e) => setPreservePitch(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="preserve-pitch" className="text-sm text-gray-700 dark:text-gray-300">
                  Preserve audio pitch (recommended)
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                When enabled, audio stays natural-sounding regardless of speed changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Button */}
      {selectedFile && (
        <div className="mb-6">
          <Button
            onClick={applySpeedChange}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Apply Speed Change & Download'}
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
          <li>• Use the speed slider to adjust playback rate (0.25x to 4x)</li>
          <li>• Enable "Preserve audio pitch" for natural-sounding audio</li>
          <li>• Use "Preview Speed" to test the effect before applying</li>
          <li>• Click "Apply Speed Change & Download" to process</li>
        </ul>
      </div>
    </div>
  );
}
