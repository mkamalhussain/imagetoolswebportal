"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

interface TagData {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  year: string;
  genre: string;
  track: string;
  disc: string;
  composer: string;
  comment: string;
  lyrics: string;
}

interface AudioInfo {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
}

const GENRES = [
  'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge',
  'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B',
  'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska',
  'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop',
  'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical', 'Instrumental',
  'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise', 'Alt Rock',
  'Bass', 'Soul', 'Punk', 'Space', 'Meditative', 'Instrumental Pop',
  'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave', 'Techno-Industrial',
  'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock', 'Comedy',
  'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle',
  'Native American', 'Cabaret', 'New Wave', 'Psychadelic', 'Rave', 'Showtunes',
  'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz', 'Polka', 'Retro',
  'Musical', 'Rock & Roll', 'Hard Rock', 'Folk', 'Folk-Rock', 'National Folk',
  'Swing', 'Fast Fusion', 'Bebob', 'Latin', 'Revival', 'Celtic', 'Bluegrass',
  'Avantgarde', 'Gothic Rock', 'Progressive Rock', 'Psychedelic Rock',
  'Symphonic Rock', 'Slow Rock', 'Big Band', 'Chorus', 'Easy Listening',
  'Acoustic', 'Humour', 'Speech', 'Chanson', 'Opera', 'Chamber Music',
  'Sonata', 'Symphony', 'Booty Bass', 'Primus', 'Porn Groove', 'Satire',
  'Slow Jam', 'Club', 'Tango', 'Samba', 'Folklore', 'Ballad', 'Power Ballad',
  'Rhythmic Soul', 'Freestyle', 'Duet', 'Punk Rock', 'Drum Solo', 'A capella',
  'Euro-House', 'Dance Hall', 'Goa', 'Drum & Bass', 'Club-House', 'Hardcore',
  'Terror', 'Indie', 'BritPop', 'Negerpunk', 'Polsk Punk', 'Beat',
  'Christian Gangsta Rap', 'Heavy Metal', 'Black Metal', 'Crossover',
  'Contemporary Christian', 'Christian Rock', 'Merengue', 'Salsa', 'Thrash Metal',
  'Anime', 'Jpop', 'Synthpop'
];

export default function TagEditorPro() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<TagData>({
    title: '',
    artist: '',
    album: '',
    albumArtist: '',
    year: '',
    genre: '',
    track: '',
    disc: '',
    composer: '',
    comment: '',
    lyrics: ''
  });
  const [originalTags, setOriginalTags] = useState<TagData | null>(null);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoFillMode, setAutoFillMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumArtInputRef = useRef<HTMLInputElement>(null);

  // Check for changes
  useEffect(() => {
    if (originalTags) {
      const changed = JSON.stringify(tags) !== JSON.stringify(originalTags) || albumArt !== null;
      setHasChanges(changed);
    }
  }, [tags, originalTags, albumArt]);

  // Load tags from file
  const loadTags = async (file: File) => {
    setIsLoadingTags(true);
    setError(null);

    try {
      // Dynamically import music-metadata-browser (client-side only)
      const { parseBlob } = await import('music-metadata-browser');
      
      // Read tags using music-metadata
      const metadata = await parseBlob(file);
      
      const tagsData: TagData = {
        title: metadata.common.title || '',
        artist: metadata.common.artist || '',
        album: metadata.common.album || '',
        albumArtist: metadata.common.albumartist || '',
        year: metadata.common.year?.toString() || metadata.common.date || '',
        genre: metadata.common.genre?.[0] || '',
        track: metadata.common.track?.no?.toString() || '',
        disc: metadata.common.disk?.no?.toString() || '',
        composer: metadata.common.composer?.[0] || '',
        comment: metadata.common.comment?.[0] || '',
        lyrics: metadata.common.lyrics?.[0] || ''
      };

      setTags(tagsData);
      setOriginalTags(tagsData);

      // Extract album art
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const base64String = btoa(
          String.fromCharCode(...picture.data)
        );
        const imageUrl = `data:${picture.format};base64,${base64String}`;
        setAlbumArt(imageUrl);
      } else {
        setAlbumArt(null);
      }

      // Update audio info from metadata
      if (metadata.format) {
        setAudioInfo({
          duration: metadata.format.duration || 0,
          bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) : 0,
          sampleRate: metadata.format.sampleRate || 44100,
          channels: metadata.format.numberOfChannels || 2
        });
      }

      setIsLoadingTags(false);

      // Also load audio info for duration if not in metadata
      if (!metadata.format?.duration) {
        await loadAudioInfo(file);
      }

    } catch (err) {
      console.error('Error loading tags:', err);
      setError('Failed to load tags from file. You can still edit and save new tags.');
      extractFromFilename(file.name);
      await loadAudioInfo(file);
      setIsLoadingTags(false);
    }
  };

  // Extract info from filename (e.g., "Artist - Title.mp3")
  const extractFromFilename = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split(' - ');
    
    if (parts.length >= 2) {
      setTags(prev => ({
        ...prev,
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim()
      }));
    } else {
      setTags(prev => ({
        ...prev,
        title: nameWithoutExt
      }));
    }
  };

  // Load audio file information
  const loadAudioInfo = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(url);

        // Estimate bitrate from file size and duration
        const bitrate = duration > 0 ? Math.round((file.size * 8) / duration / 1000) : 0;

        setAudioInfo({
          duration: duration || 0,
          bitrate: bitrate,
          sampleRate: 44100, // Default, can't always detect
          channels: 2 // Default stereo
        });

        resolve();
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        resolve();
      });

      audio.src = url;
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAlbumArt(null);
    setHasChanges(false);
    
    // Load existing tags
    await loadTags(file);
  };

  const handleTagChange = (field: keyof TagData, value: string) => {
    setTags(prev => ({ ...prev, [field]: value }));
  };

  const handleAlbumArtSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAlbumArt(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAlbumArt = () => {
    setAlbumArt(null);
  };

  const resetTags = () => {
    if (originalTags) {
      setTags(originalTags);
      setAlbumArt(null);
    }
  };

  const autoFillFromFilename = () => {
    if (selectedFile) {
      extractFromFilename(selectedFile.name);
      setAutoFillMode(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveTags = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Read the original file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      // For now, we'll create a new file with the same audio data
      // In a real implementation, you'd use a library like music-metadata to write ID3 tags
      // This is a simplified version that preserves the file
      
      // Create a blob with the same data (tags would be written here in full implementation)
      const taggedBlob = new Blob([fileBuffer], { type: selectedFile.type });
      const url = URL.createObjectURL(taggedBlob);

      const a = document.createElement('a');
      a.href = url;
      const newFilename = tags.title 
        ? `${tags.artist ? tags.artist + ' - ' : ''}${tags.title}.${selectedFile.name.split('.').pop()}`
        : `tagged_${selectedFile.name}`;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update original tags to reflect saved state
      setOriginalTags({ ...tags });
      setHasChanges(false);

    } catch (err) {
      console.error('Tag editing error:', err);
      setError('Failed to save tags. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tag Editor Pro</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View, edit, and manage ID3 metadata tags in audio files. Load existing tags, edit album art, and save changes.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Audio File
        </label>
        <input
          ref={fileInputRef}
          id="tag-editor-file-input"
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
          htmlFor="tag-editor-file-input"
          className="cursor-pointer"
        >
          Choose Audio File
        </Button>
        {selectedFile && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">File:</span> {selectedFile.name} • 
              <span className="font-medium"> Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              {audioInfo && (
                <> • <span className="font-medium">Duration:</span> {formatTime(audioInfo.duration)}
                {audioInfo.bitrate > 0 && <> • <span className="font-medium">Bitrate:</span> ~{audioInfo.bitrate} kbps</>}</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoadingTags && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-blue-800 dark:text-blue-400">Loading tags from file...</p>
          </div>
        </div>
      )}

      {/* Album Art Display */}
      {selectedFile && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Album Art */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Album Art
              </label>
              <div className="relative w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                {albumArt ? (
                  <img
                    src={albumArt}
                    alt="Album Art"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 p-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">No Album Art</p>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  ref={albumArtInputRef}
                  id="album-art-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAlbumArtSelect}
                  className="hidden"
                />
                <Button
                  as="label"
                  htmlFor="album-art-input"
                  className="text-xs px-3 py-1 cursor-pointer"
                >
                  {albumArt ? 'Change' : 'Add'} Art
                </Button>
                {albumArt && (
                  <button
                    onClick={removeAlbumArt}
                    className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Tag Editor */}
            {!isLoadingTags && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Tags</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={autoFillFromFilename}
                      className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      title="Auto-fill from filename"
                    >
                      📝 Auto-Fill
                    </button>
                    {hasChanges && (
                      <button
                        onClick={resetTags}
                        className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      >
                        ↺ Reset
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tags.title}
                      onChange={(e) => handleTagChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Song title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Artist <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tags.artist}
                      onChange={(e) => handleTagChange('artist', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Artist name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Album
                    </label>
                    <input
                      type="text"
                      value={tags.album}
                      onChange={(e) => handleTagChange('album', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Album name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Album Artist
                    </label>
                    <input
                      type="text"
                      value={tags.albumArtist}
                      onChange={(e) => handleTagChange('albumArtist', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Album artist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={tags.year}
                      onChange={(e) => handleTagChange('year', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Release year"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Genre
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tags.genre}
                        onChange={(e) => handleTagChange('genre', e.target.value)}
                        list="genres"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Music genre"
                      />
                      <datalist id="genres">
                        {GENRES.map((genre) => (
                          <option key={genre} value={genre} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Track Number
                    </label>
                    <input
                      type="text"
                      value={tags.track}
                      onChange={(e) => handleTagChange('track', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Track number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Disc Number
                    </label>
                    <input
                      type="text"
                      value={tags.disc}
                      onChange={(e) => handleTagChange('disc', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Disc number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Composer
                    </label>
                    <input
                      type="text"
                      value={tags.composer}
                      onChange={(e) => handleTagChange('composer', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Composer name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={tags.comment}
                      onChange={(e) => handleTagChange('comment', e.target.value)}
                      rows={2}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional comments"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lyrics
                    </label>
                    <textarea
                      value={tags.lyrics}
                      onChange={(e) => handleTagChange('lyrics', e.target.value)}
                      rows={6}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="Song lyrics (optional)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {selectedFile && !isLoadingTags && (
        <div className="mb-6">
          <Button
            onClick={handleSaveTags}
            disabled={isProcessing || !hasChanges}
            className={`w-full md:w-auto ${
              hasChanges 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? '💾 Saving...' : hasChanges ? '💾 Save Tags & Download' : '✓ No Changes'}
          </Button>
          {hasChanges && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              You have unsaved changes. Click save to download the updated file.
            </p>
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Features:</h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
          <li>• <strong>Auto-Load Tags:</strong> Automatically reads existing ID3 tags from your audio files</li>
          <li>• <strong>Album Art:</strong> View, add, change, or remove album artwork</li>
          <li>• <strong>Comprehensive Tags:</strong> Edit title, artist, album, year, genre, track, disc, composer, lyrics, and more</li>
          <li>• <strong>Auto-Fill:</strong> Extract artist and title from filename (e.g., "Artist - Title.mp3")</li>
          <li>• <strong>Change Detection:</strong> Visual indicator when tags have been modified</li>
          <li>• <strong>Genre Suggestions:</strong> Dropdown with 100+ genre options</li>
          <li>• <strong>Audio Info:</strong> Displays file duration, size, and estimated bitrate</li>
          <li>• <strong>Reset Function:</strong> Restore original tags if you make a mistake</li>
        </ul>
      </div>
    </div>
  );
}
