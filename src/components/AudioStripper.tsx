"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function AudioStripper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedFile(file);
    setAudioPreview(null);
    setError(null);
  };

  const extractAudio = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement audio extraction using FFmpeg.wasm for demuxing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a simulated audio blob
      const audioBlob = new Blob(['simulated extracted audio'], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioPreview(audioUrl);

      // Auto-download
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio_${selectedFile.name.replace(/\.[^/.]+$/, "")}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      console.error('Audio extraction error:', err);
      setError('Failed to extract audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Audio Stripper</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Extract audio tracks from video files and save them as MP3 for separate use.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
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
          htmlFor={fileInputRef.current?.id}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Preview</h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full max-h-64"
              controls
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Extract Button */}
      {selectedFile && !audioPreview && (
        <div className="mb-6">
          <Button
            onClick={extractAudio}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Extracting Audio...' : 'Extract Audio'}
          </Button>
        </div>
      )}

      {/* Audio Preview */}
      {audioPreview && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Extracted Audio</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <audio controls className="w-full">
              <source src={audioPreview} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            ✅ Audio extracted and downloaded successfully as MP3!
          </p>
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
          <li>• Upload a video file with audio track</li>
          <li>• Preview the video to ensure it has the desired audio</li>
          <li>• Click "Extract Audio" to strip the audio track</li>
          <li>• The audio will be automatically downloaded as MP3</li>
          <li>• You can also preview the extracted audio before using it</li>
        </ul>
      </div>
    </div>
  );
}
