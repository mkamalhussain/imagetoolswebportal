"use client";

import React from "react";
import dynamic from "next/dynamic";

type Props = { slug: string };

const PixelSorter = dynamic(() => import("@/components/ImagePixelSorter"), { ssr: false });
const ExifTool = dynamic(() => import("@/components/ImageExifTool"), { ssr: false });
const GifMaker = dynamic(() => import("@/components/AnimatedGifMaker"), { ssr: false });
const Favicon = dynamic(() => import("@/components/FaviconMaker"), { ssr: false });
const CardMaker = dynamic(() => import("@/components/CustomCardMaker"), { ssr: false });
const AsciiArt = dynamic(() => import("@/components/ImageAsciiArtConverter"), { ssr: false });
const OCRExtractor = dynamic(() => import("@/components/ImageOCRExtractor"), { ssr: false });
const PuzzleGame = dynamic(() => import("@/components/ImagePuzzleGame"), { ssr: false });
const BackgroundChanger = dynamic(() => import("@/components/ImageBackgroundChanger"), { ssr: false });
const FormatConverter = dynamic(() => import("@/components/ImageFormatConverter"), { ssr: false });
const Anaglyph3D = dynamic(() => import("@/components/Anaglyph3D"), { ssr: false });
const ImageResizer = dynamic(() => import("@/components/ImageResizer"), { ssr: false });
const DitheringTool = dynamic(() => import("@/components/ImageDitheringTool"), { ssr: false });
const HiddenMessage = dynamic(() => import("@/components/ImageHiddenMessage"), { ssr: false });
const ImageToCartoon = dynamic(() => import("@/components/ImageToCartoon"), { ssr: false });
const ColorPaletteExtractor = dynamic(() => import("@/components/ColorPaletteExtractor"), { ssr: false });
const ImageUpscaler = dynamic(() => import("@/components/ImageUpscaler"), { ssr: false });
const WatermarkRemover = dynamic(() => import("@/components/WatermarkRemover"), { ssr: false });
const PersonalityAnalyzer = dynamic(() => import("@/components/PersonalityAnalyzer"), { ssr: false });
const QRCodeTool = dynamic(() => import("@/components/QRCodeTool"), { ssr: false });
const ImageMoodAnalyzer = dynamic(() => import("@/components/ImageMoodAnalyzer"), { ssr: false });
const ColorBlindnessSimulator = dynamic(() => import("@/components/ColorBlindnessSimulator"), { ssr: false });
const ImageHistogramViewer = dynamic(() => import("@/components/ImageHistogramViewer"), { ssr: false });
const MemeGenerator = dynamic(() => import("@/components/MemeGenerator"), { ssr: false });

export default function ClientModuleRenderer({ slug }: Props) {
  if (slug === "image-pixel-sorter") {
    return <PixelSorter />;
  }
  if (slug === "image-exif-tool") {
    return <ExifTool />;
  }
  if (slug === "animated-gif-maker") {
    return <GifMaker />;
  }
  if (slug === "favicon-maker") {
    return <Favicon />;
  }
  if (slug === "custom-card-maker") {
    return <CardMaker />;
  }
  if (slug === "image-ascii-art-converter") {
    return <AsciiArt />;
  }
  if (slug === "image-ocr-extractor") {
    return <OCRExtractor />;
  }
  if (slug === "image-puzzle-game") {
    return <PuzzleGame />;
  }
  if (slug === "image-background-changer") {
    return <BackgroundChanger />;
  }
  if (slug === "image-format-converter") {
    return <FormatConverter />;
  }
  if (slug === "image-anaglyph-3d") {
    return <Anaglyph3D />;
  }
  if (slug === "image-resizer") {
    return <ImageResizer />;
  }
  if (slug === "image-dithering-tool") {
    return <DitheringTool />;
  }
  if (slug === "image-hidden-message") {
    return <HiddenMessage />;
  }
  if (slug === "image-to-cartoon") {
    return <ImageToCartoon />;
  }
  if (slug === "color-palette-extractor") {
    return <ColorPaletteExtractor />;
  }
  if (slug === "image-upscaler") {
    return <ImageUpscaler />;
  }
  if (slug === "watermark-remover") {
    return <WatermarkRemover />;
  }
  if (slug === "personality-analyzer") {
    return <PersonalityAnalyzer />;
  }
  if (slug === "qr-code-tool") {
    return <QRCodeTool />;
  }
  if (slug === "image-mood-analyzer") {
    return <ImageMoodAnalyzer />;
  }
  if (slug === "color-blindness-simulator") {
    return <ColorBlindnessSimulator />;
  }
  if (slug === "image-histogram-viewer") {
    return <ImageHistogramViewer />;
  }
  if (slug === "meme-generator") {
    return <MemeGenerator />;
  }
  return <p className="text-gray-700">This module is coming soon.</p>;
}