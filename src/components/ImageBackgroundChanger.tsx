"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";

function colorDiff(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export default function ImageBackgroundChanger() {
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [targetColor, setTargetColor] = useState<string>("#00ff00");
  const [tolerance, setTolerance] = useState<number>(40);
  const [feather, setFeather] = useState<number>(2);
  const [resultUrl, setResultUrl] = useState<string>("");
  
  const [bgType, setBgType] = useState<"none" | "color" | "image" | "gradient">("none");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgGradient, setBgGradient] = useState<{from: string, to: string}>({ from: "#3b82f6", to: "#8b5cf6" });
  const [bgImageUrl, setBgImageUrl] = useState<string>("");
  const [bgFit, setBgFit] = useState<"cover" | "contain">("cover");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFromBlob(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  const onBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImageUrl(url);
    setBgType("image");
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const m = hex.replace('#', '');
    const r = parseInt(m.substring(0, 2), 16);
    const g = parseInt(m.substring(2, 4), 16);
    const b = parseInt(m.substring(4, 6), 16);
    return [r, g, b];
  };

  const autoDetectBackground = useCallback(() => {
    if (!sourceUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = 100; cv.height = 100;
      const ct = cv.getContext("2d");
      if (!ct) return;
      ct.drawImage(img, 0, 0, 100, 100);
      const data = ct.getImageData(0, 0, 1, 1).data; // Just pick top-left pixel
      const hex = "#" + ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1);
      setTargetColor(hex);
    };
    img.src = sourceUrl;
  }, [sourceUrl]);

  const pickColor = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        setTargetColor(result.sRGBHex);
      } catch (e) {
        // user cancelled or failed
      }
    } else {
      alert("EyeDropper API is not supported in this browser. Please use the color picker below.");
    }
  };

  const process = useCallback(async () => {
    if (!sourceUrl) {
      setResultUrl("");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = sourceUrl;
    });

    const w = img.width;
    const h = img.height;
    
    // 1. Create original canvas
    const mainCnv = canvasRef.current || document.createElement("canvas");
    mainCnv.width = w;
    mainCnv.height = h;
    const mainCtx = mainCnv.getContext("2d", { willReadFrequently: true });
    if (!mainCtx) return;
    mainCtx.drawImage(img, 0, 0);

    // 2. Create mask based on color
    const imgData = mainCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const target = hexToRgb(targetColor);

    for (let i = 0; i < data.length; i += 4) {
      const diff = colorDiff([data[i], data[i+1], data[i+2]], target);
      // We'll set alpha based on tolerance
      // Using a small transition for smoother edges
      if (diff < tolerance) {
        data[i + 3] = 0;
      } else if (diff < tolerance + 10) {
        data[i + 3] = ((diff - tolerance) / 10) * 255;
      } else {
        data[i + 3] = 255;
      }
    }

    // 3. Apply Feathering (if enabled)
    // We use an offscreen canvas for the masked image
    const maskedCnv = document.createElement("canvas");
    maskedCnv.width = w;
    maskedCnv.height = h;
    const maskedCtx = maskedCnv.getContext("2d");
    if (!maskedCtx) return;
    maskedCtx.putImageData(imgData, 0, 0);

    // 4. Compose with background
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    if (bgType === "color") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, bgGradient.from);
      grad.addColorStop(1, bgGradient.to);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (bgType === "image" && bgImageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.src = bgImageUrl;
      });

      const iAspect = bgImg.width / bgImg.height;
      const cAspect = w / h;
      let drawW = w, drawH = h, dx = 0, dy = 0;

      if (bgFit === "cover") {
        if (iAspect > cAspect) {
          drawW = h * iAspect; dx = (w - drawW) / 2;
        } else {
          drawH = w / iAspect; dy = (h - drawH) / 2;
        }
      } else {
        if (iAspect > cAspect) {
          drawH = w / iAspect; dy = (h - drawH) / 2;
        } else {
          drawW = h * iAspect; dx = (w - drawW) / 2;
        }
      }
      ctx.drawImage(bgImg, dx, dy, drawW, drawH);
    }

    // Draw the masked foreground
    if (feather > 0) {
      ctx.filter = `blur(${feather}px)`;
      // We draw it slightly enlarged or just rely on the blur to smooth edges
      ctx.drawImage(maskedCnv, 0, 0);
      ctx.filter = "none";
    }
    ctx.drawImage(maskedCnv, 0, 0);

    setResultUrl(out.toDataURL("image/png"));
  }, [sourceUrl, targetColor, tolerance, feather, bgType, bgColor, bgGradient, bgImageUrl, bgFit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      process();
    }, 100);
    return () => clearTimeout(timer);
  }, [process]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `bg-changed-${fileName || "result"}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            Background Changer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Effortlessly remove or replace backgrounds from your images. Use solid colors, gradients, or custom images.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Upload Section */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={() => { setSourceUrl(""); setFileName(null); setResultUrl(""); }}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {fileName ? `File: ${fileName}` : "Drag and drop your image here"}
                </p>
              </div>
            </div>

            {/* Removal Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Removal Settings</h3>
                {sourceUrl && (
                  <button onClick={autoDetectBackground} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Auto-detect BG
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Color</span>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="relative group">
                        <input
                          type="color" value={targetColor}
                          onChange={(e) => setTargetColor(e.target.value)}
                          className="w-12 h-12 p-0.5 border-0 rounded-lg cursor-pointer bg-transparent"
                        />
                      </div>
                      <Button 
                        variant="secondary" 
                        className="flex items-center gap-2"
                        onClick={pickColor}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Pick Color
                      </Button>
                      <span className="text-sm font-mono text-gray-500">{targetColor.toUpperCase()}</span>
                    </div>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tolerance: {tolerance}
                    </label>
                    <input
                      type="range" min={0} max={150} value={tolerance}
                      onChange={(e) => setTolerance(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Edge Feathering: {feather}px
                    </label>
                    <input
                      type="range" min={0} max={10} value={feather}
                      onChange={(e) => setFeather(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Smoothens the edges of the cutout.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Replacement Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Replacement Background</h3>
              
              <div className="flex flex-wrap gap-3">
                {["none", "color", "gradient", "image"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setBgType(type as any)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      bgType === type
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                {bgType === "color" && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pick Color:</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 p-0.5 rounded cursor-pointer" />
                  </div>
                )}
                
                {bgType === "gradient" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">From</span>
                      <input type="color" value={bgGradient.from} onChange={(e) => setBgGradient({...bgGradient, from: e.target.value})} className="w-full h-10 p-0.5 rounded cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">To</span>
                      <input type="color" value={bgGradient.to} onChange={(e) => setBgGradient({...bgGradient, to: e.target.value})} className="w-full h-10 p-0.5 rounded cursor-pointer" />
                    </div>
                  </div>
                )}

                {bgType === "image" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <Button variant="secondary" as="label">
                        Choose Image
                        <input type="file" accept="image/*" onChange={onBgFile} className="hidden" />
                      </Button>
                      <select
                        value={bgFit}
                        onChange={(e) => setBgFit(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                      >
                        <option value="cover">Fit: Cover</option>
                        <option value="contain">Fit: Contain</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full py-3" onClick={download} disabled={!resultUrl}>
                  Download PNG Result
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded uppercase">Output</span>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                {/* Checkerboard pattern for transparency */}
                <div 
                  className="absolute inset-0 opacity-10 dark:opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                ></div>

                {resultUrl ? (
                  <img src={resultUrl} alt="Result" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-2xl" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600 relative z-10">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium">Upload an image to preview results</p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Original Image</span>
                  {sourceUrl ? (
                    <img 
                      src={sourceUrl} 
                      className="h-20 w-full object-cover rounded border border-gray-200 dark:border-gray-600"
                      alt="Source thumb"
                    />
                  ) : (
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Color</span>
                  <div className="h-20 w-full rounded border border-gray-200 dark:border-gray-600" style={{ backgroundColor: targetColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={maskCanvasRef} className="hidden" />

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
