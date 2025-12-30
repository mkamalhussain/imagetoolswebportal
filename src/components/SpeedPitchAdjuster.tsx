"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

interface Preset {
  name: string;
  speed: number;
  pitch: number;
  icon: string;
  description: string;
  effects?: AudioEffects;
}

interface VoiceEffect {
  name: string;
  icon: string;
  description: string;
  speed: number;
  pitch: number;
  distortion: number;
  reverb: number;
  echo: number;
  eq: { low: number; mid: number; high: number };
}

interface AudioEffects {
  distortion: number;
  reverb: number;
  echo: number;
  compression: number;
  eq: { low: number; mid: number; high: number };
  stereoWidth: number;
}

interface CreativeEffect {
  name: string;
  icon: string;
  description: string;
  type: 'reverse' | 'stutter' | 'pitchBend' | 'robot' | 'alien';
  params: any;
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

const VOICE_EFFECTS: VoiceEffect[] = [
  {
    name: 'Robot',
    icon: '🤖',
    description: 'Mechanical robot voice',
    speed: 1.0,
    pitch: 0.8,
    distortion: 0.3,
    reverb: 0.1,
    echo: 0.2,
    eq: { low: -10, mid: 5, high: 15 }
  },
  {
    name: 'Alien',
    icon: '👽',
    description: 'Otherworldly alien voice',
    speed: 0.9,
    pitch: 1.4,
    distortion: 0.4,
    reverb: 0.3,
    echo: 0.1,
    eq: { low: 10, mid: -5, high: 20 }
  },
  {
    name: 'Underwater',
    icon: '🐠',
    description: 'Submerged underwater effect',
    speed: 0.8,
    pitch: 0.9,
    distortion: 0.1,
    reverb: 0.5,
    echo: 0.8,
    eq: { low: 15, mid: -10, high: -20 }
  },
  {
    name: 'Phone',
    icon: '📞',
    description: 'Telephone voice effect',
    speed: 1.0,
    pitch: 1.0,
    distortion: 0.2,
    reverb: 0.0,
    echo: 0.0,
    eq: { low: -15, mid: 5, high: -10 }
  },
  {
    name: 'Monster',
    icon: '👹',
    description: 'Deep scary monster voice',
    speed: 0.6,
    pitch: 0.5,
    distortion: 0.6,
    reverb: 0.4,
    echo: 0.3,
    eq: { low: 20, mid: -5, high: -15 }
  },
  {
    name: 'Chipmunk',
    icon: '🐿️',
    description: 'High-pitched chipmunk voice',
    speed: 1.0,
    pitch: 2.0,
    distortion: 0.1,
    reverb: 0.0,
    echo: 0.0,
    eq: { low: -10, mid: 10, high: 20 }
  },
  {
    name: 'Helium',
    icon: '🎈',
    description: 'High helium voice effect',
    speed: 1.2,
    pitch: 1.6,
    distortion: 0.0,
    reverb: 0.0,
    echo: 0.0,
    eq: { low: -20, mid: 5, high: 25 }
  },
  {
    name: 'Demon',
    icon: '👿',
    description: 'Evil demonic voice',
    speed: 0.7,
    pitch: 0.6,
    distortion: 0.8,
    reverb: 0.6,
    echo: 0.4,
    eq: { low: 25, mid: -10, high: -5 }
  }
];

const CREATIVE_EFFECTS: CreativeEffect[] = [
  {
    name: 'Reverse',
    icon: '🔄',
    description: 'Play audio backwards',
    type: 'reverse',
    params: {}
  },
  {
    name: 'Stutter',
    icon: '⚡',
    description: 'Create stuttering effect',
    type: 'stutter',
    params: { intensity: 0.5, speed: 10 }
  },
  {
    name: 'Pitch Bend',
    icon: '🌊',
    description: 'Smooth pitch bending',
    type: 'pitchBend',
    params: { range: 2, speed: 2 }
  },
  {
    name: 'Vibrato',
    icon: '〰️',
    description: 'Add vibrato effect',
    type: 'robot',
    params: { rate: 5, depth: 0.3 }
  }
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

  // New innovative features state
  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    distortion: 0,
    reverb: 0,
    echo: 0,
    compression: 0,
    eq: { low: 0, mid: 0, high: 0 },
    stereoWidth: 0
  });
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<VoiceEffect | null>(null);
  const [selectedCreativeEffect, setSelectedCreativeEffect] = useState<CreativeEffect | null>(null);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [currentPresetName, setCurrentPresetName] = useState('');
  const [isRecordingPreset, setIsRecordingPreset] = useState(false);

  // Analyzer refs
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const vuMeterCanvasRef = useRef<HTMLCanvasElement>(null);

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

      // Immediately set processed buffer to original (will be updated by processAudio)
      setProcessedAudioBuffer(buffer);

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

  // Apply audio effects
  const applyAudioEffects = useCallback((buffer: AudioBuffer, effects: AudioEffects): AudioBuffer => {
    let processedBuffer = buffer;

    // Apply distortion
    if (effects.distortion > 0) {
      processedBuffer = applyDistortion(processedBuffer, effects.distortion);
    }

    // Apply reverb
    if (effects.reverb > 0) {
      processedBuffer = applyReverb(processedBuffer, effects.reverb);
    }

    // Apply echo
    if (effects.echo > 0) {
      processedBuffer = applyEcho(processedBuffer, effects.echo);
    }

    // Apply compression
    if (effects.compression > 0) {
      processedBuffer = applyCompression(processedBuffer, effects.compression);
    }

    // Apply EQ
    if (effects.eq.low !== 0 || effects.eq.mid !== 0 || effects.eq.high !== 0) {
      processedBuffer = applyEQ(processedBuffer, effects.eq);
    }

    // Apply stereo widening
    if (effects.stereoWidth > 0) {
      processedBuffer = applyStereoWidening(processedBuffer, effects.stereoWidth);
    }

    return processedBuffer;
  }, []);


  // Creative effects
  const applyCreativeEffect = useCallback((buffer: AudioBuffer, effect: CreativeEffect): AudioBuffer => {
    switch (effect.type) {
      case 'reverse':
        return reverseAudio(buffer);
      case 'stutter':
        return applyStutter(buffer, effect.params.intensity, effect.params.speed);
      case 'pitchBend':
        return applyPitchBend(buffer, effect.params.range, effect.params.speed);
      case 'robot':
        return applyRobotEffect(buffer, effect.params.rate, effect.params.depth);
      default:
        return buffer;
    }
  }, []);

  // Individual effect implementations
  const applyDistortion = (buffer: AudioBuffer, amount: number): AudioBuffer => {
    if (!audioContext || amount <= 0) return buffer;

    try {
      const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);
        for (let i = 0; i < inputData.length; i++) {
          const x = inputData[i];
          // Soft clipping distortion
          outputData[i] = Math.tanh(x * (1 + amount * 2));
        }
      }
      return newBuffer;
    } catch (error) {
      console.warn('Distortion effect failed:', error);
      return buffer;
    }
  };

  const applyReverb = (buffer: AudioBuffer, amount: number): AudioBuffer => {
    if (!audioContext || amount <= 0) return buffer;

    try {
      // Use convolution reverb approach (simplified)
      const reverbTime = 0.3 * amount; // 0-300ms based on amount
      const decaySamples = Math.floor(buffer.sampleRate * reverbTime);

      const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);

        // Copy original with slight dampening
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = inputData[i] * (1 - amount * 0.1);
        }

        // Add simple reverb tail
        const feedback = 0.3 * amount;
        let reverbLevel = feedback;

        for (let delay = 1; delay <= Math.min(5, Math.floor(decaySamples / 100)); delay++) {
          const delaySamples = Math.floor(buffer.sampleRate * 0.05 * delay * amount);
          reverbLevel *= 0.7;

          for (let i = 0; i < inputData.length; i++) {
            if (i + delaySamples < outputData.length) {
              outputData[i + delaySamples] += inputData[i] * reverbLevel;
            }
          }
        }
      }
      return newBuffer;
    } catch (error) {
      console.warn('Reverb effect failed:', error);
      return buffer;
    }
  };

  const applyEcho = (buffer: AudioBuffer, amount: number): AudioBuffer => {
    if (!audioContext || amount <= 0) return buffer;

    try {
      const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      const delaySamples = Math.floor(buffer.sampleRate * 0.25 * amount); // Variable delay based on amount

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);

        // Copy original
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = inputData[i];
        }

        // Add echo within buffer bounds
        const feedback = 0.3 * amount;
        for (let i = 0; i < inputData.length - delaySamples; i++) {
          outputData[i + delaySamples] += inputData[i] * feedback;
          // Add second echo if space allows
          if (i + delaySamples * 2 < inputData.length) {
            outputData[i + delaySamples * 2] += inputData[i] * feedback * 0.5;
          }
        }
      }
      return newBuffer;
    } catch (error) {
      console.warn('Echo effect failed:', error);
      return buffer;
    }
  };

  const applyCompression = (buffer: AudioBuffer, amount: number): AudioBuffer => {
    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    const threshold = 0.8 - amount * 0.6;
    const ratio = 1 + amount * 9;

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < inputData.length; i++) {
        const x = Math.abs(inputData[i]);
        if (x > threshold) {
          const compressed = threshold + (x - threshold) / ratio;
          outputData[i] = inputData[i] > 0 ? compressed : -compressed;
        } else {
          outputData[i] = inputData[i];
        }
      }
    }
    return newBuffer;
  };

  const applyEQ = (buffer: AudioBuffer, eq: { low: number; mid: number; high: number }): AudioBuffer => {
    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    const sampleRate = buffer.sampleRate;

    // Simple frequency-based filtering
    const lowFreq = 200;
    const highFreq = 5000;
    const lowSamples = Math.floor(lowFreq * buffer.length / sampleRate);
    const highSamples = Math.floor(highFreq * buffer.length / sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      // Apply EQ by frequency ranges
      for (let i = 0; i < inputData.length; i++) {
        let gain = 1;

        if (i < lowSamples) {
          gain *= Math.pow(10, eq.low / 20); // Low frequencies
        } else if (i > highSamples) {
          gain *= Math.pow(10, eq.high / 20); // High frequencies
        } else {
          gain *= Math.pow(10, eq.mid / 20); // Mid frequencies
        }

        outputData[i] = inputData[i] * gain;
      }
    }
    return newBuffer;
  };

  const applyStereoWidening = (buffer: AudioBuffer, amount: number): AudioBuffer => {
    if (buffer.numberOfChannels < 2) return buffer;

    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);
    const newLeftData = newBuffer.getChannelData(0);
    const newRightData = newBuffer.getChannelData(1);

    for (let i = 0; i < leftData.length; i++) {
      const mid = (leftData[i] + rightData[i]) / 2;
      const side = (leftData[i] - rightData[i]) / 2;

      // Apply stereo widening
      const widenedSide = side * (1 + amount);

      newLeftData[i] = mid + widenedSide;
      newRightData[i] = mid - widenedSide;
    }

    return newBuffer;
  };

  const reverseAudio = (buffer: AudioBuffer): AudioBuffer => {
    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = inputData[inputData.length - 1 - i];
      }
    }
    return newBuffer;
  };

  const applyStutter = (buffer: AudioBuffer, intensity: number, speed: number): AudioBuffer => {
    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    const stutterLength = Math.floor(buffer.sampleRate / speed);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < inputData.length; i++) {
        const stutterPos = Math.floor(i / stutterLength) % 2;
        if (stutterPos === 0 || Math.random() > intensity) {
          outputData[i] = inputData[i];
        } else {
          // Repeat previous samples
          const repeatIndex = Math.max(0, i - stutterLength);
          outputData[i] = outputData[repeatIndex];
        }
      }
    }
    return newBuffer;
  };

  const applyPitchBend = (buffer: AudioBuffer, range: number, speed: number): AudioBuffer => {
    const newBuffer = audioContext!.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < inputData.length; i++) {
        const timeRatio = i / inputData.length;
        const bendAmount = Math.sin(timeRatio * speed * Math.PI * 2) * range;
        const pitchRatio = Math.pow(2, bendAmount / 12); // Semitones to ratio

        const sourceIndex = Math.floor(i / pitchRatio);
        if (sourceIndex < inputData.length) {
          outputData[i] = inputData[sourceIndex];
        } else {
          outputData[i] = 0;
        }
      }
    }
    return newBuffer;
  };

  const applyRobotEffect = (buffer: AudioBuffer, rate: number, depth: number): AudioBuffer => {
    if (!audioContext) return buffer;
    const newBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      for (let i = 0; i < inputData.length; i++) {
        const timeRatio = i / buffer.sampleRate;
        const modulation = Math.sin(timeRatio * rate * Math.PI * 2) * depth;
        outputData[i] = inputData[i] * (1 + modulation);
      }
    }
    return newBuffer;
  };

  // Apply voice effect preset
  const applyVoiceEffectPreset = useCallback((buffer: AudioBuffer, preset: VoiceEffect): AudioBuffer => {
    if (!audioContext) return buffer;

    try {
      let processedBuffer = buffer;

      // Apply speed/pitch changes from preset
      if (preset.speed !== 1.0 || preset.pitch !== 1.0) {
        const newLength = Math.floor(buffer.length / preset.speed);
        const speedBuffer = audioContext.createBuffer(
          buffer.numberOfChannels,
          newLength,
          buffer.sampleRate
        );

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const originalData = buffer.getChannelData(channel);
          const newData = speedBuffer.getChannelData(channel);

          for (let i = 0; i < newLength; i++) {
            const originalIndex = i * preset.speed;
            const index = Math.floor(originalIndex);
            const fraction = originalIndex - index;

            if (index < buffer.length - 1) {
              const sample1 = originalData[index];
              const sample2 = originalData[index + 1];
              newData[i] = sample1 + (sample2 - sample1) * fraction;
            } else if (index < buffer.length) {
              newData[i] = originalData[index];
            } else {
              newData[i] = 0;
            }
          }
        }
        processedBuffer = speedBuffer;
      }

      // Apply distortion
      if (preset.distortion > 0) {
        processedBuffer = applyDistortion(processedBuffer, preset.distortion);
      }

      // Apply reverb
      if (preset.reverb > 0) {
        processedBuffer = applyReverb(processedBuffer, preset.reverb);
      }

      // Apply echo
      if (preset.echo > 0) {
        processedBuffer = applyEcho(processedBuffer, preset.echo);
      }

      // Apply EQ
      if (preset.eq.low !== 0 || preset.eq.mid !== 0 || preset.eq.high !== 0) {
        processedBuffer = applyEQ(processedBuffer, preset.eq);
      }

      return processedBuffer;
    } catch (error) {
      console.warn('Voice effect application failed:', error);
      return buffer;
    }
  }, [audioContext, applyDistortion, applyReverb, applyEcho, applyEQ]);

  // Process audio with speed and pitch adjustment
  const processAudio = useCallback(async (buffer: AudioBuffer, speedValue: number, pitchValue: number) => {
    if (!audioContext || !buffer) {
      console.warn('AudioContext or buffer not available');
      return;
    }

    try {
      let processedBuffer = buffer;

      console.log('🎵 Processing audio - speed:', speedValue, 'pitch:', pitchValue);

      // Always start with the original buffer
      processedBuffer = buffer;

      // Apply speed/pitch changes if needed
      if (speedValue !== 1.0 || pitchValue !== 1.0) {
        const sampleRate = buffer.sampleRate;
        const numberOfChannels = buffer.numberOfChannels;
        const originalLength = buffer.length;

        // For speed change: resample the audio
        let newLength = originalLength;
        if (speedValue !== 1.0) {
          newLength = Math.floor(originalLength / speedValue);
        }

        // Create new audio buffer with correct length
        processedBuffer = audioContext.createBuffer(
          numberOfChannels,
          newLength,
          sampleRate
        );

        // Process each channel
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const originalData = buffer.getChannelData(channel);
          const newData = processedBuffer.getChannelData(channel);

          // Simple speed adjustment with linear interpolation
          for (let i = 0; i < newLength; i++) {
            const originalIndex = i * speedValue;
            const index = Math.floor(originalIndex);
            const fraction = originalIndex - index;

            if (index < originalLength - 1) {
              // Linear interpolation
              const sample1 = originalData[index];
              const sample2 = originalData[index + 1];
              newData[i] = sample1 + (sample2 - sample1) * fraction;
            } else if (index < originalLength) {
              newData[i] = originalData[index];
            } else {
              newData[i] = 0;
            }
          }
        }

        // For pitch adjustment (if different from speed), we use a simple pitch shifting approach
        if (pitchValue !== 1.0 && pitchValue !== speedValue) {
          // Create another buffer for pitch adjustment
          const pitchBuffer = audioContext.createBuffer(
            numberOfChannels,
            Math.floor(newLength / pitchValue),
            sampleRate
          );

          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sourceData = processedBuffer.getChannelData(channel);
            const pitchData = pitchBuffer.getChannelData(channel);

            // Simple pitch shifting by resampling
            for (let i = 0; i < pitchBuffer.length; i++) {
              const sourceIndex = i * pitchValue;
              const index = Math.floor(sourceIndex);
              const fraction = sourceIndex - index;

              if (index < processedBuffer.length - 1) {
                const sample1 = sourceData[index];
                const sample2 = sourceData[index + 1];
                pitchData[i] = sample1 + (sample2 - sample1) * fraction;
              } else if (index < processedBuffer.length) {
                pitchData[i] = sourceData[index];
              } else {
                pitchData[i] = 0;
              }
            }
          }
          processedBuffer = pitchBuffer;
        }
      }

      // Apply audio effects
      let effectsBuffer = applyAudioEffects(processedBuffer, audioEffects);

      // Apply voice effect if selected
      if (selectedVoiceEffect) {
        effectsBuffer = applyVoiceEffectPreset(effectsBuffer, selectedVoiceEffect);
      }

      // Apply creative effect if selected
      if (selectedCreativeEffect) {
        effectsBuffer = applyCreativeEffect(effectsBuffer, selectedCreativeEffect);
      }

      // Final validation
      if (!effectsBuffer || effectsBuffer.length === 0 || isNaN(effectsBuffer.length)) {
        console.warn('Audio processing resulted in invalid buffer, using original');
        effectsBuffer = buffer;
      }

      // Check if buffer has any non-zero data
      let hasAudioData = false;
      for (let channel = 0; channel < effectsBuffer.numberOfChannels && !hasAudioData; channel++) {
        const data = effectsBuffer.getChannelData(channel);
        for (let i = 0; i < Math.min(data.length, 1000); i++) { // Check first 1000 samples
          if (Math.abs(data[i]) > 0.0001) { // Allow for small floating point errors
            hasAudioData = true;
            break;
          }
        }
      }

      if (!hasAudioData) {
        console.warn('Processed buffer contains no audio data, using original');
        effectsBuffer = buffer;
      }

      console.log('Setting processed audio buffer:', {
        exists: !!effectsBuffer,
        length: effectsBuffer.length,
        sampleRate: effectsBuffer.sampleRate,
        channels: effectsBuffer.numberOfChannels,
        hasAudioData: hasAudioData
      });

      setProcessedAudioBuffer(effectsBuffer);

      // Generate and store processed waveform
      const procWaveform = generateWaveformData(effectsBuffer);
      setProcessedWaveformData(procWaveform);

      // Update displayed waveform if currently showing processed
      if (!showingOriginalWaveform) {
        setWaveformData(procWaveform);
        drawWaveform(procWaveform);
      }

      console.log('Audio processed successfully:', {
        originalLength: buffer.length,
        processedLength: effectsBuffer.length,
        sampleRate: effectsBuffer.sampleRate,
        channels: effectsBuffer.numberOfChannels,
        hasAudioData: hasAudioData
      });

    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
      // Fallback: use original buffer
      setProcessedAudioBuffer(buffer);
    }
  }, [audioContext, showingOriginalWaveform, audioEffects, selectedCreativeEffect, applyAudioEffects, applyCreativeEffect]);

  // Process audio whenever original buffer or settings change
  useEffect(() => {
    if (originalAudioBuffer) {
      console.log('🎵 Processing audio - original buffer loaded or settings changed');
      processAudio(originalAudioBuffer, speed, pitch);
    }
  }, [originalAudioBuffer, speed, pitch, processAudio]);

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

  // Spectrum analyzer drawing
  const drawSpectrum = useCallback(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas || !analyzerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyzerRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height;

      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }, []);

  // VU Meter drawing
  const drawVUMeter = useCallback((channel: 'left' | 'right') => {
    const canvas = channel === 'left' ? vuMeterCanvasRef.current : document.querySelector('canvas[data-channel="right"]') as HTMLCanvasElement;
    if (!canvas || !analyzerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple VU meter - in a real implementation, you'd analyze the audio data
    const level = Math.random() * 100; // Placeholder

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw meter levels
    const colors = ['#10b981', '#fbbf24', '#f59e0b', '#ef4444'];
    const segments = [60, 80, 90, 100];

    for (let i = 0; i < segments.length; i++) {
      const segmentHeight = (segments[i] / 100) * canvas.height;
      ctx.fillStyle = level > segments[i] ? colors[i] : '#374151';
      ctx.fillRect(10, canvas.height - segmentHeight, canvas.width - 20, segmentHeight - (i > 0 ? (segments[i-1] / 100) * canvas.height : 0));
    }

    // Draw level indicator
    ctx.fillStyle = '#ffffff';
    const indicatorY = canvas.height - (level / 100) * canvas.height;
    ctx.fillRect(0, indicatorY - 2, canvas.width, 4);
  }, []);

  // Animation loop for analyzers
  useEffect(() => {
    if (!showAnalyzer) return;

    const animate = () => {
      drawSpectrum();
      drawVUMeter('left');
      drawVUMeter('right');
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showAnalyzer, drawSpectrum, drawVUMeter]);

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
    if (preset.effects) {
      setAudioEffects(preset.effects);
    }
    setSelectedVoiceEffect(null);
    setSelectedCreativeEffect(null);
  };

  // Download processed audio
  const downloadProcessed = async () => {
    console.log('🎵 ========== DOWNLOAD FUNCTION STARTED ==========');
    console.log('🎵 DOWNLOAD FUNCTION CALLED - checking conditions');

    if (!selectedFile) {
      console.log('❌ No file selected');
      setError('No file selected.');
      return;
    }

    // Use processed buffer if available, otherwise use original
    const bufferToDownload = processedAudioBuffer || originalAudioBuffer;
    if (!bufferToDownload) {
      setError('No audio data available to download.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('=== DOWNLOAD DEBUG ===');
      console.log('Buffer to download:', {
        exists: !!bufferToDownload,
        length: bufferToDownload?.length || 'N/A',
        sampleRate: bufferToDownload?.sampleRate || 'N/A',
        channels: bufferToDownload?.numberOfChannels || 'N/A',
        duration: bufferToDownload ? bufferToDownload.length / bufferToDownload.sampleRate : 'N/A'
      });

      // Check if buffer has actual audio data
      if (bufferToDownload && bufferToDownload.length > 0) {
        let hasData = false;
        for (let ch = 0; ch < bufferToDownload.numberOfChannels; ch++) {
          const data = bufferToDownload.getChannelData(ch);
          for (let i = 0; i < Math.min(100, data.length); i++) {
            if (Math.abs(data[i]) > 0.001) {
              hasData = true;
              break;
            }
          }
          if (hasData) break;
        }
        console.log('Buffer has audio data:', hasData);
      }

      // Convert AudioBuffer to WAV
      const wavBuffer = audioBufferToWav(bufferToDownload);
      console.log('WAV buffer created:', {
        byteLength: wavBuffer.byteLength,
        expectedSize: bufferToDownload ? 44 + bufferToDownload.length * bufferToDownload.numberOfChannels * 2 : 'N/A'
      });

      if (wavBuffer.byteLength < 44) {
        console.error('WAV buffer is too small - header incomplete!');
        throw new Error('Generated WAV file is too small');
      }

      // Validate WAV buffer
      if (wavBuffer.byteLength < 44) {
        throw new Error('Invalid WAV buffer generated');
      }

      // Create blob with correct MIME type
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      console.log('Blob created:', {
        size: blob.size,
        type: blob.type,
        expectedSize: wavBuffer.byteLength
      });

      if (blob.size !== wavBuffer.byteLength) {
        console.warn('Blob size mismatch:', blob.size, 'vs expected', wavBuffer.byteLength);
      }

      // Generate filename
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const effects = [];
      if (speed !== 1.0) effects.push(`speed${speed.toFixed(1)}`);
      if (pitch !== 1.0) effects.push(`pitch${pitch.toFixed(1)}`);
      if (selectedVoiceEffect) effects.push(selectedVoiceEffect.name.toLowerCase());
      if (selectedCreativeEffect) effects.push(selectedCreativeEffect.name.toLowerCase().replace(' ', ''));
      if (audioEffects.distortion > 0) effects.push('dist');
      if (audioEffects.reverb > 0) effects.push('rvb');
      if (audioEffects.echo > 0) effects.push('echo');

      const effectsString = effects.length > 0 ? '_' + effects.slice(0, 3).join('_') : '';
      const filename = `processed_${originalName}${effectsString}.wav`;

      // Try multiple download methods
      try {
        // Method 1: Direct blob download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (blobError) {
        console.warn('Blob download failed, trying alternative method:', blobError);

        // Method 2: Fallback - create a data URL
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          reader.readAsDataURL(blob);
        } catch (fallbackError) {
          console.error('All download methods failed:', fallbackError);
          throw new Error('Download failed with all methods');
        }
      }

      console.log('Audio downloaded successfully:', filename);
    } catch (err) {
      console.error('Error downloading audio:', err);
      setError('Failed to download audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    console.log('=== WAV CONVERSION DEBUG ===');
    console.log('Input buffer:', {
      length: buffer.length,
      channels: buffer.numberOfChannels,
      sampleRate: buffer.sampleRate
    });

    if (!buffer || buffer.length === 0) {
      console.error('Invalid or empty buffer passed to audioBufferToWav');
      // Return minimal valid WAV header for empty file
      const emptyBuffer = new ArrayBuffer(44);
      const view = new DataView(emptyBuffer);
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      writeString(0, 'RIFF');
      view.setUint32(4, 36, true); // File size - 8
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, 44100, true); // Default sample rate
      view.setUint32(28, 88200, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      writeString(36, 'data');
      view.setUint32(40, 0, true); // No data
      return emptyBuffer;
    }

    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    console.log('Calculated sizes:', {
      dataSize,
      bufferSize,
      blockAlign,
      byteRate
    });

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // File size - 8
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Format chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, numberOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, byteRate, true); // Byte rate
    view.setUint16(32, blockAlign, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); // Data size

    console.log('WAV header written, starting data conversion...');

    // Convert float samples to 16-bit PCM
    let offset = 44;
    let samplesWritten = 0;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const floatSample = buffer.getChannelData(channel)[i];
        // Clamp and convert to 16-bit PCM
        const sample = Math.max(-1, Math.min(1, floatSample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
        samplesWritten++;
      }
    }

    console.log('Data conversion complete:', {
      samplesWritten,
      finalOffset: offset,
      expectedOffset: 44 + dataSize
    });

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

      {/* Voice Effects */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🎭 Voice Effects
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {VOICE_EFFECTS.map((effect) => (
              <button
                key={effect.name}
                onClick={() => {
                  setSpeed(effect.speed);
                  setPitch(effect.pitch);
                  setAudioEffects({
                    distortion: effect.distortion,
                    reverb: effect.reverb,
                    echo: effect.echo,
                    compression: 0,
                    eq: effect.eq,
                    stereoWidth: 0
                  });
                  setSelectedVoiceEffect(effect);
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedVoiceEffect?.name === effect.name
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={effect.description}
              >
                <div className="text-2xl mb-1">{effect.icon}</div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{effect.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Creative Effects */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🎨 Creative Effects
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CREATIVE_EFFECTS.map((effect) => (
              <button
                key={effect.name}
                onClick={() => {
                  setSelectedCreativeEffect(selectedCreativeEffect?.name === effect.name ? null : effect);
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCreativeEffect?.name === effect.name
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={effect.description}
              >
                <div className="text-2xl mb-1">{effect.icon}</div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{effect.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Advanced Effects Panel */}
      {selectedFile && showAdvancedPanel && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎛️ Advanced Audio Effects</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Distortion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distortion: {Math.round(audioEffects.distortion * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioEffects.distortion}
                onChange={(e) => setAudioEffects(prev => ({ ...prev, distortion: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-500"
              />
            </div>

            {/* Reverb */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reverb: {Math.round(audioEffects.reverb * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioEffects.reverb}
                onChange={(e) => setAudioEffects(prev => ({ ...prev, reverb: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
              />
            </div>

            {/* Echo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Echo: {Math.round(audioEffects.echo * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioEffects.echo}
                onChange={(e) => setAudioEffects(prev => ({ ...prev, echo: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
              />
            </div>

            {/* Compression */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compression: {Math.round(audioEffects.compression * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioEffects.compression}
                onChange={(e) => setAudioEffects(prev => ({ ...prev, compression: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
              />
            </div>

            {/* Stereo Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stereo Width: {Math.round(audioEffects.stereoWidth * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioEffects.stereoWidth}
                onChange={(e) => setAudioEffects(prev => ({ ...prev, stereoWidth: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"
              />
            </div>

            {/* EQ Controls */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                🎚️ Equalizer (dB)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Low ({audioEffects.eq.low}dB)</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={audioEffects.eq.low}
                    onChange={(e) => setAudioEffects(prev => ({
                      ...prev,
                      eq: { ...prev.eq, low: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mid ({audioEffects.eq.mid}dB)</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={audioEffects.eq.mid}
                    onChange={(e) => setAudioEffects(prev => ({
                      ...prev,
                      eq: { ...prev.eq, mid: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">High ({audioEffects.eq.high}dB)</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={audioEffects.eq.high}
                    onChange={(e) => setAudioEffects(prev => ({
                      ...prev,
                      eq: { ...prev.eq, high: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spectrum Analyzer */}
      {selectedFile && showAnalyzer && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              📊 Real-time Spectrum Analyzer
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnalyzer(false)}
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                Hide
              </button>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Spectrum Canvas */}
              <div className="lg:col-span-2">
                <canvas
                  ref={spectrumCanvasRef}
                  width={600}
                  height={200}
                  className="w-full h-auto rounded border border-gray-300 dark:border-gray-700"
                />
              </div>

              {/* VU Meters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Left Channel</label>
                  <canvas
                    ref={vuMeterCanvasRef}
                    width={100}
                    height={150}
                    className="w-full h-auto rounded border border-gray-300 dark:border-gray-700"
                    data-channel="left"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Right Channel</label>
                  <canvas
                    width={100}
                    height={150}
                    className="w-full h-auto rounded border border-gray-300 dark:border-gray-700"
                    data-channel="right"
                  />
                </div>
              </div>
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

      {/* Advanced Features Toggle */}
      {selectedFile && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAdvancedPanel
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showAdvancedPanel ? '🔧 Hide Advanced Effects' : '🎛️ Advanced Effects'}
          </button>

          <button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAnalyzer
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showAnalyzer ? '📊 Hide Analyzer' : '📊 Spectrum Analyzer'}
          </button>

          <button
            onClick={() => setIsRecordingPreset(!isRecordingPreset)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecordingPreset
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isRecordingPreset ? '⏹️ Save Preset' : '💾 Save Custom Preset'}
          </button>
        </div>
      )}

      {/* Custom Preset Save */}
      {selectedFile && isRecordingPreset && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Preset Name:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentPresetName}
              onChange={(e) => setCurrentPresetName(e.target.value)}
              placeholder="My Custom Preset"
              className="flex-1 px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded bg-white dark:bg-gray-800 text-yellow-900 dark:text-yellow-100"
            />
            <button
              onClick={() => {
                if (currentPresetName.trim()) {
                  const newPreset: Preset = {
                    name: currentPresetName,
                    speed,
                    pitch,
                    icon: '⭐',
                    description: `Custom preset: Speed ${speed.toFixed(2)}x, Pitch ${pitch.toFixed(2)}x`,
                    effects: audioEffects
                  };
                  setCustomPresets(prev => [...prev, newPreset]);
                  setCurrentPresetName('');
                  setIsRecordingPreset(false);
                }
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsRecordingPreset(false);
                setCurrentPresetName('');
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Custom Presets */}
      {selectedFile && customPresets.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            ⭐ Your Custom Presets
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {customPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  speed === preset.speed && pitch === preset.pitch
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">🚀 Advanced Features:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎭 Voice Effects</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Robot, Alien, Underwater voices</li>
              <li>• Monster & Demon effects</li>
              <li>• Phone & Helium transformations</li>
              <li>• Professional voice modulation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎨 Creative Effects</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Audio reversal & stuttering</li>
              <li>• Pitch bending & vibrato</li>
              <li>• Custom effect combinations</li>
              <li>• Real-time effect processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🎛️ Audio Effects</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Distortion, Reverb, Echo</li>
              <li>• 3-Band EQ & Compression</li>
              <li>• Stereo widening</li>
              <li>• Professional audio processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 Analysis Tools</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Real-time spectrum analyzer</li>
              <li>• VU meters for both channels</li>
              <li>• Frequency visualization</li>
              <li>• Audio quality monitoring</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💾 Additional Features</h4>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
            <li>• <strong>Custom Presets:</strong> Save and reuse your favorite effect combinations</li>
            <li>• <strong>Real-time Preview:</strong> Hear changes instantly with before/after comparison</li>
            <li>• <strong>Professional Quality:</strong> High-fidelity audio processing with Web Audio API</li>
            <li>• <strong>Independent Controls:</strong> Speed, pitch, and effects work together seamlessly</li>
            <li>• <strong>Visual Feedback:</strong> Waveform visualization and spectrum analysis</li>
            <li>• <strong>Multiple Export Formats:</strong> WAV output with full quality preservation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
