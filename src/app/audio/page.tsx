import type { Metadata } from 'next';
import AudioPageClient from './AudioPageClient';

export const metadata: Metadata = {
  title: 'Audio Tools - Free Online Audio Processing & Editing | FreeToolBox.app',
  description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed/pitch adjustment, multi-track mixing, format conversion, and more. Free online audio tools with no signup required.',
  keywords: [
    // Core audio keywords
    'audio tools online',
    'audio processing free',
    'audio editor web',
    'online audio processor',
    'free audio tools',
    'sound editing online',
    'audio enhancement tools',
    'audio converter online',

    // Tool-specific keywords
    'podcast clip cutter',
    'audio trimmer online',
    'multi track audio mixer',
    'audio mixer web',
    'speed pitch adjuster',
    'tempo changer online',
    'noise cleaner audio',
    'background noise remover',
    'audio denoiser online',
    'waveform generator',
    'audio visualization tool',
    'metadata tag editor',
    'ID3 tag editor online',
    'voice memo transcriber',
    'speech to text converter',
    'audio transcription online',

    // Technical audio terms
    'audio processing algorithms',
    'sound wave manipulation',
    'frequency analysis',
    'audio spectrum analyzer',
    'voice processing tools',
    'music editing online',
    'podcast editing tools',
    'audio mastering online',
    'sound design tools',
    'audio effects processor',

    // Popular audio searches
    'remove noise from audio',
    'change audio speed online',
    'mix audio tracks free',
    'cut audio file online',
    'convert audio format',
    'transcribe voice recording',
    'edit podcast audio',
    'clean up audio recording',
    'adjust pitch of voice',
    'generate audio waveform',

    // Long-tail keywords
    'free online audio editing tools',
    'web based audio processor',
    'browser audio editor',
    'audio manipulation software free',
    'sound processing tools online',
    'voice enhancement tools',
    'music production tools free',
    'audio post production',
    'sound editing web app',
    'audio file converter online',

    // Industry-specific
    'podcasting tools free',
    'music production online',
    'audio engineering tools',
    'sound design software',
    'voice over tools',
    'audio mixing web app',
    'recording studio online',
    'audio mastering free tools'
  ],
  openGraph: {
    title: 'Audio Tools - Free Online Audio Processing & Editing',
    description: 'Professional audio tools for processing, editing, and enhancing audio files. Noise removal, speed adjustment, format conversion, and more.',
    type: 'website',
    url: 'https://freetools.com/audio',
  },
  twitter: {
    card: 'summary',
    title: 'Audio Tools - Free Online Audio Processing',
    description: 'Professional audio tools for processing and editing audio files.',
  },
  alternates: {
    canonical: 'https://freetools.com/audio',
  },
};

export default function AudioPage() {
  return <AudioPageClient />;
}
