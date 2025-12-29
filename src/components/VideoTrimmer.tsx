"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from './Button';

interface QualityOption {
  label: string;
  crf: string;
  preset: string;
  description: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  { label: 'High Quality', crf: '18', preset: 'slow', description: 'Best quality, larger file size' },
  { label: 'Medium Quality', crf: '23', preset: 'medium', description: 'Balanced quality and size' },
  { label: 'Good Quality', crf: '23', preset: 'fast', description: 'Good quality, faster processing' },
  { label: 'Smaller File', crf: '28', preset: 'fast', description: 'Smaller file, acceptable quality' },
];

const EXPORT_FORMATS = [
  { value: 'mp4', label: 'MP4 (H.264)', extension: 'mp4' },
  { value: 'webm', label: 'WebM (VP9)', extension: 'webm' },
  { value: 'mov', label: 'MOV (H.264)', extension: 'mov' },
];

const MAX_FILE_SIZE_MB = 500; // 500MB recommended max
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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
  const [quality, setQuality] = useState<string>('23');
  const [preset, setPreset] = useState<string>('fast');
  const [exportFormat, setExportFormat] = useState<string>('mp4');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [frameStep, setFrameStep] = useState<number>(0.033); // ~30fps default
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const cancelRef = useRef<boolean>(false);

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

  // Estimate file size
  useEffect(() => {
    if (selectedFile && duration > 0 && startTime < endTime) {
      const trimDuration = endTime - startTime;
      const originalBitrate = (selectedFile.size * 8) / duration; // bits per second
      const estimatedBitrate = originalBitrate * 0.8; // Assume 20% reduction with compression
      const estimatedBytes = (estimatedBitrate * trimDuration) / 8;
      setEstimatedSize(estimatedBytes);
    } else {
      setEstimatedSize(null);
    }
  }, [selectedFile, duration, startTime, endTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedFile || !videoRef.current) return;

      const video = videoRef.current;
      const step = frameStep;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + step);
          break;
        case ' ':
          e.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
          break;
        case 'i':
          e.preventDefault();
          setStartTime(video.currentTime);
          break;
        case 'o':
          e.preventDefault();
          setEndTime(video.currentTime);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedFile, duration, frameStep]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      setError(`File size (${sizeMB} MB) exceeds recommended maximum (${MAX_FILE_SIZE_MB} MB). Processing may be slow or fail.`);
    }

    setSelectedFile(file);
    setError(null);
    setStartTime(0);
    setEndTime(10);
    setCurrentTime(0);
    setProgress(0);
    setPreviewUrl(null);
    setEstimatedSize(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(Math.min(10, videoDuration));
      
      // Detect frame rate if possible
      const video = videoRef.current;
      if (video.videoWidth && video.videoHeight) {
        // Estimate frame rate (rough approximation)
        setFrameStep(1 / 30); // Default to 30fps
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    if (!videoRef.current) return;
    const step = direction === 'forward' ? frameStep : -frameStep;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + step));
  };

  const previewTrim = async () => {
    if (!selectedFile || !ffmpegRef.current || startTime >= endTime) return;

    setIsPreviewing(true);
    setError(null);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputFileName = 'input.' + selectedFile.name.split('.').pop();
      const previewFileName = 'preview.mp4';
      const trimDuration = endTime - startTime;

      // Limit preview to 10 seconds max
      const previewDuration = Math.min(trimDuration, 10);

      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      await ffmpeg.exec([
        '-i', inputFileName,
        '-ss', startTime.toString(),
        '-t', previewDuration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-vf', 'scale=640:-1', // Lower resolution for preview
        previewFileName
      ]);

      const data = await ffmpeg.readFile(previewFileName);
      let arrayBuffer: ArrayBuffer;
      if (data instanceof Uint8Array) {
        arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      } else if (typeof data === 'object' && 'byteLength' in data) {
        const source = data as ArrayBuffer;
        arrayBuffer = source.slice(0) as ArrayBuffer;
      } else {
        const binaryString = atob(data as string);
        arrayBuffer = new ArrayBuffer(binaryString.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          view[i] = binaryString.charCodeAt(i);
        }
      }

      const previewBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(previewBlob);
      setPreviewUrl(url);

      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(previewFileName);
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to generate preview. Please try again.');
    } finally {
      setIsPreviewing(false);
    }
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
    cancelRef.current = false;

    try {
      const ffmpeg = ffmpegRef.current;
      const inputFileName = 'input.' + selectedFile.name.split('.').pop();
      const format = EXPORT_FORMATS.find(f => f.value === exportFormat) || EXPORT_FORMATS[0];
      const outputFileName = `output.${format.extension}`;
      const trimDuration = endTime - startTime;

      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      const args = [
        '-i', inputFileName,
        '-ss', startTime.toString(),
        '-t', trimDuration.toString(),
      ];

      if (exportFormat === 'mp4') {
        args.push('-c:v', 'libx264', '-c:a', 'aac', '-preset', preset, '-crf', quality);
      } else if (exportFormat === 'webm') {
        args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus', '-b:v', '0', '-crf', quality);
      } else if (exportFormat === 'mov') {
        args.push('-c:v', 'libx264', '-c:a', 'aac', '-preset', preset, '-crf', quality);
      }

      args.push(outputFileName);

      await ffmpeg.exec(args);

      if (cancelRef.current) {
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
        return;
      }

      const data = await ffmpeg.readFile(outputFileName);
      let arrayBuffer: ArrayBuffer;
      if (data instanceof Uint8Array) {
        arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      } else if (typeof data === 'object' && 'byteLength' in data) {
        const source = data as ArrayBuffer;
        arrayBuffer = source.slice(0) as ArrayBuffer;
      } else {
        const binaryString = atob(data as string);
        arrayBuffer = new ArrayBuffer(binaryString.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
          view[i] = binaryString.charCodeAt(i);
        }
      }

      const trimmedBlob = new Blob([arrayBuffer], { type: `video/${format.extension}` });
      const url = URL.createObjectURL(trimmedBlob);

      const a = document.createElement('a');
      a.href = url;
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      a.download = `trimmed_${originalName}_${formatTime(startTime)}-${formatTime(endTime)}.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

    } catch (err) {
      if (!cancelRef.current) {
        console.error('Trimming error:', err);
        setError(`Failed to trim video: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const cancelProcessing = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    setProgress(0);
  };

  const scrubToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const selectedQuality = QUALITY_OPTIONS.find(q => q.crf === quality && q.preset === preset) || QUALITY_OPTIONS[2];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Short Video Trimmer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a video and trim it with precision controls, quality options, and preview.
        </p>
        {selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES && (
          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Large file detected. Processing may take longer. Recommended max: {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        )}
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
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
            {estimatedSize && (
              <p className="mt-1 text-xs">
                Estimated output size: ~{formatFileSize(estimatedSize)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Video Player */}
      {selectedFile && (
        <div className="mb-6">
          <div className="bg-black rounded-lg overflow-hidden relative">
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
            {/* Frame navigation overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => stepFrame('backward')}
                className="px-3 py-1 bg-black/70 text-white rounded text-sm hover:bg-black/90"
                title="Previous frame (←)"
              >
                ⏮ Frame
              </button>
              <button
                onClick={() => stepFrame('forward')}
                className="px-3 py-1 bg-black/70 text-white rounded text-sm hover:bg-black/90"
                title="Next frame (→)"
              >
                Frame ⏭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Preview</h3>
          <video src={previewUrl} controls className="w-full max-h-64 rounded" />
          <Button
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }}
            className="mt-2 text-sm"
          >
            Close Preview
          </Button>
        </div>
      )}

      {/* Timeline Scrubber */}
      {selectedFile && duration > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trim Timeline</h3>

          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = x / rect.width;
                  const time = percent * duration;
                  scrubToTime(time);
                }}
              >
                <div
                  className="absolute h-3 bg-blue-600 rounded-full"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    width: `${((endTime - startTime) / duration) * 100}%`
                  }}
                ></div>
              </div>

              {/* Current time indicator */}
              <div
                className="absolute w-1 h-6 bg-red-500 -mt-1.5 pointer-events-none"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>

              {/* Start marker */}
              <div
                className="absolute w-5 h-5 bg-blue-600 rounded-full -mt-1 cursor-pointer border-2 border-white dark:border-gray-800 shadow-lg hover:scale-110 transition-transform"
                style={{ left: `${(startTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                onClick={() => scrubToTime(startTime)}
                title={`Start: ${formatTime(startTime)}`}
              ></div>

              {/* End marker */}
              <div
                className="absolute w-5 h-5 bg-blue-600 rounded-full -mt-1 cursor-pointer border-2 border-white dark:border-gray-800 shadow-lg hover:scale-110 transition-transform"
                style={{ left: `${(endTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                onClick={() => scrubToTime(endTime)}
                title={`End: ${formatTime(endTime)}`}
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
                  step={frameStep}
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setStartTime(Math.max(0, startTime - frameStep))}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    -Frame
                  </button>
                  <button
                    onClick={() => setStartTime(videoRef.current?.currentTime || 0)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    Set to Current (I)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time: {formatTime(endTime)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step={frameStep}
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEndTime(Math.min(duration, endTime + frameStep))}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    +Frame
                  </button>
                  <button
                    onClick={() => setEndTime(videoRef.current?.currentTime || duration)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    Set to Current (O)
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Duration: {formatTime(endTime - startTime)} (Total: {formatTime(duration)})
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      {selectedFile && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {EXPORT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality: {selectedQuality.label}
            </label>
            <select
              value={`${quality}-${preset}`}
              onChange={(e) => {
                const [crf, presetValue] = e.target.value.split('-');
                setQuality(crf);
                setPreset(presetValue);
              }}
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {QUALITY_OPTIONS.map(opt => (
                <option key={`${opt.crf}-${opt.preset}`} value={`${opt.crf}-${opt.preset}`}>
                  {opt.label} - {opt.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="mb-6 flex flex-wrap gap-3">
          {isLoadingFFmpeg && (
            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Loading video processing engine... Please wait.
              </p>
            </div>
          )}
          <Button
            onClick={previewTrim}
            disabled={isProcessing || isLoadingFFmpeg || isPreviewing}
            className="flex items-center gap-2"
          >
            {isPreviewing ? '⏳ Generating Preview...' : '👁️ Preview Trim'}
          </Button>
          <Button
            onClick={handleTrim}
            disabled={isProcessing || isLoadingFFmpeg}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing... {progress > 0 && `${Math.round(progress)}%`}
              </span>
            ) : (
              '✂️ Trim and Download'
            )}
          </Button>
          {isProcessing && (
            <Button
              onClick={cancelProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel
            </Button>
          )}
          {isProcessing && progress > 0 && (
            <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
          <li>• Upload a video file (recommended max: {MAX_FILE_SIZE_MB}MB for best performance)</li>
          <li>• Use timeline scrubber or sliders to set start and end times</li>
          <li>• <strong>Keyboard shortcuts:</strong> ←/→ (frame step), Space (play/pause), I (set start), O (set end)</li>
          <li>• Click "Preview Trim" to see a quick preview before processing</li>
          <li>• Choose export format (MP4, WebM, MOV) and quality settings</li>
          <li>• Click "Trim and Download" to process and download your trimmed video</li>
          <li>• Large files may take longer to process - be patient!</li>
        </ul>
      </div>
    </div>
  );
}
