"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";

type AnaglyphMode = "red-cyan" | "green-magenta" | "yellow-blue" | "dubois" | "grayscale";

export default function Anaglyph3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [mode, setMode] = useState<AnaglyphMode>("red-cyan");
  const [horizontalOffset, setHorizontalOffset] = useState<number>(12);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const renderAnaglyph = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img || !sourceUrl) return;

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 50));

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (showOriginal) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
      setIsProcessing(false);
      return;
    }

    // Offscreen canvases for parallax
    const offCnvL = document.createElement("canvas");
    const offCnvR = document.createElement("canvas");
    offCnvL.width = w; offCnvL.height = h;
    offCnvR.width = w; offCnvR.height = h;
    const lctx = offCnvL.getContext("2d");
    const rctx = offCnvR.getContext("2d");
    if (!lctx || !rctx) return;

    lctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    rctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Parallax draw
    lctx.drawImage(img, -horizontalOffset, -verticalOffset, w, h);
    rctx.drawImage(img, horizontalOffset, verticalOffset, w, h);

    const lData = lctx.getImageData(0, 0, w, h).data;
    const rData = rctx.getImageData(0, 0, w, h).data;
    const outData = ctx.createImageData(w, h);
    const op = outData.data;

    for (let i = 0; i < op.length; i += 4) {
      const lr = lData[i], lg = lData[i+1], lb = lData[i+2];
      const rr = rData[i], rg = rData[i+1], rb = rData[i+2];

      if (mode === "red-cyan") {
        op[i] = lr; op[i+1] = rg; op[i+2] = rb;
      } else if (mode === "grayscale") {
        const ll = 0.299*lr + 0.587*lg + 0.114*lb;
        const rl = 0.299*rr + 0.587*rg + 0.114*rb;
        op[i] = ll; op[i+1] = rl; op[i+2] = rl;
      } else if (mode === "green-magenta") {
        op[i] = rr; op[i+1] = lg; op[i+2] = rb; 
      } else if (mode === "yellow-blue") {
        op[i] = lr; op[i+1] = lg; op[i+2] = rb;
      } else if (mode === "dubois") {
        op[i] = Math.max(0, Math.min(255, 0.456*lr + 0.5*lg + 0.176*lb - 0.043*rr - 0.088*rg - 0.002*rb));
        op[i+1] = Math.max(0, Math.min(255, -0.04*lr - 0.038*lg - 0.016*lb + 0.378*rr + 0.734*rg - 0.018*rb));
        op[i+2] = Math.max(0, Math.min(255, -0.015*lr - 0.021*lg - 0.005*lb - 0.072*rr - 0.113*rg + 1.226*rb));
      } else {
        op[i] = lr; op[i+1] = rg; op[i+2] = rb;
      }
      op[i+3] = 255;
    }

    ctx.putImageData(outData, 0, 0);
    setIsProcessing(false);
  }, [sourceUrl, horizontalOffset, verticalOffset, mode, brightness, contrast, saturation, showOriginal]);

  useEffect(() => {
    if (sourceUrl) {
      const timer = setTimeout(renderAnaglyph, 150);
      return () => clearTimeout(timer);
    }
  }, [renderAnaglyph, sourceUrl]);

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^.]+$/, "") + "-3d.png" : "anaglyph.png";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 dark:from-gray-900 dark:via-indigo-950/10 dark:to-rose-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-200 dark:bg-rose-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            3D Anaglyph Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform ordinary 2D photos into immersive 3D experiences. Compatible with standard red-cyan glasses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={clear}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Drag & Drop Image Here"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                    3D Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rendering Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as AnaglyphMode)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="red-cyan">Standard Red/Cyan</option>
                        <option value="dubois">Dubois (Advanced High-Quality)</option>
                        <option value="grayscale">Grayscale 3D</option>
                        <option value="green-magenta">Green/Magenta</option>
                        <option value="yellow-blue">Yellow/Blue (ColorCode)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                          <span>Horizontal Depth</span>
                          <span>{horizontalOffset}px</span>
                        </label>
                        <input
                          type="range" min={0} max={60} value={horizontalOffset}
                          onChange={(e) => setHorizontalOffset(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                          <span>Vertical Align</span>
                          <span>{verticalOffset}px</span>
                        </label>
                        <input
                          type="range" min={-20} max={20} value={verticalOffset}
                          onChange={(e) => setVerticalOffset(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Image Tuning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Brightness</label>
                      <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contrast</label>
                      <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saturation</label>
                      <input type="range" min={0} max={200} value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Render</h3>
                <div className="flex items-center gap-4">
                  {isProcessing && <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />}
                  <button 
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onMouseLeave={() => setShowOriginal(false)}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${
                      showOriginal ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Hold for Original
                  </button>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 group relative">
                {sourceUrl ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-lg transition-all duration-300" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="font-bold text-lg opacity-20 uppercase tracking-tighter">Waiting for Image Source</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="primary" className="w-full py-4 shadow-lg flex items-center justify-center gap-3" onClick={onDownload} disabled={!sourceUrl || isProcessing}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export 3D Image
                </Button>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Best viewed with red-cyan glasses. Adjust depth for stronger parallax.
                </p>
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
