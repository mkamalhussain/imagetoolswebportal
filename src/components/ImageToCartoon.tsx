"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type ArtisticStyle = "classic" | "vivid" | "noir" | "minimal" | "watercolor" | "popart" | "sketch" | "oil";

function clamp(v: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

export default function ImageToCartoon() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [style, setStyle] = useState<ArtisticStyle>("classic");
  const [levels, setLevels] = useState<number>(6);
  const [edgeThreshold, setEdgeThreshold] = useState<number>(40);
  const [edgeThickness, setEdgeThickness] = useState<number>(1);
  const [blurRadius, setBlurRadius] = useState<number>(2);
  const [saturation, setSaturation] = useState<number>(120);
  const [inkStrength, setInkStrength] = useState<number>(0.7);
  const [halftoneScale, setHalftoneScale] = useState<number>(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); };
  }, [sourceUrl]);

  // Median Filter for better edge preservation
  const medianFilter = (data: Uint8ClampedArray, w: number, h: number, r: number) => {
    if (r <= 0) return data;
    const out = new Uint8ClampedArray(data.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const rs: number[] = [], gs: number[] = [], bs: number[] = [];
        for (let ky = -r; ky <= r; ky++) {
          for (let kx = -r; kx <= r; kx++) {
            const px = Math.max(0, Math.min(w - 1, x + kx));
            const py = Math.max(0, Math.min(h - 1, y + ky));
            const i = (py * w + px) * 4;
            rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
          }
        }
        const idx = (y * w + x) * 4;
        rs.sort((a, b) => a - b); gs.sort((a, b) => a - b); bs.sort((a, b) => a - b);
        const mid = Math.floor(rs.length / 2);
        out[idx] = rs[mid]; out[idx + 1] = gs[mid]; out[idx + 2] = bs[mid]; out[idx + 3] = 255;
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
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * w + (x + kx)) * 4;
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const k = (ky + 1) * 3 + (kx + 1);
            sx += gray * gx[k]; sy += gray * gy[k];
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
      out[i+1] = Math.round(data[i+1] / step) * step;
      out[i+2] = Math.round(data[i+2] / step) * step;
      out[i+3] = data[i+3];
    }
    return out;
  };

  const applyEffect = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    // Give UI time to show the spinner
    await new Promise(r => setTimeout(r, 10));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Optimization: For preview, we limit the processing resolution
    // but keep the aspect ratio. This makes it feel much faster.
    const MAX_PROC_SIZE = 1200;
    let procW = img.naturalWidth;
    let procH = img.naturalHeight;
    
    if (procW > MAX_PROC_SIZE || procH > MAX_PROC_SIZE) {
      const scale = MAX_PROC_SIZE / Math.max(procW, procH);
      procW = Math.round(procW * scale);
      procH = Math.round(procH * scale);
    }

    canvas.width = procW;
    canvas.height = procH;

    let preSat = saturation;
    if (style === "noir" || style === "sketch") preSat = 0;
    if (style === "vivid" || style === "popart") preSat = Math.max(saturation, 160);
    
    // Fast native blur for noise reduction instead of heavy custom median filter
    ctx.filter = `saturate(${preSat}%) blur(${blurRadius / 2}px)`;
    ctx.drawImage(img, 0, 0, procW, procH);
    ctx.filter = "none";

    const base = ctx.getImageData(0, 0, procW, procH);
    const data = base.data;

    // 1. Optimized Sobel Edges
    const edges = new Uint8ClampedArray(procW * procH);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < procH - 1; y++) {
      for (let x = 1; x < procW - 1; x++) {
        let sx = 0, sy = 0;
        const idx = (y * procW + x) * 4;
        
        // Fast Grayscale + Convolution
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * procW + (x + kx)) * 4;
            const gray = (data[i] + data[i+1] + data[i+2]) / 3;
            const k = (ky + 1) * 3 + (kx + 1);
            sx += gray * gx[k]; sy += gray * gy[k];
          }
        }
        edges[y * procW + x] = Math.sqrt(sx * sx + sy * sy);
      }
    }
    
    // 2. Optimized Posterization + Edge Application
    const step = 255 / Math.max(1, (style === "popart" ? 3 : levels) - 1);
    const final = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const e = edges[i/4];
      const isEdge = e > edgeThreshold;
      
      // Fast Posterize
      let r = Math.round(data[i] / step) * step;
      let g = Math.round(data[i+1] / step) * step;
      let b = Math.round(data[i+2] / step) * step;

      if (style === "sketch") {
        const val = isEdge ? clamp(255 - (e * inkStrength)) : 255;
        final[i] = final[i+1] = final[i+2] = val;
      } else if (isEdge && style !== "watercolor" && style !== "oil") {
        const dark = 1 - (inkStrength * (e / 255) * edgeThickness);
        final[i] = clamp(r * dark);
        final[i+1] = clamp(g * dark);
        final[i+2] = clamp(b * dark);
      } else {
        final[i] = r; final[i+1] = g; final[i+2] = b;
      }
      final[i+3] = 255;
    }

    ctx.putImageData(new ImageData(final, procW, procH), 0, 0);
    
    // ... rest of post processing ...
    if (style === "watercolor") {
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 0, procW, procH);
      ctx.globalCompositeOperation = "source-over";
    }

    if (style === "oil") {
      ctx.filter = "contrast(120%) brightness(110%) blur(0.5px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
    }

    if (halftoneScale > 0) {
      const dotSize = Math.max(2, Math.floor(halftoneScale));
      const tmp = ctx.getImageData(0, 0, procW, procH);
      ctx.clearRect(0, 0, procW, procH);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, procW, procH);
      for (let y = 0; y < procH; y += dotSize) {
        for (let x = 0; x < procW; x += dotSize) {
          const i = (y * procW + x) * 4;
          const lum = (tmp.data[i] + tmp.data[i+1] + tmp.data[i+2]) / 3;
          const r = (dotSize / 2) * (1 - lum / 255);
          ctx.fillStyle = `rgb(${tmp.data[i]},${tmp.data[i+1]},${tmp.data[i+2]})`;
          ctx.beginPath();
          ctx.arc(x + dotSize/2, y + dotSize/2, r * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    setIsProcessing(false);
  }, [sourceUrl, style, levels, edgeThreshold, edgeThickness, blurRadius, saturation, inkStrength, halftoneScale]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(applyEffect, 300);
      return () => clearTimeout(timer);
    }
  }, [applyEffect, sourceUrl]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    // Clear previous state
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setFileName(null);
    originalImgRef.current = null;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log("Image loaded successfully:", file.name, img.width, "x", img.height);
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
    };
    
    img.onerror = (err) => {
      console.error("Image loading failed:", err);
      alert("Failed to load the image. Please try another file.");
    };
    
    img.src = url;
  }, [sourceUrl]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceUrl) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `art-${fileName?.split('.')[0] || 'result'}.png`;
    a.click();
  };

  const clear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setFileName(null);
    originalImgRef.current = null;
    const cnv = canvasRef.current;
    if (cnv) cnv.getContext("2d")?.clearRect(0, 0, cnv.width, cnv.height);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-yellow-950/10 dark:to-orange-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-200 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Cartoon Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform photos into high-end comic book art, oil paintings, or charcoal sketches using advanced edge detection.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={clear}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{fileName || "Drag & Drop Image Here"}</p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Art Style</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {(["classic", "vivid", "noir", "minimal", "watercolor", "popart", "sketch", "oil"] as ArtisticStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                          style === s 
                            ? "bg-yellow-500 text-white border-yellow-500 shadow-md scale-105" 
                            : "bg-gray-50 dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-yellow-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Fine Tuning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Detail Polish</span><span>{blurRadius}px</span></label>
                        <input type="range" min={0} max={5} value={blurRadius} onChange={e => setBlurRadius(parseInt(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Ink Weight</span><span>{Math.round(inkStrength*100)}%</span></label>
                        <input type="range" min={0} max={1} step={0.1} value={inkStrength} onChange={e => setInkStrength(parseFloat(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Saturation</span><span>{saturation}%</span></label>
                        <input type="range" min={0} max={200} value={saturation} onChange={e => setSaturation(parseInt(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Color Depth</span><span>{levels} levels</span></label>
                        <input type="range" min={2} max={16} value={levels} onChange={e => setLevels(parseInt(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Edge Pop</span><span>{edgeThreshold}</span></label>
                        <input type="range" min={10} max={100} value={edgeThreshold} onChange={e => setEdgeThreshold(parseInt(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Halftone</span><span>{halftoneScale > 0 ? `${halftoneScale}px` : "OFF"}</span></label>
                        <input type="range" min={0} max={12} value={halftoneScale} onChange={e => setHalftoneScale(parseInt(e.target.value))} className="w-full h-1.5 accent-yellow-500 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Artboard */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[450px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Artboard</h3>
                <div className="flex gap-4 items-center">
                  {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full" />}
                  {sourceUrl && (
                    <button 
                      onMouseDown={() => setShowOriginal(true)}
                      onMouseUp={() => setShowOriginal(false)}
                      onMouseLeave={() => setShowOriginal(false)}
                      onTouchStart={(e) => { e.preventDefault(); setShowOriginal(true); }}
                      onTouchEnd={() => setShowOriginal(false)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all select-none ${
                        showOriginal ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 group relative">
                <canvas 
                  ref={canvasRef} 
                  className={`max-w-full h-auto shadow-2xl transition-all duration-300 ${!sourceUrl ? 'hidden' : showOriginal ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} 
                />
                
                {sourceUrl ? (
                  <>
                    {showOriginal && <img src={sourceUrl} className="absolute max-w-full h-auto shadow-2xl rounded-sm" alt="Original" />}
                  </>
                ) : (
                  <div className="text-center opacity-20">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-black uppercase tracking-tighter text-xl">Waiting for Inspiration</p>
                  </div>
                )}
              </div>

              {sourceUrl && (
                <div className="mt-6">
                  <Button variant="primary" className="w-full py-4 shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition-all" onClick={download} disabled={isProcessing}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Masterpiece
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
