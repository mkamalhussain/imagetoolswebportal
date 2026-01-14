import Link from "next/link";
import ClientModuleRenderer from "./ClientModuleRenderer";
import { modules } from "@/data/modules";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const module = modules.find(m => m.slug === slug);

  if (!module) {
    return {
      title: "Tool Not Found",
      description: "The requested tool could not be found.",
    };
  }

  // Unique meta descriptions for each tool
  const toolDescriptions: Record<string, string> = {
    'animated-gif-maker': "Convert videos to animated GIFs with custom timing, quality settings, and visual effects. Perfect for social media, tutorials, and creative content. No signup required.",
    'custom-card-maker': "Design professional cards, badges, and certificates with customizable text, colors, and layouts. Perfect for events, awards, and branding materials.",
    'favicon-maker': "Generate professional favicons from images in multiple sizes and formats. Create website icons that work perfectly across all devices and browsers.",
    'image-ascii-art-converter': "Transform images into ASCII art text representations. Create retro-style art, terminal displays, and unique visual effects from your photos.",
    'image-background-changer': "Remove image backgrounds automatically with AI or manually with precision tools. Create transparent PNGs, change backgrounds, or isolate subjects.",
    'image-dithering-tool': "Apply classic dithering algorithms to images for retro gaming aesthetics, pixel art effects, and unique visual styles. Choose from multiple dithering patterns.",
    'image-exif-tool': "View, edit, and manage EXIF metadata in images. Extract location data, camera settings, timestamps, and modify metadata tags professionally.",
    'image-ocr-extractor': "Extract text from images using advanced OCR technology. Convert scanned documents, photos, and screenshots into editable text with high accuracy.",
    'image-pixel-sorter': "Create glitch art by sorting pixels based on brightness, color, or other properties. Generate unique visual effects and artistic distortions.",
    'image-puzzle-game': "Turn images into interactive jigsaw puzzles. Challenge yourself or share puzzles with friends. Adjustable difficulty levels and piece counts.",
    'image-format-converter': "Convert between image formats with advanced options. Transform JPG, PNG, WebP, AVIF, and more while preserving quality and optimizing file sizes.",
    'image-hidden-message': "Hide secret messages in images using steganography or reveal hidden content. Perfect for digital watermarking and secure communications.",
    'image-anaglyph-3d': "Create 3D anaglyph images from stereo pairs for red-cyan 3D viewing. Transform regular photos into immersive 3D experiences.",
    'image-resizer': "Resize images with precise control over dimensions, aspect ratio, and quality. Perfect for web optimization, printing, and social media requirements.",
    'image-to-cartoon': "Transform photos into cartoon-style images with AI-powered conversion. Create fun, artistic versions of your pictures with various cartoon effects.",
    'color-palette-extractor': "Extract dominant colors from images and generate beautiful color palettes. Perfect for design projects, branding, and color inspiration.",
    'image-upscaler': "Enhance image resolution using AI upscaling technology. Increase image size by 2x-4x while maintaining quality and sharpness.",
    'watermark-remover': "Remove unwanted watermarks, logos, and text from images using advanced AI technology. Restore clean, original-looking photos.",
    'personality-analyzer': "Analyze personality traits through handwriting analysis using AI. Discover insights about character, behavior, and psychological tendencies from writing samples.",
    'qr-code-tool': "Generate custom QR codes for URLs, text, and data, or scan existing QR codes from images. Create and read QR codes with full customization options.",
    'image-mood-analyzer': "Analyze the emotional tone and mood conveyed by images using AI. Understand how colors, composition, and lighting affect emotional responses.",
    'color-blindness-simulator': "See how images appear to people with color vision deficiencies. Test accessibility and design for colorblind users across different vision types.",
    'image-histogram-viewer': "Analyze color distribution, brightness levels, and exposure quality through detailed histograms. Professional image analysis for photographers and designers.",
    'meme-generator': "Create viral memes with popular templates and custom text. Add captions, customize styling, and generate shareable content for social media.",
    'image-grid-maker': "Combine multiple images into professional grids and collages. Create uniform layouts with perfect spacing and alignment for portfolios and presentations.",
    'image-size-predictor': "Predict compressed file sizes before processing. Optimize images for web delivery by testing different formats, quality settings, and dimensions.",
    'infographic-creator': "Design stunning infographics with charts, text, and data visualization. Create professional presentations and visual content for marketing and education.",
    'perspective-correction': "Fix tilted horizons and perspective distortion in architectural and landscape photos. Correct converging lines and geometric distortions.",
    'panorama-stitcher': "Combine multiple overlapping photos into seamless panoramic images. Create wide-angle views from multiple shots with professional stitching.",
  };

  const toolKeywords: Record<string, string[]> = {
    'animated-gif-maker': ["gif maker", "animated gif creator", "video to gif", "gif converter online", "custom gif timing", "gif quality settings"],
    'custom-card-maker': ["card maker", "badge creator", "certificate designer", "custom card design", "event cards", "professional cards"],
    'favicon-maker': ["favicon generator", "website icon maker", "favicon creator online", "browser icons", "site favicon", "icon generator"],
    'image-ascii-art-converter': ["ascii art", "text art generator", "image to ascii", "retro art converter", "terminal art", "ascii converter"],
    'image-background-changer': ["background remover", "transparent background", "background changer", "image cutout", "remove background online", "background replacement"],
    'image-dithering-tool': ["image dithering", "pixel art", "retro graphics", "dithering algorithms", "gaming aesthetics", "pixel effects"],
    'image-exif-tool': ["exif data", "metadata viewer", "photo metadata", "exif editor", "image information", "photo details"],
    'image-ocr-extractor': ["ocr online", "text recognition", "image to text", "optical character recognition", "text extraction", "scan to text"],
    'image-pixel-sorter': ["pixel sorting", "glitch art", "pixel manipulation", "datamoshing", "visual effects", "artistic distortion"],
    'image-puzzle-game': ["jigsaw puzzle", "image puzzle", "puzzle maker", "interactive puzzle", "photo puzzle", "brain teaser"],
    'image-format-converter': ["image converter", "format changer", "file converter", "image format", "convert image online", "picture converter"],
    'image-hidden-message': ["steganography", "hidden messages", "digital watermarking", "secret messages", "image encryption", "hidden content"],
    'image-anaglyph-3d': ["3d images", "anaglyph 3d", "red cyan 3d", "3d converter", "stereo images", "3d photos"],
    'image-resizer': ["image resizer", "resize photo", "image dimensions", "photo resizer online", "resize image free", "image scaling"],
    'image-to-cartoon': ["cartoon converter", "photo to cartoon", "cartoon effect", "toon boom", "cartoon filter", "animated style"],
    'color-palette-extractor': ["color palette", "color extractor", "palette generator", "dominant colors", "color picker", "design colors"],
    'image-upscaler': ["image upscaler", "resolution enhancer", "upscale image", "increase resolution", "ai upscaling", "image enlargement"],
    'watermark-remover': ["watermark remover", "remove watermark", "logo remover", "clean image", "watermark removal", "remove text overlay"],
    'personality-analyzer': ["handwriting analysis", "personality test", "character analysis", "psychological analysis", "personality traits", "behavior analysis"],
    'qr-code-tool': ["qr code generator", "qr creator", "qr code maker", "barcode generator", "qr scanner", "qr reader"],
    'image-mood-analyzer': ["mood analyzer", "emotional analysis", "image emotions", "color psychology", "mood detection", "emotional tone"],
    'color-blindness-simulator': ["color blindness", "accessibility testing", "vision simulator", "color deficiency", "design accessibility", "inclusive design"],
    'image-histogram-viewer': ["image histogram", "color distribution", "exposure analysis", "photo analysis", "brightness levels", "color balance"],
    'meme-generator': ["meme maker", "meme creator", "meme generator online", "funny memes", "social media memes", "viral memes"],
    'image-grid-maker': ["image grid", "photo grid", "collage maker", "image collage", "grid layout", "photo arrangement"],
    'image-size-predictor': ["file size calculator", "image compression", "size optimization", "web optimization", "file size predictor", "image optimizer"],
    'infographic-creator': ["infographic maker", "data visualization", "chart creator", "presentation maker", "visual content", "information graphics"],
    'perspective-correction': ["perspective correction", "horizon leveling", "geometric correction", "photo straightening", "architecture correction", "distortion correction"],
    'panorama-stitcher': ["panorama maker", "photo stitching", "wide angle photos", "panoramic images", "360 photos", "image stitching"],
  };

  const description = toolDescriptions[slug] || module.description;
  const additionalKeywords = toolKeywords[slug] || [];

  return {
    title: module.title,
    description,
    keywords: [
      ...additionalKeywords,
      module.title.toLowerCase(),
      "free online tool",
      "image processing",
      slug.replace(/-/g, ' '),
      "online tool",
      "free tool",
      "no signup required",
      "browser based",
      "web tool"
    ],
    openGraph: {
      title: `${module.title} - Free Online Image Tool`,
      description,
      type: 'website',
      url: `https://freetoolbox.app/modules/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${module.title} - Free Online Tool`,
      description,
    },
    alternates: {
      canonical: `https://freetoolbox.app/modules/${slug}`,
    },
  };
}

export default async function ModulePage({ params }: Props) {
  const { slug } = await params;
  const mod = modules.find((m) => m.slug === slug);

  if (!mod) {
    return (
      <main className="min-h-screen">
        <h1 className="text-2xl font-semibold">Module Not Found</h1>
        <p className="text-gray-600 mt-2">The requested module "{slug}" does not exist.</p>
        <Link href="/" className="text-blue-600 mt-4 inline-block">Back to Home</Link>
      </main>
    );
  }

  // Schema markup for SoftwareApplication
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": mod.title,
    "description": mod.description,
    "url": `https://freetoolbox.app/modules/${slug}`,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "FreeToolBox.app",
      "url": "https://freetoolbox.app"
    },
    "featureList": mod.title.toLowerCase().includes('image') ? [
      "Free to use",
      "No signup required",
      "Browser-based processing",
      "High-quality results",
      "Multiple format support"
    ] : [
      "Free online tool",
      "No registration needed",
      "Client-side processing",
      "Professional quality",
      "Web-based application"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <main className="min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {mod.title}
            </h1>
            <p className="text-gray-600 mt-2">{mod.description}</p>
          </div>
          <Link href="/" className="text-blue-600">Back to Home</Link>
        </div>
        <hr className="my-4" />

        <div className="card p-4 mt-6">
          <ClientModuleRenderer slug={slug} />
        </div>
        {/* Sponsored section provided globally in layout */}
      </main>
    </>
  );
}