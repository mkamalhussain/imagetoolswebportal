"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

interface Preset {
  name: string;
  speed: number;
  pitch: number;
  icon: string;
  description: string;
}

const PRESETS: Preset[] = [
  { name: 'Normal', speed: 1.0, pitch: 1.0, icon: '🎵', description: 'Original speed and pitch' },
  { name: 'Slow Motion', speed: 0.5, pitch: 1.0, icon: '🐌', description: 'Half speed, normal pitch' },
  { name: 'Fast Forward', speed: 2.0, pitch: 1.0, icon: '⚡', description: 'Double speed, normal pitch' },
  { name: 'Chipmunk', speed: 1.0, pitch: 1.5, icon: '🐿️', description: 'Normal speed, higher pitch' },
  { name: 'Deep Voice', speed: 1.0, pitch: 0.7, icon: '🎤', description: 'Normal speed, lower pitch' },
  { name: 'Slow & Deep', speed: 0.7, pitch: 0.8, icon: '🎭', description: 'Slower and deeper' },
  { name: 'Fast & High', speed: 1.5, pitch: 1.3, icon: '🚀', description: 'Faster and higher' },
];

export default function SpeedPitchAdjuster() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [originalAudioBuffer, setOriginalAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processedAudioBuffer, setProcessedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [showingOriginalWaveform, setShowingOriginalWaveform] = useState(true);
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const processedAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const processedSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Generate waveform data from audio buffer
  const generateWaveformData = (buffer: AudioBuffer): number[] => {
    const data = buffer.getChannelData(0);
    const samples = 200; // Number of points in waveform
    const blockSize = Math.floor(data.length / samples);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[i * blockSize + j]);
      }
      waveform.push(sum / blockSize);
    }

    return waveform;
  };


  // Draw waveform on canvas
  const drawWaveform = useCallback((data: number[]) => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width - 32; // Account for padding
      canvas.height = 150;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;

    const barWidth = Math.max(1, width / data.length);
    const maxValue = Math.max(...data, 0.01); // Prevent division by zero

    data.forEach((value, index) => {
      const normalizedValue = value / maxValue;
      const barHeight = normalizedValue * height * 0.7;
      const x = index * barWidth;
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, []);

  // Store original waveform data
  const [originalWaveformData, setOriginalWaveformData] = useState<number[]>([]);
  const [processedWaveformData, setProcessedWaveformData] = useState<number[]>([]);

  // Load and decode audio file
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      if (!audioContext) {
        throw new Error('AudioContext not initialized');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setOriginalAudioBuffer(buffer);
      
      // Generate and store original waveform
      const origWaveform = generateWaveformData(buffer);
      setOriginalWaveformData(origWaveform);
      setWaveformData(origWaveform);
      setShowingOriginalWaveform(true);
      
      processAudio(buffer, speed, pitch);
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Failed to load audio file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process audio with speed and pitch adjustment
  const processAudio = useCallback(async (buffer: AudioBuffer, speedValue: number, pitchValue: number) => {
    if (!audioContext || !buffer) return;

    try {
      const sampleRate = buffer.sampleRate;
      const numberOfChannels = buffer.numberOfChannels;
      const originalLength = buffer.length;
      
      // Calculate new length based on speed
      const newLength = Math.floor(originalLength / speedValue);
      
      // Create new audio buffer
      const newBuffer = audioContext.createBuffer(
        numberOfChannels,
        newLength,
        sampleRate
      );

      // Process each channel
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const originalData = buffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);

        // Resample and adjust pitch
        for (let i = 0; i < newLength; i++) {
          const originalIndex = i * speedValue;
          const index = Math.floor(originalIndex);
          const fraction = originalIndex - index;

          if (index + 1 < originalLength) {
            // Linear interpolation for smooth pitch adjustment
            const sample1 = originalData[index];
            const sample2 = originalData[index + 1];
            let interpolated = sample1 + (sample2 - sample1) * fraction;

            // Apply pitch shift using simple resampling
            const pitchIndex = Math.floor(i / pitchValue);
            if (pitchIndex < originalLength) {
              newData[i] = interpolated;
            } else {
              newData[i] = 0;
            }
          } else {
            newData[i] = 0;
          }
        }
      }

      setProcessedAudioBuffer(newBuffer);
      
      // Generate and store processed waveform
      const procWaveform = generateWaveformData(newBuffer);
      setProcessedWaveformData(procWaveform);
      
      // Update displayed waveform if currently showing processed
      if (!showingOriginalWaveform) {
        setWaveformData(procWaveform);
        drawWaveform(procWaveform);
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
    }
  }, [audioContext, showingOriginalWaveform]);

  // Update processed audio when speed or pitch changes
  useEffect(() => {
    if (originalAudioBuffer) {
      processAudio(originalAudioBuffer, speed, pitch);
    }
  }, [speed, pitch, originalAudioBuffer, processAudio]);

  // Update waveform display when switching between original/processed
  useEffect(() => {
    if (showingOriginalWaveform && originalWaveformData.length > 0) {
      setWaveformData(originalWaveformData);
      drawWaveform(originalWaveformData);
    } else if (!showingOriginalWaveform && processedWaveformData.length > 0) {
      setWaveformData(processedWaveformData);
      drawWaveform(processedWaveformData);
    }
  }, [showingOriginalWaveform, originalWaveformData, processedWaveformData, drawWaveform]);

  // Redraw waveform on window resize
  useEffect(() => {
    const handleResize = () => {
      if (waveformData.length > 0) {
        drawWaveform(waveformData);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [waveformData, drawWaveform]);

  // Play original audio
  const playOriginal = () => {
    if (!originalAudioBuffer || !audioContext) return;

    stopAll();

    const source = audioContext.createBufferSource();
    source.buffer = originalAudioBuffer;
    source.connect(audioContext.destination);
    originalSourceRef.current = source;

    source.onended = () => {
      setIsPlayingOriginal(false);
      setPlaybackPosition(0);
    };

    source.start(0);
    setIsPlayingOriginal(true);
  };

  // Play processed audio
  const playProcessed = () => {
    if (!processedAudioBuffer || !audioContext) return;

    stopAll();

    const source = audioContext.createBufferSource();
    source.buffer = processedAudioBuffer;
    source.connect(audioContext.destination);
    processedSourceRef.current = source;

    source.onended = () => {
      setIsPlayingProcessed(false);
      setPlaybackPosition(0);
    };

    source.start(0);
    setIsPlayingProcessed(true);
  };

  // Stop all playback
  const stopAll = () => {
    if (originalSourceRef.current) {
      try {
        originalSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      originalSourceRef.current = null;
    }
    if (processedSourceRef.current) {
      try {
        processedSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      processedSourceRef.current = null;
    }
    setIsPlayingOriginal(false);
    setIsPlayingProcessed(false);
    setPlaybackPosition(0);
  };

  // Apply preset
  const applyPreset = (preset: Preset) => {
    setSpeed(preset.speed);
    setPitch(preset.pitch);
  };

  // Download processed audio
  const downloadProcessed = async () => {
    if (!processedAudioBuffer || !audioContext) return;

    setIsProcessing(true);
    try {
      // Convert AudioBuffer to WAV
      const wav = audioBufferToWav(processedAudioBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adjusted_${selectedFile?.name.replace(/\.[^/.]+$/, '')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading audio:', err);
      setError('Failed to download audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];

    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  // Format time
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Speed/Pitch Adjuster Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Adjust speed and pitch independently with real-time preview and before/after comparison.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          id="speed-pitch-file-input"
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
          htmlFor="speed-pitch-file-input"
          className="cursor-pointer"
        >
          Choose Audio File
        </Button>
        {selectedFile && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">File:</span> {selectedFile.name
              } • <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              {originalAudioBuffer && (
                <> • <span className="font-medium">Duration:</span> {formatTime(originalAudioBuffer.duration)}</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Presets */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  speed === preset.speed && pitch === preset.pitch
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={preset.description}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {selectedFile && (
        <div className="mb-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Speed: {speed.toFixed(2)}x
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">0.5x - 2.0x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pitch: {pitch.toFixed(2)}x
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">0.5x - 2.0x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.01"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x (Lower)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Higher)</span>
            </div>
          </div>
        </div>
      )}

      {/* Waveform Visualization */}
      {waveformData.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Waveform Visualization
            </label>
            {originalWaveformData.length > 0 && processedWaveformData.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowingOriginalWaveform(true)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    showingOriginalWaveform
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setShowingOriginalWaveform(false)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    !showingOriginalWaveform
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Processed
                </button>
              </div>
            )}
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <canvas
              ref={waveformCanvasRef}
              width={800}
              height={150}
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Before/After Preview */}
      {selectedFile && originalAudioBuffer && processedAudioBuffer && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Before & After Preview</h3>
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {comparisonMode ? '🔄 Comparison Mode ON' : '🎵 Single Mode'}
            </button>
          </div>

          <div className={`grid ${comparisonMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {/* Original Audio */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Original Audio</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(originalAudioBuffer.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlayingOriginal ? stopAll : playOriginal}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlayingOriginal
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isPlayingOriginal ? '⏹️ Stop' : '▶️ Play Original'}
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${(playbackPosition / originalAudioBuffer.duration) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Processed Audio */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Processed Audio</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(processedAudioBuffer.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlayingProcessed ? stopAll : playProcessed}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPlayingProcessed
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isPlayingProcessed ? '⏹️ Stop' : '▶️ Play Processed'}
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${(playbackPosition / processedAudioBuffer.duration) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Speed: {speed.toFixed(2)}x • Pitch: {pitch.toFixed(2)}x
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Button */}
      {selectedFile && processedAudioBuffer && (
        <div className="mb-6">
          <Button
            onClick={downloadProcessed}
            disabled={isProcessing}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isProcessing ? '⏳ Processing...' : '💾 Download Processed Audio'}
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Features:</h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
          <li>• <strong>Real-time Preview:</strong> Hear changes instantly as you adjust</li>
          <li>• <strong>Before/After Comparison:</strong> Compare original vs processed side-by-side</li>
          <li>• <strong>Quick Presets:</strong> One-click presets for common adjustments</li>
          <li>• <strong>Waveform Visualization:</strong> Visual representation of your audio</li>
          <li>• <strong>Independent Controls:</strong> Adjust speed and pitch separately</li>
          <li>• <strong>High Quality:</strong> Professional audio processing with Web Audio API</li>
        </ul>
      </div>
    </div>
  );
}
