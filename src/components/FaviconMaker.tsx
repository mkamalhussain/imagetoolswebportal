"use client";

import React, { useRef, useState } from "react";

export default function FaviconMaker() {
  const [size, setSize] = useState<number>(32);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      const cnv = canvasRef.current!;
      cnv.width = size;
      cnv.height = size;
      const ctx = cnv.getContext("2d")!;
      ctx.clearRect(0, 0, size, size);
      // Fit image into square
      const ratio = Math.min(size / img.width, size / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (size - w) / 2;
      const y = (size - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };
    img.src = url;
  }

  function download() {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const a = document.createElement("a");
    a.href = cnv.toDataURL("image/png");
    a.download = `favicon-${size}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={onFile} />
        <label className="flex items-center gap-2">
          <span>Size</span>
          <select value={size} onChange={(e) => setSize(parseInt(e.target.value))}>
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
          </select>
        </label>
        <button className="border px-3 py-1 rounded" disabled={!previewUrl} onClick={download}>Download PNG</button>
      </div>
      <div className="rounded border p-4 inline-block">
        <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: "crisp-edges" }} />
      </div>
      {previewUrl && (
        <div className="text-sm text-gray-600">Rendered from selected image at {size}×{size}px.</div>
      )}
    </div>
  );
}