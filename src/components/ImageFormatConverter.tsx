"use client";
import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type Format = "png" | "jpeg" | "webp";

export default function ImageFormatConverter() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState<number>(90);
  const [resultUrl, setResultUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setResultUrl("");
      return;
    }
    convert();
  }, [imageUrl, format, quality]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const convert = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const type = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
      const q = format === "png" ? undefined : Math.min(1, Math.max(0, quality / 100));
      const dataUrl = canvas.toDataURL(type, q);
      setResultUrl(dataUrl);
    };
    img.src = imageUrl;
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `converted.${format}`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Image Format Converter</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <Button as="label" variant="primary" className="cursor-pointer">
          Choose Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </Button>
        <label className="flex items-center gap-2">
          <span>Format</span>
          <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className="border rounded px-2 py-1">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span>Quality</span>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            disabled={format === "png"}
          />
          <span>{quality}</span>
        </label>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={download} disabled={!resultUrl}>
          Download
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Original</h3>
          {imageUrl ? (
            <img src={imageUrl} alt="Original" className="max-h-80 rounded border" />
          ) : (
            <div className="text-gray-600">Upload an image to convert.</div>
          )}
        </div>
        <div>
          <h3 className="font-medium">Converted</h3>
          {resultUrl ? (
            <img src={resultUrl} alt="Converted" className="max-h-80 rounded border" />
          ) : (
            <div className="text-gray-600">Select format and quality.</div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}