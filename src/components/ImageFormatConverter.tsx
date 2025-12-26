"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";

type Format = "png" | "jpeg" | "webp" | "avif" | "gif" | "bmp" | "ico" | "tiff" | "pdf";

export default function ImageFormatConverter() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  
  const [format, setFormat] = useState<Format>("png");
  const [quality, setQuality] = useState<number>(90);
  const [scale, setStrength] = useState<number>(100);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isGrayscale, setIsGrayscale] = useState(false);
  
  const [resultUrl, setResultUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [avifSupported, setAvifSupported] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  // Check AVIF support and Load jsPDF from CDN
  useEffect(() => {
    const canvas = document.createElement("canvas");
    setAvifSupported(canvas.toDataURL("image/avif").indexOf("image/avif") !== -1);

    if (typeof window !== "undefined" && !(window as any).jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.onload = () => setPdfReady(true);
      document.head.appendChild(script);
    } else if ((window as any).jspdf) {
      setPdfReady(true);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const convert = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const targetWidth = Math.max(1, Math.round(img.naturalWidth * (scale / 100)));
    const targetHeight = Math.max(1, Math.round(img.naturalHeight * (scale / 100)));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    
    let filters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (isGrayscale) filters += " grayscale(100%)";
    ctx.filter = filters;
    
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    ctx.filter = "none";

    if (format === "pdf") {
      // For PDF, we show a preview as JPEG
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setResultUrl(dataUrl);
      setNewSize(Math.round((dataUrl.length - 22) * 3 / 4)); // Estimate
    } else {
      const type = `image/${format === "ico" ? "x-icon" : format}`;
      const q = (format === "png" || format === "gif" || format === "bmp" || format === "tiff") ? undefined : Math.min(1, Math.max(0, quality / 100));
      
      const dataUrl = canvas.toDataURL(type, q);
      setResultUrl(dataUrl);

      const head = dataUrl.indexOf(",") + 1;
      const size = Math.round((dataUrl.length - head) * 3 / 4);
      setNewSize(size);
    }
    
    setIsProcessing(false);
  }, [sourceUrl, format, quality, scale, brightness, contrast, saturation, isGrayscale]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(convert, 300);
      return () => clearTimeout(timer);
    }
  }, [convert, sourceUrl]);

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
      setOriginalSize(file.size);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const download = async () => {
    if (!resultUrl || !canvasRef.current) return;

    if (format === "pdf") {
      const { jsPDF } = (window as any).jspdf;
      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL("image/jpeg", quality / 100);
      
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName?.split(".")[0] || "converted"}.pdf`);
    } else {
      const a = document.createElement("a");
      a.href = resultUrl;
      const ext = format === "jpeg" ? "jpg" : format;
      const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "converted";
      a.download = `${base}.${ext}`;
      a.click();
    }
  };

  const clear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setFileName(null);
    setResultUrl("");
    setOriginalSize(0);
    setNewSize(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-emerald-950/10 dark:to-cyan-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Image Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Switch between formats, resize, and tune your images with instant live previews. All processed locally in your browser.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={clear}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {fileName ? `File: ${fileName}` : "Drop your image here"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Output Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as Format)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPEG (Universal)</option>
                        <option value="webp">WebP (High Compression)</option>
                        {avifSupported && <option value="avif">AVIF (Ultra Efficient)</option>}
                        <option value="gif">GIF</option>
                        <option value="bmp">BMP</option>
                        <option value="tiff">TIFF</option>
                        <option value="ico">ICO (Icon)</option>
                        <option value="pdf">PDF (Document)</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>Quality</span>
                        <span className="font-mono text-emerald-600">{quality}%</span>
                      </label>
                      <input
                        type="range" min={1} max={100} value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        disabled={format === "png"}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-gray-700">
                    <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Scaling / Resize</span>
                      <span className="font-mono text-emerald-600">{scale}%</span>
                    </label>
                    <input
                      type="range" min={10} max={200} step={1} value={scale}
                      onChange={(e) => setStrength(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>New Resolution:</span>
                      <span>{Math.round(width * scale / 100)} × {Math.round(height * scale / 100)} px</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Image Tuning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                          <span>Brightness</span>
                          <span>{brightness}%</span>
                        </label>
                        <input type="range" min={0} max={200} value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1.5 accent-emerald-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div>
                        <label className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                          <span>Contrast</span>
                          <span>{contrast}%</span>
                        </label>
                        <input type="range" min={0} max={200} value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-1.5 accent-emerald-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                          <span>Saturation</span>
                          <span>{saturation}%</span>
                        </label>
                        <input type="range" min={0} max={200} value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full h-1.5 accent-emerald-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Grayscale</span>
                        <input 
                          type="checkbox" checked={isGrayscale} 
                          onChange={(e) => setIsGrayscale(e.target.checked)} 
                          className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-emerald-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 after:transition-transform checked:after:translate-x-5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Preview & Stats */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px] relative overflow-hidden">
              {!sourceUrl ? (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-bold text-xl">Upload an image to convert</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h3>
                    {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />}
                  </div>

                  <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner group relative">
                    {/* Checkerboard background for transparency */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#000 10%, transparent 10%)", backgroundSize: "20px 20px" }} />
                    
                    {resultUrl && (
                      <img 
                        src={resultUrl} 
                        alt="Converted" 
                        className={`max-w-full h-auto shadow-2xl transition-opacity duration-300 ${isProcessing ? 'opacity-50' : 'opacity-100'}`} 
                      />
                    )}
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Original Size</span>
                      <span className="text-2xl font-black text-gray-700 dark:text-gray-300">{formatFileSize(originalSize)}</span>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                      <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">New Estimate</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatFileSize(newSize)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Button variant="primary" className="w-full py-4 shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-3" onClick={download} disabled={!resultUrl || isProcessing}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Converted Image
                    </Button>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                      <span>Saved: {originalSize > newSize ? Math.round((1 - newSize/originalSize) * 100) : 0}%</span>
                      <span>Format: {format.toUpperCase()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

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
