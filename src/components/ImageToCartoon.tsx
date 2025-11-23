"use client";

import React, { useEffect, useRef, useState } from "react";

function clamp(v: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

export default function ImageToCartoon() {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [levels, setLevels] = useState<number>(6);
  const [edgeThreshold, setEdgeThreshold] = useState<number>(40);
  const [blurRadius, setBlurRadius] = useState<number>(2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    await drawImage(url);
    runCartoon();
  };

  const drawImage = async (url: string) => new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  const boxBlur = (data: Uint8ClampedArray, w: number, h: number, r: number) => {
    if (r <= 0) return data;
    const out = new Uint8ClampedArray(data.length);
    const kernelSize = (2 * r + 1) ** 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rs = 0, gs = 0, bs = 0;
        for (let ky = -r; ky <= r; ky++) {
          for (let kx = -r; kx <= r; kx++) {
            const px = Math.max(0, Math.min(w - 1, x + kx));
            const py = Math.max(0, Math.min(h - 1, y + ky));
            const i = (py * w + px) * 4;
            rs += data[i];
            gs += data[i + 1];
            bs += data[i + 2];
          }
        }
        const idx = (y * w + x) * 4;
        out[idx] = rs / kernelSize;
        out[idx + 1] = gs / kernelSize;
        out[idx + 2] = bs / kernelSize;
        out[idx + 3] = data[idx + 3];
      }
    }
    return out;
  };

  const sobelEdges = (data: Uint8ClampedArray, w: number, h: number) => {
    const out = new Uint8ClampedArray(data.length);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let sx = 0, sy = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * w + (x + kx)) * 4;
            // grayscale
            const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            sx += g * gx[k];
            sy += g * gy[k];
            k++;
          }
        }
        const mag = Math.sqrt(sx * sx + sy * sy);
        const idx = (y * w + x) * 4;
        out[idx] = out[idx + 1] = out[idx + 2] = clamp(mag);
        out[idx + 3] = 255;
      }
    }
    return out;
  };

  const posterize = (data: Uint8ClampedArray, lvl: number) => {
    const out = new Uint8ClampedArray(data.length);
    const step = 255 / Math.max(1, lvl - 1);
    for (let i = 0; i < data.length; i += 4) {
      out[i] = Math.round(data[i] / step) * step;
      out[i + 1] = Math.round(data[i + 1] / step) * step;
      out[i + 2] = Math.round(data[i + 2] / step) * step;
      out[i + 3] = data[i + 3];
    }
    return out;
  };

  const runCartoon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const base = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // blur
    const blurred = boxBlur(base.data, canvas.width, canvas.height, blurRadius);
    // edges
    const edges = sobelEdges(blurred, canvas.width, canvas.height);
    // posterize
    const post = posterize(blurred, levels);

    // combine: draw posterized, then darken where edges exceed threshold
    const out = new Uint8ClampedArray(post.length);
    for (let i = 0; i < post.length; i += 4) {
      out[i] = post[i];
      out[i + 1] = post[i + 1];
      out[i + 2] = post[i + 2];
      out[i + 3] = 255;
      const e = edges[i];
      if (e > edgeThreshold) {
        out[i] = clamp(out[i] - e * 0.7);
        out[i + 1] = clamp(out[i + 1] - e * 0.7);
        out[i + 2] = clamp(out[i + 2] - e * 0.7);
      }
    }
    const imgOut = new ImageData(out, canvas.width, canvas.height);
    ctx.putImageData(imgOut, 0, 0);
    setStatus("Cartoon effect applied.");
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "cartoon.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="btn btn-primary cursor-pointer">
          Choose Image
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2">Levels
            <input type="range" min={3} max={12} value={levels} onChange={(e) => setLevels(parseInt(e.target.value))} />
            <span className="text-sm">{levels}</span>
          </label>
          <label className="flex items-center gap-2">Edge Threshold
            <input type="range" min={10} max={120} value={edgeThreshold} onChange={(e) => setEdgeThreshold(parseInt(e.target.value))} />
            <span className="text-sm">{edgeThreshold}</span>
          </label>
          <label className="flex items-center gap-2">Blur Radius
            <input type="range" min={0} max={4} value={blurRadius} onChange={(e) => setBlurRadius(parseInt(e.target.value))} />
            <span className="text-sm">{blurRadius}</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={runCartoon} disabled={!imgUrl}>Apply Cartoon</button>
          <button className="btn" onClick={download} disabled={!imgUrl}>Download PNG</button>
          <button className="btn" onClick={() => { setImgUrl(""); setStatus(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Reset</button>
        </div>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>
      <canvas ref={canvasRef} className="w-full max-w-full border rounded" />
    </div>
  );
}