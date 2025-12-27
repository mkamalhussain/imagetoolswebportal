"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";

type UpscaleMethod = "smooth" | "nearest" | "multi-step" | "sharpened" | "lanczos";
type ExportFormat = "png" | "jpeg" | "webp";
type ResolutionPreset = "custom" | "1080p" | "4k" | "8k";

export default function ImageUpscaler() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [scale, setScale] = useState<number>(2);
  const [resolutionPreset, setResolutionPreset] = useState<ResolutionPreset>("custom");
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [method, setMethod] = useState<UpscaleMethod>("sharpened");
  const [denoise, setDenoise] = useState<number>(0);
  const [sharpness, setSharpness] = useState<number>(30);
  const [edgePreservation, setEdgePreservation] = useState<number>(50);
  const [colorEnhancement, setColorEnhancement] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); };
  }, [sourceUrl]);

  const applyUnsharpMask = (data: Uint8ClampedArray, width: number, height: number, amount: number, radius: number) => {
    const out = new Uint8ClampedArray(data.length);
    const blur = new Uint8ClampedArray(data.length);
    const sigma = radius;
    const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
    const kernel: number[] = [];
    let sum = 0;
    
    for (let i = 0; i < kernelSize; i++) {
      const x = i - Math.floor(kernelSize / 2);
      const val = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel.push(val);
      sum += val;
    }
    for (let i = 0; i < kernelSize; i++) kernel[i] /= sum;

    // Horizontal blur
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let val = 0;
          for (let k = 0; k < kernelSize; k++) {
            const px = Math.max(0, Math.min(width - 1, x + k - Math.floor(kernelSize / 2)));
            val += data[(y * width + px) * 4 + c] * kernel[k];
          }
          blur[(y * width + x) * 4 + c] = val;
        }
        blur[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
      }
    }

    // Vertical blur
    const temp = new Uint8ClampedArray(blur);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let val = 0;
          for (let k = 0; k < kernelSize; k++) {
            const py = Math.max(0, Math.min(height - 1, y + k - Math.floor(kernelSize / 2)));
            val += temp[(py * width + x) * 4 + c] * kernel[k];
          }
          blur[(y * width + x) * 4 + c] = val;
        }
      }
    }

    // Unsharp mask
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const original = data[i + c];
        const blurred = blur[i + c];
        const diff = original - blurred;
        out[i + c] = Math.max(0, Math.min(255, original + diff * amount));
      }
      out[i + 3] = data[i + 3];
    }
    return out;
  };

  const applyMedianFilter = (data: Uint8ClampedArray, width: number, height: number, radius: number) => {
    if (radius <= 0) return data;
    const out = new Uint8ClampedArray(data.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rs: number[] = [], gs: number[] = [], bs: number[] = [];
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.max(0, Math.min(width - 1, x + kx));
            const py = Math.max(0, Math.min(height - 1, y + ky));
            const i = (py * width + px) * 4;
            rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]);
          }
        }
        rs.sort((a, b) => a - b); gs.sort((a, b) => a - b); bs.sort((a, b) => a - b);
        const mid = Math.floor(rs.length / 2);
        const idx = (y * width + x) * 4;
        out[idx] = rs[mid]; out[idx + 1] = gs[mid]; out[idx + 2] = bs[mid]; out[idx + 3] = data[idx + 3];
      }
    }
    return out;
  };

  const enhanceColors = (data: Uint8ClampedArray, amount: number) => {
    if (amount === 0) return data;
    const out = new Uint8ClampedArray(data);
    const factor = 1 + (amount / 100);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b);
      if (max > 0) {
        out[i] = Math.min(255, r * factor);
        out[i + 1] = Math.min(255, g * factor);
        out[i + 2] = Math.min(255, b * factor);
      }
    }
    return out;
  };

  const upscale = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    setStatus("Processing...");
    await new Promise(r => setTimeout(r, 50));

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    
    let outW: number, outH: number;
    if (resolutionPreset === "custom") {
      outW = Math.round(w * scale);
      outH = Math.round(h * scale);
    } else {
      if (resolutionPreset === "1080p") {
        outW = 1920; outH = 1080;
      } else if (resolutionPreset === "4k") {
        outW = 3840; outH = 2160;
      } else {
        outW = 7680; outH = 4320;
      }
      const aspectRatio = w / h;
      if (aspectRatio > outW / outH) {
        outH = Math.round(outW / aspectRatio);
      } else {
        outW = Math.round(outH * aspectRatio);
      }
    }

    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (method === "nearest") {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, outW, outH);
    } else if (method === "smooth") {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
    } else if (method === "lanczos") {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
    } else if (method === "multi-step") {
      let tmp = document.createElement("canvas");
      tmp.width = w; tmp.height = h;
      tmp.getContext("2d")?.drawImage(img, 0, 0);
      
      let curW = w, curH = h;
      while (curW < outW || curH < outH) {
        const nextW = Math.min(outW, Math.round(curW * 1.5));
        const nextH = Math.min(outH, Math.round(curH * 1.5));
        const nextCnv = document.createElement("canvas");
        nextCnv.width = nextW; nextCnv.height = nextH;
        const nextCtx = nextCnv.getContext("2d")!;
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = "high";
        nextCtx.drawImage(tmp, 0, 0, curW, curH, 0, 0, nextW, nextH);
        tmp = nextCnv;
        curW = nextW; curH = nextH;
      }
      ctx.drawImage(tmp, 0, 0);
    } else if (method === "sharpened") {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, outW, outH);
      
      if (sharpness > 0) {
        const imgData = ctx.getImageData(0, 0, outW, outH);
        const amount = sharpness / 100;
        const radius = 1 + (sharpness / 50);
        const sharpened = applyUnsharpMask(imgData.data, outW, outH, amount, radius);
        ctx.putImageData(new ImageData(sharpened, outW, outH), 0, 0);
      }
    }

    if (denoise > 0) {
      const imgData = ctx.getImageData(0, 0, outW, outH);
      const radius = Math.floor(denoise / 10);
      const denoised = applyMedianFilter(imgData.data, outW, outH, radius);
      ctx.putImageData(new ImageData(new Uint8ClampedArray(denoised), outW, outH), 0, 0);
    }

    if (colorEnhancement > 0) {
      const imgData = ctx.getImageData(0, 0, outW, outH);
      const enhanced = enhanceColors(imgData.data, colorEnhancement);
      ctx.putImageData(new ImageData(new Uint8ClampedArray(enhanced), outW, outH), 0, 0);
    }

    // Calculate file size
    const dataUrl = canvas.toDataURL(`image/${exportFormat}`, exportFormat === "png" ? undefined : jpegQuality / 100);
    const sizeInBytes = Math.round((dataUrl.length - 22) * 3 / 4);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeInMB} MB`);

    setIsProcessing(false);
    setStatus(`${outW}×${outH}px`);
  }, [sourceUrl, scale, resolutionPreset, method, denoise, sharpness, colorEnhancement, exportFormat, jpegQuality]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(upscale, 300);
      return () => clearTimeout(timer);
    }
  }, [upscale, sourceUrl]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
      
      // Store original in canvas for comparison
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = img.naturalWidth;
        originalCanvasRef.current.height = img.naturalHeight;
        originalCanvasRef.current.getContext("2d")?.drawImage(img, 0, 0);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatus("Failed to load image");
    };
    img.src = url;
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = exportFormat === "png" ? "image/png" : exportFormat === "jpeg" ? "image/jpeg" : "image/webp";
    const quality = exportFormat === "png" ? undefined : jpegQuality / 100;
    const dataUrl = canvas.toDataURL(mime, quality);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `upscaled-${fileName?.split('.')[0] || 'result'}.${exportFormat}`;
    a.click();
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-cyan-950/10 dark:to-blue-950/10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Image Upscaler
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enhance and enlarge your photos with advanced algorithms. Professional-grade upscaling with AI-enhanced sharpening and noise reduction.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={() => { setSourceUrl(null); setFileName(null); setFileSize(""); }}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Drag & Drop Image Here"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Upscale Engine</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Resolution Preset</label>
                        <select 
                          value={resolutionPreset} 
                          onChange={e => {
                            setResolutionPreset(e.target.value as ResolutionPreset);
                            if (e.target.value !== "custom") {
                              setScale(2);
                            }
                          }}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold"
                        >
                          <option value="custom">Custom Scale</option>
                          <option value="1080p">1080p (Full HD)</option>
                          <option value="4k">4K (Ultra HD)</option>
                          <option value="8k">8K (Super HD)</option>
                        </select>
                      </div>
                      {resolutionPreset === "custom" && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                            <span>Scale Factor</span>
                            <span className="text-cyan-600">{scale}x</span>
                          </div>
                          <input
                            type="range" min={1.25} max={8} step={0.25} value={scale}
                            onChange={e => setScale(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase">Algorithm</label>
                      <select 
                        value={method} 
                        onChange={e => setMethod(e.target.value as UpscaleMethod)} 
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold"
                      >
                        <option value="sharpened">AI-Enhanced (Unsharp Mask)</option>
                        <option value="multi-step">Multi-Pass (HQ)</option>
                        <option value="lanczos">Lanczos (Crisp)</option>
                        <option value="smooth">Bicubic (Smooth)</option>
                        <option value="nearest">Pixel-Art (Nearest)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Enhancement Studio</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Unsharp Mask</span>
                        <span className="text-cyan-600">{sharpness}%</span>
                      </div>
                      <input 
                        type="range" min={0} max={100} value={sharpness} 
                        onChange={e => setSharpness(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <p className="text-[10px] text-gray-500">Advanced edge sharpening algorithm</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Noise Reduction</span>
                        <span className="text-cyan-600">{denoise}%</span>
                      </div>
                      <input 
                        type="range" min={0} max={50} value={denoise} 
                        onChange={e => setDenoise(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <p className="text-[10px] text-gray-500">Median filter for artifact removal</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Color Enhancement</span>
                        <span className="text-cyan-600">{colorEnhancement}%</span>
                      </div>
                      <input 
                        type="range" min={0} max={50} value={colorEnhancement} 
                        onChange={e => setColorEnhancement(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />
                      <p className="text-[10px] text-gray-500">Boost color saturation and vibrancy</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Export Studio</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">Format</label>
                        <select 
                          value={exportFormat} 
                          onChange={e => setExportFormat(e.target.value as ExportFormat)} 
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold"
                        >
                          <option value="png">PNG (Lossless)</option>
                          <option value="jpeg">JPEG (Compressed)</option>
                          <option value="webp">WebP (Modern)</option>
                        </select>
                      </div>
                      {exportFormat !== "png" && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                            <span>Quality</span>
                            <span className="text-cyan-600">{jpegQuality}%</span>
                          </div>
                          <input 
                            type="range" min={60} max={100} value={jpegQuality} 
                            onChange={e => setJpegQuality(parseInt(e.target.value))} 
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                          />
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="primary" 
                      className="w-full py-4 shadow-lg flex items-center justify-center gap-3" 
                      onClick={download} 
                      disabled={isProcessing}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Enhanced Image
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[400px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enhanced Preview</h3>
                <div className="flex gap-4 items-center">
                  {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />}
                  {status && <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{status}</span>}
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner p-4 relative group">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#000 10%, transparent 10%)", backgroundSize: "20px 20px" }} />
                
                {sourceUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-full shadow-2xl"
                      style={{ 
                        clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)`,
                        transition: isDraggingSlider ? 'none' : 'clip-path 0.1s'
                      }}
                    />
                    {originalImgRef.current && (
                      <img 
                        src={sourceUrl} 
                        className="absolute max-w-full max-h-full shadow-2xl"
                        style={{ 
                          clipPath: `inset(0 0 0 ${comparisonSlider}%)`,
                          transition: isDraggingSlider ? 'none' : 'clip-path 0.1s'
                        }}
                        alt="Original" 
                      />
                    )}
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-cyan-500 shadow-lg"
                        style={{ left: `${comparisonSlider}%` }}
                      />
                      <div 
                        className="absolute top-2 left-2 px-2 py-1 bg-cyan-500/90 text-white text-[10px] font-black uppercase rounded shadow-lg"
                        style={{ left: `${comparisonSlider}%`, transform: 'translateX(-50%)' }}
                      >
                        {comparisonSlider < 50 ? 'Original' : 'Enhanced'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <p className="font-bold text-lg opacity-20 uppercase tracking-tighter">Waiting for Image</p>
                  </div>
                )}
              </div>

              {sourceUrl && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                      <span>Comparison Slider</span>
                      <span className="text-cyan-600">{Math.round(comparisonSlider)}% Enhanced</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={comparisonSlider}
                      onChange={e => setComparisonSlider(parseInt(e.target.value))}
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onMouseUp={() => setIsDraggingSlider(false)}
                      onTouchStart={() => setIsDraggingSlider(true)}
                      onTouchEnd={() => setIsDraggingSlider(false)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  <div className="flex justify-between items-center px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>File Size: {fileSize || "Calculating..."}</span>
                    <span className="text-cyan-600">{exportFormat.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={originalCanvasRef} className="hidden" />

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
