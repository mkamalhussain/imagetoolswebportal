export type ModuleDef = {
  slug: string;
  title: string;
  description: string;
};

export const modules: ModuleDef[] = [
  { slug: 'animated-gif-maker', title: 'Animated GIF Maker', description: 'Create GIFs from images.' },
  { slug: 'custom-card-maker', title: 'Custom Card Maker', description: 'Design simple cards and badges.' },
  { slug: 'favicon-maker', title: 'Favicon Maker', description: 'Generate favicons from images.' },
  { slug: 'image-ascii-art-converter', title: 'ASCII Art Converter', description: 'Convert images to ASCII art.' },
  { slug: 'image-background-changer', title: 'Background Changer', description: 'Change or remove image backgrounds.' },
  { slug: 'image-dithering-tool', title: 'Image Dithering Tool', description: 'Apply grayscale and color dithering algorithms.' },
  { slug: 'image-exif-tool', title: 'Image EXIF Tool', description: 'View and edit EXIF metadata.' },
  { slug: 'image-ocr-extractor', title: 'Image OCR Extractor', description: 'Extract text from images using OCR.' },
  { slug: 'image-pixel-sorter', title: 'Image Pixel Sorter', description: 'Glitch art via pixel sorting.' },
  { slug: 'image-puzzle-game', title: 'Image Puzzle Game', description: 'Shuffle pieces and solve the image puzzle.' },
  { slug: 'image-format-converter', title: 'Format Converter', description: 'Convert between image formats.' },
  { slug: 'image-hidden-message', title: 'Hidden Message', description: 'Hide and reveal messages in images.' },
  { slug: 'image-anaglyph-3d', title: 'Anaglyph 3D', description: 'Create 3D anaglyph images from stereo pairs.' },
  { slug: 'image-resizer', title: 'Image Resizer', description: 'Resize images quickly.' },
  { slug: 'image-to-cartoon', title: 'Image to Cartoon', description: 'Cartoonify your images.' },
  { slug: 'color-palette-extractor', title: 'Color Palette Extractor', description: 'Extract dominant colors and copy hex codes.' },
  { slug: 'image-upscaler', title: 'Image Upscaler', description: 'Upscale images by 2x–4x with multiple methods.' },
  { slug: 'watermark-remover', title: 'Watermark Remover', description: 'Brush blur or clone to clean watermark areas.' },
];