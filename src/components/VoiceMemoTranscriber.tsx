"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export default function VoiceMemoTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscription(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error: ' + event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Web Speech API not supported in this browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }
    setSelectedFile(file);
    setTranscription('');
    setError(null);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
        setSelectedFile(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');

      if (recognition) {
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
      recognition.stop();
    }

    setIsRecording(false);
  };

  const transcribeFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setTranscription('');

    try {
      // TODO: Implement file transcription using Web Speech API or external service
      // For now, simulate transcription
      await new Promise(resolve => setTimeout(resolve, 3000));

      setTranscription('This is a simulated transcription of the audio file. In a real implementation, this would use speech recognition to convert the audio content to text.');

    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Voice Memo Transcriber</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record or upload short audio clips and get them transcribed to text using speech recognition.
        </p>
      </div>

      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex items-center gap-2">
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
          htmlFor={fileInputRef.current?.id}
          className="cursor-pointer"
        >
          Choose Audio File
        </Button>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Transcribe Button */}
      {selectedFile && !isRecording && (
        <div className="mb-6">
          <Button
            onClick={transcribeFile}
            disabled={isProcessing}
            className="w-full md:w-auto"
          >
            {isProcessing ? 'Transcribing...' : 'Transcribe Audio'}
          </Button>
        </div>
      )}

      {/* Transcription Result */}
      {(transcription || isRecording) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isRecording ? 'Live Transcription' : 'Transcription Result'}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[100px]">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {transcription || 'Listening...'}
            </p>
          </div>
          {transcription && !isRecording && (
            <div className="mt-4">
              <Button onClick={() => navigator.clipboard.writeText(transcription)}>
                Copy to Clipboard
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
          <li>• Click "Start Recording" to record live audio (requires microphone permission)</li>
          <li>• Or upload an existing audio file</li>
          <li>• Click "Transcribe Audio" to convert speech to text</li>
          <li>• Live transcription shows results in real-time while recording</li>
          <li>• Copy the transcribed text to use elsewhere</li>
        </ul>
      </div>
    </div>
  );
}
