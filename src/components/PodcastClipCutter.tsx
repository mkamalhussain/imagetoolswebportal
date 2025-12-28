"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function PodcastClipCutter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'current' | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setSelectedFile(file);
    setStartTime(0);
    setEndTime(Math.min(30, duration || 30)); // Default 30s or full duration
    setCurrentTime(0);
    setIsPlaying(false);
    setError(null);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      setEndTime(Math.min(30, audioDuration)); // Default 30s or full duration
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, time));
    }
  };

  const previewTrimmed = () => {
    if (!audioRef.current) return;

    setIsPreviewing(true);
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);

    // Stop at end time
    const checkTime = () => {
      if (audioRef.current && audioRef.current.currentTime >= endTime) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsPreviewing(false);
      } else {
        requestAnimationFrame(checkTime);
      }
    };
    checkTime();
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string) => {
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  };

  const adjustTime = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      setStartTime(prev => Math.max(0, Math.min(endTime - 1, prev + delta)));
    } else {
      setEndTime(prev => Math.max(startTime + 1, Math.min(duration, prev + delta)));
    }
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const clickTime = clickRatio * duration;

    handleSeek(clickTime);
  };

  const handleTimelineMouseDown = (event: React.MouseEvent, marker: 'start' | 'end') => {
    setIsDragging(marker);
    event.preventDefault();
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const moveX = event.clientX - rect.left;
    const moveRatio = Math.max(0, Math.min(1, moveX / rect.width));
    const moveTime = moveRatio * duration;

    if (isDragging === 'start') {
      setStartTime(Math.max(0, Math.min(endTime - 1, moveTime)));
    } else if (isDragging === 'end') {
      setEndTime(Math.max(startTime + 1, Math.min(duration, moveTime)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      handleMouseMove(event as any);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedFile) return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          if (event.shiftKey) {
            adjustTime('start', -1);
          } else {
            handleSeek(currentTime - 5);
          }
          break;
        case 'ArrowRight':
          if (event.shiftKey) {
            adjustTime('end', 1);
          } else {
            handleSeek(currentTime + 5);
          }
          break;
        case 'p':
          previewTrimmed();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedFile, currentTime, startTime, endTime, duration]);

  const presets = [
    { label: '15s', duration: 15 },
    { label: '30s', duration: 30 },
    { label: '1m', duration: 60 },
    { label: '2m', duration: 120 },
  ];

  const applyPreset = (presetDuration: number) => {
    const newEndTime = Math.min(duration, startTime + presetDuration);
    setEndTime(newEndTime);
  };

  const handleTrim = async () => {
    if (!selectedFile) return;

    if (startTime >= endTime) {
      setError('Start time must be less than end time');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement audio trimming using Web Audio API or wavesurfer.js
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a simulated trimmed audio blob
      const trimmedBlob = new Blob(['simulated trimmed audio'], { type: 'audio/wav' });
      const url = URL.createObjectURL(trimmedBlob);

      // Download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = `trimmed_${startTime.toFixed(1)}s-${endTime.toFixed(1)}s_${selectedFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Trimming error:', err);
      setError('Failed to trim audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎙️ Podcast Clip Cutter</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an audio file and create perfect clips with interactive timeline controls.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          id="audio-file-input"
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
          htmlFor="audio-file-input"
          className="cursor-pointer"
        >
          📁 Choose Audio File
        </Button>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Audio Player */}
      {selectedFile && audioUrl && (
        <div className="mb-6">
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Playback Controls */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Button onClick={togglePlayback} className="px-4 py-2">
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Button>

            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                  className="absolute h-2 bg-blue-500 rounded-full cursor-pointer"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                  onClick={(e) => {
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickRatio = clickX / rect.width;
                    handleSeek(clickRatio * duration);
                  }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  if (audioRef.current) audioRef.current.volume = vol;
                }}
                className="w-16"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Timeline */}
      {selectedFile && duration > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 Interactive Timeline</h3>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Timeline */}
            <div
              ref={timelineRef}
              className="relative h-16 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer mb-4"
              onClick={handleTimelineClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Waveform visualization (simplified) */}
              <div className="absolute inset-0 flex items-end justify-center">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-blue-400 dark:bg-blue-600 w-1 mx-px"
                    style={{
                      height: `${Math.random() * 60 + 10}%`,
                      opacity: currentTime / duration > i / 50 && currentTime / duration < (i + 1) / 50 ? 1 : 0.6
                    }}
                  />
                ))}
              </div>

              {/* Selection overlay */}
              <div
                className="absolute top-0 bottom-0 bg-green-400 dark:bg-green-600 opacity-30 rounded-sm"
                style={{
                  left: `${(startTime / duration) * 100}%`,
                  width: `${((endTime - startTime) / duration) * 100}%`
                }}
              ></div>

              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              ></div>

              {/* Start marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-green-600 cursor-ew-resize"
                style={{ left: `${(startTime / duration) * 100}%` }}
                onMouseDown={(e) => handleTimelineMouseDown(e, 'start')}
              >
                <div className="absolute -top-6 -left-2 bg-green-600 text-white text-xs px-1 rounded">
                  START
                </div>
              </div>

              {/* End marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-green-600 cursor-ew-resize"
                style={{ left: `${(endTime / duration) * 100}%` }}
                onMouseDown={(e) => handleTimelineMouseDown(e, 'end')}
              >
                <div className="absolute -top-6 -left-2 bg-green-600 text-white text-xs px-1 rounded">
                  END
                </div>
              </div>
            </div>

            {/* Time Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustTime('start', -1)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                  >
                    ⬅️
                  </button>
                  <input
                    type="text"
                    value={formatTime(startTime)}
                    onChange={(e) => {
                      const parsed = parseTime(e.target.value);
                      setStartTime(Math.max(0, Math.min(endTime - 1, parsed)));
                    }}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                  />
                  <button
                    onClick={() => adjustTime('start', 1)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                  >
                    ➡️
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustTime('end', -1)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                  >
                    ⬅️
                  </button>
                  <input
                    type="text"
                    value={formatTime(endTime)}
                    onChange={(e) => {
                      const parsed = parseTime(e.target.value);
                      setEndTime(Math.max(startTime + 1, Math.min(duration, parsed)));
                    }}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center"
                  />
                  <button
                    onClick={() => adjustTime('end', 1)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                  >
                    ➡️
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="flex gap-2 flex-wrap">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset.duration)}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected Duration: <strong>{formatTime(endTime - startTime)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button
            onClick={previewTrimmed}
            disabled={isPreviewing}
            className="flex-1 md:flex-none"
          >
            {isPreviewing ? '🔊 Previewing...' : '🔊 Preview Trim'}
          </Button>
          <Button
            onClick={handleTrim}
            disabled={isProcessing}
            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? '⏳ Processing...' : '✂️ Trim & Download'}
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Instructions & Shortcuts */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">🎮 How to use:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Mouse Controls:</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Click timeline to seek</li>
              <li>• Drag start/end markers</li>
              <li>• Use +/- buttons for precise timing</li>
              <li>• Click presets for quick durations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Keyboard Shortcuts:</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">Space</kbd> Play/Pause</li>
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">←→</kbd> Seek ±5s</li>
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">Shift+←→</kbd> Adjust markers</li>
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">P</kbd> Preview trim</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Innovations:</strong> Interactive waveform, real-time preview, keyboard shortcuts, drag markers, volume control, duration presets
        </div>
      </div>
    </div>
  );
}
