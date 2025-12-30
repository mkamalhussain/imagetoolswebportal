"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface CapturedFrame {
  id: string;
  timestamp: number;
  dataUrl: string;
  timeFormatted: string;
}

interface FrameSettings {
  interval: number; // seconds between frames
  maxFrames: number;
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 0-1 for jpg/webp
}

export default function FrameGrabber() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [settings, setSettings] = useState<FrameSettings>({
    interval: 1,
    maxFrames: 10,
    format: 'png',
    quality: 0.9
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        ffmpegInstance.on('log', ({ message }) => {
          console.log('FFmpeg:', message);
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpeg(ffmpegInstance);
        setIsFfmpegLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError('Failed to initialize frame extraction engine');
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
    setCurrentFrame(null);
    setCapturedFrames([]);
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

    // Convert to data URL
    const frameDataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality);
    setCurrentFrame(frameDataUrl);

    // Add to captured frames
    const newFrame: CapturedFrame = {
      id: Date.now().toString(),
      timestamp: video.currentTime,
      dataUrl: frameDataUrl,
      timeFormatted: formatTime(video.currentTime)
    };

    setCapturedFrames(prev => [newFrame, ...prev].slice(0, 50)); // Keep last 50 frames
  };

  const extractFramesAutomatically = async () => {
    if (!selectedFile || !ffmpeg) return;

    setIsProcessing(true);
    setError(null);
    setCapturedFrames([]);

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedFile));

      const frames: CapturedFrame[] = [];
      const videoDuration = 60; // Assume max 60 seconds for automatic extraction

      // Extract frames at intervals
      for (let i = 0; i < Math.min(settings.maxFrames, Math.floor(videoDuration / settings.interval)); i++) {
        const timestamp = i * settings.interval;

        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', timestamp.toString(),
          '-vframes', '1',
          '-q:v', '2',
          '-y',
          `frame_${i}.png`
        ]);

        try {
          const frameData = await ffmpeg.readFile(`frame_${i}.png`);
          const blob = new Blob([frameData], { type: 'image/png' });
          const dataUrl = URL.createObjectURL(blob);

          frames.push({
            id: `auto_${i}`,
            timestamp: timestamp,
            dataUrl: dataUrl,
            timeFormatted: formatTime(timestamp)
          });
        } catch (readErr) {
          console.warn(`Could not read frame at ${timestamp}s`);
        }
      }

      setCapturedFrames(frames);

    } catch (err) {
      console.error('Automatic frame extraction error:', err);
      setError('Failed to extract frames automatically');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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

  const downloadAllFrames = () => {
    capturedFrames.forEach((frame, index) => {
      const a = document.createElement('a');
      a.href = frame.dataUrl;
      a.download = `frame_${index + 1}_${frame.timeFormatted.replace(':', '-')}.${settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎬 Advanced Frame Grabber Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Professional frame extraction with automatic capture, batch processing, and multiple formats.
          {!isFfmpegLoaded && <span className="text-yellow-600 dark:text-yellow-400"> (Loading frame extraction engine...)</span>}
        </p>
      </div>

      {/* File Upload & Settings */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🎥 Select Video File
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
            className="cursor-pointer w-full"
          >
            Choose Video File
          </Button>
          {selectedFile && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {/* Frame Extraction Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">⚙️ Extraction Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Interval (sec)</label>
              <input
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                value={settings.interval}
                onChange={(e) => setSettings(prev => ({ ...prev, interval: parseFloat(e.target.value) || 1 }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Frames</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxFrames}
                onChange={(e) => setSettings(prev => ({ ...prev, maxFrames: parseInt(e.target.value) || 10 }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Format</label>
              <select
                value={settings.format}
                onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Quality</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={settings.format === 'png'}
              />
              <div className="text-xs text-center text-gray-500">
                {settings.format === 'png' ? 'N/A' : Math.round(settings.quality * 100) + '%'}
              </div>
            </div>
          </div>
        </div>
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
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button onClick={handlePlayPause}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Button>
            <Button onClick={captureFrame}>
              📸 Capture Current Frame
            </Button>
            <Button
              onClick={extractFramesAutomatically}
              disabled={isProcessing || !isFfmpegLoaded}
              variant="outline"
            >
              {isProcessing ? `🔄 Extracting... ${progress}%` : '🤖 Auto Extract Frames'}
            </Button>
            {capturedFrames.length > 0 && (
              <Button onClick={downloadAllFrames} variant="outline">
                💾 Download All ({capturedFrames.length})
              </Button>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {videoRef.current && `Time: ${formatTime(videoRef.current.currentTime)}`}
            </div>
          </div>

          {!isFfmpegLoaded && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
              ⚠️ Frame extraction engine is loading... Manual capture available.
            </p>
          )}
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Frames Gallery */}
      {capturedFrames.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📸 Captured Frames ({capturedFrames.length})
            </h3>
            <Button onClick={downloadAllFrames} size="sm">
              💾 Download All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {capturedFrames.map((frame) => (
              <div key={frame.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={frame.dataUrl}
                    alt={`Frame at ${frame.timeFormatted}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                    {frame.timeFormatted}
                  </div>
                </div>
                <div className="p-2">
                  <Button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = frame.dataUrl;
                      a.download = `frame_${frame.timeFormatted.replace(':', '-')}.${settings.format}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    size="sm"
                    className="w-full"
                  >
                    💾 Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Frame Preview */}
      {currentFrame && capturedFrames.length === 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Frame Preview</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={currentFrame}
              alt="Current frame"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <Button onClick={downloadFrame}>
            💾 Download Frame
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
