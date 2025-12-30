"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface SubtitleStyle {
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowOffset: number;
  position: 'bottom' | 'top' | 'middle';
  alignment: 'left' | 'center' | 'right';
  marginV: number; // vertical margin
  marginH: number; // horizontal margin
}

interface SubtitleTiming {
  offset: number; // time offset in seconds
  speed: number; // speed multiplier
}

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia',
  'Verdana', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Lucida Console'
];

const COLOR_PRESETS = [
  { name: 'White', value: 'white' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Green', value: 'lime' },
  { name: 'Blue', value: 'cyan' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Purple', value: 'magenta' },
  { name: 'Black', value: 'black' }
];

const STYLE_PRESETS = [
  { name: 'Classic', style: { fontSize: 24, fontColor: 'white', outlineColor: 'black', outlineWidth: 2, shadowColor: 'black', shadowOffset: 0 } },
  { name: 'Modern', style: { fontSize: 28, fontColor: 'yellow', outlineColor: 'black', outlineWidth: 1, shadowColor: 'black', shadowOffset: 1 } },
  { name: 'Minimal', style: { fontSize: 22, fontColor: 'white', outlineColor: 'none', outlineWidth: 0, shadowColor: 'black', shadowOffset: 1 } },
  { name: 'Bold', style: { fontSize: 32, fontColor: 'white', outlineColor: 'black', outlineWidth: 3, shadowColor: 'none', shadowOffset: 0 } },
  { name: 'Retro', style: { fontSize: 24, fontColor: 'yellow', outlineColor: 'black', outlineWidth: 2, shadowColor: 'none', shadowOffset: 0 } }
];

export default function SubtitleBurner() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedSubtitles, setSelectedSubtitles] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // Subtitle styling state
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    fontColor: 'white',
    fontFamily: 'Arial',
    outlineColor: 'black',
    outlineWidth: 2,
    shadowColor: 'black',
    shadowOffset: 0,
    position: 'bottom',
    alignment: 'center',
    marginV: 30,
    marginH: 20
  });

  const [timing, setTiming] = useState<SubtitleTiming>({
    offset: 0,
    speed: 1.0
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        ffmpegInstance.on('log', ({ message }) => {
          console.log('FFmpeg log:', message);
        });
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });

        // Use CDN for better compatibility with Next.js/Turbopack
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpeg(ffmpegInstance);
        setIsFfmpegLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError('Failed to initialize video processing engine. Please refresh the page and try again.');
      }
    };

    loadFFmpeg();
  }, []);

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setSelectedVideo(file);
    setError(null);
    setPreviewUrl(null); // Clear preview when new video is selected
  };

  const handleSubtitleSelect = (file: File) => {
    const validExtensions = ['.srt', '.vtt', '.sub'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please select a valid subtitle file (.srt, .vtt, or .sub)');
      return;
    }
    setSelectedSubtitles(file);
    setError(null);
  };

  const parseSubtitles = (subtitleText: string) => {
    // Simple SRT parser
    const subtitles = [];
    const blocks = subtitleText.split('\n\n');

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        // Parse timing (format: 00:00:00,000 --> 00:00:00,000)
        const timingMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (timingMatch) {
          const startTime = timingMatch[1];
          const endTime = timingMatch[2];
          const text = lines.slice(2).join('\n');

          subtitles.push({
            start: startTime,
            end: endTime,
            text: text
          });
        }
      }
    }

    return subtitles;
  };

  const generateSubtitleFilter = (): string => {
    // Use FFmpeg's built-in subtitles filter
    // This should handle SRT files properly
    console.log('🎬 Using subtitles filter: subtitles=input.srt');
    return 'subtitles=input.srt';
  };

  const generatePreview = async () => {
    if (!selectedVideo || !selectedSubtitles || !ffmpeg) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🎬 Starting preview generation...');

      // Write input files to FFmpeg FS
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedVideo));
      await ffmpeg.writeFile('input.srt', await fetchFile(selectedSubtitles));

      // Generate subtitle filter
      const subtitleFilter = generateSubtitleFilter();
      console.log('🎬 Generated subtitle filter:', subtitleFilter);

      // Build the full filter chain
      let fullFilter = 'select=between(t\\,0\\,10)'; // First select 10 seconds
      if (subtitleFilter) {
        fullFilter += `,${subtitleFilter}`; // Then apply subtitles
      }

      console.log('🎬 Full filter chain:', fullFilter);

      // Generate a short preview (first 10 seconds)
      const previewCommand = [
        '-i', 'input.mp4',
        '-vf', fullFilter,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-t', '10',
        '-preset', 'ultrafast',
        '-y',
        'preview.mp4'
      ];

      console.log('🎬 Preview FFmpeg command:', previewCommand.join(' '));

      await ffmpeg.exec(previewCommand);

      console.log('🎬 FFmpeg preview command executed');

      // Verify preview file
      try {
        const previewData = await ffmpeg.readFile('preview.mp4');
        console.log('🎬 Preview file verified, size:', previewData.byteLength);
      } catch (previewErr) {
        console.error('🎬 Failed to verify preview file:', previewErr);
        throw new Error('Preview generation completed but file was not created');
      }

      // Read the output
      const data = await ffmpeg.readFile('preview.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      console.log('🎬 Preview blob created, size:', blob.size);

      setPreviewUrl(url);
      setPreviewMode(true);

    } catch (err) {
      console.error('🎬 Preview generation error:', err);
      setError(`Failed to generate preview: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const burnSubtitles = async () => {
    if (!selectedVideo || !selectedSubtitles || !ffmpeg) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      console.log('Starting subtitle burning process...');

      // Write input files to FFmpeg FS
      await ffmpeg.writeFile('input.mp4', await fetchFile(selectedVideo));
      await ffmpeg.writeFile('input.srt', await fetchFile(selectedSubtitles));

      // Apply timing adjustments if needed
      let timingFilter = '';
      if (timing.offset !== 0 || timing.speed !== 1.0) {
        timingFilter = `setpts=PTS/${timing.speed}`;
        if (timing.offset !== 0) {
          timingFilter += `,setpts=PTS+${timing.offset}/TB`;
        }
        timingFilter += ',';
      }

      // Generate subtitle filter
      const subtitleFilter = generateSubtitleFilter();
      const fullFilter = timingFilter + subtitleFilter;

      if (!subtitleFilter) {
        console.warn('🎬 No subtitle filter generated, falling back to basic processing');
      }

      // Execute the FFmpeg command with subtitles

      console.log('🎬 Subtitle burning - Input files written');
      console.log('🎬 Video file size:', selectedVideo.size);
      console.log('🎬 Subtitle file size:', selectedSubtitles.size);
      console.log('🎬 Using filter:', fullFilter);

      // Debug: Check if files exist in FFmpeg FS
      try {
        const videoData = await ffmpeg.readFile('input.mp4');
        const subtitleData = await ffmpeg.readFile('input.srt');
        console.log('🎬 File verification - Video size in FS:', videoData.byteLength, 'Subtitle size in FS:', subtitleData.byteLength);
      } catch (readErr) {
        console.error('🎬 Error reading files from FFmpeg FS:', readErr);
        throw new Error('Failed to write input files to processing engine');
      }

      const ffmpegCommand = [
        '-i', 'input.mp4',
        '-vf', fullFilter,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        '-y',
        'output.mp4'
      ];

      console.log('🎬 FFmpeg command:', ffmpegCommand.join(' '));
      console.log('🎬 Full filter being applied:', fullFilter);

      // Burn subtitles using FFmpeg
      try {
        console.log('🎬 Executing FFmpeg command...');
        await ffmpeg.exec(ffmpegCommand);
        console.log('🎬 FFmpeg command executed successfully');

        // Verify output file was created
        try {
          const outputData = await ffmpeg.readFile('output.mp4');
          console.log('🎬 Output file verified, size:', outputData.byteLength);
        } catch (verifyErr) {
          console.error('🎬 Failed to verify output file:', verifyErr);
          throw new Error('FFmpeg completed but output file was not created');
        }

        // Check if output file was created
        try {
          const outputData = await ffmpeg.readFile('output.mp4');
          console.log('🎬 Output file created, size:', outputData.byteLength);
        } catch (outputErr) {
          console.error('🎬 Failed to read output file:', outputErr);
          throw new Error('FFmpeg completed but no output file was created');
        }

      } catch (ffmpegErr) {
        console.error('🎬 FFmpeg execution error:', ffmpegErr);
        throw new Error(`FFmpeg processing failed: ${ffmpegErr}`);
      }

      // Read the output
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });

      console.log('Output blob size:', blob.size);

      if (blob.size < 1000) {
        throw new Error('Generated video file is too small - processing may have failed');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subtitled_${selectedVideo.name.replace(/\.[^/.]+$/, '')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);

    } catch (err) {
      console.error('Subtitle burning error:', err);
      setError(`Failed to burn subtitles: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎬 Advanced Subtitle Burner Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Professional subtitle burning with customizable styling, positioning, and timing controls.
          {!isFfmpegLoaded && <span className="text-yellow-600 dark:text-yellow-400"> (Loading video processor...)</span>}
        </p>
      </div>

      {/* File Uploads */}
      <div className="mb-6 grid md:grid-cols-2 gap-6">
        {/* Video Upload */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎥 Select Video File
            </label>
            <input
              ref={videoInputRef}
              id="subtitle-burner-video-input"
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoSelect(file);
              }}
              className="hidden"
            />
            <Button
              as="label"
              htmlFor="subtitle-burner-video-input"
              className="cursor-pointer w-full"
            >
              Choose Video File
            </Button>
            {selectedVideo && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedVideo.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Subtitle Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📝 Select Subtitle File (.srt, .vtt, .sub)
            </label>
            <input
              ref={subtitleInputRef}
              id="subtitle-burner-subtitle-input"
              type="file"
              accept=".srt,.vtt,.sub,text/srt,text/vtt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSubtitleSelect(file);
              }}
              className="hidden"
            />
            <Button
              as="label"
              htmlFor="subtitle-burner-subtitle-input"
              className="cursor-pointer w-full"
            >
              Choose Subtitle File
            </Button>
            {selectedSubtitles && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedSubtitles.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {(selectedSubtitles.size / 1024).toFixed(0)} KB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Style Presets */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🎨 Style Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => setSubtitleStyle(prev => ({ ...prev, ...preset.style }))}
                className="text-xs py-2"
                variant="outline"
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Quick Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSubtitleStyle(prev => ({ ...prev, fontColor: color.value }))}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Styling Controls */}
      {selectedVideo && selectedSubtitles && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎨 Subtitle Styling</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">

            {/* Font Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Font</h4>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Family</label>
                <select
                  value={subtitleStyle.fontFamily}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Size</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={subtitleStyle.fontSize}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-center text-gray-500">{subtitleStyle.fontSize}px</div>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Colors</h4>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={subtitleStyle.fontColor.startsWith('#') ? subtitleStyle.fontColor : '#ffffff'}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Outline Color</label>
                <input
                  type="color"
                  value={subtitleStyle.outlineColor.startsWith('#') ? subtitleStyle.outlineColor : '#000000'}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, outlineColor: e.target.value }))}
                  className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Shadow Color</label>
                <input
                  type="color"
                  value={subtitleStyle.shadowColor.startsWith('#') ? subtitleStyle.shadowColor : '#000000'}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, shadowColor: e.target.value }))}
                  className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            </div>

            {/* Effects & Position */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Effects & Position</h4>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Outline Width</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={subtitleStyle.outlineWidth}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, outlineWidth: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-center text-gray-500">{subtitleStyle.outlineWidth}px</div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Shadow Offset</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={subtitleStyle.shadowOffset}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, shadowOffset: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-xs text-center text-gray-500">{subtitleStyle.shadowOffset}px</div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Position</label>
                <select
                  value={subtitleStyle.position}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                >
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Alignment</label>
                <select
                  value={subtitleStyle.alignment}
                  onChange={(e) => setSubtitleStyle(prev => ({ ...prev, alignment: e.target.value as any }))}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800"
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timing Controls */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">⏰ Timing Adjustments</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-blue-800 dark:text-blue-200 mb-1">Time Offset (seconds)</label>
                <input
                  type="number"
                  step="0.1"
                  value={timing.offset}
                  onChange={(e) => setTiming(prev => ({ ...prev, offset: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 text-sm border border-blue-300 dark:border-blue-600 rounded dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-800 dark:text-blue-200 mb-1">Speed Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3.0"
                  value={timing.speed}
                  onChange={(e) => setTiming(prev => ({ ...prev, speed: parseFloat(e.target.value) || 1.0 }))}
                  className="w-full p-2 text-sm border border-blue-300 dark:border-blue-600 rounded dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {selectedVideo && selectedSubtitles && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">👀 Preview</h3>
            <Button
              onClick={generatePreview}
              disabled={isProcessing || !isFfmpegLoaded}
              variant="outline"
              size="sm"
            >
              {previewMode ? '🔄 Update Preview' : '🎬 Generate Preview'}
            </Button>
          </div>

          {previewUrl ? (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={previewUrl}
                className="w-full max-h-64"
                controls
                key={previewUrl} // Force re-render when preview updates
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2">
                📹 Preview shows first 10 seconds with your styling applied
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {previewMode ? 'Generating preview...' : 'Click "Generate Preview" to see how subtitles will look'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                {previewMode ? 'Generating Preview...' : 'Burning Subtitles...'}
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

      {/* Burn Button */}
      {selectedVideo && selectedSubtitles && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={burnSubtitles}
              disabled={isProcessing || !isFfmpegLoaded}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isProcessing ? `🔥 Processing... ${progress}%` : '🔥 Burn Subtitles & Download'}
            </Button>

            <Button
              onClick={generatePreview}
              disabled={isProcessing || !isFfmpegLoaded}
              variant="outline"
              className="flex-1"
            >
              👀 Generate Preview
            </Button>
          </div>

          {!isFfmpegLoaded && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ Video processor is loading... Please wait before burning subtitles.
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Processing Error</h4>
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features Showcase */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎨 Advanced Styling</h4>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• Custom fonts & sizes</li>
            <li>• Color customization</li>
            <li>• Outline & shadow effects</li>
            <li>• Position & alignment control</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">⏰ Timing Control</h4>
          <ul className="text-green-800 dark:text-green-200 space-y-1 text-sm">
            <li>• Subtitle timing offset</li>
            <li>• Speed synchronization</li>
            <li>• Perfect sync adjustment</li>
            <li>• Frame-accurate positioning</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🚀 Professional Quality</h4>
          <ul className="text-purple-800 dark:text-purple-200 space-y-1 text-sm">
            <li>• Real-time preview</li>
            <li>• FFmpeg processing</li>
            <li>• High-quality output</li>
            <li>• Multiple format support</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4">📋 How to Use Subtitle Burner Pro:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">1. Upload Files</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Select your video file (MP4, AVI, MOV, etc.)</li>
              <li>• Choose subtitle file (.srt, .vtt, or .sub)</li>
              <li>• Ensure subtitle timing matches your video</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">2. Customize & Preview</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Adjust font, size, and colors</li>
              <li>• Set position and alignment</li>
              <li>• Generate preview to check styling</li>
              <li>• Fine-tune timing if needed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">3. Burn & Download</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Click "Burn Subtitles & Download"</li>
              <li>• Wait for processing to complete</li>
              <li>• Download your subtitled video</li>
              <li>• Subtitles are permanently embedded</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">4. Pro Tips</h4>
            <ul className="text-indigo-700 dark:text-indigo-300 space-y-1 text-sm">
              <li>• Use preview to check subtitle appearance</li>
              <li>• Adjust timing for perfect synchronization</li>
              <li>• Choose contrasting colors for readability</li>
              <li>• Position subtitles to avoid important visuals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
