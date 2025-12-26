"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "./Button";

type Tool = "blur" | "clone" | "smudge" | "heal" | "patch";
type ExportFormat = "png" | "jpeg" | "webp";

export default function WatermarkRemover() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [tool, setTool] = useState<Tool>("heal");
  const [brushSize, setBrushSize] = useState<number>(30);
  const [brushHardness, setBrushHardness] = useState<number>(70);
  const [strength, setStrength] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(100);
  const [showOriginal, setShowOriginal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef(false);
  const cloneSourceRef = useRef<{ x: number; y: number } | null>(null);
  const cloneOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const brushPreviewRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); };
  }, [sourceUrl]);

  // Draw clone source indicator on overlay canvas
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const mainCanvas = canvasRef.current;
    if (!overlay || !mainCanvas) {
      if (overlay) {
        const ctx = overlay.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
        }
      }
      return;
    }

    const syncCanvasSize = () => {
      if (!overlay || !mainCanvas || tool !== "clone" || !cloneSource) return;
      
      // Sync internal canvas size (pixel dimensions) only
      // Let CSS handle display size - both canvases share the same classes
      overlay.width = mainCanvas.width;
      overlay.height = mainCanvas.height;
    };

    const ctx = overlay.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrame: number | null = null;

    // Only sync when clone tool is active
    if (!cloneSource || tool !== "clone") {
      ctx.clearRect(0, 0, overlay.width || 0, overlay.height || 0);
      // Set dimensions to 0 to prevent layout impact
      overlay.width = 0;
      overlay.height = 0;
      return () => {
        // Cleanup if needed
      };
    }

    // Sync size only when clone tool is active
    syncCanvasSize();

    let startTime = Date.now();

    const draw = () => {
      // Clear overlay
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Only draw if still in clone mode
      if (tool !== "clone" || !cloneSource) {
        return;
      }

      // Draw clone source indicator
      const x = cloneSource.x;
      const y = cloneSource.y;
      const r = brushSize;
      
      // Pulsing effect
      const time = (Date.now() - startTime) / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(time * 2);

      // Outer circle with pulse
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 + pulse * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // White ring around dot
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Cyan ring
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.stroke();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [cloneSource, tool, brushSize, sourceUrl, zoom]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(data);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  }, [history, historyIdx]);

  const undo = () => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    const canvas = canvasRef.current;
    if (!canvas || !prev) return;
    canvas.getContext("2d")?.putImageData(prev, 0, 0);
    setHistoryIdx(historyIdx - 1);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    const canvas = canvasRef.current;
    if (!canvas || !next) return;
    canvas.getContext("2d")?.putImageData(next, 0, 0);
    setHistoryIdx(historyIdx + 1);
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.round(((clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  const createBrushMask = (radius: number, hardness: number) => {
    const size = radius * 2 + 1;
    const mask = new Uint8ClampedArray(size * size);
    const center = radius;
    const softRadius = radius * (hardness / 100);
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= softRadius) {
          mask[y * size + x] = 255;
        } else if (dist <= radius) {
          const fade = 1 - (dist - softRadius) / (radius - softRadius);
          mask[y * size + x] = Math.round(255 * fade);
        } else {
          mask[y * size + x] = 0;
        }
      }
    }
    return { mask, size };
  };

  const applyHealingBrush = (x: number, y: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const r = brushSize;
    const sampleRadius = r * 2;
    const area = ctx.getImageData(x - sampleRadius, y - sampleRadius, sampleRadius * 2, sampleRadius * 2);
    const target = ctx.getImageData(x - r, y - r, r * 2, r * 2);
    
    const { mask, size } = createBrushMask(r, brushHardness);
    const data = target.data;
    const areaData = area.data;
    const w = target.width;
    const h = target.height;
    
    for (let ay = 0; ay < h; ay++) {
      for (let ax = 0; ax < w; ax++) {
        const dx = ax - r, dy = ay - r;
        if (dx * dx + dy * dy > r * r) continue;
        
        const maskIdx = ay * size + ax;
        const alpha = mask[maskIdx] / 255;
        if (alpha === 0) continue;
        
        let bestX = ax, bestY = ay;
        let bestScore = Infinity;
        
        for (let sy = -sampleRadius; sy <= sampleRadius; sy += 2) {
          for (let sx = -sampleRadius; sx <= sampleRadius; sx += 2) {
            if (sx === 0 && sy === 0) continue;
            const px = Math.max(0, Math.min(w - 1, ax + sx));
            const py = Math.max(0, Math.min(h - 1, ay + sy));
            const dist = Math.sqrt(sx * sx + sy * sy);
            if (dist > sampleRadius) continue;
            
            const areaIdx = ((py + sampleRadius) * (sampleRadius * 2) + (px + sampleRadius)) * 4;
            const targetIdx = (ay * w + ax) * 4;
            
            const dr = areaData[areaIdx] - data[targetIdx];
            const dg = areaData[areaIdx + 1] - data[targetIdx + 1];
            const db = areaData[areaIdx + 2] - data[targetIdx + 2];
            const score = dr * dr + dg * dg + db * db + dist * 0.1;
            
            if (score < bestScore) {
              bestScore = score;
              bestX = px;
              bestY = py;
            }
          }
        }
        
        const bestIdx = (bestY * w + bestX) * 4;
        const targetIdx = (ay * w + ax) * 4;
        const blend = alpha * (strength / 100);
        
        data[targetIdx] = data[targetIdx] * (1 - blend) + areaData[bestIdx] * blend;
        data[targetIdx + 1] = data[targetIdx + 1] * (1 - blend) + areaData[bestIdx + 1] * blend;
        data[targetIdx + 2] = data[targetIdx + 2] * (1 - blend) + areaData[bestIdx + 2] * blend;
      }
    }
    
    ctx.putImageData(target, x - r, y - r);
  };

  const applyAtPos = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const r = brushSize;
    const { mask, size } = createBrushMask(r, brushHardness);
    
    if (tool === "blur") {
      const area = ctx.getImageData(x - r, y - r, r * 2, r * 2);
      const data = area.data;
      const copy = new Uint8ClampedArray(data);
      const k = Math.max(1, Math.floor(strength / 10));
      const w = area.width;
      const h = area.height;
      
      for (let ay = 0; ay < h; ay++) {
        for (let ax = 0; ax < w; ax++) {
          const dx = ax - r, dy = ay - r;
          if (dx * dx + dy * dy > r * r) continue;
          
          const maskIdx = ay * size + ax;
          const alpha = mask[maskIdx] / 255;
          if (alpha === 0) continue;
          
          let rs = 0, gs = 0, bs = 0, n = 0;
          for (let ky = -k; ky <= k; ky++) {
            for (let kx = -k; kx <= k; kx++) {
              const px = Math.max(0, Math.min(w - 1, ax + kx));
              const py = Math.max(0, Math.min(h - 1, ay + ky));
              const i = (py * w + px) * 4;
              rs += copy[i]; gs += copy[i + 1]; bs += copy[i + 2]; n++;
            }
          }
          
          const idx = (ay * w + ax) * 4;
          const blend = alpha * (strength / 100);
          data[idx] = data[idx] * (1 - blend) + (rs / n) * blend;
          data[idx + 1] = data[idx + 1] * (1 - blend) + (gs / n) * blend;
          data[idx + 2] = data[idx + 2] * (1 - blend) + (bs / n) * blend;
        }
      }
      ctx.putImageData(area, x - r, y - r);
    } else if (tool === "clone") {
      const src = cloneSourceRef.current;
      if (!src) return;
      
      // Initialize offset on first stroke
      if (!cloneOffsetRef.current) {
        cloneOffsetRef.current = { x: x - src.x, y: y - src.y };
      } else {
        // Update offset based on movement
        const last = lastPosRef.current;
        if (last) {
          const dx = x - last.x;
          const dy = y - last.y;
          cloneOffsetRef.current.x += dx;
          cloneOffsetRef.current.y += dy;
        }
      }
      
      const offset = cloneOffsetRef.current;
      const { mask, size } = createBrushMask(r, brushHardness);
      
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      
      // Calculate source position
      const sourceX = src.x + offset.x;
      const sourceY = src.y + offset.y;
      
      // Get source area (with bounds checking)
      const sourceArea = ctx.getImageData(
        Math.max(0, Math.min(canvas.width - r * 2, sourceX - r)), 
        Math.max(0, Math.min(canvas.height - r * 2, sourceY - r)), 
        r * 2, 
        r * 2
      );
      
      // Get target area
      const targetData = ctx.getImageData(
        Math.max(0, x - r), 
        Math.max(0, y - r), 
        r * 2, 
        r * 2
      );
      
      // Blend with mask
      for (let ay = 0; ay < r * 2; ay++) {
        for (let ax = 0; ax < r * 2; ax++) {
          const dx = ax - r;
          const dy = ay - r;
          if (dx * dx + dy * dy > r * r) continue;
          
          const maskIdx = Math.min(size - 1, Math.max(0, ay)) * size + Math.min(size - 1, Math.max(0, ax));
          const alpha = mask[maskIdx] / 255 * (strength / 100);
          
          // Calculate source pixel position relative to source area
          const sx = sourceX - r + ax;
          const sy = sourceY - r + ay;
          const sourceAreaX = sx - (sourceX - r);
          const sourceAreaY = sy - (sourceY - r);
          
          const idx = (ay * (r * 2) + ax) * 4;
          
          // Check if source pixel is within bounds
          if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height &&
              sourceAreaX >= 0 && sourceAreaX < r * 2 && sourceAreaY >= 0 && sourceAreaY < r * 2) {
            const sourceIdx = (sourceAreaY * (r * 2) + sourceAreaX) * 4;
            targetData.data[idx] = targetData.data[idx] * (1 - alpha) + sourceArea.data[sourceIdx] * alpha;
            targetData.data[idx + 1] = targetData.data[idx + 1] * (1 - alpha) + sourceArea.data[sourceIdx + 1] * alpha;
            targetData.data[idx + 2] = targetData.data[idx + 2] * (1 - alpha) + sourceArea.data[sourceIdx + 2] * alpha;
          }
        }
      }
      
      ctx.putImageData(targetData, Math.max(0, x - r), Math.max(0, y - r));
      ctx.restore();
    } else if (tool === "smudge") {
      const last = lastPosRef.current;
      if (!last) return;
      const area = ctx.getImageData(last.x - r, last.y - r, r * 2, r * 2);
      const blend = strength / 100;
      ctx.globalAlpha = blend;
      ctx.putImageData(area, x - r, y - r);
      ctx.globalAlpha = 1.0;
    } else if (tool === "heal") {
      applyHealingBrush(x, y, ctx, canvas);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    if ('altKey' in e && (e as React.MouseEvent).altKey) {
      cloneSourceRef.current = pos;
      cloneOffsetRef.current = null;
      setCloneSource(pos);
      return;
    }
    
    // If clone tool and no source set, use first click as source
    if (tool === "clone" && !cloneSourceRef.current) {
      cloneSourceRef.current = pos;
      cloneOffsetRef.current = { x: 0, y: 0 };
      setCloneSource(pos);
      return;
    }
    
    isDrawingRef.current = true;
    lastPosRef.current = pos;
    applyAtPos(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    brushPreviewRef.current = pos;
    
    if (!isDrawingRef.current) return;
    applyAtPos(pos.x, pos.y);
    lastPosRef.current = pos;
  };

  const handleEnd = () => {
    if (isDrawingRef.current) saveHistory();
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
      
      // Use setTimeout to ensure canvas is in DOM
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (initialData) {
              setHistory([initialData]);
              setHistoryIdx(0);
            }
          }
        }
      }, 50);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setSourceUrl(null);
      setFileName(null);
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
    a.download = `retouched-${fileName?.split('.')[0] || 'result'}.${exportFormat}`;
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

  const toolInfo: Record<Tool, { name: string; desc: string; icon: string }> = {
    heal: { name: "Healing Brush", desc: "Content-aware fill for seamless removal", icon: "✨" },
    clone: { name: "Clone Stamp", desc: "Click to set source, then paint to clone", icon: "🎨" },
    blur: { name: "Blur Tool", desc: "Blur watermarks into background", icon: "🌫️" },
    smudge: { name: "Smudge", desc: "Blend edges and smooth transitions", icon: "👆" },
    patch: { name: "Patch", desc: "Select area to replace with nearby pixels", icon: "🔧" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-indigo-950/10 dark:to-cyan-950/10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro Retouch Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional watermark and object removal with advanced healing algorithms. Seamless retouching powered by content-aware technology.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={() => { 
                    setSourceUrl(null); 
                    setFileName(null); 
                    setHistory([]); 
                    setHistoryIdx(-1);
                    cloneSourceRef.current = null;
                    cloneOffsetRef.current = null;
                    setCloneSource(null);
                  }}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Drag & Drop Image Here"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Retouch Tools</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={undo} 
                        disabled={historyIdx <= 0} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                        title="Undo (Ctrl+Z)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button 
                        onClick={redo} 
                        disabled={historyIdx >= history.length - 1} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                        title="Redo (Ctrl+Y)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2m18-18l-6 6m6-6l-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {(["heal", "clone", "blur", "smudge"] as Tool[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTool(t);
                          if (t !== "clone") {
                            cloneSourceRef.current = null;
                            cloneOffsetRef.current = null;
                            setCloneSource(null);
                          }
                        }}
                        className={`p-4 text-left rounded-xl border transition-all ${
                          tool === t 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105" 
                            : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{toolInfo[t].icon}</div>
                        <div className="text-xs font-black uppercase">{toolInfo[t].name}</div>
                        <div className={`text-[10px] mt-1 ${tool === t ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {toolInfo[t].desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Brush Size</span>
                        <span className="text-indigo-600">{brushSize}px</span>
                      </div>
                      <input 
                        type="range" min={5} max={150} value={brushSize} 
                        onChange={e => setBrushSize(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Brush Hardness</span>
                        <span className="text-indigo-600">{brushHardness}%</span>
                      </div>
                      <input 
                        type="range" min={0} max={100} value={brushHardness} 
                        onChange={e => setBrushHardness(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <p className="text-[10px] text-gray-500">Softer edges blend better</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                        <span>Tool Strength</span>
                        <span className="text-indigo-600">{strength}%</span>
                      </div>
                      <input 
                        type="range" min={10} max={100} value={strength} 
                        onChange={e => setStrength(parseInt(e.target.value))} 
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
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
                            <span className="text-indigo-600">{jpegQuality}%</span>
                          </div>
                          <input 
                            type="range" min={60} max={100} value={jpegQuality} 
                            onChange={e => setJpegQuality(parseInt(e.target.value))} 
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="primary" 
                      className="w-full py-4 shadow-lg flex items-center justify-center gap-3" 
                      onClick={download}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Retouched Image
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Canvas */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Workspace</h3>
                <div className="flex gap-4 items-center">
                  {sourceUrl && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={showOriginal} 
                            onChange={e => setShowOriginal(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-indigo-500">Compare</span>
                      </label>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {history.length > 0 && `${historyIdx + 1}/${history.length}`}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 relative group cursor-crosshair">
                <div className={`relative ${sourceUrl ? '' : 'hidden'}`} style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full h-auto shadow-2xl rounded-sm transition-all duration-300"
                    style={{ 
                      opacity: showOriginal ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                  />
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute top-0 left-0 max-w-full h-auto shadow-2xl rounded-sm pointer-events-none"
                    style={{ 
                      display: tool === "clone" && cloneSource ? 'block' : 'none'
                    }}
                  />
                  {showOriginal && sourceUrl && (
                    <img 
                      src={sourceUrl}
                      className="absolute top-0 left-0 max-w-full h-auto shadow-2xl rounded-sm pointer-events-none"
                      style={{ opacity: 0.5 }}
                      alt="Original"
                    />
                  )}
                  {brushPreviewRef.current && sourceUrl && (
                    <div 
                      className="absolute pointer-events-none border-2 border-indigo-500 rounded-full"
                      style={{
                        left: `${brushPreviewRef.current.x - brushSize}px`,
                        top: `${brushPreviewRef.current.y - brushSize}px`,
                        width: `${brushSize * 2}px`,
                        height: `${brushSize * 2}px`,
                        opacity: isDrawingRef.current ? 0.8 : 0.3
                      }}
                    />
                  )}
                </div>
                {!sourceUrl && (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-bold text-lg opacity-20 uppercase tracking-tighter">Waiting for Image</p>
                  </div>
                )}
              </div>

              {sourceUrl && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                    <span>Zoom</span>
                    <span className="text-indigo-600">{zoom}%</span>
                  </div>
                  <input
                    type="range"
                    min={25}
                    max={200}
                    step={25}
                    value={zoom}
                    onChange={e => setZoom(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
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
