"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from './Button';

interface TextOverlay {
  text: string;
  x: number; // 0-1 (percentage of width)
  y: number; // 0-1 (percentage of height)
  size: number; // font size
  color: string;
  font: string;
  startTime: number;
  endTime: number;
}

interface GIFStyle {
  name: string;
  filter: string;
  description: string;
}

const GIF_STYLES: GIFStyle[] = [
  { name: 'Normal', filter: '', description: 'Standard GIF' },
  { name: 'Cinematic', filter: 'curves=all=\'0/0 0.5/0.7 1/1\'', description: 'Enhanced colors and contrast' },
  { name: 'Vintage', filter: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131', description: 'Sepia tone effect' },
  { name: 'High Contrast', filter: 'eq=contrast=1.5:brightness=0.1', description: 'Dramatic contrast boost' },
  { name: 'Cool Tone', filter: 'colorbalance=rs=0.3:gs=0.3:bs=0.3', description: 'Cool blue tint' },
  { name: 'Warm Tone', filter: 'colorbalance=rs=0.2:gs=0.1:bs=-0.1', description: 'Warm orange tint' },
];

const FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Impact',
  'Comic Sans MS'
];

const ASPECT_RATIOS = [
  { name: 'Original', value: 'original' },
  { name: '16:9', value: '16:9' },
  { name: '4:3', value: '4:3' },
  { name: '1:1 (Square)', value: '1:1' },
  { name: '9:16 (Vertical)', value: '9:16' },
];

export default function GIFMaker() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [fps, setFps] = useState<number>(15);
  const [quality, setQuality] = useState<number>(80);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<string>('original');
  const [selectedStyle, setSelectedStyle] = useState<string>('Normal');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentTextOverlay, setCurrentTextOverlay] = useState<Partial<TextOverlay>>({
    text: '',
    x: 0.5,
    y: 0.5,
    size: 24,
    color: '#FFFFFF',
    font: 'Arial',
    startTime: 0,
    endTime: 5
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const cancelRef = useRef<boolean>(false);

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (ffmpegRef.current) return;

      setIsLoadingFFmpeg(true);
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('log', ({ message }) => {
          console.log('FFmpeg:', message);
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
    setGifUrl(null);
    setPreviewUrl(null);
    setTextOverlays([]);
    setError(null);
    setProgress(0);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(Math.min(5, videoDuration));
      setCurrentTextOverlay(prev => ({ ...prev, endTime: Math.min(5, videoDuration) }));
    }
  };

  const generateGIF = async () => {
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

    // Set up timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (isProcessing) {
        setError('GIF generation timed out. Try with a shorter clip or different settings.');
        cancelProcessing();
      }
    }, 120000); // 2 minute timeout

    try {
      const ffmpeg = ffmpegRef.current;
      const inputFileName = 'input.mp4';
      const gifFileName = 'output.gif';

      // Write input file
      setProgress(5);
      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      // Build FFmpeg arguments
      const args = ['-i', inputFileName];

      // Add start time if needed
      if (startTime > 0) {
        args.push('-ss', startTime.toFixed(3));
      }

      // Duration
      const clipDuration = endTime - startTime;
      args.push('-t', clipDuration.toFixed(3));

      // Apply aspect ratio if not original
      if (aspectRatio !== 'original') {
        const [width, height] = aspectRatio.split(':').map(Number);
        if (width && height) {
          const ratio = width / height;
          if (ratio > 1) {
            // Landscape
            args.push('-vf', `scale='min(480,iw)':-2,pad=480:ih:(ow-iw)/2:(oh-ih)/2:black`);
          } else {
            // Portrait
            args.push('-vf', `scale=-2:'min(480,ih)',pad=iw:480:(ow-iw)/2:(oh-ih)/2:black`);
          }
        }
      }

      // Apply selected style filter
      const selectedStyleObj = GIF_STYLES.find(s => s.name === selectedStyle);
      if (selectedStyleObj && selectedStyleObj.filter) {
        if (args.includes('-vf')) {
          // Add to existing filter chain
          const vfIndex = args.indexOf('-vf');
          args[vfIndex + 1] = args[vfIndex + 1] + ',' + selectedStyleObj.filter;
        } else {
          args.push('-vf', selectedStyleObj.filter);
        }
      }

      // Add text overlays
      if (textOverlays.length > 0) {
        for (const overlay of textOverlays) {
          const textFilter = `drawtext=text='${overlay.text.replace(/'/g, "\\'")}':x=(w-tw)*${overlay.x}:y=(h-th)*${overlay.y}:fontsize=${overlay.size}:fontcolor=${overlay.color}:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
          if (args.includes('-vf')) {
            const vfIndex = args.indexOf('-vf');
            args[vfIndex + 1] = args[vfIndex + 1] + ',' + textFilter;
          } else {
            args.push('-vf', textFilter);
          }
        }
      }

      // GIF generation parameters
      args.push(
        '-vf', args.includes('-vf') ? args[args.indexOf('-vf') + 1] + ',fps=' + fps : 'fps=' + fps,
        '-gifflags', '+transdiff',
        '-y', // Overwrite output files
        gifFileName
      );

      setProgress(20);
      const progressCallback = ({ progress }: { progress: number }) => {
        setProgress(20 + progress * 75); // 20-95% for GIF generation
      };

      ffmpeg.on('progress', progressCallback);
      await ffmpeg.exec(args);
      ffmpeg.off('progress', progressCallback);

      // Read the output file
      setProgress(95);
      const data = await ffmpeg.readFile(gifFileName);
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

      setProgress(100);
      const gifBlob = new Blob([arrayBuffer], { type: 'image/gif' });
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);

      // Clean up FFmpeg files
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(gifFileName);

    } catch (err) {
      if (!cancelRef.current) {
        console.error('GIF generation error:', err);
        setError(`Failed to generate GIF: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      }
    } finally {
      clearTimeout(timeout);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const generatePreview = async () => {
    if (!selectedFile || !ffmpegRef.current) return;

    setIsPreviewing(true);
    setError(null);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputFileName = 'input.mp4';
      const previewFileName = 'preview.gif';

      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      // Create a short preview GIF (first 2 seconds)
      const previewDuration = Math.min(2, endTime - startTime);
      const args = [
        '-i', inputFileName,
        '-ss', startTime.toFixed(3),
        '-t', previewDuration.toFixed(3),
        '-vf', 'fps=10,scale=320:-1',
        '-y',
        previewFileName
      ];

      await ffmpeg.exec(args);

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

      const previewBlob = new Blob([arrayBuffer], { type: 'image/gif' });
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

  const cancelProcessing = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    setProgress(0);
  };

  const addTextOverlay = () => {
    if (currentTextOverlay.text && currentTextOverlay.text.trim()) {
      setTextOverlays(prev => [...prev, currentTextOverlay as TextOverlay]);
      setCurrentTextOverlay({
        text: '',
        x: 0.5,
        y: 0.5,
        size: 24,
        color: '#FFFFFF',
        font: 'Arial',
        startTime: startTime,
        endTime: endTime
      });
      setShowTextEditor(false);
    }
  };

  const removeTextOverlay = (index: number) => {
    setTextOverlays(prev => prev.filter((_, i) => i !== index));
  };

  const downloadGIF = () => {
    if (!gifUrl) return;

    const a = document.createElement('a');
    a.href = gifUrl;
    const fileName = selectedFile?.name.replace(/\.[^/.]+$/, "") || 'video';
    const style = selectedStyle !== 'Normal' ? `_${selectedStyle.toLowerCase()}` : '';
    a.download = `gif_${fileName}_${startTime.toFixed(1)}-${endTime.toFixed(1)}s${style}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">GIF Maker from Video</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Convert video segments to animated GIFs with speed control options and loop settings.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Video File
        </label>
        <input
          ref={fileInputRef}
          id="gif-maker-file-input"
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
          htmlFor="gif-maker-file-input"
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
          <video
            ref={videoRef}
            className="w-full max-h-64 bg-black rounded"
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={URL.createObjectURL(selectedFile)} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Settings */}
      {selectedFile && (
        <div className="mb-6 space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="number"
                min="0"
                max={duration}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(Math.max(0, Math.min(parseFloat(e.target.value) || 0, duration)))}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">{formatTime(startTime)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="number"
                min="0"
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(Math.max(0, Math.min(parseFloat(e.target.value) || 0, duration)))}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">{formatTime(endTime)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frame Rate: {fps} FPS
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {ASPECT_RATIOS.map(ratio => (
                  <option key={ratio.value} value={ratio.value}>{ratio.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visual Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {GIF_STYLES.map(style => (
                  <option key={style.name} value={style.name}>
                    {style.name} - {style.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            Duration: {formatTime(endTime - startTime)} • Estimated file size: ~{(endTime - startTime) * fps * 50} KB
          </div>
        </div>
      )}

      {/* Text Overlays */}
      {selectedFile && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Overlays</h3>
            <Button
              onClick={() => setShowTextEditor(!showTextEditor)}
              className="text-sm"
            >
              {showTextEditor ? 'Hide Editor' : 'Add Text'}
            </Button>
          </div>

          {/* Text Editor */}
          {showTextEditor && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text</label>
                <input
                  type="text"
                  value={currentTextOverlay.text || ''}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter text to overlay"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font</label>
                <select
                  value={currentTextOverlay.font || 'Arial'}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, font: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                >
                  {FONTS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <input
                  type="color"
                  value={currentTextOverlay.color || '#FFFFFF'}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size: {currentTextOverlay.size || 24}px</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={currentTextOverlay.size || 24}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position X: {(currentTextOverlay.x || 0.5) * 100}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentTextOverlay.x || 0.5}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position Y: {(currentTextOverlay.y || 0.5) * 100}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentTextOverlay.y || 0.5}
                  onChange={(e) => setCurrentTextOverlay(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={addTextOverlay} disabled={!currentTextOverlay.text?.trim()}>
                  Add Text Overlay
                </Button>
                <Button
                  onClick={() => setShowTextEditor(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Text Overlays */}
          {textOverlays.length > 0 && (
            <div className="space-y-2">
              {textOverlays.map((overlay, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">"{overlay.text}"</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {overlay.font}, {overlay.size}px, {overlay.color} • {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeTextOverlay(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      {selectedFile && !gifUrl && (
        <div className="mb-6">
          {isLoadingFFmpeg && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Loading video processing engine... Please wait.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generatePreview}
              disabled={isProcessing || isLoadingFFmpeg || isPreviewing}
              className="flex items-center gap-2"
            >
              {isPreviewing ? '⏳ Generating Preview...' : '👁️ Preview GIF'}
            </Button>
            <Button
              onClick={generateGIF}
              disabled={isProcessing || isLoadingFFmpeg}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing... {progress > 0 && `${Math.round(progress)}%`}
                </span>
              ) : (
                '🎬 Generate GIF'
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
          </div>
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

      {/* Preview */}
      {previewUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GIF Preview</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={previewUrl}
              alt="GIF Preview"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This is a short preview. Click "Generate GIF" for the full version.
            </p>
          </div>
          <Button
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }}
            className="mr-2"
          >
            Close Preview
          </Button>
        </div>
      )}

      {/* Generated GIF */}
      {gifUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated GIF</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <img
              src={gifUrl}
              alt="Generated GIF"
              className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadGIF} className="flex items-center gap-2">
              💾 Download GIF
            </Button>
            <Button
              onClick={() => {
                if (gifUrl) URL.revokeObjectURL(gifUrl);
                setGifUrl(null);
              }}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>
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
          <li>• Set start and end times for your GIF segment</li>
          <li>• Adjust frame rate (5-30 FPS) and quality (50-95%)</li>
          <li>• Choose aspect ratio and visual style effects</li>
          <li>• <strong>Add text overlays</strong> with custom fonts, colors, and positioning</li>
          <li>• Click "Preview GIF" for a quick 2-second preview</li>
          <li>• Click "Generate GIF" to create the full animated GIF</li>
          <li>• Download your customized GIF file</li>
          <li>• <strong>Tip:</strong> Lower quality/frame rate = smaller file size</li>
        </ul>
      </div>
    </div>
  );
}
