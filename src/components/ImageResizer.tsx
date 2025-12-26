"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type Format = "png" | "jpeg" | "webp";
type ResizeMode = "pixels" | "percentage";
type FillMode = "fit" | "fill" | "stretch";

const PRESETS = [
  { name: "Instagram Post", w: 1080, h: 1080 },
  { name: "Instagram Story", w: 1080, h: 1920 },
  { name: "Twitter Header", w: 1500, h: 500 },
  { name: "YouTube Thumb", w: 1280, h: 720 },
  { name: "4K UHD", w: 3840, h: 2160 },
  { name: "1080p Full HD", w: 1920, h: 1080 },
];

export default function ImageResizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [origW, setOrigW] = useState<number>(0);
  const [origH, setOrigH] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(100);
  const [mode, setMode] = useState<ResizeMode>("pixels");
  const [fillMode, setFillMode] = useState<FillMode>("fit");
  const [bgColor, setBgColor] = useState("#ffffff");
  
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  
  const [watermark, setWatermark] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkPos, setWatermarkPos] = useState("bottom-right");
  
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState<number>(90);
  const [smoothing, setSmoothing] = useState<ImageSmoothingQuality>("high");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [newSize, setNewSize] = useState<number>(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl || width <= 0 || height <= 0) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Actual canvas size is based on rotation
    const isVertical = (rotation / 90) % 2 !== 0;
    const canvasW = isVertical ? height : width;
    const canvasH = isVertical ? width : height;

    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background for Fit mode
    if (fillMode === "fit") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = smoothing;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    
    if (fillMode === "stretch") {
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
    } else {
      // Fit or Fill logic
      const iAspect = origW / origH;
      const cAspect = width / height;
      let drawW = width;
      let drawH = height;

      if (fillMode === "fit") {
        if (iAspect > cAspect) {
          drawH = width / iAspect;
        } else {
          drawW = height * iAspect;
        }
      } else if (fillMode === "fill") {
        if (iAspect > cAspect) {
          drawW = height * iAspect;
        } else {
          drawH = width / iAspect;
        }
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();

    // Watermark
    if (watermark) {
      ctx.save();
      const fontSize = Math.max(12, Math.floor(canvas.width / 20));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity / 100})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacity / 100})`;
      ctx.lineWidth = 1;
      
      const metrics = ctx.measureText(watermark);
      const textW = metrics.width;
      const textH = fontSize;
      let tx = 20, ty = 20 + textH;

      if (watermarkPos.includes("right")) tx = canvas.width - textW - 20;
      if (watermarkPos.includes("center")) tx = (canvas.width - textW) / 2;
      if (watermarkPos.includes("bottom")) ty = canvas.height - 20;
      if (watermarkPos.includes("middle")) ty = (canvas.height + textH) / 2;

      ctx.fillText(watermark, tx, ty);
      ctx.strokeText(watermark, tx, ty);
      ctx.restore();
    }

    const type = `image/${format}`;
    const q = format === "png" ? undefined : quality / 100;
    const dataUrl = canvas.toDataURL(type, q);
    
    const head = dataUrl.indexOf(",") + 1;
    setNewSize(Math.round((dataUrl.length - head) * 3 / 4));
    
    setIsProcessing(false);
  }, [width, height, rotation, flipH, flipV, format, quality, smoothing, sourceUrl, fillMode, bgColor, watermark, watermarkOpacity, watermarkPos, origW, origH]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(render, showOriginal ? 0 : 300);
      return () => clearTimeout(timer);
    }
  }, [render, sourceUrl, showOriginal]);

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
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setOrigW(w);
      setOrigH(h);
      setWidth(w);
      setHeight(h);
      setPercentage(100);
      setSourceUrl(url);
      setFileName(file.name);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const updateWidth = (newW: number) => {
    if (newW <= 0) return;
    if (lockAspect && origW > 0) {
      const ratio = origH / origW;
      setWidth(newW);
      setHeight(Math.round(newW * ratio));
      setPercentage(Math.round((newW / origW) * 100));
    } else {
      setWidth(newW);
      if (origW > 0) setPercentage(Math.round((newW / origW) * 100));
    }
  };

  const updateHeight = (newH: number) => {
    if (newH <= 0) return;
    if (lockAspect && origH > 0) {
      const ratio = origW / origH;
      setHeight(newH);
      setWidth(Math.round(newH * ratio));
      setPercentage(Math.round((newH / origH) * 100));
    } else {
      setHeight(newH);
      if (origH > 0) setPercentage(Math.round((newH / origH) * 100));
    }
  };

  const updatePercentage = (p: number) => {
    if (p <= 0 || !origW) return;
    setPercentage(p);
    const newW = Math.round((origW * p) / 100);
    const newH = Math.round((origH * p) / 100);
    setWidth(newW);
    setHeight(newH);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    if (lockAspect) {
      // Fit within preset while maintaining aspect
      const ratio = origW / origH;
      const pRatio = preset.w / preset.h;
      if (ratio > pRatio) {
        // Limited by width
        updateWidth(preset.w);
      } else {
        updateHeight(preset.h);
      }
    } else {
      setWidth(preset.w);
      setHeight(preset.h);
    }
    setMode("pixels");
  };

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = `image/${format}`;
    const url = canvas.toDataURL(mime, quality / 100);
    const a = document.createElement("a");
    a.href = url;
    const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "resized";
    const ext = format === "jpeg" ? "jpg" : format;
    a.download = `${base}-${width}x${height}.${ext}`;
    a.click();
  };

  const clear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setFileName(null);
    originalImgRef.current = null;
    setOrigW(0);
    setOrigH(0);
    setWidth(0);
    setHeight(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-blue-950/10 dark:to-indigo-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Image Resizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Precisely resize, rotate, and optimize your images for web and social media.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={clear}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Click or drag & drop"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dimensions & Fit</h3>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <button 
                        onClick={() => setMode("pixels")}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === "pixels" ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600" : "text-gray-500"}`}
                      >
                        Pixels
                      </button>
                      <button 
                        onClick={() => setMode("percentage")}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === "percentage" ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600" : "text-gray-500"}`}
                      >
                        Percent
                      </button>
                    </div>
                  </div>

                  {mode === "pixels" ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Width</label>
                        <div className="relative">
                          <input
                            type="number" value={width} onChange={(e) => updateWidth(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          />
                          <span className="absolute right-4 top-3.5 text-xs text-gray-400">px</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Height</label>
                        <div className="relative">
                          <input
                            type="number" value={height} onChange={(e) => updateHeight(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                          />
                          <span className="absolute right-4 top-3.5 text-xs text-gray-400">px</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Scale Factor</span>
                        <span className="text-blue-600">{percentage}%</span>
                      </div>
                      <input
                        type="range" min={1} max={400} value={percentage}
                        onChange={(e) => updatePercentage(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all"
                      />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-blue-500">Lock Aspect</span>
                    </label>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scaling Method</label>
                      <select 
                        value={fillMode} onChange={(e) => setFillMode(e.target.value as FillMode)}
                        className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold"
                      >
                        <option value="fit">Fit (Contain)</option>
                        <option value="fill">Fill (Cover)</option>
                        <option value="stretch">Stretch to Box</option>
                      </select>
                    </div>
                  </div>

                  {fillMode === "fit" && (
                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 uppercase">Canvas Color</span>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Social Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => applyPreset(p)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-transparent hover:border-blue-500"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Watermark & Transform</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Watermark Text</label>
                        <input 
                          type="text" value={watermark} onChange={(e) => setWatermark(e.target.value)}
                          placeholder="Ex: © 2025 Kamal"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Placement</label>
                        <select 
                          value={watermarkPos} onChange={(e) => setWatermarkPos(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="middle-center">Center</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    </div>
                    {watermark && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>Visibility</span>
                          <span>{watermarkOpacity}%</span>
                        </div>
                        <input type="range" min={10} max={100} value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))} className="w-full h-1.5 accent-blue-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Rotation</label>
                      <div className="flex gap-2">
                        <button onClick={() => setRotation(r => (r + 270) % 360)} className="flex-1 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:text-blue-600 transition-colors">↺</button>
                        <button onClick={() => setRotation(r => (r + 90) % 360)} className="flex-1 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:text-blue-600 transition-colors">↻</button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Flip</label>
                      <div className="flex gap-2">
                        <button onClick={() => setFlipH(!flipH)} className={`flex-1 py-2 rounded-lg border transition-all ${flipH ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>⇿</button>
                        <button onClick={() => setFlipV(!flipV)} className={`flex-1 py-2 rounded-lg border transition-all ${flipV ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>⇳</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Render Output</h3>
                <div className="flex items-center gap-4">
                  {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />}
                  <button 
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onMouseLeave={() => setShowOriginal(false)}
                    onTouchStart={(e) => { e.preventDefault(); setShowOriginal(true); }}
                    onTouchEnd={() => setShowOriginal(false)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all select-none ${
                      showOriginal ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Hold for Original
                  </button>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 relative group">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#000 10%, transparent 10%)", backgroundSize: "20px 20px" }} />
                
                {sourceUrl ? (
                  showOriginal ? (
                    <img src={sourceUrl} className="max-w-full h-auto rounded-sm shadow-2xl" alt="Original" />
                  ) : (
                    <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-sm transition-all duration-300" />
                  )
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <p className="font-bold text-lg opacity-20 uppercase tracking-tighter">Waiting for Image</p>
                  </div>
                )}
              </div>

              {sourceUrl && (
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Source Resolution</span>
                    <span className="text-2xl font-black text-gray-700 dark:text-gray-300">{origW}×{origH}</span>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                    <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Estimate</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatFileSize(newSize)}</span>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button variant="primary" className="w-full py-4 shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition-all" onClick={onDownload} disabled={!sourceUrl || isProcessing}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Optimized Image
                </Button>
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
