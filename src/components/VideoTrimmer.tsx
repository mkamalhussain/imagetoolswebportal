"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from './Button';

export default function VideoTrimmer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (ffmpegRef.current) return; // Already loaded

      setIsLoadingFFmpeg(true);
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('log', ({ message }) => {
          console.log('FFmpeg:', message);
        });

        ffmpeg.on('progress', ({ progress }) => {
          setProgress(progress * 100);
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        console.log('FFmpeg loaded successfully');
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError('Failed to load video processing engine. Please refresh the page and try again.');
      } finally {
        setIsLoadingFFmpeg(false);
      }
    };

    loadFFmpeg();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setStartTime(0);
    setEndTime(10);
    setCurrentTime(0);
    setProgress(0);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setEndTime(Math.min(10, videoRef.current.duration));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrim = async () => {
    if (!selectedFile || !ffmpegRef.current) {
      setError('Please select a video file and wait for the processing engine to load.');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be less than end time');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputFileName = 'input.' + selectedFile.name.split('.').pop();
      const outputFileName = 'output.mp4';
      const trimDuration = endTime - startTime;

      // Write input file to FFmpeg's virtual file system
      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      // Trim video: -ss is start time, -t is duration, -c copy for fast copy (no re-encoding)
      // Using -c copy is faster but may not work for all videos, so we'll use re-encoding for compatibility
      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', startTime.toString(),
        '-t', trimDuration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        outputFileName
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      // Convert FileData to proper ArrayBuffer for Blob
      let arrayBuffer: ArrayBuffer;
      if (data instanceof Uint8Array) {
        // Create a new ArrayBuffer and copy data
        arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      } else if (typeof data === 'object' && 'byteLength' in data) {
        // It's an ArrayBuffer-like object, create a new one
        const source = data as ArrayBuffer;
        arrayBuffer = source.slice(0) as ArrayBuffer;
      } else {
        // If it's a string (base64), convert it
        const binaryString = atob(data as string);
        arrayBuffer = new ArrayBuffer(binaryString.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          view[i] = binaryString.charCodeAt(i);
        }
      }
      const trimmedBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(trimmedBlob);

      // Download the trimmed video
      const a = document.createElement('a');
      a.href = url;
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const extension = selectedFile.name.split('.').pop();
      a.download = `trimmed_${originalName}_${formatTime(startTime)}-${formatTime(endTime)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clean up FFmpeg files
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

    } catch (err) {
      console.error('Trimming error:', err);
      setError(`Failed to trim video: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const scrubToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Short Video Trimmer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a video and trim it by selecting start and end times using the timeline scrubber.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
          id="video-trimmer-file-input"
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
          htmlFor="video-trimmer-file-input"
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
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full max-h-96"
              controls
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Timeline Scrubber */}
      {selectedFile && duration > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trim Timeline</h3>

          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-2 bg-blue-600 rounded-full"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    width: `${((endTime - startTime) / duration) * 100}%`
                  }}
                ></div>
              </div>

              {/* Start marker */}
              <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full -mt-1 cursor-pointer border-2 border-white dark:border-gray-800"
                style={{ left: `${(startTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                onClick={() => scrubToTime(startTime)}
              ></div>

              {/* End marker */}
              <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full -mt-1 cursor-pointer border-2 border-white dark:border-gray-800"
                style={{ left: `${(endTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                onClick={() => scrubToTime(endTime)}
              ></div>
            </div>

            {/* Time Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time: {formatTime(startTime)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time: {formatTime(endTime)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Duration: {formatTime(endTime - startTime)} (Total: {formatTime(duration)})
            </div>
          </div>
        </div>
      )}

      {/* Trim Button */}
      {selectedFile && (
        <div className="mb-6">
          {isLoadingFFmpeg && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Loading video processing engine... Please wait.
              </p>
            </div>
          )}
          <Button
            onClick={handleTrim}
            disabled={isProcessing || isLoadingFFmpeg}
            className="w-full md:w-auto"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing... {progress > 0 && `${Math.round(progress)}%`}
              </span>
            ) : (
              '✂️ Trim and Download'
            )}
          </Button>
          {isProcessing && progress > 0 && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
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
          <li>• Use the timeline scrubber to set start and end times</li>
          <li>• Click on the markers to jump to specific times</li>
          <li>• Click "Trim and Download" to get your trimmed video</li>
          <li>• The trimmed file will be downloaded automatically</li>
        </ul>
      </div>
    </div>
  );
}
