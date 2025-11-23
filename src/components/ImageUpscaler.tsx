"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";

type Method = "nearest" | "smooth" | "multi-step";

export default function ImageUpscaler() {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [scale, setScale] = useState<number>(2);
  const [method, setMethod] = useState<Method>("smooth");
  const [status, setStatus] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    await drawImage(url);
    upscale();
  };

  const drawImage = async (url: string) => new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const base = baseCanvasRef.current!;
      base.width = img.width;
      base.height = img.height;
      const bctx = base.getContext("2d")!;
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = "high";
      bctx.drawImage(img, 0, 0);

      // Initialize visible canvas with original image
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(base, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  const upscale = () => {
    const src = baseCanvasRef.current;
    if (!src) return;
    const w = src.width, h = src.height;
    if (!w || !h) return;
    const outW = Math.round(w * scale);
    const outH = Math.round(h * scale);
    const out = document.createElement("canvas");
    out.width = outW; out.height = outH;
    const ctx = out.getContext("2d")!;

    if (method === "nearest") {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, w, h, 0, 0, outW, outH);
    } else if (method === "smooth") {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(src, 0, 0, w, h, 0, 0, outW, outH);
    } else {
      // multi-step: upscale in steps of 1.5x to improve quality
      let tmp = src;
      let currentW = w, currentH = h;
      while (currentW < outW || currentH < outH) {
        const stepW = Math.min(outW, Math.round(currentW * 1.5));
        const stepH = Math.min(outH, Math.round(currentH * 1.5));
        const stepCanvas = document.createElement("canvas");
        stepCanvas.width = stepW; stepCanvas.height = stepH;
        const stepCtx = stepCanvas.getContext("2d")!;
        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = "high";
        stepCtx.drawImage(tmp, 0, 0, currentW, currentH, 0, 0, stepW, stepH);
        tmp = stepCanvas;
        currentW = stepW; currentH = stepH;
      }
      ctx.drawImage(tmp, 0, 0);
    }

    // Replace source canvas with upscaled result
    const dest = canvasRef.current!;
    dest.width = outW; dest.height = outH;
    const destCtx = dest.getContext("2d")!;
    destCtx.drawImage(out, 0, 0);
    setStatus(`Upscaled to ${outW}×${outH} (${scale}×)`);
  };

  // Auto-upscale when parameters change
  useEffect(() => {
    if (!imgUrl) return;
    upscale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, method]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "upscaled.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="primary" as="label">
          Choose Image
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </Button>
        <label className="flex items-center gap-2">
          <span>Scale</span>
          <input type="range" min={1} max={4} step={0.1} value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />
          <span className="text-sm">{scale.toFixed(1)}×</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="select select-bordered">
            <option value="nearest">Nearest (sharp)</option>
            <option value="smooth">Smooth (fast)</option>
            <option value="multi-step">Multi-step (HQ)</option>
          </select>
        </label>
        <button className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={upscale} disabled={!imgUrl}>Upscale</button>
        <button className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50" onClick={download} disabled={!imgUrl}>Download PNG</button>
      </div>
      {status && <p className="text-sm text-gray-600">{status}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <canvas ref={baseCanvasRef} className="w-full max-w-full border rounded" style={{ display: 'none' }} />
        <canvas ref={canvasRef} className="w-full max-w-full border rounded" />
      </div>
    </div>
  );
}