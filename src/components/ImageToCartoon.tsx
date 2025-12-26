"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

function clamp(v: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

export default function ImageToCartoon() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [levels, setLevels] = useState<number>(6);
  const [edgeThreshold, setEdgeThreshold] = useState<number>(40);
  const [edgeThickness, setEdgeThickness] = useState<number>(1);
  const [blurRadius, setBlurRadius] = useState<number>(2);
  const [saturation, setSaturation] = useState<number>(120);
  const [inkStrength, setInkStrength] = useState<number>(0.7);
  
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success" | "info"; text: string }>({ type: "idle", text: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

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
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            sx += gray * gx[k];
            sy += gray * gy[k];
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

  const runCartoon = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    setStatus({ type: "info", text: "Transforming image..." });
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Apply initial adjustments (Saturation)
    ctx.filter = `saturate(${saturation}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    const base = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // 1. Blur to simplify details
    const blurred = boxBlur(base.data, w, h, blurRadius);
    
    // 2. Find Edges
    const edges = sobelEdges(blurred, w, h);
    
    // 3. Posterize colors
    const post = posterize(blurred, levels);

    // 4. Merge edges and colors
    const finalData = new Uint8ClampedArray(post.length);
    for (let i = 0; i < post.length; i += 4) {
      finalData[i] = post[i];
      finalData[i + 1] = post[i + 1];
      finalData[i + 2] = post[i + 2];
      finalData[i + 3] = 255;
      
      const e = edges[i];
      if (e > edgeThreshold) {
        // Darken based on ink strength
        const factor = 1 - (inkStrength * (e / 255) * edgeThickness);
        finalData[i] = clamp(finalData[i] * factor);
        finalData[i + 1] = clamp(finalData[i + 1] * factor);
        finalData[i + 2] = clamp(finalData[i + 2] * factor);
      }
    }

    ctx.putImageData(new ImageData(finalData, w, h), 0, 0);
    setStatus({ type: "success", text: "Cartoonized!" });
    setIsProcessing(false);
  }, [sourceUrl, levels, edgeThreshold, edgeThickness, blurRadius, saturation, inkStrength]);

  const setFileFromBlob = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Please select a valid image file." });
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
    
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
      }
      runCartoon();
    };
    img.src = url;
  }, [sourceUrl, runCartoon]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileFromBlob(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `cartoon-${fileName?.split('.')[0] || 'result'}.png`;
    a.click();
  };

  const clear = () => {
    setSourceUrl(null);
    setFileName(null);
    setStatus({ type: "idle", text: "" });
    originalImgRef.current = null;
    const cnv = canvasRef.current;
    if (cnv) {
      cnv.getContext("2d")?.clearRect(0, 0, cnv.width, cnv.height);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 dark:from-gray-900 dark:via-yellow-950/10 dark:to-pink-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-200 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Cartoonizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Instantly turn your photos into vibrant cartoon art. Adjust ink strength, color levels, and detail.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                  </Button>
                  {fileName && <Button variant="secondary" onClick={clear}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {fileName ? `File: ${fileName}` : "JPG, PNG, or WebP"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Artistic Controls</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Color Levels</span>
                        <span className="font-mono text-yellow-600">{levels}</span>
                      </label>
                      <input type="range" min={3} max={12} value={levels} onChange={(e) => setLevels(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Edge Threshold</span>
                        <span className="font-mono text-yellow-600">{edgeThreshold}</span>
                      </label>
                      <input type="range" min={10} max={120} value={edgeThreshold} onChange={(e) => setEdgeThreshold(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Saturation</span>
                        <span className="font-mono text-yellow-600">{saturation}%</span>
                      </label>
                      <input type="range" min={50} max={200} value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Ink Strength</span>
                        <span className="font-mono text-yellow-600">{Math.round(inkStrength * 100)}%</span>
                      </label>
                      <input type="range" min={0} max={1} step={0.1} value={inkStrength} onChange={(e) => setInkStrength(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Edge Thickness</span>
                        <span className="font-mono text-yellow-600">{edgeThickness}x</span>
                      </label>
                      <input type="range" min={1} max={3} step={0.5} value={edgeThickness} onChange={(e) => setEdgeThickness(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Detail Smoothing</span>
                        <span className="font-mono text-yellow-600">{blurRadius}px</span>
                      </label>
                      <input type="range" min={0} max={4} value={blurRadius} onChange={(e) => setBlurRadius(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" className="flex-1 py-4 shadow-lg flex items-center justify-center gap-2" onClick={runCartoon} disabled={isProcessing}>
                    {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : "Apply Effect"}
                  </Button>
                  <Button variant="secondary" className="flex-1 py-4" onClick={download} disabled={isProcessing}>
                    Download Art
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 flex-grow flex flex-col min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Canvas Preview</h3>
                {sourceUrl && (
                  <button 
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onMouseLeave={() => setShowOriginal(false)}
                    className="text-[10px] font-black px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all select-none"
                  >
                    Hold to Compare
                  </button>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner relative group">
                {sourceUrl ? (
                  <>
                    <canvas ref={canvasRef} className={`max-w-full h-auto shadow-2xl transition-opacity duration-300 ${showOriginal ? 'opacity-0' : 'opacity-100'}`} />
                    {showOriginal && (
                      <img src={sourceUrl} className="absolute max-w-full h-auto shadow-2xl animate-in fade-in duration-200" alt="Original" />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-bold text-lg">Load an image to start</p>
                  </div>
                )}
              </div>

              {status.text && (
                <div className={`mt-6 p-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 ${
                  status.type === "error" ? "bg-red-50 text-red-600" :
                  status.type === "success" ? "bg-green-50 text-green-600" :
                  "bg-yellow-50 text-yellow-700"
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    status.type === "error" ? "bg-red-500" :
                    status.type === "success" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  {status.text}
                </div>
              )}
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
