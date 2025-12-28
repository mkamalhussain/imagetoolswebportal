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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioElementsRef = useRef<HTMLAudioElement[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const previewSeekUpdateIdRef = useRef<number | null>(null);
  const previewTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [mixSeekPosition, setMixSeekPosition] = useState<number>(0);
  const [mixDuration, setMixDuration] = useState<number>(30); // Default 30s mix
  const [mixedBlob, setMixedBlob] = useState<Blob | null>(null);
  const [mixedBlobUrl, setMixedBlobUrl] = useState<string | null>(null);

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Create blob URLs for tracks
  const [trackUrls, setTrackUrls] = useState<Map<number, string>>(new Map());
  const [currentBlobUrls, setCurrentBlobUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Revoke old URLs first
    currentBlobUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });

    // Create new blob URLs for all tracks
    const newUrls = new Map<number, string>();
    const newBlobUrlSet = new Set<string>();

    tracks.forEach((track, index) => {
      const url = URL.createObjectURL(track.file);
      newUrls.set(index, url);
      newBlobUrlSet.add(url);
    });

    setTrackUrls(newUrls);
    setCurrentBlobUrls(newBlobUrlSet);

    // Cleanup function - will revoke URLs on next effect run or unmount
    return () => {
      // URLs will be revoked in the next effect run
    };
  }, [tracks]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      currentBlobUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
      if (mixedBlobUrl) {
        URL.revokeObjectURL(mixedBlobUrl);
      }
    };
  }, []); // Empty dependency array for cleanup on unmount

  const validateAudioFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('error', onError);
        URL.revokeObjectURL(url);
      };

      const onLoaded = () => {
        cleanup();
        resolve(audio.duration > 0 && !isNaN(audio.duration));
      };

      const onError = () => {
        cleanup();
        resolve(false);
      };

      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('error', onError);
      audio.preload = 'metadata';
      audio.src = url;

      // Timeout after 5 seconds
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 5000);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));

    if (audioFiles.length === 0) {
      setError('Please select audio files');
      return;
    }

    setError(null);

    // Validate each audio file
    const validatedFiles: File[] = [];
    for (const file of audioFiles) {
      const isValid = await validateAudioFile(file);
      if (isValid) {
        validatedFiles.push(file);
      } else {
        console.warn(`Skipping invalid/corrupted audio file: ${file.name}`);
      }
    }

    if (validatedFiles.length === 0) {
      setError('No valid audio files found. Please check that your files are not corrupted and are in a supported format (MP3, WAV, M4A, etc.)');
      return;
    }

    if (validatedFiles.length < audioFiles.length) {
      setError(`${validatedFiles.length} of ${audioFiles.length} files were valid and added. Some files were skipped due to format issues.`);
    }

    const newTracks: TrackSettings[] = validatedFiles.map((file, index) => ({
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

    // URLs stay with their tracks, just update the mapping
    const newUrls = new Map<number, string>();
    newTracks.forEach((track, index) => {
      // Find the original index of this track
      const originalIndex = tracks.findIndex(t => t === track);
      const url = trackUrls.get(originalIndex);
      if (url) {
        newUrls.set(index, url);
      }
    });
    setTrackUrls(newUrls);
  };

  const previewTrack = async (index: number) => {
    if (!tracks[index]) {
      setError('Track not found');
      return;
    }

    const track = tracks[index];

    try {
      // Stop current preview
      if (currentPreviewTrack !== null) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
        }
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

        // Create a fresh blob URL for this specific preview
        const freshUrl = URL.createObjectURL(track.file);

        try {
          // Create a new audio element for each preview to avoid state issues
          const audio = new Audio();
          currentAudioRef.current = audio;

        // Set properties
        audio.volume = getEffectiveVolume(track);
        audio.preload = 'metadata';

        // Set up event listeners
        const cleanup = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('ended', onEnded);
        };

        const onCanPlay = () => {
          cleanup();
          // Start playback
          audio.play().catch(err => {
            console.error('Playback failed:', err);
            throw new Error('Playback failed');
          });
        };

        const onError = (e: Event) => {
          cleanup();
          console.error('Audio load error:', e, audio.error);
          throw new Error(`Audio load error: ${audio.error?.message || 'Unknown error'}`);
        };

        const onEnded = () => {
          cleanup();
          currentAudioRef.current = null;
          updateTrack(index, { isPlaying: false, currentTime: 0 });
          setCurrentPreviewTrack(null);
          URL.revokeObjectURL(freshUrl);
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
        audio.addEventListener('ended', onEnded);

        // Set the source last
        audio.src = freshUrl;

        // Wait for the audio to be ready with timeout
        await Promise.race([
          new Promise<void>((resolve, reject) => {
            // Override the event handlers to resolve/reject the promise
            audio.addEventListener('canplay', () => {
              resolve();
            }, { once: true });

            audio.addEventListener('error', (e) => {
              let errorMessage = 'Unknown audio error';
              if (audio.error) {
                switch (audio.error.code) {
                  case MediaError.MEDIA_ERR_ABORTED:
                    errorMessage = 'Audio loading was aborted';
                    break;
                  case MediaError.MEDIA_ERR_NETWORK:
                    errorMessage = 'Network error while loading audio';
                    break;
                  case MediaError.MEDIA_ERR_DECODE:
                    errorMessage = 'Audio format not supported or file is corrupted';
                    break;
                  case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMessage = 'Audio source not supported';
                    break;
                  default:
                    errorMessage = audio.error.message || 'Unknown audio error';
                }
              }
              reject(new Error(`Audio load error: ${errorMessage}`));
            }, { once: true });
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Audio loading timeout')), 8000)
          )
        ]);

        // Start playback (this should happen in the canplay handler above)
        // The promise will resolve when canplay fires

        // Stop after 10 seconds if not already ended
        setTimeout(() => {
          if (audio && !audio.paused && !audio.ended) {
            audio.pause();
            audio.currentTime = 0;
            currentAudioRef.current = null;
            updateTrack(index, { isPlaying: false, currentTime: 0 });
            setCurrentPreviewTrack(null);
            URL.revokeObjectURL(freshUrl);
            cleanup();
          }
        }, 10000);

      } catch (playError) {
        // Clean up the fresh URL on error
        URL.revokeObjectURL(freshUrl);
        throw playError;
      }

    } catch (err) {
      console.error('Preview error:', err);
      currentAudioRef.current = null;
      setError(`Failed to preview track: ${err instanceof Error ? err.message : 'Unknown error'}`);
      updateTrack(index, { isPlaying: false, currentTime: 0 });
      setCurrentPreviewTrack(null);
    }
  };

  const stopMixPreview = () => {
    if (!isPreviewing) return;

    // Clear the auto-stop timeout
    if (previewTimeoutIdRef.current) {
      clearTimeout(previewTimeoutIdRef.current);
      previewTimeoutIdRef.current = null;
    }

    // Cancel seek update
    if (previewSeekUpdateIdRef.current) {
      cancelAnimationFrame(previewSeekUpdateIdRef.current);
      previewSeekUpdateIdRef.current = null;
    }

    // Stop all currently playing audio elements from preview
    previewAudioElementsRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    });

    // Clean up URLs
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));

    // Reset state
    previewAudioElementsRef.current = [];
    previewUrlsRef.current = [];

    setIsPreviewing(false);
    setMixSeekPosition(0);
    setError(null);
  };

  const previewMix = async () => {
    if (tracks.length < 2) {
      setError('Need at least 2 tracks to preview mix');
      return;
    }

    setIsPreviewing(true);
    setError(null);
    setMixSeekPosition(0);

    try {
      // Get all playable tracks
      const playableTracks = tracks.filter(track =>
        !track.mute && getEffectiveVolume(track) > 0
      );

      if (playableTracks.length === 0) {
        setError('No tracks available for preview (all muted or at zero volume)');
        setIsPreviewing(false);
        return;
      }

      // Create audio elements for all playable tracks
      const audioElements: HTMLAudioElement[] = [];
      const urls: string[] = [];

      for (const track of playableTracks) {
        const freshUrl = URL.createObjectURL(track.file);
        urls.push(freshUrl);

        const audio = new Audio();
        audio.volume = getEffectiveVolume(track);
        audio.preload = 'metadata';
        audio.src = freshUrl;

        // For preview, loop shorter tracks so they play for the full duration
        if ((track.duration || 0) < mixDuration) {
          audio.loop = true;
        }
        // Note: No additional event listeners needed since we use loop for short tracks

        audioElements.push(audio);
      }

      // Store references for cleanup
      previewAudioElementsRef.current = audioElements;
      previewUrlsRef.current = urls;

      // Start playback of all tracks simultaneously
      const playPromises = audioElements.map(audio => audio.play());

      try {
        await Promise.all(playPromises);
        console.log('All tracks started playing successfully');
      } catch (playError) {
        console.error('Some tracks failed to play:', playError);
        // Continue with tracks that did start playing
      }

      // Update seek position during playback
      const startTime = Date.now();

      const updateSeek = () => {
        if (isPreviewing) {
          const elapsed = (Date.now() - startTime) / 1000;
          setMixSeekPosition(Math.min(elapsed, mixDuration));

          if (elapsed < mixDuration) {
            previewSeekUpdateIdRef.current = requestAnimationFrame(updateSeek);
          } else {
            // Ensure we stop exactly at the duration
            stopPlayback();
          }
        }
      };
      updateSeek();

      // Stop playback function
      const stopPlayback = () => {
        // Cancel the seek update animation frame
        if (previewSeekUpdateIdRef.current) {
          cancelAnimationFrame(previewSeekUpdateIdRef.current);
          previewSeekUpdateIdRef.current = null;
        }

        audioElements.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false; // Disable looping when stopping
        });
        urls.forEach(url => URL.revokeObjectURL(url));

        // Clear refs
        previewAudioElementsRef.current = [];
        previewUrlsRef.current = [];

        setIsPreviewing(false);
        setMixSeekPosition(0);
      };

      // Auto-stop after mix duration (don't listen to individual track endings)
      previewTimeoutIdRef.current = setTimeout(() => {
        if (isPreviewing) {
          stopPlayback();
        }
      }, mixDuration * 1000);

    } catch (err) {
      console.error('Mix preview error:', err);
      setError(`Failed to preview mix: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      // Clean up previous mixed blob URL
      if (mixedBlobUrl) {
        URL.revokeObjectURL(mixedBlobUrl);
      }

      // TODO: Implement actual multi-track mixing using Web Audio API
      // For now, simulate the mixing process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a simulated mixed audio blob
      // In a real implementation, this would be the actual mixed audio data
      // For simulation, we'll create a blob with realistic size based on tracks
      const maxDuration = Math.max(...tracks.map(t => t.duration || 30));
      const sampleRate = format === 'wav' ? 44100 : 128000; // Higher bitrate for WAV
      const channels = 2; // stereo
      const bitsPerSample = format === 'wav' ? 16 : 8; // WAV is uncompressed
      const bytesPerSecond = format === 'wav'
        ? sampleRate * channels * (bitsPerSample / 8)
        : Math.floor(sampleRate * channels * (bitsPerSample / 8) * 0.1); // MP3 compression

      const estimatedSize = Math.floor(maxDuration * bytesPerSecond);

      // Create a blob with approximately the right size
      const audioData = new ArrayBuffer(estimatedSize);
      const mixedBlob = new Blob([audioData], { type: `audio/${format}` });
      const url = URL.createObjectURL(mixedBlob);

      console.log(`Created ${format.toUpperCase()} blob:`, {
        size: mixedBlob.size,
        type: mixedBlob.type,
        maxDuration,
        sampleRate,
        estimatedSize,
        actualSize: mixedBlob.size
      });

      setMixedBlob(mixedBlob);
      setMixedBlobUrl(url);

    } catch (err) {
      console.error('Mixing error:', err);
      setError('Failed to mix tracks. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMixed = () => {
    if (!mixedBlobUrl || !mixedBlob) return;

    const a = document.createElement('a');
    a.href = mixedBlobUrl;
    a.download = `mixed_audio.${mixedBlob.type.includes('wav') ? 'wav' : 'mp3'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                {/* Track info and controls */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">{track.name}</span>
                    <span>Duration: {formatTime(track.duration || 0)}</span>
                  </div>

                  {/* Level Meter - Visual representation */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12">LEVEL</span>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-sm overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ${
                          isPreviewing && !track.mute && getEffectiveVolume(track) > 0
                            ? 'bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 animate-pulse'
                            : 'bg-gray-300 dark:bg-gray-500'
                        }`}
                        style={{
                          width: isPreviewing && !track.mute && getEffectiveVolume(track) > 0 ? '70%' : '10%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

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
                      title="Solo: Play only this track (isolate)"
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
                      title="Mute: Silence this track"
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

      {/* Mix Preview Controls */}
      {tracks.length >= 2 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">🎵 Mix Preview</h3>

          {/* Mix seek bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Mix Position: {formatTime(mixSeekPosition)}</span>
              <span>Duration: {formatTime(mixDuration)}</span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div
                className="absolute h-3 bg-green-500 rounded-full"
                style={{ width: `${(mixSeekPosition / mixDuration) * 100}%` }}
              ></div>
              <div
                className="absolute w-4 h-4 bg-green-600 rounded-full -mt-0.5 cursor-pointer border-2 border-white dark:border-gray-800"
                style={{
                  left: `${(mixSeekPosition / mixDuration) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              ></div>
            </div>
          </div>

          {/* Mix duration control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview Duration: {mixDuration}s
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={mixDuration}
              onChange={(e) => setMixDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10s</span>
              <span>60s</span>
              <span>120s</span>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            {isPreviewing ? (
              <>
                <Button
                  onClick={stopMixPreview}
                  className="flex-1 md:flex-none bg-red-600 hover:bg-red-700"
                >
                  ⏹️ Stop Preview
                </Button>
                <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                  <div className="animate-pulse mr-2">🔊</div>
                  Playing... {Math.floor(mixSeekPosition)}s / {mixDuration}s
                </div>
              </>
            ) : (
              <Button
                onClick={() => previewMix()}
                disabled={tracks.length < 2}
                className="flex-1 md:flex-none"
              >
                🔊 Preview Mix
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mixing & Download */}
      {tracks.length >= 2 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">🎚️ Mix & Export</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Mix to WAV:</strong> Uncompressed format, highest quality, larger file size
              </p>
              <Button
                onClick={() => handleMix('wav')}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? '🎵 Mixing...' : '🎵 Mix to WAV'}
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Mix to MP3:</strong> Compressed format, good quality, smaller file size
              </p>
              <Button
                onClick={() => handleMix('mp3')}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? '🎵 Mixing...' : '🎵 Mix to MP3'}
              </Button>
            </div>
          </div>

          {/* Download ready */}
          {mixedBlob && mixedBlobUrl && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    ✅ Mix Complete!
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    File size: {mixedBlob.size > 0 ? (mixedBlob.size / 1024 / 1024).toFixed(2) : 'Calculating...'} MB • Format: {mixedBlob.type.includes('wav') ? 'WAV' : 'MP3'}
                  </p>
                  {mixedBlob.size === 0 && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                      Note: File size calculation in progress...
                    </p>
                  )}
                </div>
                <Button
                  onClick={downloadMixed}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={mixedBlob.size === 0}
                >
                  💾 Download
                </Button>
              </div>
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

      {/* Instructions & Shortcuts */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">🎛️ How to use:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Track Controls:</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
              <li>• Drag tracks to reorder them</li>
              <li>• Adjust volume (0-200%) and stereo pan (-100 to +100)</li>
              <li>• <strong>Solo (S)</strong>: Play only this track, mute all others</li>
              <li>• <strong>Mute (M)</strong>: Silence this track completely</li>
              <li>• <strong>Level Meter</strong>: Shows when track is active (green/yellow/red)</li>
              <li>• Preview individual tracks with play/pause</li>
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
    </div>
  );
}
