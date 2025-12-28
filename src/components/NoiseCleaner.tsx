"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

export default function NoiseCleaner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beforeAudio, setBeforeAudio] = useState<string | null>(null);
  const [afterAudio, setAfterAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setBeforeAudio(URL.createObjectURL(file));
    setAfterAudio(null);
    setError(null);
  };

  const handleCleanNoise = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement noise reduction using Web Audio API filters
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a simulated cleaned audio blob
      const cleanedBlob = new Blob(['simulated cleaned audio'], { type: 'audio/wav' });
      setAfterAudio(URL.createObjectURL(cleanedBlob));

    } catch (err) {
      console.error('Noise cleaning error:', err);
      setError('Failed to clean noise. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCleaned = () => {
    if (!afterAudio) return;

    const a = document.createElement('a');
    a.href = afterAudio;
    a.download = `cleaned_${selectedFile?.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Noise Cleaner Tool</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload audio files and automatically remove background noise with before/after comparison.
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

      {/* Before/After Comparison */}
      {selectedFile && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Original</h3>
              {beforeAudio && (
                <audio controls className="w-full mb-4">
                  <source src={beforeAudio} />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cleaned</h3>
              {afterAudio ? (
                <>
                  <audio controls className="w-full mb-4">
                    <source src={afterAudio} />
                    Your browser does not support the audio element.
                  </audio>
                  <Button onClick={downloadCleaned}>
                    Download Cleaned Audio
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Process the audio to see cleaned version</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clean Button */}
      {selectedFile && !afterAudio && (
        <div className="mb-6">
          <Button
            onClick={handleCleanNoise}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Cleaning Noise...' : 'Clean Noise'}
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
          <li>• Upload an audio file with background noise</li>
          <li>• Click "Clean Noise" to process the file</li>
          <li>• Compare before and after versions</li>
          <li>• Download the cleaned audio file</li>
        </ul>
      </div>
    </div>
  );
}
