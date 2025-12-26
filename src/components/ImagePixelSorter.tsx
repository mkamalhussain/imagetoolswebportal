"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Button from "@/components/Button";

type Mode = "brightness" | "hue" | "saturation" | "lightness" | "red" | "green" | "blue" | "sum";
type Direction = "rows" | "columns";

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

function getMetric(r: number, g: number, b: number, mode: Mode) {
  switch (mode) {
    case "brightness": return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    case "hue": return rgbToHsv(r, g, b).h * 255;
    case "saturation": return rgbToHsv(r, g, b).s * 255;
    case "lightness": return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    case "red": return r;
    case "green": return g;
    case "blue": return b;
    case "sum": return (r + g + b) / 3;
    default: return 0;
  }
}

export default function ImagePixelSorter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [mode, setMode] = useState<Mode>("brightness");
  const [direction, setDirection] = useState<Direction>("rows");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [thresholdLower, setThresholdLower] = useState<number>(50);
  const [thresholdUpper, setThresholdUpper] = useState<number>(200);
  
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<ImageData | null>(null);

  useEffect(() => {
    const cnv = canvasRef.current;
    if (cnv) {
      const ctx = cnv.getContext("2d");
      ctx?.clearRect(0, 0, cnv.width, cnv.height);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Use an offscreen canvas for data extraction to be safe from DOM race conditions
      const offscreen = document.createElement("canvas");
      offscreen.width = img.width;
      offscreen.height = img.height;
      const octx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, img.width, img.height);
      
      setOriginalData(data);
      setHasImage(true);
      setSourceUrl(url);
      setFileName(file.name);

      // Also update the visible canvas
      if (canvasRef.current) {
        const cnv = canvasRef.current;
        cnv.width = img.width;
        cnv.height = img.height;
        const ctx = cnv.getContext("2d");
        ctx?.drawImage(img, 0, 0);
      }
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const sortPixels = async () => {
    if (!canvasRef.current || !originalData) return;
    
    setIsProcessing(true);
    // Allow UI to update before heavy computation
    await new Promise(r => setTimeout(r, 50));

    const cnv = canvasRef.current;
    const ctx = cnv.getContext("2d")!;
    const imageData = new ImageData(
      new Uint8ClampedArray(originalData.data),
      originalData.width,
      originalData.height
    );
    const { data, width, height } = imageData;
    const isAsc = order === "asc";

    const getPixelMetric = (idx: number) => {
      return getMetric(data[idx], data[idx + 1], data[idx + 2], mode);
    };

    if (direction === "rows") {
      for (let y = 0; y < height; y++) {
        let x = 0;
        while (x < width) {
          while (x < width && getPixelMetric((y * width + x) * 4) < thresholdLower) x++;
          const start = x;
          while (x < width && getPixelMetric((y * width + x) * 4) < thresholdUpper) x++;
          const end = x;

          if (start < end) {
            const segment = [];
            for (let i = start; i < end; i++) {
              const idx = (y * width + i) * 4;
              segment.push({
                m: getMetric(data[idx], data[idx+1], data[idx+2], mode),
                r: data[idx], g: data[idx+1], b: data[idx+2], a: data[idx+3]
              });
            }
            segment.sort((a, b) => isAsc ? a.m - b.m : b.m - a.m);
            for (let i = 0; i < segment.length; i++) {
              const idx = (y * width + (start + i)) * 4;
              data[idx] = segment[i].r;
              data[idx+1] = segment[i].g;
              data[idx+2] = segment[i].b;
              data[idx+3] = segment[i].a;
            }
          }
          x++;
        }
      }
    } else {
      for (let x = 0; x < width; x++) {
        let y = 0;
        while (y < height) {
          while (y < height && getPixelMetric((y * width + x) * 4) < thresholdLower) y++;
          const start = y;
          while (y < height && getPixelMetric((y * width + x) * 4) < thresholdUpper) y++;
          const end = y;

          if (start < end) {
            const segment = [];
            for (let i = start; i < end; i++) {
              const idx = (i * width + x) * 4;
              segment.push({
                m: getMetric(data[idx], data[idx+1], data[idx+2], mode),
                r: data[idx], g: data[idx+1], b: data[idx+2], a: data[idx+3]
              });
            }
            segment.sort((a, b) => isAsc ? a.m - b.m : b.m - a.m);
            for (let i = 0; i < segment.length; i++) {
              const idx = ((start + i) * width + x) * 4;
              data[idx] = segment[i].r;
              data[idx+1] = segment[i].g;
              data[idx+2] = segment[i].b;
              data[idx+3] = segment[i].a;
            }
          }
          y++;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    setIsProcessing(false);
  };

  const applyPreset = (p: string) => {
    switch(p) {
      case "classic":
        setMode("brightness");
        setDirection("columns");
        setOrder("desc");
        setThresholdLower(50);
        setThresholdUpper(200);
        break;
      case "horizontal-hue":
        setMode("hue");
        setDirection("rows");
        setOrder("asc");
        setThresholdLower(20);
        setThresholdUpper(240);
        break;
      case "extreme":
        setMode("sum");
        setDirection("columns");
        setOrder("desc");
        setThresholdLower(0);
        setThresholdUpper(255);
        break;
    }
  };

  const reset = () => {
    if (!originalData) return;
    const cnv = canvasRef.current!;
    const ctx = cnv.getContext("2d")!;
    ctx.putImageData(originalData, 0, 0);
  };

  const download = () => {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const link = document.createElement("a");
    link.download = `pixel-sorted-${mode}-${direction}.png`;
    link.href = cnv.toDataURL("image/png");
    link.click();
  };

  const clear = () => {
    setSourceUrl(null);
    setFileName(null);
    setHasImage(false);
    setOriginalData(null);
    const cnv = canvasRef.current;
    if (cnv) {
      const ctx = cnv.getContext("2d");
      ctx?.clearRect(0, 0, cnv.width, cnv.height);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-stone-100 dark:from-gray-900 dark:via-zinc-900 dark:to-slate-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-200 dark:bg-zinc-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-200 dark:bg-slate-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Glitch Pixel Sorter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create beautiful generative glitch art by sorting pixels based on brightness, hue, and more.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-zinc-500 bg-zinc-50 dark:bg-zinc-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </Button>
                  {hasImage && (
                    <Button variant="secondary" onClick={clear}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {fileName ? `Selected: ${fileName}` : "Drag and drop your image here"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sorting Logic</h3>
                <select 
                  onChange={(e) => applyPreset(e.target.value)}
                  className="text-xs bg-zinc-100 dark:bg-zinc-700 border-none rounded px-2 py-1 font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="">Quick Presets</option>
                  <option value="classic">Classic Vertical</option>
                  <option value="horizontal-hue">Rainbow Melt</option>
                  <option value="extreme">Extreme Chaos</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sorting Metric</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as Mode)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="brightness">Brightness</option>
                      <option value="hue">Hue</option>
                      <option value="saturation">Saturation</option>
                      <option value="lightness">Lightness</option>
                      <option value="red">Red Channel</option>
                      <option value="green">Green Channel</option>
                      <option value="blue">Blue Channel</option>
                      <option value="sum">Color Sum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Direction</label>
                    <select
                      value={direction}
                      onChange={(e) => setDirection(e.target.value as Direction)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="rows">Horizontal (Rows)</option>
                      <option value="columns">Vertical (Columns)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort Order</label>
                    <select
                      value={order}
                      onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-zinc-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 italic">Sorting metrics determine which pixels are "larger" or "smaller" for the sorting algorithm.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Thresholding (Mask)</h3>
              <p className="text-xs text-gray-500">Only pixels with values between these bounds will be sorted. This creates the "torn" glitch effect.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span>Lower Bound</span>
                    <span className="font-mono text-zinc-500">{thresholdLower}</span>
                  </label>
                  <input
                    type="range" min={0} max={255} value={thresholdLower}
                    onChange={(e) => setThresholdLower(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-zinc-600"
                  />
                </div>

                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span>Upper Bound</span>
                    <span className="font-mono text-zinc-500">{thresholdUpper}</span>
                  </label>
                  <input
                    type="range" min={0} max={255} value={thresholdUpper}
                    onChange={(e) => setThresholdUpper(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-zinc-600"
                  />
                </div>
              </div>

              <div className="pt-6 border-t dark:border-gray-700 grid grid-cols-2 gap-4">
                <Button variant="primary" className="w-full flex items-center gap-2 justify-center" onClick={sortPixels} disabled={!hasImage || isProcessing}>
                  {isProcessing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Apply Sort
                </Button>
                <Button variant="secondary" className="w-full" onClick={reset} disabled={!hasImage}>
                  Reset
                </Button>
                <Button variant="secondary" className="w-full col-span-2 py-3" onClick={download} disabled={!hasImage}>
                  Download PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px] relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preview</h3>
                {isProcessing && <span className="text-xs font-bold text-zinc-400 animate-pulse">Sorting pixels...</span>}
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner">
                <canvas 
                  ref={canvasRef} 
                  className={`max-w-full h-auto shadow-2xl transition-opacity duration-300 ${hasImage ? 'block' : 'hidden'}`} 
                  style={{ opacity: isProcessing ? 0.6 : 1 }} 
                />
                {!hasImage && (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-semibold text-lg">Waiting for image...</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>Tip: High contrast images with wide threshold ranges create the best results.</span>
              </div>
            </div>
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
