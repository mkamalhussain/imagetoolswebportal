"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function SubtitleBurner() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedSubtitles, setSelectedSubtitles] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedVideo(file);
    setError(null);
  };

  const handleSubtitleSelect = (file: File) => {
    const validExtensions = ['.srt', '.vtt', '.sub'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please select a valid subtitle file (.srt, .vtt, or .sub)');
      return;
    }
    setSelectedSubtitles(file);
    setError(null);
  };

  const burnSubtitles = async () => {
    if (!selectedVideo || !selectedSubtitles) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement subtitle burning using Subtitle.js integration
      await new Promise(resolve => setTimeout(resolve, 4000));

      const burnedBlob = new Blob(['simulated video with subtitles'], { type: 'video/mp4' });
      const url = URL.createObjectURL(burnedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `subtitled_${selectedVideo.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Subtitle burning error:', err);
      setError('Failed to burn subtitles. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subtitle Burner</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload videos and SRT subtitle files to permanently embed subtitles into the video.
        </p>
      </div>

      {/* File Uploads */}
      <div className="mb-6 space-y-4">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Video File
          </label>
          <input
            ref={videoInputRef}
            id="subtitle-burner-video-input"
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoSelect(file);
            }}
            className="hidden"
          />
          <Button
            as="label"
            htmlFor="subtitle-burner-video-input"
            className="cursor-pointer"
          >
            Choose Video File
          </Button>
          {selectedVideo && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Video: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Subtitle Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Subtitle File (.srt, .vtt, .sub)
          </label>
          <input
            ref={subtitleInputRef}
            id="subtitle-burner-subtitle-input"
            type="file"
            accept=".srt,.vtt,.sub,text/srt,text/vtt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSubtitleSelect(file);
            }}
            className="hidden"
          />
          <Button
            as="label"
            htmlFor="subtitle-burner-subtitle-input"
            className="cursor-pointer"
          >
            Choose Subtitle File
          </Button>
          {selectedSubtitles && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Subtitles: {selectedSubtitles.name} ({(selectedSubtitles.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Preview */}
      {selectedVideo && selectedSubtitles && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              className="w-full max-h-64"
              controls
            >
              <source src={URL.createObjectURL(selectedVideo)} />
              <track
                kind="subtitles"
                src={URL.createObjectURL(selectedSubtitles)}
                default
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Note: Preview shows overlay subtitles. Burning will embed them permanently.
          </p>
        </div>
      )}

      {/* Burn Button */}
      {selectedVideo && selectedSubtitles && (
        <div className="mb-6">
          <Button
            onClick={burnSubtitles}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Burning Subtitles...' : 'Burn Subtitles & Download'}
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
          <li>• Upload a video file (MP4, AVI, MOV, etc.)</li>
          <li>• Upload a subtitle file (.srt, .vtt, or .sub format)</li>
          <li>• Preview the video with overlay subtitles</li>
          <li>• Click "Burn Subtitles & Download" to embed subtitles permanently</li>
          <li>• The video with burned-in subtitles will be downloaded</li>
        </ul>
      </div>
    </div>
  );
}
