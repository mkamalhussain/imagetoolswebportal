"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from './Button';

interface ClipInfo {
  file: File;
  duration: number;
  thumbnail?: string;
  startTrim?: number;
  endTrim?: number;
}

interface Transition {
  type: 'none' | 'fade' | 'crossfade' | 'slide';
  duration: number;
}

const TRANSITION_TYPES = [
  { value: 'none', label: 'No Transition' },
  { value: 'fade', label: 'Fade In/Out' },
  { value: 'crossfade', label: 'Crossfade' },
  { value: 'slide', label: 'Slide' },
];

const EXPORT_FORMATS = [
  { value: 'mp4', label: 'MP4 (H.264)', extension: 'mp4' },
  { value: 'webm', label: 'WebM (VP9)', extension: 'webm' },
];

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ClipJoiner() {
  const [clips, setClips] = useState<ClipInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [transition, setTransition] = useState<Transition>({ type: 'none', duration: 0.5 });
  const [exportFormat, setExportFormat] = useState<string>('mp4');
  const [quality, setQuality] = useState<string>('23');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
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

  // Get video duration
  const getVideoDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration || 0);
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  }, []);

  // Generate thumbnail
  const generateThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      
      video.onseeked = () => {
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          window.URL.revokeObjectURL(video.src);
          resolve(thumbnail);
        } else {
          window.URL.revokeObjectURL(video.src);
          resolve('');
        }
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve('');
      };
      
      video.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = async (files: FileList) => {
    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
    if (videoFiles.length === 0) {
      setError('Please select video files');
      return;
    }

    setError(null);
    const newClips: ClipInfo[] = [];

    for (const file of videoFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB. Processing may be slow.`);
      }

      const duration = await getVideoDuration(file);
      const thumbnail = await generateThumbnail(file);
      
      newClips.push({
        file,
        duration,
        thumbnail,
        startTrim: 0,
        endTrim: duration,
      });
    }

    setClips(prev => [...prev, ...newClips]);
  };

  const removeClip = (index: number) => {
    setClips(prev => prev.filter((_, i) => i !== index));
    if (selectedClipIndex === index) {
      setSelectedClipIndex(null);
    }
  };

  const moveClip = (fromIndex: number, toIndex: number) => {
    const newClips = [...clips];
    const [movedClip] = newClips.splice(fromIndex, 1);
    newClips.splice(toIndex, 0, movedClip);
    setClips(newClips);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newClips = [...clips];
    const [movedClip] = newClips.splice(draggedIndex, 1);
    newClips.splice(index, 0, movedClip);
    setClips(newClips);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getTotalDuration = () => {
    return clips.reduce((total, clip) => {
      const clipDuration = (clip.endTrim || clip.duration) - (clip.startTrim || 0);
      return total + clipDuration;
    }, 0);
  };

  const handleJoin = async () => {
    if (clips.length < 2) {
      setError('Please add at least 2 video clips to join');
      return;
    }

    if (!ffmpegRef.current) {
      setError('Please wait for the processing engine to load.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentClipIndex(0);
    cancelRef.current = false;

    try {
      const ffmpeg = ffmpegRef.current;
      const format = EXPORT_FORMATS.find(f => f.value === exportFormat) || EXPORT_FORMATS[0];
      const outputFileName = `output.${format.extension}`;
      
      // Calculate total file size to determine processing strategy
      const totalSize = clips.reduce((sum, clip) => sum + clip.file.size, 0);
      const isSmallFile = totalSize < 50 * 1024 * 1024; // Less than 50MB
      const preset = isSmallFile ? 'ultrafast' : 'fast';

      // Step 1: Process clips (trim if needed, normalize only if necessary)
      const processedClips: string[] = [];
      // Only normalize if we need format conversion
      const needsNormalization = exportFormat === 'webm';
      // For transitions, we'll normalize after concat to preserve aspect ratios
      const needsTransition = transition.type !== 'none';
      
      for (let i = 0; i < clips.length; i++) {
        if (cancelRef.current) break;
        
        setCurrentClipIndex(i);
        setProgress((i / clips.length) * 50); // First 50% for processing clips
        
        const clip = clips[i];
        const inputFileName = `input_${i}.${clip.file.name.split('.').pop()}`;
        const processedFileName = `processed_${i}.mp4`;
        
        await ffmpeg.writeFile(inputFileName, await fetchFile(clip.file));
        
        // Get clip duration after trimming
        const clipStart = clip.startTrim || 0;
        const clipEnd = clip.endTrim || clip.duration;
        const clipDuration = clipEnd - clipStart;
        // More precise check for trimming
        const needsTrim = clipStart > 0.1 || Math.abs(clipDuration - clip.duration) > 0.1;
        
        if (needsTrim) {
          // Need to trim - re-encode to ensure precise cuts
          // Use -ss after -i for more accurate seeking
          const processArgs = [
            '-i', inputFileName,
            '-ss', clipStart.toFixed(3),
            '-t', clipDuration.toFixed(3),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-ar', '44100',
            '-preset', preset,
            '-crf', quality,
            '-avoid_negative_ts', 'make_zero',
            '-map', '0:v:0',
            '-map', '0:a:0?', // Preserve audio
            processedFileName
          ];
          await ffmpeg.exec(processArgs);
          processedClips.push(processedFileName);
          await ffmpeg.deleteFile(inputFileName);
        } else if (needsNormalization) {
          // Need normalization for format conversion - preserve aspect ratio
          const processArgs = [
            '-i', inputFileName,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-ar', '44100',
            '-preset', preset,
            '-crf', quality,
            // Preserve aspect ratio, scale to max 1920x1080 (no padding)
            '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease',
            '-pix_fmt', 'yuv420p',
            '-map', '0:v:0',
            '-map', '0:a:0?',
            processedFileName
          ];
          await ffmpeg.exec(processArgs);
          processedClips.push(processedFileName);
          await ffmpeg.deleteFile(inputFileName);
        } else {
          // No processing needed - use copy mode to preserve quality, size, and aspect ratio
          const processArgs = [
            '-i', inputFileName,
            '-c', 'copy',
            '-avoid_negative_ts', 'make_zero',
            processedFileName
          ];
          await ffmpeg.exec(processArgs);
          processedClips.push(processedFileName);
          await ffmpeg.deleteFile(inputFileName);
        }
      }

      if (cancelRef.current) {
        for (const file of processedClips) {
          try {
            await ffmpeg.deleteFile(file);
          } catch (e) {
            // Ignore
          }
        }
        return;
      }

      // Step 2: Create concat file
      setProgress(50);
      const concatContent = processedClips.map(file => `file '${file}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // Step 3: Concatenate all clips (with transitions if needed)
      setProgress(60);
      
      if (transition.type === 'none' && exportFormat === 'mp4') {
        // Simple concatenation with copy mode (fastest, preserves quality, size, and aspect ratio)
        const concatArgs = [
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-c', 'copy',
          '-map', '0:v:0', // Explicitly map video
          '-map', '0:a:0?', // Explicitly map audio (optional if missing)
          outputFileName
        ];
        await ffmpeg.exec(concatArgs);
      } else {
        // Need to re-encode for transitions or format conversion
        if (transition.type !== 'none') {
          // For transitions, first concatenate, then apply filter
          // Note: Transitions require re-encoding which increases file size
          const tempConcat = 'temp_concat.mp4';
          const concatArgs = [
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat.txt',
            '-c', 'copy',
            '-map', '0:v:0',
            '-map', '0:a:0?',
            tempConcat
          ];
          await ffmpeg.exec(concatArgs);
          
          // Verify temp file exists before proceeding
          try {
            await ffmpeg.readFile(tempConcat);
          } catch (e) {
            throw new Error('Failed to create concatenated video for transitions');
          }
          
          // Get total duration for fade out
          const totalDuration = clips.reduce((sum, clip) => {
            const clipDuration = (clip.endTrim || clip.duration) - (clip.startTrim || 0);
            return sum + clipDuration;
          }, 0);
          
          // Apply transition filter
          const transitionArgs = [
            '-i', tempConcat,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-preset', preset,
            '-crf', quality
          ];
          
          // Add transition filter based on type
          if (transition.type === 'fade') {
            // Fade in at start and fade out at end
            const fadeOutStart = Math.max(0.1, totalDuration - transition.duration);
            // Use separate video and audio fade filters
            transitionArgs.push(
              '-vf', `fade=t=in:st=0:d=${transition.duration},fade=t=out:st=${fadeOutStart.toFixed(3)}:d=${transition.duration}`,
              '-af', `afade=t=in:st=0:d=${transition.duration},afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${transition.duration}`
            );
          } else if (transition.type === 'crossfade') {
            // Simple fade in
            transitionArgs.push(
              '-vf', `fade=t=in:st=0:d=${transition.duration}`,
              '-af', `afade=t=in:st=0:d=${transition.duration}`
            );
          } else if (transition.type === 'slide') {
            // No filter for slide (would need complex filter graph)
            // Just re-encode without filter
          }
          
          // Always map streams after filters
          transitionArgs.push(
            '-map', '0:v:0',
            '-map', '0:a:0?',
            outputFileName
          );
          
          await ffmpeg.exec(transitionArgs);
          
          // Clean up temp file
          try {
            await ffmpeg.deleteFile(tempConcat);
          } catch (e) {
            // Ignore
          }
        } else {
          // Just format conversion
          const concatArgs = [
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat.txt',
            '-c', 'copy',
            '-map', '0:v:0',
            '-map', '0:a:0?',
            outputFileName
          ];
          await ffmpeg.exec(concatArgs);
        }
      }

      if (cancelRef.current) {
        for (const file of processedClips) {
          try {
            await ffmpeg.deleteFile(file);
          } catch (e) {
            // Ignore
          }
        }
        try {
          await ffmpeg.deleteFile('concat.txt');
          await ffmpeg.deleteFile(outputFileName);
        } catch (e) {
          // Ignore
        }
        return;
      }

      // Step 4: Final format conversion if needed
      setProgress(90);
      let finalFileName = outputFileName;
      
      if (exportFormat === 'webm') {
        finalFileName = `final.${format.extension}`;
        const reencodeArgs = [
          '-i', outputFileName,
          '-c:v', 'libvpx-vp9',
          '-c:a', 'libopus',
          '-b:a', '192k',
          '-preset', preset,
          '-crf', quality,
          '-map', '0:v:0',
          '-map', '0:a:0?', // Preserve audio
          finalFileName
        ];
        
        await ffmpeg.exec(reencodeArgs);
        await ffmpeg.deleteFile(outputFileName);
      }

      // Step 5: Read and download
      setProgress(95);
      const data = await ffmpeg.readFile(finalFileName);
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
      const joinedBlob = new Blob([arrayBuffer], { type: `video/${format.extension}` });
      const url = URL.createObjectURL(joinedBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `joined_${clips.length}_clips.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clean up all files
      for (const file of processedClips) {
        try {
          await ffmpeg.deleteFile(file);
        } catch (e) {
          // Ignore
        }
      }
      try {
        await ffmpeg.deleteFile('concat.txt');
        if (finalFileName !== outputFileName) {
          await ffmpeg.deleteFile(finalFileName);
        } else {
          await ffmpeg.deleteFile(outputFileName);
        }
      } catch (e) {
        // Ignore
      }

    } catch (err) {
      if (!cancelRef.current) {
        console.error('Joining error:', err);
        setError(`Failed to join clips: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentClipIndex(0);
    }
  };

  const cancelProcessing = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    setProgress(0);
  };

  const updateClipTrim = (index: number, startTrim: number, endTrim: number) => {
    setClips(prev => prev.map((clip, i) => 
      i === index ? { ...clip, startTrim, endTrim } : clip
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clip Joiner Tool</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload multiple video clips, arrange their sequence, and merge them with transitions.
        </p>
        {clips.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total Duration: {formatTime(getTotalDuration())} | {clips.length} clip{clips.length !== 1 ? 's' : ''}
          </div>
        )}
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
          ref={fileInputRef}
        />
        <Button as="label" htmlFor="clip-upload" className="cursor-pointer" disabled={isProcessing}>
          📁 Add Video Clips
        </Button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Recommended max: {MAX_FILE_SIZE_MB}MB per file for best performance
        </p>
      </div>

      {/* Export Options */}
      {clips.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {EXPORT_FORMATS.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quality (CRF)
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="18">High (18)</option>
              <option value="23">Medium (23)</option>
              <option value="28">Good (28)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transition
            </label>
            <select
              value={transition.type}
              onChange={(e) => setTransition({ ...transition, type: e.target.value as any })}
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {TRANSITION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {transition.type !== 'none' && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Transitions require re-encoding and will increase processing time and file size
              </p>
            )}
          </div>
        </div>
      )}

      {/* Clip List */}
      {clips.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Video Clips ({clips.length})
          </h3>
          <div className="space-y-3">
            {clips.map((clip, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-all ${
                  draggedIndex === index ? 'border-blue-500 opacity-50' : 'border-transparent'
                } ${selectedClipIndex === index ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400 font-bold">
                  #{index + 1}
                </div>
                
                {/* Thumbnail */}
                {clip.thumbnail && (
                  <div className="flex-shrink-0 w-24 h-16 bg-black rounded overflow-hidden">
                    <img src={clip.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{clip.file.name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>{formatFileSize(clip.file.size)}</span>
                    <span>•</span>
                    <span>{formatTime(clip.duration)}</span>
                    {(clip.startTrim || clip.endTrim !== clip.duration) && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          Trim: {formatTime(clip.startTrim || 0)} - {formatTime(clip.endTrim || clip.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedClipIndex(selectedClipIndex === index ? null : index)}
                    className="text-xs px-2 py-1"
                    title="Edit trim"
                  >
                    ✂️
                  </Button>
                  <Button
                    onClick={() => moveClip(index, Math.max(0, index - 1))}
                    disabled={index === 0 || isProcessing}
                    className="text-xs px-2 py-1"
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => moveClip(index, Math.min(clips.length - 1, index + 1))}
                    disabled={index === clips.length - 1 || isProcessing}
                    className="text-xs px-2 py-1"
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    onClick={() => removeClip(index)}
                    disabled={isProcessing}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                    title="Remove"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clip Trim Editor */}
      {selectedClipIndex !== null && clips[selectedClipIndex] && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Trim: {clips[selectedClipIndex].file.name}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Start: {formatTime(clips[selectedClipIndex].startTrim || 0)}
              </label>
              <input
                type="range"
                min="0"
                max={clips[selectedClipIndex].duration}
                step="0.1"
                value={clips[selectedClipIndex].startTrim || 0}
                onChange={(e) => {
                  const start = parseFloat(e.target.value);
                  const end = clips[selectedClipIndex].endTrim || clips[selectedClipIndex].duration;
                  if (start < end) {
                    updateClipTrim(selectedClipIndex, start, end);
                  }
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                End: {formatTime(clips[selectedClipIndex].endTrim || clips[selectedClipIndex].duration)}
              </label>
              <input
                type="range"
                min="0"
                max={clips[selectedClipIndex].duration}
                step="0.1"
                value={clips[selectedClipIndex].endTrim || clips[selectedClipIndex].duration}
                onChange={(e) => {
                  const end = parseFloat(e.target.value);
                  const start = clips[selectedClipIndex].startTrim || 0;
                  if (end > start) {
                    updateClipTrim(selectedClipIndex, start, end);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
          <Button
            onClick={() => setSelectedClipIndex(null)}
            className="mt-3 text-sm"
          >
            Done
          </Button>
        </div>
      )}

      {/* Join Button */}
      {clips.length >= 2 && (
        <div className="mb-6">
          {isLoadingFFmpeg && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Loading video processing engine... Please wait.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              onClick={handleJoin}
              disabled={isProcessing || isLoadingFFmpeg}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> 
                  Processing clip {currentClipIndex + 1}/{clips.length}... {progress > 0 && `${Math.round(progress)}%`}
                </span>
              ) : (
                '🔗 Join and Download'
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
          <li>• Upload multiple video files (minimum 2 clips, recommended max: {MAX_FILE_SIZE_MB}MB each)</li>
          <li>• <strong>Drag and drop</strong> clips to reorder them</li>
          <li>• Click ✂️ to trim individual clips before joining</li>
          <li>• Use arrow buttons (↑↓) to move clips up/down</li>
          <li>• Choose export format and quality settings</li>
          <li>• Click "Join and Download" to merge all clips</li>
          <li>• <strong>Note:</strong> Processing happens in your browser (client-side) - keep the tab open</li>
          <li>• Small files (&lt;50MB) use faster processing for quicker results</li>
          <li>• Processing time depends on number and size of clips</li>
        </ul>
      </div>
    </div>
  );
}
