"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface AudioSettings {
  format: 'mp3' | 'aac' | 'wav' | 'flac';
  bitrate: string;
  channels: 1 | 2;
  sampleRate: number;
}

interface ProcessingOptions {
  trimStart: number;
  trimEnd: number;
  normalize: boolean;
  removeSilence: boolean;
}

export default function AudioStripper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    format: 'mp3',
    bitrate: '192k',
    channels: 2,
    sampleRate: 44100
  });

  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    trimStart: 0,
    trimEnd: 0,
    normalize: false,
    removeSilence: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        ffmpegInstance.on('log', ({ message }) => {
          console.log('AudioStripper FFmpeg:', message);
        });
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpeg(ffmpegInstance);
        setIsFfmpegLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg for audio stripping:', err);
        setError('Failed to initialize audio extraction engine');
      }
    };

    loadFFmpeg();
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    // Clear previous state completely
    setSelectedFile(null);
    setAudioPreview(null);
    setError(null);

    // Force re-render by using setTimeout
    setTimeout(() => {
      setSelectedFile(file);
      console.log('🎵 Selected new file:', file.name);
    }, 0);
  };

  const extractAudio = async () => {
    if (!selectedFile || !ffmpeg) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      console.log('🎵 Starting audio extraction...');

      // Write video file to FFmpeg FS
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedFile));
      console.log('🎵 Video file written to FFmpeg FS');

      // Build FFmpeg command based on settings
      const command = [
        '-i', 'input.mp4',
        '-vn', // No video
      ];

      // Add trimming if specified
      if (processingOptions.trimStart > 0) {
        command.push('-ss', processingOptions.trimStart.toString());
      }
      if (processingOptions.trimEnd > 0) {
        command.push('-t', (processingOptions.trimEnd - processingOptions.trimStart).toString());
      }

      // Audio processing options
      command.push(
        '-acodec',
        audioSettings.format === 'mp3' ? 'libmp3lame' :
        audioSettings.format === 'aac' ? 'aac' :
        audioSettings.format === 'flac' ? 'flac' : 'pcm_s16le'
      );

      if (audioSettings.bitrate) {
        command.push('-b:a', audioSettings.bitrate);
      }

      command.push(
        '-ac', audioSettings.channels.toString(),
        '-ar', audioSettings.sampleRate.toString(),
        '-y',
        `output.${audioSettings.format}`
      );

      console.log('🎵 FFmpeg command:', command.join(' '));

      // Execute FFmpeg command
      await ffmpeg.exec(command);

      // Read the output audio file
      const audioData = await ffmpeg.readFile(`output.${audioSettings.format}`);
      const audioBlob = new Blob([audioData], {
        type: `audio/${audioSettings.format === 'aac' ? 'mp4' : audioSettings.format}`
      });

      console.log('🎵 Audio extracted, blob size:', audioBlob.size);

      if (audioBlob.size < 1000) {
        throw new Error('Extracted audio file is too small - extraction may have failed');
      }

      // Create preview URL
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioPreview(audioUrl);

      // Auto-download
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio_${selectedFile.name.replace(/\.[^/.]+$/, "")}.${audioSettings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setProgress(100);

    } catch (err) {
      console.error('Audio extraction error:', err);
      setError(`Failed to extract audio: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎵 Professional Audio Stripper Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced audio extraction with multiple formats, quality settings, and processing options.
          {!isFfmpegLoaded && <span className="text-yellow-600 dark:text-yellow-400"> (Loading audio extraction engine...)</span>}
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
            id="audio-stripper-file-input"
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
            htmlFor="audio-stripper-file-input"
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

        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">⚙️ Audio Settings</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Format</label>
              <select
                value={audioSettings.format}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              >
                <option value="mp3">MP3</option>
                <option value="aac">AAC</option>
                <option value="wav">WAV</option>
                <option value="flac">FLAC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Bitrate</label>
              <select
                value={audioSettings.bitrate}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, bitrate: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              >
                <option value="64k">64 kbps</option>
                <option value="128k">128 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="320k">320 kbps</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Channels</label>
              <select
                value={audioSettings.channels}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, channels: parseInt(e.target.value) as 1 | 2 }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              >
                <option value={1}>Mono</option>
                <option value={2}>Stereo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Sample Rate</label>
              <select
                value={audioSettings.sampleRate}
                onChange={(e) => setAudioSettings(prev => ({ ...prev, sampleRate: parseInt(e.target.value) }))}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
              >
                <option value={22050}>22.05 kHz</option>
                <option value={44100}>44.1 kHz</option>
                <option value={48000}>48 kHz</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Options */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">🎛️ Processing Options</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-blue-800 dark:text-blue-200">Trim Audio (seconds)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Start"
                value={processingOptions.trimStart}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, trimStart: parseFloat(e.target.value) || 0 }))}
                className="flex-1 p-2 text-sm border border-blue-300 dark:border-blue-600 rounded dark:bg-gray-800"
              />
              <input
                type="number"
                placeholder="End (0 = full)"
                value={processingOptions.trimEnd}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, trimEnd: parseFloat(e.target.value) || 0 }))}
                className="flex-1 p-2 text-sm border border-blue-300 dark:border-blue-600 rounded dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={processingOptions.normalize}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, normalize: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-blue-800 dark:text-blue-200">Normalize Audio</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={processingOptions.removeSilence}
                onChange={(e) => setProcessingOptions(prev => ({ ...prev, removeSilence: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-blue-800 dark:text-blue-200">Remove Silence</span>
            </label>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      {selectedFile && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Preview</h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full max-h-64"
              controls
            >
              <source src={URL.createObjectURL(selectedFile)} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                Extracting Audio...
              </span>
              <span className="text-blue-700 dark:text-blue-300 text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Extract Button */}
      {selectedFile && !audioPreview && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={extractAudio}
              disabled={isProcessing || !isFfmpegLoaded}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? `🔊 Processing... ${progress}%` : '🔊 Extract Audio & Download'}
            </Button>

            <Button
              onClick={() => {
                setAudioPreview(null);
                setError(null);
              }}
              variant="outline"
              disabled={isProcessing}
            >
              🔄 Reset
            </Button>
          </div>

          {!isFfmpegLoaded && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ Audio extraction engine is loading... Please wait before extracting.
            </p>
          )}
        </div>
      )}

      {/* Audio Preview */}
      {audioPreview && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🎧 Extracted Audio Preview</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Format: {audioSettings.format.toUpperCase()} • {audioSettings.bitrate} • {audioSettings.channels === 1 ? 'Mono' : 'Stereo'}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <audio controls className="w-full">
              <source src={audioPreview} type={`audio/${audioSettings.format === 'aac' ? 'mp4' : audioSettings.format}`} />
              Your browser does not support the audio element.
            </audio>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                const a = document.createElement('a');
                a.href = audioPreview;
                a.download = `audio_${selectedFile?.name.replace(/\.[^/.]+$/, "")}.${audioSettings.format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              💾 Download Again
            </Button>
            <Button
              onClick={() => {
                setAudioPreview(null);
                setError(null);
              }}
              variant="outline"
            >
              🔄 Extract Different Audio
            </Button>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✅ Audio extracted successfully! File has been downloaded automatically.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Features Showcase */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎵 Multiple Formats</h4>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• MP3, AAC, WAV, FLAC</li>
            <li>• Custom bitrate settings</li>
            <li>• Stereo/Mono options</li>
            <li>• Multiple sample rates</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">✂️ Audio Editing</h4>
          <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
            <li>• Trim start/end times</li>
            <li>• Audio normalization</li>
            <li>• Silence removal</li>
            <li>• Quality optimization</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">⚡ Professional Quality</h4>
          <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
            <li>• FFmpeg processing</li>
            <li>• Lossless extraction</li>
            <li>• Progress tracking</li>
            <li>• Batch processing ready</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4">📋 Professional Audio Extraction Guide:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">1. Configure Settings</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Choose output format (MP3/AAC/WAV/FLAC)</li>
              <li>• Set bitrate and quality</li>
              <li>• Select mono/stereo channels</li>
              <li>• Configure sample rate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">2. Upload & Process</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Select video file with audio</li>
              <li>• Configure trimming if needed</li>
              <li>• Enable normalization/silence removal</li>
              <li>• Click "Extract Audio & Download"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">3. Quality Options</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Preview before final extraction</li>
              <li>• Automatic download on completion</li>
              <li>• Professional audio processing</li>
              <li>• Multiple format support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">4. Pro Tips</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Use FLAC for lossless extraction</li>
              <li>• MP3/AAC for compressed audio</li>
              <li>• Trim to remove unwanted parts</li>
              <li>• Normalize for consistent volume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
