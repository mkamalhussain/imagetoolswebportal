"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ImageResizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState<number>(0.92);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    const img = imgRef.current;
    if (!img) return;
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setOrigW(w);
      setOrigH(h);
      setWidth(w);
      setHeight(h);
      render();
    };
    img.src = url;
  };

  const render = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || width <= 0 || height <= 0) return;
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const onWidthChange = (val: number) => {
    if (lockAspect && origW > 0 && origH > 0) {
      const ratio = origH / origW;
      setWidth(val);
      setHeight(Math.round(val * ratio));
    } else {
      setWidth(val);
    }
  };

  const onHeightChange = (val: number) => {
    if (lockAspect && origW > 0 && origH > 0) {
      const ratio = origW / origH;
      setHeight(val);
      setWidth(Math.round(val * ratio));
    } else {
      setHeight(val);
    }
  };

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    const url = canvas.toDataURL(mime, quality);
    const a = document.createElement("a");
    a.href = url;
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "resized-image";
    a.download = `${base}-${canvas.width}x${canvas.height}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          <label className="btn btn-primary cursor-pointer">
            Choose Image
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </label>
          {origW > 0 && origH > 0 && (
            <p className="text-xs text-gray-500 mt-1">Original: {origW} × {origH}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Width (px)</label>
          <input
            type="number"
            min={1}
            value={width || 0}
            onChange={(e) => onWidthChange(parseInt(e.target.value || "0", 10))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Height (px)</label>
          <input
            type="number"
            min={1}
            value={height || 0}
            onChange={(e) => onHeightChange(parseInt(e.target.value || "0", 10))}
            className="input"
          />
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} />
          <span className="text-sm">Lock aspect ratio</span>
        </label>
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="input">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quality ({Math.round(quality * 100)}%)</label>
          <input type="range" min={0.1} max={1} step={0.01} value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
        </div>
        <button onClick={onDownload} className="btn">Download</button>
      </div>

      <div className="border rounded p-3 bg-white">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
        <img ref={imgRef} alt="source" style={{ display: "none" }} />
      </div>
    </div>
  );
}