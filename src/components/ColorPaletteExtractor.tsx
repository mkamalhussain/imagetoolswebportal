"use client";

import React, { useEffect, useRef, useState } from "react";

type Swatch = { r: number; g: number; b: number };

function rgbToHex({ r, g, b }: Swatch) {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function distance2(a: Swatch, b: Swatch) {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

export default function ColorPaletteExtractor() {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [k, setK] = useState<number>(6);
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [status, setStatus] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    await drawImage(url);
    extractPalette();
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

  const extractPalette = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample pixels on a grid to keep computation bounded
    const step = Math.max(1, Math.floor(Math.min(width, height) / 100));
    const samples: Swatch[] = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
    if (samples.length === 0) return;

    // Initialize centroids randomly from samples
    const centroids: Swatch[] = [];
    const used = new Set<number>();
    while (centroids.length < k && used.size < samples.length) {
      const idx = Math.floor(Math.random() * samples.length);
      if (!used.has(idx)) {
        used.add(idx);
        centroids.push({ ...samples[idx] });
      }
    }

    // K-means: assign & update for limited iterations
    const maxIter = 10;
    const assignments = new Array<number>(samples.length).fill(0);
    for (let iter = 0; iter < maxIter; iter++) {
      // Assign
      for (let s = 0; s < samples.length; s++) {
        let best = 0;
        let bestD = Infinity;
        for (let c = 0; c < centroids.length; c++) {
          const d = distance2(samples[s], centroids[c]);
          if (d < bestD) { bestD = d; best = c; }
        }
        assignments[s] = best;
      }
      // Update
      const accum = centroids.map(() => ({ r: 0, g: 0, b: 0, n: 0 }));
      for (let s = 0; s < samples.length; s++) {
        const a = assignments[s];
        const sw = samples[s];
        accum[a].r += sw.r; accum[a].g += sw.g; accum[a].b += sw.b; accum[a].n++;
      }
      for (let c = 0; c < centroids.length; c++) {
        const ac = accum[c];
        if (ac.n > 0) {
          centroids[c] = { r: Math.round(ac.r / ac.n), g: Math.round(ac.g / ac.n), b: Math.round(ac.b / ac.n) };
        }
      }
    }

    // Deduplicate similar centroids
    const unique: Swatch[] = [];
    const threshold = 10 * 10; // squared distance threshold
    for (const c of centroids) {
      if (!unique.some((u) => distance2(u, c) < threshold)) unique.push(c);
    }
    setPalette(unique.slice(0, k));
    setStatus(`Extracted ${Math.min(k, unique.length)} colors`);
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setStatus(`Copied ${hex} to clipboard`);
  };

  const downloadJSON = () => {
    const json = JSON.stringify(palette.map(rgbToHex), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="btn btn-primary cursor-pointer">
          Choose Image
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <label className="flex items-center gap-2 text-sm">Colors
          <input type="range" min={3} max={12} value={k} onChange={(e) => setK(parseInt(e.target.value))} />
          <span>{k}</span>
        </label>
        <button className="btn" onClick={extractPalette} disabled={!imgUrl}>Extract</button>
        <button className="btn" onClick={downloadJSON} disabled={palette.length === 0}>Download JSON</button>
      </div>

      {status && <p className="text-sm text-gray-600">{status}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {palette.map((sw, i) => {
          const hex = rgbToHex(sw);
          return (
            <div key={i} className="card p-2 text-center">
              <div className="w-full h-16 rounded" style={{ backgroundColor: hex }} />
              <div className="mt-2 text-xs font-mono">{hex}</div>
              <button className="btn mt-2" onClick={() => copyHex(hex)}>Copy</button>
            </div>
          );
        })}
      </div>

      <canvas ref={canvasRef} className="w-full max-w-full border rounded" />
    </div>
  );
}