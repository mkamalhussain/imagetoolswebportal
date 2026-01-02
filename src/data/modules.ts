export type ModuleDef = {
  slug: string;
  title: string;
  description: string;
  icon?: string; // SVG string for the icon
};

export const modules: ModuleDef[] = [
  {
    slug: 'animated-gif-maker',
    title: 'Animated GIF Maker',
    description: 'Create GIFs from images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#gifGradient)" stroke="#6366f1" stroke-width="1.5"/><circle cx="8" cy="9" r="1.5" fill="#ffffff"/><circle cx="12" cy="9" r="1.5" fill="#ffffff"/><path d="M6 13h12M6 16h8" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="gifGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'custom-card-maker',
    title: 'Custom Card Maker',
    description: 'Design simple cards and badges.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="4" width="18" height="16" rx="2" fill="url(#cardGradient)" stroke="#dc2626" stroke-width="1.5"/><rect x="6" y="8" width="12" height="8" rx="1" fill="#ffffff" opacity="0.9"/><circle cx="9" cy="12" r="1" fill="#dc2626"/><circle cx="12" cy="12" r="1" fill="#dc2626"/><path d="M7 15h10" stroke="#dc2626" stroke-width="1" stroke-linecap="round"/><defs><linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#dc2626"/><stop offset="100%" style="stop-color:#ef4444"/></linearGradient></defs></svg>'
  },
  {
    slug: 'favicon-maker',
    title: 'Favicon Maker',
    description: 'Generate favicons from images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#faviconGradient)" stroke="#16a34a" stroke-width="1.5"/><circle cx="9" cy="9" r="1.5" fill="#ffffff"/><circle cx="15" cy="9" r="1.5" fill="#ffffff"/><rect x="7" y="13" width="10" height="1" fill="#ffffff"/><rect x="7" y="15" width="6" height="1" fill="#ffffff"/><defs><linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#16a34a"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-ascii-art-converter',
    title: 'ASCII Art Converter',
    description: 'Convert images to ASCII art.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="2" fill="url(#asciiGradient)" stroke="#2563eb" stroke-width="1.5"/><text x="12" y="10" text-anchor="middle" font-family="monospace" font-size="6" fill="#ffffff">TXT</text><text x="12" y="16" text-anchor="middle" font-family="monospace" font-size="4" fill="#ffffff">###</text><defs><linearGradient id="asciiGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-background-changer',
    title: 'Background Changer',
    description: 'Change or remove image backgrounds.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#bgGradient)" stroke="#d97706" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="none" stroke="#ffffff" stroke-width="1.5"/><circle cx="16" cy="8" r="2" fill="none" stroke="#ffffff" stroke-width="1.5"/><rect x="5" y="13" width="14" height="6" rx="1" fill="none" stroke="#ffffff" stroke-width="1.5"/><defs><linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d97706"/><stop offset="100%" style="stop-color:#f59e0b"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-dithering-tool',
    title: 'Image Dithering Tool',
    description: 'Apply grayscale and color dithering algorithms.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="2" fill="url(#ditherGradient)" stroke="#7c3aed" stroke-width="1.5"/><path d="M6 6h2v2H6V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM6 10h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 14h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="#ffffff"/><defs><linearGradient id="ditherGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-exif-tool',
    title: 'Image EXIF Tool',
    description: 'View and edit EXIF metadata.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#exifGradient)" stroke="#ea580c" stroke-width="1.5"/><circle cx="9" cy="9" r="1.5" fill="#ffffff"/><circle cx="15" cy="9" r="1.5" fill="#ffffff"/><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><rect x="6" y="15" width="8" height="1" fill="#ffffff"/><circle cx="18" cy="15" r="0.5" fill="#ffffff"/><defs><linearGradient id="exifGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ea580c"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-ocr-extractor',
    title: 'Image OCR Extractor',
    description: 'Extract text from images using OCR.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-teal-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 4.5v15m7.5-15v15m-4.5-15h.008v.008H12V4.5zm0 3h.008v.008H12V7.5zm0 3h.008v.008H12v10.5zm0 3h.008v.008H12V13.5zm0 3h.008v.008H12V16.5z" /></svg>'
  },
  {
    slug: 'image-pixel-sorter',
    title: 'Image Pixel Sorter',
    description: 'Glitch art via pixel sorting.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-lime-500"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9H12m-8.25 4.5h7.5M3.75 18H12m3-6l2.25 2.25L21 12m0 0l-2.25-2.25L15 12m-3 6l2.25 2.25L21 18m0 0l-2.25-2.25L15 18" /></svg>'
  },
  {
    slug: 'image-puzzle-game',
    title: 'Image Puzzle Game',
    description: 'Shuffle pieces and solve the image puzzle.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-fuchsia-500"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.507 8.591A2.25 2.25 0 003 10.5v8.25c0 .414.336.75.75.75h9.75v-1.5a1.5 1.5 0 011.5-1.5H21a.75.75 0 00.75-.75V7.636a1.5 1.5 0 00-1.5-1.5H15.75c-.21 0-.422-.015-.632-.044A5.94 5.94 0 0112 5.25c-1.805 0-3.486.685-4.747 1.802A2.25 2.25 0 004.507 8.591z" /></svg>'
  },
  {
    slug: 'image-format-converter',
    title: 'Format Converter',
    description: 'Convert between image formats.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-cyan-500"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-4.5 0L21 7.5m0 0L16.5 3M21 7.5H3" /></svg>'
  },
  {
    slug: 'image-hidden-message',
    title: 'Hidden Message',
    description: 'Hide and reveal messages in images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-rose-500"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
  },
  {
    slug: 'image-anaglyph-3d',
    title: 'Anaglyph 3D',
    description: 'Create 3D anaglyph images from stereo pairs.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-emerald-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3m-6-12l-3-3m0 0l-3 3" /></svg>'
  },
  {
    slug: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize images quickly.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="4" y="4" width="16" height="16" rx="2" fill="url(#resizeGradient)" stroke="#d97706" stroke-width="1.5"/><path d="M8 8h8v8H8z" fill="none" stroke="#ffffff" stroke-width="1"/><path d="M6 6l1.5 1.5M18 6l-1.5 1.5M6 18l1.5-1.5M18 18l-1.5-1.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="resizeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d97706"/><stop offset="100%" style="stop-color:#f59e0b"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-to-cartoon',
    title: 'Image to Cartoon',
    description: 'Cartoonify your images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-sky-500"><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182A4.5 4.5 0 0118 10.5c0-1.554-.627-2.968-1.638-4.032M13.5 16.5v1.5c0 1.24-.775 2.306-1.875 2.75M9.75 16.5V18a2.25 2.0 0 002.25 2.25H12M9 16.5A.75.75 0 019.75 17.25h.75M12 10.5h.008v.008H12V10.5zm6.375 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.965 6.223A2.25 2.25 0 0115 18h-.008v-.008H15V18z" /></svg>'
  },
  {
    slug: 'color-palette-extractor',
    title: 'Color Palette Extractor',
    description: 'Extract dominant colors and copy hex codes.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#paletteGradient)" stroke="#6366f1" stroke-width="1.5"/><rect x="5" y="5" width="4" height="4" fill="#ef4444"/><rect x="9" y="5" width="4" height="4" fill="#22c55e"/><rect x="13" y="5" width="4" height="4" fill="#3b82f6"/><rect x="17" y="5" width="2" height="4" fill="#f59e0b"/><rect x="5" y="9" width="4" height="4" fill="#8b5cf6"/><rect x="9" y="9" width="4" height="4" fill="#ec4899"/><rect x="13" y="9" width="4" height="4" fill="#06b6d4"/><defs><linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-upscaler',
    title: 'Image Upscaler',
    description: 'Upscale images by 2x–4x with multiple methods.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-600"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75l16.5 16.5m-16.5 0V3.75m0 16.5h16.5" /></svg>'
  },
  {
    slug: 'watermark-remover',
    title: 'Watermark Remover',
    description: 'Brush blur or clone to clean watermark areas.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-red-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9 4.5v15m7.5-15v15m-4.5-15h.008v.008H12V4.5zm0 3h.008v.008H12V7.5zm0 3h.008v.008H12v10.5zm0 3h.008v.008H12V13.5zm0 3h.008v.008H12V16.5z" /></svg>'
  },
  {
    slug: 'personality-analyzer',
    title: 'Personality Analyzer',
    description: 'Analyze personality traits through handwriting analysis.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-purple-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
  },
  {
    slug: 'qr-code-tool',
    title: 'QR Code Tool',
    description: 'Generate QR codes or scan QR codes from images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="2" fill="url(#qrGradient)" stroke="#16a34a" stroke-width="1.5"/><rect x="5" y="5" width="6" height="6" fill="#ffffff"/><rect x="13" y="5" width="6" height="6" fill="#ffffff"/><rect x="5" y="13" width="6" height="6" fill="#ffffff"/><rect x="7" y="7" width="2" height="2" fill="#16a34a"/><rect x="15" y="7" width="2" height="2" fill="#16a34a"/><rect x="7" y="15" width="2" height="2" fill="#16a34a"/><defs><linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#16a34a"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-mood-analyzer',
    title: 'Image Mood Analyzer',
    description: 'Discover the emotional vibe of your images with AI-powered mood analysis.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-pink-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567l-1.43-.742a10.394 10.394 0 003.587-5.621c.14-.344-.357-.676-.676-.5a9.424 9.424 0 01-4.861 2.923c.23.823.444 1.445.75 1.71a7.424 7.424 0 001.865-1.545z" /></svg>'
  },
  {
    slug: 'color-blindness-simulator',
    title: 'Color Blindness Simulator',
    description: 'See how your images appear to people with different color vision deficiencies.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-purple-500"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
  },
  {
    slug: 'image-histogram-viewer',
    title: 'Image Histogram Viewer',
    description: 'Analyze color distribution and brightness levels in your images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
  },
  {
    slug: 'meme-generator',
    title: 'Meme Generator',
    description: 'Create hilarious memes with popular templates and custom text.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="4" width="18" height="16" rx="3" fill="url(#memeGradient)" stroke="#d97706" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#ffffff"/><circle cx="15" cy="10" r="2" fill="#ffffff"/><path d="M7 14h10" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="3" font-weight="bold" fill="#ffffff">LOL</text><defs><linearGradient id="memeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d97706"/><stop offset="100%" style="stop-color:#f59e0b"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-grid-maker',
    title: 'Image Grid Maker',
    description: 'Create perfect image grids and collages with uniform cell sizes.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-500"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>'
  },
  {
    slug: 'image-size-predictor',
    title: 'Image Size Predictor',
    description: 'Predict compressed file sizes and optimize images for web delivery.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-orange-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3-3m0 0l3 3m-3-3v6m-9-6h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" /></svg>'
  },
  {
    slug: 'infographic-creator',
    title: 'Infographic Creator',
    description: 'Create stunning infographics with charts, text, and background images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-violet-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h3.75m0 0h3.75m0 0h3.75m0 0H19.875c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H16.5m0 0H12m0 0H8.25m0 0H4.875" /></svg>'
  },
  {
    slug: 'perspective-correction',
    title: 'Perspective Correction',
    description: 'Correct tilted horizons and perspective distortion in photos.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-cyan-500"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75L12 12m0 0l8.25 8.25M12 12L3.75 20.25M12 12l8.25-8.25M12 12H2.25m9.75 0h9.75m-9.75 0V2.25m0 9.75v9.75" /></svg>'
  },
  {
    slug: 'panorama-stitcher',
    title: 'Panorama Stitcher',
    description: 'Combine multiple overlapping photos into panoramic images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-emerald-500"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38 1.054.106 2.259.734 3.106.484.659 1.002 1.052 1.492 1.291.37.145.504.188.6.215.126.034.41.063.918.063.5 0 .796-.03.918-.063.096-.027.23-.07.6-.215.49-.239 1.008-.632 1.492-1.291.628-.847 1.114-2.052.734-3.106a2.31 2.31 0 00-1.641-1.055c-.91-.064-1.35.694-2.42 1.061a7.19 7.19 0 01-1.703 0c-1.07-.367-1.51-1.125-2.42-1.061z" /><path stroke-linecap="round" stroke-linejoin="round" d="M14.505 6.175a2.31 2.31 0 001.641 1.055c.91.064 1.35-.694 2.42-1.061a7.19 7.19 0 011.703 0c1.07.367 1.51 1.125 2.42 1.061a2.31 2.31 0 001.641-1.055M9.75 12l2.25 6 6-6-6-6-2.25 6z" /></svg>'
  },
];
