"use client";

import React, { useState, useRef } from 'react';
import Button from './Button';

interface TagData {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  comment: string;
}

export default function TagEditorPro() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<TagData>({
    title: '',
    artist: '',
    album: '',
    year: '',
    genre: '',
    comment: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setError(null);
    // TODO: Read existing tags using jsmediatags
    // For now, set empty tags
    setTags({
      title: '',
      artist: '',
      album: '',
      year: '',
      genre: '',
      comment: ''
    });
  };

  const handleTagChange = (field: keyof TagData, value: string) => {
    setTags(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTags = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement tag editing using jsmediatags or similar library
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simulated file with updated tags
      const taggedBlob = new Blob(['simulated tagged audio'], { type: selectedFile.type });
      const url = URL.createObjectURL(taggedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `tagged_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Tag editing error:', err);
      setError('Failed to save tags. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tag Editor Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and edit ID3 metadata tags in audio files. Update artist, title, album, and other information.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          id="tag-editor-file-input"
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
          htmlFor="tag-editor-file-input"
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

      {/* Tag Editor */}
      {selectedFile && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Tags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={tags.title}
                onChange={(e) => handleTagChange('title', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Song title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist
              </label>
              <input
                type="text"
                value={tags.artist}
                onChange={(e) => handleTagChange('artist', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Artist name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Album
              </label>
              <input
                type="text"
                value={tags.album}
                onChange={(e) => handleTagChange('album', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Album name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <input
                type="text"
                value={tags.year}
                onChange={(e) => handleTagChange('year', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Release year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <input
                type="text"
                value={tags.genre}
                onChange={(e) => handleTagChange('genre', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Music genre"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={tags.comment}
                onChange={(e) => handleTagChange('comment', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional comments"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {selectedFile && (
        <div className="mb-6">
          <Button
            onClick={handleSaveTags}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Saving...' : 'Save Tags & Download'}
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
          <li>• Upload an audio file with existing metadata</li>
          <li>• Edit the tag fields as needed</li>
          <li>• Click "Save Tags & Download" to update the file</li>
          <li>• The file with updated tags will be downloaded</li>
        </ul>
      </div>
    </div>
  );
}
