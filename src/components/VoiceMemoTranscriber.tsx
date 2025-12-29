"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

interface TranscriptionSegment {
  text: string;
  timestamp: number;
  confidence?: number;
  isFinal: boolean;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'hi-IN', name: 'Hindi' },
];

export default function VoiceMemoTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [interimTranscription, setInterimTranscription] = useState<string>('');
  const [transcriptionSegments, setTranscriptionSegments] = useState<TranscriptionSegment[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [language, setLanguage] = useState<string>('en-US');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [showWaveform, setShowWaveform] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        const newSegments: TranscriptionSegment[] = [];

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            newSegments.push({
              text: transcript,
              timestamp: Date.now(),
              confidence,
              isFinal: true
            });
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript);
          setTranscriptionSegments(prev => [...prev, ...newSegments]);
        }
        setInterimTranscription(interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        // Ignore 'no-speech' errors as they're common during processing
        if (event.error === 'no-speech') {
          return;
        }
        
        console.error('Speech recognition error:', event.error);
        
        // Only show user-facing errors for critical issues
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'aborted') {
          // Aborted is usually intentional, don't show error
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'network') {
          setError('Network error. Please check your internet connection.');
          setIsRecording(false);
          setIsProcessing(false);
        } else if (event.error === 'service-not-allowed') {
          setError('Speech recognition service not available. Please try again later.');
          setIsRecording(false);
          setIsProcessing(false);
        }
        // Other errors like 'audio-capture', 'bad-grammar' are less critical
      };

      recognitionInstance.onend = () => {
        // Auto-restart if still recording/processing
        if (isRecording || isProcessing) {
          try {
            recognitionInstance.start();
          } catch (e) {
            // Ignore restart errors
          }
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Web Speech API not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [language]);

  // Generate waveform data
  const generateWaveform = useCallback(async (file: File) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of samples for waveform
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }

      // Normalize
      const max = Math.max(...waveform);
      waveform.forEach((val, i) => {
        waveform[i] = val / max;
      });

      setWaveformData(waveform);
      audioContext.close();
    } catch (err) {
      console.warn('Error generating waveform:', err);
    }
  }, []);

  // Draw waveform
  useEffect(() => {
    if (!waveformCanvasRef.current || waveformData.length === 0) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#3b82f6';

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setTranscription('');
    setInterimTranscription('');
    setTranscriptionSegments([]);
    setError(null);
    
    // Create audio URL for playback
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Generate waveform
    await generateWaveform(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recorded_audio.webm', { type: 'audio/webm' });
        setSelectedFile(audioFile);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        generateWaveform(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
      setInterimTranscription('');
      setTranscriptionSegments([]);

      if (recognition) {
        recognition.lang = language;
        recognition.start();
      }
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore
      }
    }

    setIsRecording(false);
  };

  const transcribeFile = async () => {
    if (!selectedFile || !recognition) {
      setError('Please select an audio file and ensure speech recognition is available');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTranscription('');
    setInterimTranscription('');
    setTranscriptionSegments([]);

    try {
      // Create audio element to play the file (muted for transcription)
      const audio = new Audio();
      audio.src = audioUrl || URL.createObjectURL(selectedFile);
      audio.volume = 0; // Mute audio during transcription
      audioRef.current = audio;

      // Set up speech recognition
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;

      // Start recognition before playing audio
      recognition.start();

      // Play audio silently and transcribe
      await new Promise<void>((resolve, reject) => {
        let transcriptionStarted = false;
        let timeoutId: NodeJS.Timeout;

        // Set a timeout in case transcription doesn't work
        timeoutId = setTimeout(() => {
          if (!transcriptionStarted) {
            setError('Transcription timed out. Web Speech API requires microphone input. For file transcription, please use the live recording feature instead.');
            if (recognition) {
              try {
                recognition.stop();
              } catch (e) {
                // Ignore
              }
            }
            audio.pause();
            resolve();
          }
        }, 5000); // 5 second timeout

        recognition.onresult = () => {
          transcriptionStarted = true;
          clearTimeout(timeoutId);
        };

        audio.onended = () => {
          clearTimeout(timeoutId);
          setTimeout(() => {
            if (recognition) {
              try {
                recognition.stop();
              } catch (e) {
                // Ignore
              }
            }
            resolve();
          }, 2000); // Give recognition time to process final results
        };

        audio.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error('Audio playback error:', err);
          if (recognition) {
            try {
              recognition.stop();
            } catch (e) {
              // Ignore
            }
          }
          reject(err);
        };

        audio.play().catch((err) => {
          clearTimeout(timeoutId);
          console.error('Error playing audio:', err);
          setError('Failed to play audio. Please try again.');
          if (recognition) {
            try {
              recognition.stop();
            } catch (e) {
              // Ignore
            }
          }
          reject(err);
        });
      });

    } catch (err) {
      console.error('Transcription error:', err);
      if (!error) {
        setError('Failed to transcribe audio. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore
        }
      }
      // Restore audio volume after transcription
      if (audioRef.current) {
        audioRef.current.volume = 1;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadTranscription = () => {
    const content = showTimestamps && transcriptionSegments.length > 0
      ? transcriptionSegments.map(seg => 
          `[${formatTime((seg.timestamp - (transcriptionSegments[0]?.timestamp || 0)) / 1000)}] ${seg.text}`
        ).join('\n')
      : transcription;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const content = showTimestamps && transcriptionSegments.length > 0
      ? transcriptionSegments.map(seg => 
          `[${formatTime((seg.timestamp - (transcriptionSegments[0]?.timestamp || 0)) / 1000)}] ${seg.text}`
        ).join('\n')
      : transcription;
    
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const displayText = transcription + (interimTranscription ? ` ${interimTranscription}` : '');

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Voice Memo Transcriber</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record or upload audio files and get them transcribed to text using advanced speech recognition.
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording || isProcessing}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex items-center gap-2" disabled={isProcessing}>
              🎤 Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              ⏹️ Stop Recording
            </Button>
          )}
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              Recording...
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Or upload an existing audio file:
        </div>
        <input
          ref={fileInputRef}
          id="voice-transcriber-file-input"
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          disabled={isRecording || isProcessing}
        />
        <Button
          as="label"
          htmlFor="voice-transcriber-file-input"
          className="cursor-pointer"
          disabled={isRecording || isProcessing}
        >
          Choose Audio File
        </Button>
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            {audioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full max-w-md"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Waveform Visualization */}
      {showWaveform && waveformData.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Audio Waveform</h3>
            <button
              onClick={() => setShowWaveform(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Hide
            </button>
          </div>
          <canvas
            ref={waveformCanvasRef}
            width={800}
            height={100}
            className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"
          />
        </div>
      )}

      {/* Transcribe Button */}
      {selectedFile && !isRecording && (
        <div className="mb-6">
          <div className="mb-2">
            <Button
              onClick={transcribeFile}
              disabled={isProcessing}
              className="w-full md:w-auto"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Transcribing...
                </span>
              ) : (
                '🎯 Transcribe Audio'
              )}
            </Button>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mt-2">
            <p className="font-semibold mb-1">⚠️ File Transcription Limitation:</p>
            <p>Web Speech API requires microphone input. For best results, use "Start Recording" for live transcription. File transcription may not work reliably as it depends on your system's audio routing.</p>
          </div>
        </div>
      )}

      {/* Transcription Result */}
      {(displayText || isRecording || isProcessing) && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isRecording ? 'Live Transcription' : isProcessing ? 'Transcribing...' : 'Transcription Result'}
            </h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="rounded"
                />
                Show timestamps
              </label>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
            {displayText ? (
              <div className="space-y-2">
                {showTimestamps && transcriptionSegments.length > 0 ? (
                  transcriptionSegments.map((seg, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        [{formatTime((seg.timestamp - (transcriptionSegments[0]?.timestamp || 0)) / 1000)}]
                      </span>{' '}
                      <span className="text-gray-900 dark:text-gray-100">{seg.text}</span>
                      {seg.confidence && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          ({Math.round(seg.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {transcription}
                    {interimTranscription && (
                      <span className="text-gray-500 italic">{interimTranscription}</span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {isProcessing ? 'Processing audio...' : 'Listening...'}
              </p>
            )}
          </div>
          {transcription && !isRecording && !isProcessing && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} className="flex items-center gap-2">
                📋 Copy to Clipboard
              </Button>
              <Button onClick={downloadTranscription} className="flex items-center gap-2">
                💾 Download as Text
              </Button>
              <Button
                onClick={() => {
                  setTranscription('');
                  setInterimTranscription('');
                  setTranscriptionSegments([]);
                }}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
              >
                🗑️ Clear
              </Button>
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
          <li>• Select your preferred language from the dropdown</li>
          <li>• <strong>Recommended:</strong> Click "Start Recording" for live transcription (requires microphone permission) - This works best!</li>
          <li>• Or upload an audio file and click "Transcribe Audio" (may have limitations)</li>
          <li>• Audio playback is muted during file transcription</li>
          <li>• View transcription with optional timestamps and confidence scores</li>
          <li>• Export transcription as text file or copy to clipboard</li>
          <li>• Works best with clear audio and minimal background noise</li>
          <li>• <strong>Note:</strong> Web Speech API works best with live microphone input. File transcription depends on system audio routing.</li>
        </ul>
      </div>
    </div>
  );
}
