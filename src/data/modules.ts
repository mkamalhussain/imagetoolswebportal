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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM10.5 19.5h.002v.002H10.5V19.5zm3.75-5.25h.002v.002H14.25V14.25zm-2.25-4.5h.002v.002H12V9.75z" /></svg>'
  },
  {
    slug: 'custom-card-maker',
    title: 'Custom Card Maker',
    description: 'Design simple cards and badges.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3-3m0 0l3 3m-3-3v6m-9-6h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" /></svg>'
  },
  {
    slug: 'favicon-maker',
    title: 'Favicon Maker',
    description: 'Generate favicons from images.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-500"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21h7.5A2.25 2.25 0 0020.25 18V6.75A2.25 2.25 0 0018 4.5H5.25A2.25 2.25 0 003 6.75v10.5a2.25 2.25 0 002.25 2.25H10.5m-6 3V6.75m0 13.5V6.75" /></svg>'
  },
  {
    slug: 'image-ascii-art-converter',
    title: 'ASCII Art Converter',
    description: 'Convert images to ASCII art.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-500"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L21 10.5m0 0l-3.75 3.75M21 10.5H12m0 0L9.75 8.25m0 0L6 12m3.75-3.75V21m-3.75 0V3" /></svg>'
  },
  {
    slug: 'image-background-changer',
    title: 'Background Changer',
    description: 'Change or remove image backgrounds.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-yellow-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM10.5 19.5h.002v.002H10.5V19.5zm3.75-5.25h.002v.002H14.25V14.25zm-2.25-4.5h.002v.002H12V9.75z" /></svg>'
  },
  {
    slug: 'image-dithering-tool',
    title: 'Image Dithering Tool',
    description: 'Apply grayscale and color dithering algorithms.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-purple-500"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75L12 12m0 0l9.75 3.75M12 12V2.25m0 9.75l-9.75 3.75M12 12v9.75m0-9.75l9.75-3.75M12 12l-9.75-3.75" /></svg>'
  },
  {
    slug: 'image-exif-tool',
    title: 'Image EXIF Tool',
    description: 'View and edit EXIF metadata.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-orange-500"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063 0l.041.02m-.172 6.636l1.024.07c1.173.047 2.33-.213 3.367-.94a3.75 3.75 0 00.494-4.496 3.75 3.75 0 00-1.635-3.413 3.75 3.75 0 00-4.707-.318c-.281.192-.601.402-.932.592-.584.331-1.248.599-1.929.754a.75.75 0 01-.754-.122L5.25 12m10.626 8.585l.957-1.134c1.254-1.488 1.838-3.216 1.838-5.118 0-3.078-1.58-5.5-4.286-5.5S9 9.384 9 12.462c0 1.693.494 3.284 1.368 4.606l.872 1.186a3 3 0 00.318 3.32l.142.205z" /></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-amber-500"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75L12 12m0 0l8.25 8.25M12 12L3.75 20.25M12 12l8.25-8.25M12 12H2.25m9.75 0h9.75m-9.75 0V2.25m0 9.75v9.75" /></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.584A6.737 6.737 0 0112 15.75c2.471 0 4.711.906 6.366 2.29a.75.75 0 001.012-.236l.22-.366M4.5 19.5h15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-600"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5C4.254 10.5 3.75 9.996 3.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5c-.621 0-1.125-.504-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5C14.004 10.5 13.5 9.996 13.5 9.375v-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.0075v.0075H6.75V6.75zm0 5.25h.0075v.0075H6.75V12zm5.25-5.25h.0075v.0075H12V6.75zm0 5.25h.0075v.0075H12V12zm5.25-5.25h.0075v.0075H17.25V6.75zm0 5.25h.0075v.0075H17.25V12z" /></svg>'
  },
];
