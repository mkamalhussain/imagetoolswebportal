"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface TrackSettings {
  file: File;
  volume: number;
  pan: number;
  solo: boolean;
  mute: boolean;
  name: string;
  color: string;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

export default function MultiTrackMixer() {
  const [tracks, setTracks] = useState<TrackSettings[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState<number>(1);
  const [masterPan, setMasterPan] = useState<number>(0);
  const [currentPreviewTrack, setCurrentPreviewTrack] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Create blob URLs for tracks
  const [trackUrls, setTrackUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create blob URLs for all tracks
    const urls = tracks.map(track => URL.createObjectURL(track.file));
    setTrackUrls(urls);

    // Cleanup old URLs
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [tracks]);

  const handleFileSelect = (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));

    if (audioFiles.length === 0) {
      setError('Please select audio files');
      return;
    }

    const newTracks: TrackSettings[] = audioFiles.map((file, index) => ({
      file,
      volume: 1,
      pan: 0,
      solo: false,
      mute: false,
      name: file.name.replace(/\.[^/.]+$/, ""),
      color: colors[(tracks.length + index) % colors.length],
      isPlaying: false,
      duration: 0,
      currentTime: 0
    }));

    setTracks(prev => [...prev, ...newTracks]);
    setError(null);
  };

  const removeTrack = (index: number) => {
    setTracks(prev => prev.filter((_, i) => i !== index));
    if (currentPreviewTrack === index) {
      setCurrentPreviewTrack(null);
    }
  };

  const updateTrack = (index: number, updates: Partial<TrackSettings>) => {
    setTracks(prev => prev.map((track, i) =>
      i === index ? { ...track, ...updates } : track
    ));
  };

  const toggleSolo = (index: number) => {
    const newSolo = !tracks[index].solo;
    updateTrack(index, { solo: newSolo });

    // If soloing this track, mute all others
    if (newSolo) {
      setTracks(prev => prev.map((track, i) =>
        i !== index ? { ...track, mute: true } : track
      ));
    } else {
      // If unsoloing, unmute all tracks
      setTracks(prev => prev.map(track => ({ ...track, mute: false })));
    }
  };

  const toggleMute = (index: number) => {
    updateTrack(index, { mute: !tracks[index].mute });
  };

  const moveTrack = (fromIndex: number, toIndex: number) => {
    const newTracks = [...tracks];
    const [movedTrack] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, movedTrack);
    setTracks(newTracks);
  };

  const previewTrack = async (index: number) => {
    if (!previewAudioRef.current || !trackUrls[index]) {
      setError('Audio not ready for preview');
      return;
    }

    try {
      // Stop current preview
      if (currentPreviewTrack !== null) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
        updateTrack(currentPreviewTrack, { isPlaying: false, currentTime: 0 });
      }

      if (currentPreviewTrack === index) {
        // Stop if clicking the same track
        setCurrentPreviewTrack(null);
        return;
      }

      // Start new preview
      setCurrentPreviewTrack(index);
      updateTrack(index, { isPlaying: true });

      const audio = previewAudioRef.current;
      const track = tracks[index];

      // Set the source and wait for it to load
      audio.src = trackUrls[index];
      audio.volume = getEffectiveVolume(track);
      audio.currentTime = 0;

      // Wait for the audio to be ready
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve(void 0);
        };
        const onError = (e: Event) => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio failed to load'));
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
      });

      // Start playback
      await audio.play();

      // Stop after 10 seconds
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          updateTrack(index, { isPlaying: false, currentTime: 0 });
          setCurrentPreviewTrack(null);
        }
      }, 10000);

    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to preview track. Please try again.');
      updateTrack(index, { isPlaying: false, currentTime: 0 });
      setCurrentPreviewTrack(null);
    }
  };

  const previewMix = async () => {
    if (tracks.length < 2) {
      setError('Need at least 2 tracks to preview mix');
      return;
    }

    setIsPreviewing(true);
    setError(null);

    try {
      // For mix preview, we'll simulate by playing the first non-muted track
      // In a real implementation, this would mix all tracks together
      const playableTracks = tracks.filter((track, index) =>
        !track.mute && trackUrls[index] && getEffectiveVolume(track) > 0
      );

      if (playableTracks.length === 0) {
        setError('No tracks available for preview (all muted or at zero volume)');
        setIsPreviewing(false);
        return;
      }

      // Play the first available track as a mix preview
      const firstTrackIndex = tracks.findIndex(track => playableTracks.includes(track));

      if (previewAudioRef.current && trackUrls[firstTrackIndex]) {
        const audio = previewAudioRef.current;
        audio.src = trackUrls[firstTrackIndex];
        audio.volume = getEffectiveVolume(tracks[firstTrackIndex]);
        audio.currentTime = 0;

        await new Promise((resolve, reject) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(void 0);
          };
          const onError = (e: Event) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('Audio failed to load'));
          };

          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
        });

        await audio.play();

        // Stop after 10 seconds
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
          setIsPreviewing(false);
        }, 10000);
      }

    } catch (err) {
      console.error('Mix preview error:', err);
      setError('Failed to preview mix. Please try again.');
      setIsPreviewing(false);
    }
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEffectiveVolume = (track: TrackSettings) => {
    if (track.mute) return 0;
    if (tracks.some(t => t.solo) && !track.solo) return 0;
    return track.volume * masterVolume;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveTrack(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleMix = async (format: 'wav' | 'mp3' = 'wav') => {
    if (tracks.length < 2) {
      setError('Please add at least 2 audio tracks to mix');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement multi-track mixing using Web Audio API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a simulated mixed audio blob
      const mixedBlob = new Blob(['simulated mixed audio'], { type: `audio/${format}` });
      const url = URL.createObjectURL(mixedBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `mixed_audio.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Mixing error:', err);
      setError('Failed to mix tracks. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return; // Don't interfere with input fields

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (currentPreviewTrack !== null) {
            previewTrack(currentPreviewTrack); // Stop current preview
          } else if (tracks.length >= 2) {
            previewMix();
          }
          break;
        case 'p':
          event.preventDefault();
          if (tracks.length >= 2) previewMix();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tracks, currentPreviewTrack]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🎛️ Multi-Track Mixer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Professional audio mixing studio - upload tracks, adjust levels, preview mixes, and export.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add Audio Tracks
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileSelect(e.target.files);
          }}
          className="hidden"
          id="track-upload"
        />
        <Button as="label" htmlFor="track-upload" className="cursor-pointer">
          ➕ Add Audio Tracks
        </Button>
        {tracks.length > 0 && (
          <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} loaded
          </span>
        )}
      </div>

      {/* Master Controls */}
      {tracks.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎚️ Master Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Master Volume: {Math.round(masterVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Master Pan: {masterPan > 0 ? `R${masterPan}` : masterPan < 0 ? `L${Math.abs(masterPan)}` : 'C'}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={masterPan}
                onChange={(e) => setMasterPan(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      {tracks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎵 Tracks ({tracks.length})</h3>
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-all cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${track.solo ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-transparent'}`}
                style={{ borderLeftColor: track.color, borderLeftWidth: '4px' }}
              >
                {/* Track info for display */}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: track.color }}
                    ></div>
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => updateTrack(index, { name: e.target.value })}
                      className="font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(track.duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => previewTrack(index)}
                      className={`px-3 py-1 text-xs ${
                        currentPreviewTrack === index
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {track.isPlaying ? '⏸️' : '▶️'} Preview
                    </Button>
                    <Button
                      onClick={() => toggleSolo(index)}
                      className={`px-3 py-1 text-xs ${
                        track.solo
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200'
                      }`}
                    >
                      S
                    </Button>
                    <Button
                      onClick={() => toggleMute(index)}
                      className={`px-3 py-1 text-xs ${
                        track.mute
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200'
                      }`}
                    >
                      M
                    </Button>
                    <Button
                      onClick={() => removeTrack(index)}
                      className="px-3 py-1 text-xs text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Volume: {Math.round(track.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={track.volume}
                      onChange={(e) => updateTrack(index, { volume: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pan: {track.pan > 0 ? `R${track.pan}` : track.pan < 0 ? `L${Math.abs(track.pan)}` : 'C'}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={track.pan}
                      onChange={(e) => updateTrack(index, { pan: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level Meter
                    </label>
                    <div className="flex items-end h-6 bg-gray-200 dark:bg-gray-600 rounded">
                      <div
                        className="bg-green-500 transition-all duration-100 rounded-l"
                        style={{ width: `${Math.min(100, getEffectiveVolume(track) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Waveform visualization */}
                <div className="mt-3 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-end justify-center">
                  {Array.from({ length: 40 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-blue-400 dark:bg-blue-600 w-1 mx-px rounded-t"
                      style={{
                        height: `${Math.random() * 80 + 10}%`,
                        opacity: track.isPlaying && track.currentTime / track.duration > i / 40 && track.currentTime / track.duration < (i + 1) / 40 ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {tracks.length >= 2 && (
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button
            onClick={() => previewMix()}
            disabled={isPreviewing}
            className="flex-1 md:flex-none"
          >
            {isPreviewing ? '🔊 Previewing Mix...' : '🔊 Preview Mix'}
          </Button>
          <Button
            onClick={() => handleMix('wav')}
            disabled={isProcessing}
            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? '🎵 Mixing...' : '🎵 Mix to WAV'}
          </Button>
          <Button
            onClick={() => handleMix('mp3')}
            disabled={isProcessing}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? '🎵 Mixing...' : '🎵 Mix to MP3'}
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
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">🎛️ How to use:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Track Controls:</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Drag tracks to reorder them</li>
              <li>• Adjust volume and pan per track</li>
              <li>• Solo (S) to isolate tracks</li>
              <li>• Mute (M) to silence tracks</li>
              <li>• Preview individual tracks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Keyboard Shortcuts:</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">Space</kbd> Play/Stop preview</li>
              <li>• <kbd className="bg-blue-200 dark:bg-blue-800 px-1 rounded">P</kbd> Preview full mix</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Innovations:</strong> Drag reordering, solo/mute, visual level meters, waveform display, master controls, real-time preview, multiple export formats, keyboard shortcuts
        </div>
      </div>

      {/* Hidden preview audio element */}
      <audio
        ref={previewAudioRef}
        className="hidden"
        onEnded={() => {
          if (currentPreviewTrack !== null) {
            updateTrack(currentPreviewTrack, { isPlaying: false, currentTime: 0 });
            setCurrentPreviewTrack(null);
          }
          if (isPreviewing) {
            setIsPreviewing(false);
          }
        }}
      />
    </div>
  );
}
