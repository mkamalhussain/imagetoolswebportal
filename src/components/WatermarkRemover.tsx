"use client";

import React, { useEffect, useRef, useState } from "react";

export default function WatermarkRemover() {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [brushSize, setBrushSize] = useState<number>(20);
  const [strength, setStrength] = useState<number>(3);
  const [mode, setMode] = useState<"blur" | "clone">("blur");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const cloneSourceRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    await drawImage(url);
  };

  const drawImage = async (url: string) => new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width),
      y: Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    if (e.altKey) {
      cloneSourceRef.current = getMousePos(e);
      setStatus(`Clone source set at (${cloneSourceRef.current.x}, ${cloneSourceRef.current.y})`);
    } else {
      applyAtMouse(e);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    applyAtMouse(e);
  };

  const onMouseUp = () => { isDrawingRef.current = false; };

  const applyAtMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getMousePos(e);
    const r = brushSize;
    if (mode === "blur") {
      // Box blur in a circular area
      const img = ctx.getImageData(x - r, y - r, r * 2, r * 2);
      const data = img.data;
      const copy = new Uint8ClampedArray(data);
      const kernel = strength;
      const w = img.width, h = img.height;
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const dx = xx - r, dy = yy - r;
          if (dx * dx + dy * dy > r * r) continue; // circle mask
          let rs = 0, gs = 0, bs = 0, n = 0;
          for (let ky = -kernel; ky <= kernel; ky++) {
            for (let kx = -kernel; kx <= kernel; kx++) {
              const px = Math.max(0, Math.min(w - 1, xx + kx));
              const py = Math.max(0, Math.min(h - 1, yy + ky));
              const i = (py * w + px) * 4;
              rs += copy[i]; gs += copy[i + 1]; bs += copy[i + 2]; n++;
            }
          }
          const idx = (yy * w + xx) * 4;
          data[idx] = rs / n;
          data[idx + 1] = gs / n;
          data[idx + 2] = bs / n;
          data[idx + 3] = copy[idx + 3];
        }
      }
      ctx.putImageData(img, x - r, y - r);
    } else {
      // Clone from source
      const src = cloneSourceRef.current;
      if (!src) return;
      const dx = x - src.x;
      const dy = y - src.y;
      const img = ctx.getImageData(src.x - r, src.y - r, r * 2, r * 2);
      const copy = ctx.getImageData(x - r, y - r, r * 2, r * 2);
      const dataSrc = img.data;
      const dataDst = copy.data;
      const w = img.width, h = img.height;
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const sIdx = (yy * w + xx) * 4;
          const dIdx = sIdx;
          dataDst[dIdx] = dataSrc[sIdx];
          dataDst[dIdx + 1] = dataSrc[sIdx + 1];
          dataDst[dIdx + 2] = dataSrc[sIdx + 2];
          dataDst[dIdx + 3] = dataSrc[sIdx + 3];
        }
      }
      ctx.putImageData(copy, x - r, y - r);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "watermark-removed.png";
    a.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="btn btn-primary cursor-pointer">
          Choose Image
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <label className="flex items-center gap-2">Brush
          <input type="range" min={8} max={64} value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} />
          <span className="text-sm">{brushSize}px</span>
        </label>
        <label className="flex items-center gap-2">Strength
          <input type="range" min={1} max={6} value={strength} onChange={(e) => setStrength(parseInt(e.target.value))} />
          <span className="text-sm">{strength}</span>
        </label>
        <label className="flex items-center gap-2">Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="select">
            <option value="blur">Blur</option>
            <option value="clone">Clone (Alt-click to set source)</option>
          </select>
        </label>
        <button className="btn" onClick={download} disabled={!imgUrl}>Download PNG</button>
      </div>

      <p className="text-xs text-gray-600">Tip: Hold Alt and click to set clone source. Then paint over the watermark.</p>

      <canvas
        ref={canvasRef}
        className="w-full max-w-full border rounded cursor-crosshair"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
    </div>
  );
}