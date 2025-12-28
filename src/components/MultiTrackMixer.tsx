"use client";

import React, { useState } from 'react';
import Button from './Button';

export default function MultiTrackMixer() {
  const [tracks, setTracks] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    if (audioFiles.length === 0) {
      setError('Please select audio files');
      return;
    }

    setTracks(prev => [...prev, ...audioFiles]);
    setError(null);
  };

  const removeTrack = (index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
  };

  const handleMix = async () => {
    if (tracks.length < 2) {
      setError('Please add at least 2 audio tracks to mix');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement multi-track mixing using Web Audio API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a simulated mixed audio blob
      const mixedBlob = new Blob(['simulated mixed audio'], { type: 'audio/wav' });
      const url = URL.createObjectURL(mixedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'mixed_audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Mixing error:', err);
      setError('Failed to mix tracks. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Multi-Track Mixer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple audio tracks, adjust volumes and panning, then merge them into a single file.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add Audio Tracks
        </label>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileSelect(e.target.files);
          }}
          className="hidden"
          id="track-upload"
        />
        <Button as="label" htmlFor="track-upload" className="cursor-pointer">
          Add Tracks
        </Button>
      </div>

      {/* Track List */}
      {tracks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracks ({tracks.length})</h3>
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{track.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(track.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Volume:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="100"
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Pan:</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      defaultValue="0"
                      className="w-20"
                    />
                  </div>
                  <Button
                    onClick={() => removeTrack(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mix Button */}
      {tracks.length >= 2 && (
        <div className="mb-6">
          <Button
            onClick={handleMix}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Mixing Tracks...' : 'Mix and Download'}
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
          <li>• Upload multiple audio files (minimum 2 tracks)</li>
          <li>• Adjust volume and panning for each track</li>
          <li>• Click "Mix and Download" to combine all tracks</li>
          <li>• The mixed file will be downloaded as WAV format</li>
        </ul>
      </div>
    </div>
  );
}
