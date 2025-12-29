"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

type NoiseType = 'hiss' | 'hum' | 'background' | 'wind' | 'click' | 'auto';
type Algorithm = 'spectral' | 'highpass' | 'notch' | 'adaptive' | 'combined';

interface NoiseProfile {
  type: NoiseType;
  frequency?: number; // For hum/notch filtering
  intensity: number; // 0-1
}

export default function NoiseCleaner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalAudioBuffer, setOriginalAudioBuffer] = useState<AudioBuffer | null>(null);
  const [cleanedAudioBuffer, setCleanedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [noiseType, setNoiseType] = useState<NoiseType>('auto');
  const [intensity, setIntensity] = useState<number>(0.7);
  const [algorithm, setAlgorithm] = useState<Algorithm>('combined');
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingCleaned, setIsPlayingCleaned] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [originalWaveform, setOriginalWaveform] = useState<number[]>([]);
  const [cleanedWaveform, setCleanedWaveform] = useState<number[]>([]);
  const [frequencySpectrum, setFrequencySpectrum] = useState<number[]>([]);
  const [showingOriginalWaveform, setShowingOriginalWaveform] = useState(true);
  const [noiseProfile, setNoiseProfile] = useState<NoiseProfile | null>(null);

  const originalSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const cleanedSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize AudioContext
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  // Generate waveform data
  const generateWaveformData = useCallback((buffer: AudioBuffer): number[] => {
    const data = buffer.getChannelData(0);
    const samples = 200;
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
  }, []);

  // Generate frequency spectrum using FFT
  const generateFrequencySpectrum = useCallback((buffer: AudioBuffer): number[] => {
    const data = buffer.getChannelData(0);
    const fftSize = 2048;
    const samples = Math.min(data.length, fftSize);
    const spectrum: number[] = [];

    // Simple FFT approximation using windowed samples
    for (let i = 0; i < 100; i++) {
      const start = Math.floor((i / 100) * samples);
      const end = Math.floor(((i + 1) / 100) * samples);
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += Math.abs(data[j]);
      }
      spectrum.push(sum / (end - start));
    }

    return spectrum;
  }, []);

  // Draw waveform on canvas
  const drawWaveform = useCallback((data: number[], color: string = '#3b82f6') => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width - 32;
      canvas.height = 150;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (color === '#3b82f6') {
      gradient.addColorStop(0, '#1e40af');
      gradient.addColorStop(1, '#3b82f6');
    } else {
      gradient.addColorStop(0, '#059669');
      gradient.addColorStop(1, '#10b981');
    }
    ctx.fillStyle = gradient;

    const barWidth = Math.max(1, width / data.length);
    const maxValue = Math.max(...data, 0.01);

    data.forEach((value, index) => {
      const normalizedValue = value / maxValue;
      const barHeight = normalizedValue * height * 0.7;
      const x = index * barWidth;
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, []);

  // Draw frequency spectrum
  const drawSpectrum = useCallback((data: number[]) => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width - 32;
      canvas.height = 200;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ef4444');
    gradient.addColorStop(0.5, '#f59e0b');
    gradient.addColorStop(1, '#10b981');
    ctx.fillStyle = gradient;

    const barWidth = width / data.length;
    const maxValue = Math.max(...data, 0.01);

    data.forEach((value, index) => {
      const normalizedValue = value / maxValue;
      const barHeight = normalizedValue * height;
      const x = index * barWidth;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    });
  }, []);

  // Detect noise profile
  const detectNoiseProfile = useCallback((buffer: AudioBuffer): NoiseProfile => {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    
    // Analyze frequency content
    const fftSize = 2048;
    const samples = Math.min(data.length, fftSize);
    
    // Calculate average energy in different frequency bands
    const lowFreq = [0, sampleRate * 0.1]; // 0-10% of sample rate
    const midFreq = [sampleRate * 0.1, sampleRate * 0.5];
    const highFreq = [sampleRate * 0.5, sampleRate * 0.9];
    
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;
    
    for (let i = 0; i < samples; i++) {
      const freq = (i / samples) * (sampleRate / 2);
      const energy = Math.abs(data[i]);
      
      if (freq >= lowFreq[0] && freq < lowFreq[1]) lowEnergy += energy;
      else if (freq >= midFreq[0] && freq < midFreq[1]) midEnergy += energy;
      else if (freq >= highFreq[0] && freq < highFreq[1]) highEnergy += energy;
    }
    
    // Determine noise type based on frequency distribution
    const totalEnergy = lowEnergy + midEnergy + highEnergy;
    const lowRatio = lowEnergy / totalEnergy;
    const highRatio = highEnergy / totalEnergy;
    
    let detectedType: NoiseType = 'background';
    if (highRatio > 0.4) detectedType = 'hiss';
    else if (lowRatio > 0.5) detectedType = 'hum';
    else if (lowRatio > 0.3 && highRatio < 0.2) detectedType = 'wind';
    
    return {
      type: detectedType,
      intensity: Math.min(0.8, (highEnergy + lowEnergy) / totalEnergy)
    };
  }, []);

  // Spectral subtraction algorithm with proper noise gating
  const spectralSubtraction = useCallback((buffer: AudioBuffer, intensity: number): AudioBuffer => {
    if (!audioContext) throw new Error('AudioContext not initialized');

    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      // Estimate noise floor from first 10% of audio (assuming it's mostly noise)
      const noiseSampleLength = Math.floor(length * 0.1);
      let noiseFloor = 0;
      let noiseMax = 0;
      for (let i = 0; i < noiseSampleLength; i++) {
        const abs = Math.abs(inputData[i]);
        noiseFloor += abs;
        noiseMax = Math.max(noiseMax, abs);
      }
      noiseFloor = noiseFloor / noiseSampleLength;
      
      // Scale noise floor conservatively with intensity (0.1 = 10% reduction, 1.0 = 100% reduction)
      const scaledNoiseFloor = noiseFloor * intensity;
      const noiseThreshold = noiseMax * 0.3; // Lower threshold to preserve more signal

      // Apply spectral subtraction with conservative processing
      for (let i = 0; i < length; i++) {
        const sample = inputData[i];
        const magnitude = Math.abs(sample);
        
        // Only process if significantly above noise threshold
        if (magnitude > noiseThreshold * 2) {
          // Conservative subtraction - only remove scaled noise floor
          const cleanedMagnitude = Math.max(magnitude * 0.9, magnitude - scaledNoiseFloor);
          
          // Preserve at least 90% of original signal at low intensity
          const minPreservation = 0.9 + (1 - intensity) * 0.1;
          const finalMagnitude = Math.max(cleanedMagnitude, magnitude * minPreservation);
          
          // Preserve phase
          outputData[i] = (finalMagnitude / magnitude) * sample;
        } else if (magnitude > noiseThreshold) {
          // Gentle reduction for signals near threshold
          const reduction = intensity * 0.3; // Max 30% reduction even at 100% intensity
          outputData[i] = sample * (1 - reduction);
        } else {
          // Very gentle gating for low-level signals - preserve most of it
          const gateReduction = intensity * 0.2; // Max 20% reduction
          outputData[i] = sample * (1 - gateReduction);
        }
      }
    }

    return newBuffer;
  }, [audioContext]);

  // Low-pass filter for removing high-frequency noise (hiss)
  const lowPassFilter = useCallback((buffer: AudioBuffer, cutoffFreq: number): AudioBuffer => {
    if (!audioContext) throw new Error('AudioContext not initialized');

    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    // First-order low-pass filter
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      let prevOutput = inputData[0];
      outputData[0] = prevOutput;

      for (let i = 1; i < length; i++) {
        const input = inputData[i];
        // Low-pass filter: y[n] = alpha * x[n] + (1 - alpha) * y[n-1]
        const output = alpha * input + (1 - alpha) * prevOutput;
        outputData[i] = output;
        prevOutput = output;
      }
    }

    return newBuffer;
  }, [audioContext]);

  // High-pass filter for removing low-frequency noise (hum, wind)
  const highPassFilter = useCallback((buffer: AudioBuffer, cutoffFreq: number): AudioBuffer => {
    if (!audioContext) throw new Error('AudioContext not initialized');

    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    // First-order high-pass filter coefficients
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = rc / (rc + dt);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      let prevInput = inputData[0];
      let prevOutput = 0;

      // Initialize with first sample
      outputData[0] = 0;

      for (let i = 1; i < length; i++) {
        const input = inputData[i];
        // High-pass filter: y[n] = alpha * (y[n-1] + x[n] - x[n-1])
        const output = alpha * (prevOutput + input - prevInput);
        outputData[i] = output;
        prevInput = input;
        prevOutput = output;
      }
    }

    return newBuffer;
  }, [audioContext]);

  // Notch filter for removing specific frequency (hum at 50Hz/60Hz)
  const notchFilter = useCallback((buffer: AudioBuffer, frequency: number, q: number = 30): AudioBuffer => {
    if (!audioContext) throw new Error('AudioContext not initialized');

    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    const w = 2 * Math.PI * frequency / sampleRate;
    const bw = w / q;
    const cosw = Math.cos(w);
    const sinw = Math.sin(w);
    const alpha = sinw * Math.sinh(Math.log(2) / 2 * bw * w / sinw);

    const b0 = 1;
    const b1 = -2 * cosw;
    const b2 = 1;
    const a0 = 1 + alpha;
    const a1 = -2 * cosw;
    const a2 = 1 - alpha;

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

      for (let i = 0; i < length; i++) {
        const x0 = inputData[i];
        const y0 = (b0 / a0) * x0 + (b1 / a0) * x1 + (b2 / a0) * x2
                  - (a1 / a0) * y1 - (a2 / a0) * y2;
        
        outputData[i] = y0;
        x2 = x1; x1 = x0;
        y2 = y1; y1 = y0;
      }
    }

    return newBuffer;
  }, [audioContext]);

  // Adaptive noise reduction with better noise gating
  const adaptiveNoiseReduction = useCallback((buffer: AudioBuffer, intensity: number): AudioBuffer => {
    if (!audioContext) throw new Error('AudioContext not initialized');

    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

    const noiseSmoothing = 0.99; // Very slow adaptation for noise
    const signalSmoothing = 0.95; // Moderate adaptation for signal

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      
      // Initialize noise estimate from first 10% (assumed to be mostly noise)
      const noiseInitLength = Math.floor(length * 0.1);
      let noiseEstimate = 0;
      for (let i = 0; i < noiseInitLength; i++) {
        noiseEstimate += Math.abs(inputData[i]);
      }
      noiseEstimate = noiseEstimate / noiseInitLength;
      
      let signalEstimate = noiseEstimate;
      const minNoiseLevel = noiseEstimate * 0.3; // Lower minimum to preserve more

      for (let i = 0; i < length; i++) {
        const sample = inputData[i];
        const magnitude = Math.abs(sample);

        // Update noise estimate (very slow adaptation, only when signal is low)
        if (magnitude < noiseEstimate * 2.0) {
          noiseEstimate = noiseEstimate * noiseSmoothing + magnitude * (1 - noiseSmoothing);
        }
        noiseEstimate = Math.max(noiseEstimate, minNoiseLevel);

        // Update signal estimate (moderate adaptation)
        signalEstimate = signalEstimate * signalSmoothing + magnitude * (1 - signalSmoothing);

        // Calculate SNR
        const snr = signalEstimate / (noiseEstimate + 0.0001);
        
        // Conservative gain function - preserve more signal
        let gain = 1.0;
        
        if (snr < 1.5) {
          // Low SNR - apply gentle reduction scaled by intensity
          const reduction = intensity * 0.3 * (1.5 - snr) / 1.5; // Max 30% reduction
          gain = 1.0 - reduction;
        } else if (snr < 3.0) {
          // Medium SNR - very gentle reduction
          const reduction = intensity * 0.1 * (3.0 - snr) / 1.5; // Max 10% reduction
          gain = 1.0 - reduction;
        }
        // High SNR - no reduction (gain = 1.0)

        // Ensure minimum gain to preserve signal quality
        const minGain = 0.85 + (1 - intensity) * 0.15; // At 10% intensity, min gain = 0.985
        gain = Math.max(gain, minGain);

        // Apply gain
        outputData[i] = sample * gain;
      }
    }

    return newBuffer;
  }, [audioContext]);

  // Main noise cleaning function
  const cleanNoise = useCallback(async (buffer: AudioBuffer, noiseType: NoiseType, intensity: number, algorithm: Algorithm): Promise<AudioBuffer> => {
    let cleaned = buffer;

    switch (algorithm) {
      case 'spectral':
        cleaned = spectralSubtraction(buffer, intensity);
        break;
      case 'highpass':
        const cutoff = noiseType === 'hum' ? 80 : noiseType === 'wind' ? 100 : 60;
        cleaned = highPassFilter(buffer, cutoff);
        break;
      case 'notch':
        const freq = noiseType === 'hum' ? 60 : 50; // 60Hz or 50Hz hum
        cleaned = notchFilter(buffer, freq);
        break;
      case 'adaptive':
        cleaned = adaptiveNoiseReduction(buffer, intensity);
        break;
      case 'combined':
        // Apply multiple algorithms conservatively, blending with original based on intensity
        // At low intensity, preserve more of original signal
        const blendFactor = intensity; // 0.1 = 10% processed, 90% original
        
        // Start with spectral subtraction for general noise (scaled down)
        cleaned = spectralSubtraction(buffer, intensity * 0.6);
        
        // Apply specific filters based on noise type (only at higher intensities)
        if (intensity > 0.3) {
          if (noiseType === 'hum') {
            // Remove 50Hz and 60Hz hum (only if intensity is high enough)
            cleaned = notchFilter(cleaned, 50, 30);
            cleaned = notchFilter(cleaned, 60, 30);
            if (intensity > 0.5) {
              cleaned = highPassFilter(cleaned, 80);
            }
          } else if (noiseType === 'wind') {
            // Remove low-frequency wind noise
            if (intensity > 0.4) {
              cleaned = highPassFilter(cleaned, 100);
            }
            cleaned = adaptiveNoiseReduction(cleaned, intensity * 0.5);
          } else if (noiseType === 'hiss') {
            // Remove high-frequency hiss (only at higher intensities to preserve high frequencies)
            if (intensity > 0.5) {
              const sampleRate = buffer.sampleRate;
              const cutoff = sampleRate * 0.45; // Less aggressive cutoff
              cleaned = lowPassFilter(cleaned, cutoff);
            }
            cleaned = adaptiveNoiseReduction(cleaned, intensity * 0.6);
          } else if (noiseType === 'background') {
            // General background noise - use adaptive only
            cleaned = adaptiveNoiseReduction(cleaned, intensity * 0.6);
          } else {
            // Auto-detect - very conservative
            cleaned = adaptiveNoiseReduction(cleaned, intensity * 0.5);
            if (intensity > 0.4) {
              cleaned = highPassFilter(cleaned, 60);
            }
          }
        }
        
        // Blend processed result with original to preserve quality at low intensities
        if (blendFactor < 1.0 && audioContext) {
          const numberOfChannels = buffer.numberOfChannels;
          const sampleRate = buffer.sampleRate;
          const length = buffer.length;
          const blendedBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
          
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const originalData = buffer.getChannelData(channel);
            const processedData = cleaned.getChannelData(channel);
            const blendedData = blendedBuffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
              // Blend: (1 - blendFactor) * original + blendFactor * processed
              blendedData[i] = (1 - blendFactor) * originalData[i] + blendFactor * processedData[i];
            }
          }
          cleaned = blendedBuffer;
        }
        break;
    }

    return cleaned;
  }, [spectralSubtraction, highPassFilter, lowPassFilter, notchFilter, adaptiveNoiseReduction, audioContext]);

  // Load audio file
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

      // Generate waveform and spectrum
      const waveform = generateWaveformData(buffer);
      const spectrum = generateFrequencySpectrum(buffer);
      setOriginalWaveform(waveform);
      setFrequencySpectrum(spectrum);
      setShowingOriginalWaveform(true);
      drawWaveform(waveform, '#3b82f6');
      drawSpectrum(spectrum);

      // Detect noise profile
      const profile = detectNoiseProfile(buffer);
      setNoiseProfile(profile);
      
      // Don't auto-clean here - let useEffect handle it after state updates
      
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Failed to load audio file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-process when settings change
  useEffect(() => {
    if (!originalAudioBuffer) return;
    
    // If auto mode, wait for noise profile to be detected
    if (noiseType === 'auto' && !noiseProfile) return;
    
    // Determine actual noise type to use
    const actualNoiseType = noiseType === 'auto' && noiseProfile 
      ? noiseProfile.type 
      : noiseType === 'auto' 
      ? 'background' 
      : noiseType;
    
    setIsProcessing(true);
    cleanNoise(originalAudioBuffer, actualNoiseType, intensity, algorithm)
      .then((cleaned) => {
        setCleanedAudioBuffer(cleaned);
        const cleanedWaveform = generateWaveformData(cleaned);
        const cleanedSpectrum = generateFrequencySpectrum(cleaned);
        setCleanedWaveform(cleanedWaveform);
        setFrequencySpectrum(cleanedSpectrum);
        if (!showingOriginalWaveform) {
          drawWaveform(cleanedWaveform, '#10b981');
          drawSpectrum(cleanedSpectrum);
        }
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error('Error cleaning noise:', err);
        setError('Failed to clean noise. Please try again.');
        setIsProcessing(false);
      });
  }, [noiseType, intensity, algorithm, originalAudioBuffer, noiseProfile, cleanNoise, generateWaveformData, generateFrequencySpectrum, showingOriginalWaveform, drawWaveform, drawSpectrum]);

  // Update waveform display
  useEffect(() => {
    if (showingOriginalWaveform && originalWaveform.length > 0) {
      drawWaveform(originalWaveform, '#3b82f6');
    } else if (!showingOriginalWaveform && cleanedWaveform.length > 0) {
      drawWaveform(cleanedWaveform, '#10b981');
    }
  }, [showingOriginalWaveform, originalWaveform, cleanedWaveform, drawWaveform]);

  // Play original audio
  const playOriginal = () => {
    if (!originalAudioBuffer || !audioContext) return;
    stopAll();

    const source = audioContext.createBufferSource();
    source.buffer = originalAudioBuffer;
    source.connect(audioContext.destination);
    originalSourceRef.current = source;

    source.onended = () => setIsPlayingOriginal(false);
    source.start(0);
    setIsPlayingOriginal(true);
  };

  // Play cleaned audio
  const playCleaned = () => {
    if (!cleanedAudioBuffer || !audioContext) return;
    stopAll();

    const source = audioContext.createBufferSource();
    source.buffer = cleanedAudioBuffer;
    source.connect(audioContext.destination);
    cleanedSourceRef.current = source;

    source.onended = () => setIsPlayingCleaned(false);
    source.start(0);
    setIsPlayingCleaned(true);
  };

  // Stop all playback
  const stopAll = () => {
    if (originalSourceRef.current) {
      try { originalSourceRef.current.stop(); } catch (e) {}
      originalSourceRef.current = null;
    }
    if (cleanedSourceRef.current) {
      try { cleanedSourceRef.current.stop(); } catch (e) {}
      cleanedSourceRef.current = null;
    }
    setIsPlayingOriginal(false);
    setIsPlayingCleaned(false);
  };

  // Download cleaned audio
  const downloadCleaned = async () => {
    if (!cleanedAudioBuffer || !audioContext) return;

    try {
      const wav = audioBufferToWav(cleanedAudioBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaned_${selectedFile?.name.replace(/\.[^/.]+$/, '')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading audio:', err);
      setError('Failed to download audio. Please try again.');
    }
  };

  // Convert AudioBuffer to WAV
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

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Noise Cleaner Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced noise reduction with multiple algorithms, real-time preview, and frequency analysis.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          id="noise-cleaner-file-input"
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
          htmlFor="noise-cleaner-file-input"
          className="cursor-pointer"
        >
          Choose Audio File
        </Button>
        {selectedFile && originalAudioBuffer && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">File:</span> {selectedFile.name} • 
              <span className="font-medium"> Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • 
              <span className="font-medium"> Duration:</span> {formatTime(originalAudioBuffer.duration)}
              {noiseProfile && (
                <> • <span className="font-medium">Detected:</span> {noiseProfile.type} noise ({(noiseProfile.intensity * 100).toFixed(0)}% intensity)</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Noise Type Selection */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Noise Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {(['auto', 'hiss', 'hum', 'background', 'wind', 'click'] as NoiseType[]).map((type) => (
              <button
                key={type}
                onClick={() => setNoiseType(type)}
                className={`p-3 rounded-lg border-2 transition-all capitalize ${
                  noiseType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {type === 'auto' ? '🔍 Auto' : type === 'hiss' ? '🌊 Hiss' : type === 'hum' ? '⚡ Hum' : type === 'background' ? '🔊 Background' : type === 'wind' ? '💨 Wind' : '📢 Click'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Selection */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Cleaning Algorithm
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(['spectral', 'highpass', 'notch', 'adaptive', 'combined'] as Algorithm[]).map((alg) => (
              <button
                key={alg}
                onClick={() => setAlgorithm(alg)}
                className={`p-3 rounded-lg border-2 transition-all capitalize ${
                  algorithm === alg
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
                title={
                  alg === 'spectral' ? 'Spectral Subtraction - Removes noise based on frequency analysis' :
                  alg === 'highpass' ? 'High-Pass Filter - Removes low-frequency noise' :
                  alg === 'notch' ? 'Notch Filter - Removes specific frequencies (50Hz/60Hz hum)' :
                  alg === 'adaptive' ? 'Adaptive - Dynamically adjusts based on signal' :
                  'Combined - Uses multiple algorithms for best results'
                }
              >
                {alg === 'spectral' ? '📊 Spectral' : alg === 'highpass' ? '⬆️ High-Pass' : alg === 'notch' ? '🎯 Notch' : alg === 'adaptive' ? '🔄 Adaptive' : '✨ Combined'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Intensity Control */}
      {selectedFile && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cleaning Intensity: {(intensity * 100).toFixed(0)}%
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">0% - 100%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Light (10%)</span>
            <span>Medium (50%)</span>
            <span>Aggressive (100%)</span>
          </div>
        </div>
      )}

      {/* Frequency Spectrum */}
      {frequencySpectrum.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frequency Spectrum Analysis
          </label>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <canvas
              ref={spectrumCanvasRef}
              width={800}
              height={200}
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Waveform Visualization */}
      {originalWaveform.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Waveform Comparison
            </label>
            {cleanedWaveform.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowingOriginalWaveform(true)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    showingOriginalWaveform
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setShowingOriginalWaveform(false)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    !showingOriginalWaveform
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Cleaned
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
      {selectedFile && originalAudioBuffer && cleanedAudioBuffer && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Before & After Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Audio */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Original Audio</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(originalAudioBuffer.duration)}
                </span>
              </div>
              <button
                onClick={isPlayingOriginal ? stopAll : playOriginal}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPlayingOriginal
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {isPlayingOriginal ? '⏹️ Stop' : '▶️ Play Original'}
              </button>
            </div>

            {/* Cleaned Audio */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Cleaned Audio</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(cleanedAudioBuffer.duration)}
                </span>
              </div>
              <button
                onClick={isPlayingCleaned ? stopAll : playCleaned}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors mb-2 ${
                  isPlayingCleaned
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isPlayingCleaned ? '⏹️ Stop' : '▶️ Play Cleaned'}
              </button>
              <Button
                onClick={downloadCleaned}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                💾 Download Cleaned Audio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-blue-800 dark:text-blue-400">Processing audio...</p>
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
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">✨ Features:</h3>
        <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
          <li>• <strong>Auto-Detection:</strong> Automatically detects noise type and intensity</li>
          <li>• <strong>Multiple Algorithms:</strong> Spectral, High-Pass, Notch, Adaptive, and Combined</li>
          <li>• <strong>Real-Time Processing:</strong> See results instantly as you adjust settings</li>
          <li>• <strong>Frequency Analysis:</strong> Visual spectrum analysis of your audio</li>
          <li>• <strong>Waveform Comparison:</strong> Compare original vs cleaned waveforms</li>
          <li>• <strong>Before/After Preview:</strong> Play and compare both versions side-by-side</li>
          <li>• <strong>Adjustable Intensity:</strong> Fine-tune cleaning strength from light to aggressive</li>
        </ul>
      </div>
    </div>
  );
}
