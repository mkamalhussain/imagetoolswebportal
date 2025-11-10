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
  return <p className="text-gray-700">This module is coming soon.</p>;
}