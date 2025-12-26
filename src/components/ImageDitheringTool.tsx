"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";

type Algo = "floyd-steinberg" | "atkinson" | "ordered" | "stucki" | "burkes" | "jarvis-judice-ninke";

const PALETTES = {
  grayscale: null, // Dynamic based on levels
  bw: [[0, 0, 0], [255, 255, 255]],
  gameboy: [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]],
  cga: [[0, 0, 0], [85, 255, 255], [255, 85, 255], [255, 255, 255]],
  c64: [
    [0, 0, 0], [255, 255, 255], [136, 0, 0], [170, 255, 238],
    [204, 68, 204], [0, 204, 85], [0, 0, 170], [238, 238, 119],
    [221, 136, 85], [102, 68, 0], [255, 119, 119], [51, 51, 51],
    [119, 119, 119], [170, 255, 102], [0, 136, 255], [187, 187, 187]
  ]
};

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export default function ImageDitheringTool() {
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  
  const [algo, setAlgo] = useState<Algo>("floyd-steinberg");
  const [levels, setLevels] = useState<number>(2);
  const [paletteType, setPaletteType] = useState<keyof typeof PALETTES>("grayscale");
  const [isColor, setIsColor] = useState(false);
  const [serpentine, setSerpentine] = useState(true);
  
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFromBlob(file);
    e.target.value = "";
  };

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  // Find nearest color in palette
  const findNearest = useCallback((r: number, g: number, b: number) => {
    let palette: number[][] | null = null;
    
    if (paletteType === "grayscale") {
      const step = 255 / (levels - 1);
      const val = Math.max(0, Math.min(255, Math.round((0.299 * r + 0.587 * g + 0.114 * b) / step) * step));
      return [val, val, val];
    }
    
    palette = PALETTES[paletteType] as number[][];
    let minDist = Infinity;
    let nearest = palette[0];
    
    for (const color of palette) {
      const dr = r - color[0];
      const dg = g - color[1];
      const db = b - color[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        nearest = color;
      }
    }
    return nearest;
  }, [paletteType, levels]);

  const processDither = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    setError("");

    // Use natural dimensions
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Apply pre-processing
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    if (algo === "ordered") {
      const N = 4;
      const matrixScale = (N * N + 1);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const threshold = ((bayer4[y % N][x % N] + 0.5) / matrixScale) * 255 - 128;
          
          const r = data[i] + threshold;
          const g = data[i+1] + threshold;
          const b = data[i+2] + threshold;
          
          const nearest = findNearest(r, g, b);
          data[i] = nearest[0];
          data[i+1] = nearest[1];
          data[i+2] = nearest[2];
        }
      }
    } else {
      // Error diffusion algorithms
      const kernels: Record<string, number[][]> = {
        "floyd-steinberg": [[1, 0, 7/16], [-1, 1, 3/16], [0, 1, 5/16], [1, 1, 1/16]],
        "atkinson": [[1, 0, 1/8], [2, 0, 1/8], [-1, 1, 1/8], [0, 1, 1/8], [1, 1, 1/8], [0, 2, 1/8]],
        "stucki": [[1, 0, 8/42], [2, 0, 4/42], [-2, 1, 2/42], [-1, 1, 4/42], [0, 1, 8/42], [1, 1, 4/42], [2, 1, 2/42], [-2, 2, 1/42], [-1, 2, 2/42], [0, 2, 4/42], [1, 2, 2/42], [2, 2, 1/42]],
        "burkes": [[1, 0, 8/32], [2, 0, 4/32], [-2, 1, 2/32], [-1, 1, 4/32], [0, 1, 8/32], [1, 1, 4/32], [2, 1, 2/32]],
        "jarvis-judice-ninke": [[1, 0, 7/48], [2, 0, 5/48], [-2, 1, 3/48], [-1, 1, 5/48], [0, 1, 7/48], [1, 1, 5/48], [2, 1, 3/48], [-2, 2, 1/48], [-1, 2, 3/48], [0, 2, 5/48], [1, 2, 3/48], [2, 2, 1/48]]
      };

      const kernel = kernels[algo];
      
      // Use a Float32 buffer for error distribution
      const floatData = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) floatData[i] = data[i];

      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && (y % 2 !== 0);
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const stepX = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += stepX) {
          const i = (y * w + x) * 4;
          const oldR = floatData[i];
          const oldG = floatData[i + 1];
          const oldB = floatData[i + 2];

          const nearest = findNearest(oldR, oldG, oldB);
          
          data[i] = nearest[0];
          data[i+1] = nearest[1];
          data[i+2] = nearest[2];

          const errR = oldR - nearest[0];
          const errG = oldG - nearest[1];
          const errB = oldB - nearest[2];

          for (const [dx, dy, weight] of kernel) {
            const nx = x + (isReverse ? -dx : dx);
            const ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const ni = (ny * w + nx) * 4;
              floatData[ni] += errR * weight;
              floatData[ni + 1] += errG * weight;
              floatData[ni + 2] += errB * weight;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setIsProcessing(false);
  }, [sourceUrl, algo, levels, paletteType, isColor, serpentine, contrast, brightness, findNearest]);

  useEffect(() => {
    if (!sourceUrl) return;
    const img = imgRef.current;
    if (!img) return;
    img.onload = processDither;
    img.src = sourceUrl;
  }, [sourceUrl, processDither]);

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "dithered";
    a.download = `${base}-${algo}-${paletteType}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-200 dark:bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Retro Dithering Tool
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Give your images a classic low-fi look with advanced dithering algorithms and retro palettes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mb-4 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={() => { setSourceUrl(""); setFileName(""); }}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {fileName ? `Selected: ${fileName}` : "Drag & drop your image here"}
                </p>
              </div>
            </div>

            {/* Algorithm Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
                Dithering Engine
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Algorithm</label>
                  <select
                    value={algo}
                    onChange={(e) => setAlgo(e.target.value as Algo)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
                  >
                    <option value="floyd-steinberg">Floyd–Steinberg</option>
                    <option value="atkinson">Atkinson (Classic Mac)</option>
                    <option value="stucki">Stucki (High Quality)</option>
                    <option value="burkes">Burkes (Smooth)</option>
                    <option value="jarvis-judice-ninke">Jarvis-Judice-Ninke</option>
                    <option value="ordered">Ordered (Bayer 4×4)</option>
                  </select>
                  <p className="mt-2 text-[10px] text-gray-400 italic">
                    {algo === "atkinson" ? "Great for high contrast, reduces artifacts." : 
                     algo === "ordered" ? "Classic halftone/pixel-art pattern." : 
                     "Spreads error to neighboring pixels."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Serpentine Scan</span>
                    <input
                      type="checkbox" checked={serpentine}
                      onChange={(e) => setSerpentine(e.target.checked)}
                      disabled={algo === "ordered"}
                      className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-zinc-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 after:transition-transform checked:after:translate-x-5 disabled:opacity-30"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">Alternates scan direction to reduce streaks.</p>
                </div>
              </div>

              {/* Palette Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color Palette</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PALETTES).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaletteType(p as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                        paletteType === p 
                          ? "bg-zinc-800 text-white border-zinc-800 shadow-md" 
                          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p === "bw" ? "B&W (1-bit)" : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
                
                {paletteType === "grayscale" && (
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gray Levels: {levels}</label>
                    <input
                      type="range" min={2} max={16} value={levels}
                      onChange={(e) => setLevels(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-zinc-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Image Tuning */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
                Image Tuning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contrast: {contrast}%
                  </label>
                  <input
                    type="range" min={0} max={200} value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brightness: {brightness}%
                  </label>
                  <input
                    type="range" min={0} max={200} value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-zinc-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <Button variant="primary" className="w-full py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all" onClick={onDownload} disabled={!sourceUrl}>
                  Download Dithered Image
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[600px] relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h3>
                {isProcessing && (
                  <span className="flex items-center gap-2 text-xs font-bold text-zinc-500 animate-pulse">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                )}
              </div>
              
              <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-inner p-4 relative">
                {sourceUrl ? (
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full max-h-full object-contain block shadow-2xl transition-opacity duration-300"
                    style={{ 
                      imageRendering: "pixelated",
                      opacity: isProcessing ? 0.5 : 1
                    }} 
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-600 flex flex-col items-center">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-semibold">Upload an image to start dithering</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Original Feed</span>
                  <span className="text-xs text-gray-500">Dithering logic is 100% client-side</span>
                </div>
                {sourceUrl ? (
                  <img src={sourceUrl} className="h-20 w-32 object-cover rounded-lg border-2 border-white dark:border-gray-700 shadow-sm" alt="Thumbnail" />
                ) : (
                  <div className="h-20 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden elements */}
      <img ref={imgRef} alt="source" className="hidden" />
      {error && <p className="text-sm text-red-600 fixed bottom-4 right-4 bg-white p-4 rounded-xl shadow-2xl border border-red-100">{error}</p>}

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
