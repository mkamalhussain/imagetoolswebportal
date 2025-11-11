"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window { GIF: any }
}

export default function AnimatedGifMaker() {
  const [frames, setFrames] = useState<HTMLCanvasElement[]>([]);
  const [delayMs, setDelayMs] = useState<number>(200);
  const [quality, setQuality] = useState<number>(10);
  const [generating, setGenerating] = useState<boolean>(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let appended: HTMLScriptElement | null = null;
    const loadGifLib = (src: string) => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
      appended = script;
    });
    (async () => {
      try {
        await loadGifLib("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js");
      } catch (_e) {
        // Fallback CDN if cdnjs is blocked
        await loadGifLib("https://unpkg.com/gif.js@0.2.0/dist/gif.js");
      }
    })();
    return () => { if (appended) document.head.removeChild(appended); };
  }, []);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const processed: HTMLCanvasElement[] = [];
    for (const file of files.slice(0, 20)) {
      if (!file.type.startsWith("image/")) continue;
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
      const cnv = document.createElement("canvas");
      const maxW = 500;
      const ratio = img.width / img.height;
      cnv.width = Math.min(img.width, maxW);
      cnv.height = Math.round(cnv.width / ratio);
      const ctx = cnv.getContext("2d")!;
      ctx.drawImage(img, 0, 0, cnv.width, cnv.height);
      processed.push(cnv);
      URL.revokeObjectURL(url);
    }
    setFrames(processed);
    setGifUrl(null);
  }

  function createGif() {
    if (!window.GIF) return alert("GIF library not loaded yet. Please wait a moment.");
    if (frames.length === 0) return;
    setGenerating(true);
    const workerCandidate = typeof fetch !== 'undefined' ? "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js" : "https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js";
    const gif = new window.GIF({ workers: 2, quality, workerScript: workerCandidate });
    frames.forEach((frame) => gif.addFrame(frame, { delay: delayMs }));
    gif.on("finished", (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setGenerating(false);
    });
    gif.render();
  }

  function downloadGif() {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "animated.gif";
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept="image/*" multiple onChange={onFiles} />
        <label className="flex items-center gap-2">
          <span>Delay</span>
          <input type="number" min={50} max={2000} value={delayMs} onChange={(e) => setDelayMs(parseInt(e.target.value || "0"))} className="w-20 border rounded p-1" />
          <span>ms</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Quality</span>
          <select value={quality} onChange={(e) => setQuality(parseInt(e.target.value))}>
            <option value={10}>High</option>
            <option value={20}>Medium</option>
            <option value={30}>Low</option>
          </select>
        </label>
        <button className="border px-3 py-1 rounded" disabled={frames.length === 0 || generating} onClick={createGif}>Create GIF</button>
        <button className="border px-3 py-1 rounded" disabled={!gifUrl} onClick={downloadGif}>Download</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {frames.map((f, i) => (
          <div key={i} className="border rounded p-1">
            <img src={f.toDataURL()} alt={`frame-${i}`} className="w-full" />
          </div>
        ))}
      </div>

      <div className="rounded border p-4">
        {generating && <p>Generating GIF…</p>}
        {gifUrl && <img src={gifUrl} alt="animated gif" className="max-w-full" />}
        {!gifUrl && !generating && <p className="text-gray-600">Preview will appear here.</p>}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}