"use client";

import React, { useEffect, useRef, useState } from "react";

type Algo = "floyd-steinberg" | "ordered";

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export default function ImageDitheringTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [algo, setAlgo] = useState<Algo>("floyd-steinberg");
  const [levels, setLevels] = useState<number>(2); // grayscale levels
  const [error, setError] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    const img = imgRef.current;
    if (!img) return;
    img.onload = () => render();
    img.src = url;
  };

  const toGrayscale = (data: Uint8ClampedArray) => {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      data[i] = data[i + 1] = data[i + 2] = y;
    }
  };

  const floydSteinberg = (imgData: ImageData, levels: number) => {
    const { data, width, height } = imgData;
    // Work on grayscale copy
    const buf = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        buf[y * width + x] = data[i];
      }
    }
    const step = 255 / (levels - 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const old = buf[idx];
        const newVal = Math.round(old / step) * step;
        const err = old - newVal;
        buf[idx] = newVal;
        // Distribute error
        if (x + 1 < width) buf[idx + 1] += (7 / 16) * err;
        if (y + 1 < height) {
          if (x > 0) buf[idx + width - 1] += (3 / 16) * err;
          buf[idx + width] += (5 / 16) * err;
          if (x + 1 < width) buf[idx + width + 1] += (1 / 16) * err;
        }
      }
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const v = Math.max(0, Math.min(255, Math.round(buf[y * width + x])));
        data[i] = data[i + 1] = data[i + 2] = v;
      }
    }
  };

  const orderedDither = (imgData: ImageData, levels: number) => {
    const { data, width, height } = imgData;
    const N = 4;
    const matrixScale = (N * N + 1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = data[i];
        const threshold = ((bayer4[y % N][x % N] + 0.5) / matrixScale) * 255;
        const step = 255 / (levels - 1);
        const adjusted = Math.round((gray + threshold - 127) / step) * step;
        const v = Math.max(0, Math.min(255, adjusted));
        data[i] = data[i + 1] = data[i + 2] = v;
      }
    }
  };

  const render = () => {
    try {
      setError("");
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !img.src) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      toGrayscale(imgData.data);
      const lvl = Math.max(2, levels || 2);
      if (algo === "floyd-steinberg") {
        floydSteinberg(imgData, lvl);
      } else {
        orderedDither(imgData, lvl);
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e: any) {
      console.error("Dithering render error", e);
      setError("Failed to render. Please try a different image or settings.");
    }
  };

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo, levels]);

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "dithered";
    a.download = `${base}-${algo}-${levels}.png`;
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
          <p className="text-xs text-gray-500 mt-1">Processing is client-side via Canvas.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Algorithm</label>
          <select value={algo} onChange={(e) => setAlgo(e.target.value as Algo)} className="input">
            <option value="floyd-steinberg">Floyd–Steinberg</option>
            <option value="ordered">Ordered (Bayer 4×4)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Levels</label>
          <input type="range" min={2} max={8} value={levels} onChange={(e) => setLevels(parseInt(e.target.value, 10))} />
          <div className="text-sm text-gray-600 mt-1">{levels} grayscale levels</div>
        </div>
        <button onClick={onDownload} className="btn">Download PNG</button>
      </div>

      <div className="border rounded p-3 bg-white">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
        <img ref={imgRef} alt="source" style={{ display: "none" }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-sm text-gray-600">Tip: Floyd–Steinberg gives smoother gradients; Ordered produces a classic halftone pattern.</p>
    </div>
  );
}