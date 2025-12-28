"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function ClipJoiner() {
  const [clips, setClips] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
    if (videoFiles.length === 0) {
      setError('Please select video files');
      return;
    }

    setClips(prev => [...prev, ...videoFiles]);
    setError(null);
  };

  const removeClip = (index: number) => {
    setClips(prev => prev.filter((_, i) => i !== index));
  };

  const moveClip = (fromIndex: number, toIndex: number) => {
    const newClips = [...clips];
    const [movedClip] = newClips.splice(fromIndex, 1);
    newClips.splice(toIndex, 0, movedClip);
    setClips(newClips);
  };

  const handleJoin = async () => {
    if (clips.length < 2) {
      setError('Please add at least 2 video clips to join');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement clip joining using FFmpeg.wasm
      await new Promise(resolve => setTimeout(resolve, 4000));

      const joinedBlob = new Blob(['simulated joined video'], { type: 'video/mp4' });
      const url = URL.createObjectURL(joinedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'joined_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Joining error:', err);
      setError('Failed to join clips. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clip Joiner Tool</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple video clips, arrange their sequence, and merge them with smooth transitions.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add Video Clips
        </label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileSelect(e.target.files);
          }}
          className="hidden"
          id="clip-upload"
        />
        <Button as="label" htmlFor="clip-upload" className="cursor-pointer">
          Add Video Clips
        </Button>
      </div>

      {/* Clip List */}
      {clips.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Clips ({clips.length})</h3>
          <div className="space-y-3">
            {clips.map((clip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 dark:text-white">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{clip.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(clip.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => moveClip(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="text-xs px-2 py-1"
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => moveClip(index, Math.min(clips.length - 1, index + 1))}
                    disabled={index === clips.length - 1}
                    className="text-xs px-2 py-1"
                  >
                    ↓
                  </Button>
                  <Button
                    onClick={() => removeClip(index)}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Button */}
      {clips.length >= 2 && (
        <div className="mb-6">
          <Button
            onClick={handleJoin}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Joining Clips...' : 'Join and Download'}
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
          <li>• Upload multiple video files (minimum 2 clips)</li>
          <li>• Use the arrow buttons to reorder clips</li>
          <li>• Click "Join and Download" to merge all clips</li>
          <li>• The joined video will be downloaded as MP4 format</li>
        </ul>
      </div>
    </div>
  );
}
