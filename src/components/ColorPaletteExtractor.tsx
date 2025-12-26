"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";

type Swatch = { r: number; g: number; b: number; population: number };
type SortMode = "population" | "hue" | "luminance" | "vibrancy";
type HarmonyMode = "none" | "complementary" | "analogous" | "triadic" | "tetradic";

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function getContrast(rgb1: Swatch, rgb2: Swatch) {
  const getL = (c: Swatch) => {
    let { r, g, b } = c;
    [r, g, b] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = getL(rgb1) + 0.05;
  const l2 = getL(rgb2) + 0.05;
  return Math.max(l1, l2) / Math.min(l1, l2);
}

function distance2(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  return Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2);
}

export default function ColorPaletteExtractor() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [k, setK] = useState<number>(8);
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("population");
  const [harmony, setHarmony] = useState<HarmonyMode>("none");
  const [showQuantized, setShowQuantized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [activeSwatchIdx, setActiveSwatchIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); };
  }, [sourceUrl]);

  const extractPalette = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 100));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample pixels for K-Means (Optimized sampling for speed)
    const totalPixels = w * h;
    const targetSamples = 3000;
    const step = Math.max(1, Math.floor(Math.sqrt(totalPixels / targetSamples))); 
    const samples: Swatch[] = [];
    for (let i = 0; i < data.length; i += 4 * step) {
      samples.push({ r: data[i], g: data[i + 1], b: data[i + 2], population: 0 });
    }

    // K-Means ++ Initialization
    let centroids: Swatch[] = [];
    if (samples.length > 0) {
      centroids.push({ ...samples[Math.floor(Math.random() * samples.length)], population: 0 });
      while (centroids.length < k) {
        let farthestPoint = samples[0];
        let maxDist = -1;
        for (const s of samples) {
          let minDistToCentroid = Infinity;
          for (const c of centroids) {
            minDistToCentroid = Math.min(minDistToCentroid, distance2(s, c));
          }
          if (minDistToCentroid > maxDist) {
            maxDist = minDistToCentroid;
            farthestPoint = s;
          }
        }
        centroids.push({ ...farthestPoint, population: 0 });
      }
    }

    // Iterations (Balanced for speed/quality)
    const maxIter = 12;
    for (let iter = 0; iter < maxIter; iter++) {
      const groups = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
      for (const s of samples) {
        let best = 0;
        let bestD = Infinity;
        for (let c = 0; c < centroids.length; c++) {
          const d = distance2(s, centroids[c]);
          if (d < bestD) { bestD = d; best = c; }
        }
        groups[best].r += s.r;
        groups[best].g += s.g;
        groups[best].b += s.b;
        groups[best].count++;
      }
      for (let c = 0; c < centroids.length; c++) {
        if (groups[c].count > 0) {
          centroids[c].r = Math.round(groups[c].r / groups[c].count);
          centroids[c].g = Math.round(groups[c].g / groups[c].count);
          centroids[c].b = Math.round(groups[c].b / groups[c].count);
          centroids[c].population = groups[c].count;
        }
      }
    }

    setPalette(centroids);

    if (showQuantized) {
      const outData = ctx.createImageData(w, h);
      const od = outData.data;
      for (let i = 0; i < data.length; i += 4) {
        const p = { r: data[i], g: data[i+1], b: data[i+2] };
        let best = centroids[0];
        let bestD = Infinity;
        for (const c of centroids) {
          const d = distance2(p, c);
          if (d < bestD) { bestD = d; best = c; }
        }
        od[i] = best.r; od[i+1] = best.g; od[i+2] = best.b; od[i+3] = 255;
      }
      ctx.putImageData(outData, 0, 0);
    } else {
      ctx.drawImage(img, 0, 0);
    }

    setIsProcessing(false);
  }, [k, sourceUrl, showQuantized]);

  const sortedPalette = useMemo(() => {
    const base = [...palette].sort((a, b) => {
      if (sortMode === "population") return b.population - a.population;
      const hslA = rgbToHsl(a.r, a.g, a.b);
      const hslB = rgbToHsl(b.r, b.g, b.b);
      if (sortMode === "hue") return hslA.h - hslB.h;
      if (sortMode === "luminance") return hslA.l - hslB.l;
      if (sortMode === "vibrancy") return (hslB.s * hslB.l) - (hslA.s * hslA.l);
      return 0;
    });

    if (harmony === "none" || base.length === 0) return base;

    const dominant = base[0];
    const { h, s, l } = rgbToHsl(dominant.r, dominant.g, dominant.b);
    const harmonics: Swatch[] = [];

    if (harmony === "complementary") {
      const rgb = hslToRgb((h + 0.5) % 1, s, l);
      harmonics.push({ ...rgb, population: 0 });
    } else if (harmony === "analogous") {
      const r1 = hslToRgb((h + 0.08) % 1, s, l);
      const r2 = hslToRgb((h - 0.08 + 1) % 1, s, l);
      harmonics.push({ ...r1, population: 0 }, { ...r2, population: 0 });
    } else if (harmony === "triadic") {
      const r1 = hslToRgb((h + 0.33) % 1, s, l);
      const r2 = hslToRgb((h + 0.66) % 1, s, l);
      harmonics.push({ ...r1, population: 0 }, { ...r2, population: 0 });
    } else if (harmony === "tetradic") {
      const r1 = hslToRgb((h + 0.25) % 1, s, l);
      const r2 = hslToRgb((h + 0.5) % 1, s, l);
      const r3 = hslToRgb((h + 0.75) % 1, s, l);
      harmonics.push({ ...r1, population: 0 }, { ...r2, population: 0 }, { ...r3, population: 0 });
    }

    return [...base, ...harmonics];
  }, [palette, sortMode, harmony]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(extractPalette, 300);
      return () => clearTimeout(timer);
    }
  }, [extractPalette, sourceUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFromBlob(file);
    e.target.value = "";
  };

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
      setPalette([]);
      setActiveSwatchIdx(null);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const pickColor = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        const hex = result.sRGBHex.toUpperCase();
        setStatus(`Picked: ${hex}`);
        navigator.clipboard.writeText(hex);
        setTimeout(() => setStatus(""), 3000);
      } catch (e) {}
    } else {
      alert("EyeDropper API is not supported in this browser.");
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setStatus(`Copied ${hex}`);
    setTimeout(() => setStatus(""), 2000);
  };

  const downloadPalette = (format: "json" | "css") => {
    const hexes = sortedPalette.map(rgbToHex);
    let content = "";
    let mime = "";
    let ext = "";

    if (format === "json") {
      content = JSON.stringify(hexes, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      content = hexes.map((h, i) => `--color-${i + 1}: ${h};`).join("\n");
      mime = "text/css";
      ext = "css";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-gray-900 dark:via-slate-900 dark:to-amber-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-200 dark:bg-slate-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Color Palette Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extract stunning, harmonious color palettes from your photos using advanced K-Means clustering and generative color theory.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={() => { setSourceUrl(null); setPalette([]); setFileName(null); setActiveSwatchIdx(null); }}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Drag & Drop Image Here"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Extraction Engine</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Cluster Count</span>
                        <span className="text-amber-600">{k} Dominant Colors</span>
                      </div>
                      <input
                        type="range" min={2} max={16} value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Sort Order</label>
                        <select
                          value={sortMode}
                          onChange={(e) => setSortMode(e.target.value as SortMode)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold"
                        >
                          <option value="population">Dominance</option>
                          <option value="vibrancy">Vibrancy</option>
                          <option value="hue">Hue Range</option>
                          <option value="luminance">Brightness</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Theory Harmony</label>
                        <select
                          value={harmony}
                          onChange={(e) => setHarmony(e.target.value as HarmonyMode)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold"
                        >
                          <option value="none">None (Natural)</option>
                          <option value="complementary">Complementary</option>
                          <option value="analogous">Analogous</option>
                          <option value="triadic">Triadic</option>
                          <option value="tetradic">Tetradic</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 border-t dark:border-gray-700">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" checked={showQuantized} onChange={(e) => setShowQuantized(e.target.checked)} className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-amber-500">Live Quantization</span>
                      </label>
                      <button 
                        onClick={pickColor}
                        className="text-xs font-bold text-amber-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2H4v10h10v-4l2-2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        Manual Eyedropper
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Export Studio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" className="w-full text-xs font-bold flex items-center justify-center gap-2" onClick={() => downloadPalette("json")} disabled={palette.length === 0}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      JSON
                    </Button>
                    <Button variant="secondary" className="w-full text-xs font-bold flex items-center justify-center gap-2" onClick={() => downloadPalette("css")} disabled={palette.length === 0}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Tailwind / CSS
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Preview & Palette */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[400px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Feed</h3>
                {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full" />}
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 group relative">
                {sourceUrl ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-sm transition-all duration-300" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-bold text-lg opacity-20 uppercase tracking-tighter">Waiting for Signal</p>
                  </div>
                )}
              </div>
            </div>

            {sortedPalette.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Extracted Palette</h3>
                  {status && <span className="text-[10px] font-black text-amber-600 uppercase animate-pulse tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">{status}</span>}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {sortedPalette.map((sw, i) => {
                    const hex = rgbToHex(sw);
                    const isActive = activeSwatchIdx === i;
                    return (
                      <button 
                        key={i} 
                        onClick={() => { copyHex(hex); setActiveSwatchIdx(i); }}
                        className={`group relative aspect-square rounded-xl transition-all transform hover:-translate-y-1 shadow-md ${isActive ? 'ring-4 ring-amber-500 scale-110 z-10' : 'hover:scale-105'}`}
                        style={{ backgroundColor: hex }}
                      >
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">Copy</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeSwatchIdx !== null && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg shadow-md" style={{ backgroundColor: rgbToHex(sortedPalette[activeSwatchIdx]) }} />
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{rgbToHex(sortedPalette[activeSwatchIdx])}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Swatch</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contrast (vs White)</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${getContrast(sortedPalette[activeSwatchIdx], {r:255,g:255,b:255,population:0}) >= 4.5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {getContrast(sortedPalette[activeSwatchIdx], {r:255,g:255,b:255,population:0}).toFixed(2)}:1
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black text-white uppercase ${getContrast(sortedPalette[activeSwatchIdx], {r:255,g:255,b:255,population:0}) >= 4.5 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {getContrast(sortedPalette[activeSwatchIdx], {r:255,g:255,b:255,population:0}) >= 4.5 ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">RGB</p>
                        <p className="text-[10px] font-mono font-bold">{sortedPalette[activeSwatchIdx].r}, {sortedPalette[activeSwatchIdx].g}, {sortedPalette[activeSwatchIdx].b}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">HSL</p>
                        <p className="text-[10px] font-mono font-bold">
                          {Math.round(rgbToHsl(sortedPalette[activeSwatchIdx].r, sortedPalette[activeSwatchIdx].g, sortedPalette[activeSwatchIdx].b).h * 360)}°, 
                          {Math.round(rgbToHsl(sortedPalette[activeSwatchIdx].r, sortedPalette[activeSwatchIdx].g, sortedPalette[activeSwatchIdx].b).s * 100)}%, 
                          {Math.round(rgbToHsl(sortedPalette[activeSwatchIdx].r, sortedPalette[activeSwatchIdx].g, sortedPalette[activeSwatchIdx].b).l * 100)}%
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Luma</p>
                        <p className="text-[10px] font-mono font-bold">{Math.round((0.299*sortedPalette[activeSwatchIdx].r + 0.587*sortedPalette[activeSwatchIdx].g + 0.114*sortedPalette[activeSwatchIdx].b))}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center shadow-sm">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Dominance</p>
                        <p className="text-[10px] font-mono font-bold">{Math.round((sortedPalette[activeSwatchIdx].population / (palette.reduce((acc,s)=>acc+s.population,0) || 1)) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
