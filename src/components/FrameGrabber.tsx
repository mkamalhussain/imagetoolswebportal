"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function FrameGrabber() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedFile(file);
    setCurrentFrame(null);
    setError(null);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Canvas not supported');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to PNG data URL
    const frameDataUrl = canvas.toDataURL('image/png');
    setCurrentFrame(frameDataUrl);
  };

  const downloadFrame = () => {
    if (!currentFrame || !selectedFile) return;

    const a = document.createElement('a');
    a.href = currentFrame;
    a.download = `frame_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Frame Grabber</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Extract individual frames from videos as high-quality PNG images for thumbnails or analysis.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
          id="frame-grabber-file-input"
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
          htmlFor="frame-grabber-file-input"
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

      {/* Video Player */}
      {selectedFile && (
        <div className="mb-6">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full max-h-96"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Controls */}
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={handlePlayPause}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Button>
            <Button onClick={captureFrame}>
              📸 Capture Frame
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {videoRef.current && `Current time: ${formatTime(videoRef.current.currentTime)}`}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Frame */}
      {currentFrame && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Captured Frame</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={currentFrame}
              alt="Captured frame"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <Button onClick={downloadFrame}>
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
          <li>• Upload a video file</li>
          <li>• Use the video player controls to navigate to the desired frame</li>
          <li>• Click "Capture Frame" to grab the current frame as an image</li>
          <li>• Preview the captured frame</li>
          <li>• Download the frame as a high-quality PNG image</li>
        </ul>
      </div>
    </div>
  );
}
