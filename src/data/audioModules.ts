export interface Module {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const audioModules: Module[] = [
  {
    slug: 'podcast-clip-cutter',
    title: 'Podcast Clip Cutter',
    description: 'Upload audio files and trim them by selecting start and end times. Perfect for creating podcast clips.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#podcastGradient)" stroke="#16a34a" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><rect x="6" y="15" width="8" height="1" fill="#ffffff"/><path d="M18 14v4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="16" r="1" fill="#16a34a"/><defs><linearGradient id="podcastGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#16a34a"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs></svg>'
  },
  {
    slug: 'multi-track-mixer',
    title: 'Multi-Track Mixer',
    description: 'Upload multiple audio tracks, adjust volumes and panning, then merge them into a single file.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#mixerGradient)" stroke="#2563eb" stroke-width="1.5"/><rect x="5" y="6" width="4" height="8" fill="#ffffff"/><rect x="10" y="8" width="4" height="6" fill="#ffffff"/><rect x="15" y="5" width="4" height="10" fill="#ffffff"/><circle cx="7" cy="8" r="1" fill="#2563eb"/><circle cx="12" cy="10" r="1" fill="#2563eb"/><circle cx="17" cy="7" r="1" fill="#2563eb"/><defs><linearGradient id="mixerGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'speed-pitch-adjuster',
    title: 'Speed/Pitch Adjuster',
    description: 'Adjust audio speed (0.5x to 2x) and pitch independently using advanced audio processing.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#speedGradient)" stroke="#7c3aed" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M12 8v4l2 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1" fill="#7c3aed"/><path d="M8 12h8" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'noise-cleaner',
    title: 'Noise Cleaner Tool',
    description: 'Upload audio files and automatically remove background noise with before/after comparison.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#noiseGradient)" stroke="#ea580c" stroke-width="1.5"/><path d="M6 8h12M6 11h10M6 14h8M6 17h6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><circle cx="18" cy="12" r="2" fill="none" stroke="#ea580c" stroke-width="2"/><path d="M16 12h4" stroke="#ea580c" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="noiseGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ea580c"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs></svg>'
  },
  {
    slug: 'waveform-generator',
    title: 'Waveform Generator',
    description: 'Upload audio files and generate visual waveform images in PNG format for thumbnails and previews.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#waveformGradient)" stroke="#14b8a6" stroke-width="1.5"/><path d="M5 15l2-4l2 6l2-8l2 4l2-2l2 5l2-3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="18" cy="9" r="1.5" fill="#14b8a6"/><circle cx="6" cy="9" r="1.5" fill="#14b8a6"/><defs><linearGradient id="waveformGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#14b8a6"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  },
  {
    slug: 'tag-editor-pro',
    title: 'Tag Editor Pro',
    description: 'View and edit ID3 metadata tags in audio files. Update artist, title, album, and other information.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#tagGradient)" stroke="#6366f1" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><rect x="6" y="15" width="8" height="1" fill="#ffffff"/><text x="18" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#6366f1">ID3</text><defs><linearGradient id="tagGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'voice-memo-transcriber',
    title: 'Voice Memo Transcriber',
    description: 'Record or upload short audio clips and get them transcribed to text using speech recognition.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#voiceGradient)" stroke="#db2777" stroke-width="1.5"/><circle cx="12" cy="11" r="3" fill="#ffffff"/><path d="M9 11a3 3 0 016 0" stroke="#db2777" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="9" r="0.5" fill="#db2777"/><circle cx="14" cy="9" r="0.5" fill="#db2777"/><rect x="8" y="15" width="8" height="1" fill="#ffffff"/><rect x="10" y="17" width="4" height="1" fill="#ffffff"/><circle cx="18" cy="9" r="1.5" fill="#db2777"/><defs><linearGradient id="voiceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#db2777"/><stop offset="100%" style="stop-color:#ec4899"/></linearGradient></defs></svg>'
  }
];
