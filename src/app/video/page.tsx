import type { Metadata } from 'next';
import VideoPageClient from './VideoPageClient';

export const metadata: Metadata = {
  title: 'Video Tools',
  description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, speed adjustment, and more. Free online video tools with no signup required.',
  keywords: [
    // Core video keywords
    'video tools online',
    'video processing free',
    'video editor web',
    'online video processor',
    'free video tools',
    'video editing online',
    'video manipulation tools',
    'video converter online',

    // Tool-specific keywords
    'video trimmer online',
    'clip cutter free',
    'video clip joiner',
    'video merger online',
    'GIF maker from video',
    'animated GIF creator',
    'video to GIF converter',
    'speed changer pro',
    'video speed control',
    'tempo adjuster video',
    'subtitle burner online',
    'SRT to video converter',
    'add subtitles to video',
    'frame grabber tool',
    'video thumbnail extractor',
    'extract frames from video',
    'audio stripper video',
    'video to audio converter',
    'extract audio from video',

    // Technical video terms
    'video processing algorithms',
    'video compression tools',
    'format conversion video',
    'video encoding online',
    'subtitle embedding',
    'video timeline editor',
    'frame extraction tool',
    'video analysis tools',
    'media processing online',

    // Popular video searches
    'trim video online free',
    'cut video clip online',
    'merge video files',
    'join video clips',
    'create GIF from video',
    'make animated GIF online',
    'change video speed',
    'slow motion video online',
    'add subtitles to video free',
    'burn subtitles into video',
    'extract frames from video',
    'get video thumbnail',
    'convert video to audio',
    'remove audio from video',

    // Long-tail keywords
    'free online video editing tools',
    'web based video processor',
    'browser video editor',
    'video manipulation software free',
    'video processing tools online',
    'video enhancement tools',
    'video conversion web app',
    'video editing free no download',
    'online video cutter',
    'video trimming web tool',
    'GIF creation from video',
    'video speed adjustment online',

    // Industry-specific
    'video production tools free',
    'video editing software online',
    'content creation video tools',
    'social media video tools',
    'video post production online',
    'multimedia editing tools',
    'video processing web app',
    'creative video tools free'
  ],
  openGraph: {
    title: 'Video Tools - Free Online Video Processing & Editing',
    description: 'Professional video tools for processing, editing, and enhancing video files. Trimming, format conversion, GIF creation, subtitle burning, and more.',
    type: 'website',
    url: 'https://freetools.com/video',
  },
  twitter: {
    card: 'summary',
    title: 'Video Tools - Free Online Video Processing',
    description: 'Professional video tools for processing and editing video files.',
  },
  alternates: {
    canonical: 'https://freetools.com/video',
  },
};

export default function VideoPage() {
  return <VideoPageClient />;
}
