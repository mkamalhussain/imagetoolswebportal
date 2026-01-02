export interface Module {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const videoModules: Module[] = [
  {
    slug: 'video-trimmer',
    title: 'Short Video Trimmer',
    description: 'Upload videos and trim them using a timeline scrubber with precise start and end controls.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#trimGradient)" stroke="#dc2626" stroke-width="1.5"/><path d="M8 9h8v6H8z" fill="#ffffff"/><path d="M6 6v12l2-2V8l-2-2zM18 6v12l-2-2V8l2-2z" fill="#dc2626"/><circle cx="12" cy="12" r="1" fill="#dc2626"/><defs><linearGradient id="trimGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#dc2626"/><stop offset="100%" style="stop-color:#ef4444"/></linearGradient></defs></svg>'
  },
  {
    slug: 'clip-joiner',
    title: 'Clip Joiner Tool',
    description: 'Upload multiple video clips, arrange their sequence, and merge them with smooth transitions.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#joinGradient)" stroke="#2563eb" stroke-width="1.5"/><rect x="5" y="6" width="5" height="12" fill="#ffffff"/><rect x="12" y="6" width="5" height="12" fill="#ffffff"/><rect x="19" y="6" width="1" height="12" fill="#ffffff"/><path d="M10 9h2v6h-2zm6 0h2v6h-2z" fill="#2563eb"/><path d="M7 12l2-2v4l-2-2zm8 0l-2-2v4l2-2z" fill="#ffffff"/><defs><linearGradient id="joinGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'gif-maker',
    title: 'GIF Maker from Video',
    description: 'Convert video segments to animated GIFs with speed control options and loop settings.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#gifGradient)" stroke="#6366f1" stroke-width="1.5"/><circle cx="8" cy="9" r="1.5" fill="#ffffff"/><circle cx="12" cy="9" r="1.5" fill="#ffffff"/><path d="M6 13h12M6 16h8" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="gifGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'speed-changer',
    title: 'Speed Changer Pro',
    description: 'Adjust video playback speed while preserving audio pitch for natural-sounding results.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#speedGradient)" stroke="#7c3aed" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M12 8v4l2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1" fill="#7c3aed"/><path d="M8 12h8" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'subtitle-burner',
    title: 'Subtitle Burner',
    description: 'Upload videos and SRT subtitle files to permanently embed subtitles into the video.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#subtitleGradient)" stroke="#ea580c" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><text x="18" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ea580c">SRT</text><defs><linearGradient id="subtitleGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ea580c"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs></svg>'
  },
  {
    slug: 'frame-grabber',
    title: 'Frame Grabber',
    description: 'Extract individual frames from videos as high-quality PNG images for thumbnails or analysis.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#frameGradient)" stroke="#14b8a6" stroke-width="1.5"/><rect x="5" y="6" width="5" height="12" fill="#ffffff"/><rect x="12" y="6" width="1" height="12" fill="#ffffff"/><rect x="15" y="6" width="1" height="12" fill="#ffffff"/><rect x="18" y="6" width="1" height="12" fill="#ffffff"/><circle cx="7" cy="9" r="1" fill="#14b8a6"/><circle cx="7" cy="15" r="1" fill="#14b8a6"/><defs><linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#14b8a6"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  },
  {
    slug: 'audio-stripper',
    title: 'Audio Stripper',
    description: 'Extract audio tracks from video files and save them as MP3 for separate use.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#audioStripGradient)" stroke="#db2777" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><path d="M5 13l3-3 3 3v4H8v-1H5v-4zm7 0l3-3 3 3v4h-3v-1h-3v-4z" fill="#ffffff"/><circle cx="7" cy="15" r="1" fill="#db2777"/><circle cx="14" cy="15" r="1" fill="#db2777"/><defs><linearGradient id="audioStripGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#db2777"/><stop offset="100%" style="stop-color:#ec4899"/></linearGradient></defs></svg>'
  }
];
