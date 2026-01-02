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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#ocrGradient)" stroke="#14b8a6" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="monospace" font-size="7" font-weight="bold" fill="#ffffff">ABC</text><text x="12" y="17" text-anchor="middle" font-family="monospace" font-size="3" fill="#ffffff">123</text><circle cx="8" cy="8" r="1" fill="#ffffff"/><circle cx="16" cy="16" r="1" fill="#ffffff"/><defs><linearGradient id="ocrGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#14b8a6"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-pixel-sorter',
    title: 'Image Pixel Sorter',
    description: 'Glitch art via pixel sorting.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#pixelGradient)" stroke="#65a30d" stroke-width="1.5"/><rect x="4" y="5" width="4" height="4" fill="#ffffff"/><rect x="8" y="5" width="4" height="4" fill="#dc2626"/><rect x="12" y="5" width="4" height="4" fill="#2563eb"/><rect x="16" y="5" width="4" height="4" fill="#7c3aed"/><rect x="4" y="9" width="4" height="4" fill="#16a34a"/><rect x="8" y="9" width="4" height="4" fill="#ea580c"/><rect x="12" y="9" width="4" height="4" fill="#0891b2"/><rect x="16" y="9" width="4" height="4" fill="#be185d"/><defs><linearGradient id="pixelGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#65a30d"/><stop offset="100%" style="stop-color:#84cc16"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-puzzle-game',
    title: 'Image Puzzle Game',
    description: 'Shuffle pieces and solve the image puzzle.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="4" fill="url(#puzzleGradient)" stroke="#c026d3" stroke-width="1.5"/><rect x="4" y="4" width="6" height="6" fill="#ffffff"/><rect x="10" y="4" width="6" height="6" fill="#ffffff"/><rect x="4" y="10" width="6" height="6" fill="#ffffff"/><rect x="10" y="10" width="6" height="6" fill="#ffffff"/><path d="M7 7h2v2H7V7zm6 0h2v2h-2V7zM7 13h2v2H7v-2zm6 0h2v2h-2v-2z" fill="#c026d3"/><defs><linearGradient id="puzzleGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#c026d3"/><stop offset="100%" style="stop-color:#db2777"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-format-converter',
    title: 'Format Converter',
    description: 'Convert between image formats.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#convertGradient)" stroke="#0891b2" stroke-width="1.5"/><circle cx="8" cy="9" r="2" fill="#ffffff"/><text x="8" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="3" fill="#0891b2" font-weight="bold">JPG</text><circle cx="16" cy="15" r="2" fill="#ffffff"/><text x="16" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-size="3" fill="#0891b2" font-weight="bold">PNG</text><path d="M10 12l4 4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="convertGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0891b2"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-hidden-message',
    title: 'Hidden Message',
    description: 'Hide and reveal messages in images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#hiddenGradient)" stroke="#dc2626" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><circle cx="18" cy="14" r="1" fill="#dc2626"/><circle cx="19" cy="16" r="1" fill="#dc2626"/><defs><linearGradient id="hiddenGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#dc2626"/><stop offset="100%" style="stop-color:#e11d48"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-anaglyph-3d',
    title: 'Anaglyph 3D',
    description: 'Create 3D anaglyph images from stereo pairs.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#anaglyphGradient)" stroke="#059669" stroke-width="1.5"/><rect x="5" y="6" width="8" height="12" fill="#dc2626"/><rect x="11" y="6" width="8" height="12" fill="#2563eb"/><circle cx="9" cy="12" r="1.5" fill="#ffffff"/><circle cx="15" cy="12" r="1.5" fill="#ffffff"/><defs><linearGradient id="anaglyphGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#059669"/><stop offset="100%" style="stop-color:#10b981"/></linearGradient></defs></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#cartoonGradient)" stroke="#0284c7" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#ffffff"/><circle cx="15" cy="10" r="2" fill="#ffffff"/><path d="M7 14h10" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="10" r="0.5" fill="#0284c7"/><circle cx="15" cy="10" r="0.5" fill="#0284c7"/><path d="M11 15c0 1 1 2 2 2s2-1 2-2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="cartoonGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0284c7"/><stop offset="100%" style="stop-color:#0ea5e9"/></linearGradient></defs></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#upscaleGradient)" stroke="#2563eb" stroke-width="1.5"/><path d="M7 7h10v10H7z" fill="#ffffff"/><path d="M9 9h6v6H9z" fill="#2563eb"/><rect x="5" y="5" width="2" height="2" fill="#ffffff"/><rect x="17" y="5" width="2" height="2" fill="#ffffff"/><rect x="5" y="17" width="2" height="2" fill="#ffffff"/><rect x="17" y="17" width="2" height="2" fill="#ffffff"/><defs><linearGradient id="upscaleGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'watermark-remover',
    title: 'Watermark Remover',
    description: 'Brush blur or clone to clean watermark areas.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#watermarkGradient)" stroke="#dc2626" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><text x="18" y="15" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#dc2626">®</text><defs><linearGradient id="watermarkGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#dc2626"/><stop offset="100%" style="stop-color:#ef4444"/></linearGradient></defs></svg>'
  },
  {
    slug: 'personality-analyzer',
    title: 'Personality Analyzer',
    description: 'Analyze personality traits through handwriting analysis.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#personalityGradient)" stroke="#7c3aed" stroke-width="1.5"/><circle cx="12" cy="9" r="3" fill="#ffffff"/><path d="M8 17h8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="15" r="1" fill="#7c3aed"/><circle cx="14" cy="15" r="1" fill="#7c3aed"/><path d="M9 12c1-1 4-1 5 0" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="personalityGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#a855f7"/></linearGradient></defs></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#moodGradient)" stroke="#db2777" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="9" r="2" fill="#ffffff"/><path d="M7 13h10" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="0.5" fill="#db2777"/><circle cx="15" cy="9" r="0.5" fill="#db2777"/><path d="M11 15c0 1 1 2 2 2s2-1 2-2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#db2777"/><stop offset="100%" style="stop-color:#ec4899"/></linearGradient></defs></svg>'
  },
  {
    slug: 'color-blindness-simulator',
    title: 'Color Blindness Simulator',
    description: 'See how your images appear to people with different color vision deficiencies.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#blindnessGradient)" stroke="#7c3aed" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="#ef4444"/><circle cx="16" cy="8" r="2" fill="#22c55e"/><circle cx="8" cy="16" r="2" fill="#3b82f6"/><circle cx="16" cy="16" r="2" fill="#f59e0b"/><circle cx="12" cy="12" r="3" fill="none" stroke="#ffffff" stroke-width="1.5"/><path d="M9 9l6 6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="blindnessGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-histogram-viewer',
    title: 'Image Histogram Viewer',
    description: 'Analyze color distribution and brightness levels in your images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="3" y="3" width="18" height="18" rx="3" fill="url(#histogramGradient)" stroke="#16a34a" stroke-width="1.5"/><rect x="5" y="12" width="2" height="6" fill="#ffffff"/><rect x="8" y="8" width="2" height="10" fill="#ffffff"/><rect x="11" y="6" width="2" height="12" fill="#ffffff"/><rect x="14" y="10" width="2" height="8" fill="#ffffff"/><rect x="17" y="9" width="2" height="9" fill="#ffffff"/><defs><linearGradient id="histogramGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#16a34a"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#gridGradient)" stroke="#6366f1" stroke-width="1.5"/><rect x="4" y="4" width="6" height="6" fill="#ffffff"/><rect x="10" y="4" width="6" height="6" fill="#ffffff"/><rect x="4" y="10" width="6" height="6" fill="#ffffff"/><rect x="10" y="10" width="6" height="6" fill="#ffffff"/><path d="M7 7h2v2H7V7zm6 0h2v2h-2V7zM7 13h2v2H7v-2zm6 0h2v2h-2v-2z" fill="#6366f1"/><defs><linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'image-size-predictor',
    title: 'Image Size Predictor',
    description: 'Predict compressed file sizes and optimize images for web delivery.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#predictorGradient)" stroke="#ea580c" stroke-width="1.5"/><circle cx="8" cy="9" r="2" fill="#ffffff"/><circle cx="16" cy="9" r="2" fill="#ffffff"/><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><text x="18" y="15" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ea580c">KB</text><circle cx="19" cy="16" r="0.5" fill="#ea580c"/><defs><linearGradient id="predictorGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ea580c"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs></svg>'
  },
  {
    slug: 'infographic-creator',
    title: 'Infographic Creator',
    description: 'Create stunning infographics with charts, text, and background images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#infographicGradient)" stroke="#8b5cf6" stroke-width="1.5"/><rect x="5" y="5" width="6" height="4" fill="#ffffff"/><rect x="13" y="5" width="6" height="4" fill="#ffffff"/><rect x="5" y="11" width="14" height="1" fill="#ffffff"/><rect x="5" y="13" width="10" height="1" fill="#ffffff"/><rect x="5" y="15" width="6" height="1" fill="#ffffff"/><circle cx="7" cy="7" r="1" fill="#8b5cf6"/><circle cx="15" cy="7" r="1" fill="#8b5cf6"/><defs><linearGradient id="infographicGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8b5cf6"/><stop offset="100%" style="stop-color:#a855f7"/></linearGradient></defs></svg>'
  },
  {
    slug: 'perspective-correction',
    title: 'Perspective Correction',
    description: 'Correct tilted horizons and perspective distortion in photos.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#perspectiveGradient)" stroke="#0891b2" stroke-width="1.5"/><path d="M5 5l7 7 7-7v14l-7-7-7 7z" fill="#ffffff"/><circle cx="12" cy="12" r="1" fill="#0891b2"/><defs><linearGradient id="perspectiveGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0891b2"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  },
  {
    slug: 'panorama-stitcher',
    title: 'Panorama Stitcher',
    description: 'Combine multiple overlapping photos into panoramic images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="2" width="20" height="20" rx="3" fill="url(#panoramaGradient)" stroke="#059669" stroke-width="1.5"/><rect x="4" y="6" width="5" height="8" fill="#ffffff"/><rect x="10" y="6" width="5" height="8" fill="#ffffff"/><rect x="16" y="6" width="4" height="8" fill="#ffffff"/><path d="M6 8h1v4H6V8zm6 0h1v4h-1V8zm5 0h1v4h-1V8z" fill="#059669"/><defs><linearGradient id="panoramaGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#059669"/><stop offset="100%" style="stop-color:#10b981"/></linearGradient></defs></svg>'
  },
];
