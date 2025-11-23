"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

declare global {
  interface Window { GIF: any }
}

export default function AnimatedGifMaker() {
  const [frames, setFrames] = useState<HTMLCanvasElement[]>([]);
  const [delayMs, setDelayMs] = useState<number>(200);
  const [frameDelays, setFrameDelays] = useState<number[]>([]);
  const [quality, setQuality] = useState<number>(10);
  const [generating, setGenerating] = useState<boolean>(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [libReady, setLibReady] = useState<boolean>(false);
  const loadedCdnRef = useRef<"cdnjs" | "unpkg" | null>(null);
  const workerBlobUrlRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    let appended: HTMLScriptElement | null = null;
    const loadGifLib = (src: string, cdn: "cdnjs" | "unpkg") => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => { loadedCdnRef.current = cdn; setLibReady(true); resolve(); };
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
      appended = script;
    });
    (async () => {
      try {
        await loadGifLib("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js", "cdnjs");
      } catch (_e) {
        // Fallback CDN if cdnjs is blocked
        await loadGifLib("https://unpkg.com/gif.js@0.2.0/dist/gif.js", "unpkg");
      }
    })();
    return () => {
      if (appended) document.head.removeChild(appended);
      if (workerBlobUrlRef.current) {
        URL.revokeObjectURL(workerBlobUrlRef.current);
        workerBlobUrlRef.current = null;
      }
    };
  }, []);

  async function prepareWorkerUrl(): Promise<string> {
    const cdn = loadedCdnRef.current;
    const primary = cdn === "cdnjs"
      ? "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
      : "https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js";
    const fallback = cdn === "cdnjs"
      ? "https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js"
      : "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js";
    try {
      const res = await fetch(primary, { mode: "cors" });
      if (res.ok) {
        const code = await res.text();
        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        workerBlobUrlRef.current = url;
        return url;
      }
      throw new Error(`Fetch failed: ${res.status}`);
    } catch (_e) {
      try {
        const res2 = await fetch(fallback, { mode: "cors" });
        if (res2.ok) {
          const code = await res2.text();
          const blob = new Blob([code], { type: "application/javascript" });
          const url = URL.createObjectURL(blob);
          workerBlobUrlRef.current = url;
          return url;
        }
      } catch (_e2) {
        // As a last resort, return the primary URL (may work if CSP allows external workers)
        return primary;
      }
      return primary;
    }
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const processed: HTMLCanvasElement[] = [];
    const cap = 20;
    const picked = files.slice(0, cap);
    for (const file of picked) {
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
    setFrameDelays(processed.map(() => delayMs));
    setGifUrl(null);
    if (files.length > cap) {
      setStatusType("info");
      setStatusMessage(`Added ${processed.length} frames (capped at ${cap}). Large images are downscaled to 500px width for performance.`);
    } else {
      setStatusType("success");
      setStatusMessage(`Added ${processed.length} frame${processed.length !== 1 ? "s" : ""}. Images downscaled to 500px width for smoother generation.`);
    }
  }

  function setDelayForFrame(index: number, value: number) {
    const v = Math.max(50, Math.min(2000, value || 0));
    setFrameDelays((prev) => {
      const next = prev.slice();
      next[index] = v;
      return next;
    });
  }

  function removeFrame(index: number) {
    setFrames((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setStatusType("info");
      setStatusMessage(`Removed frame ${index + 1}. ${next.length} frame${next.length !== 1 ? "s" : ""} remaining.`);
      if (next.length === 0) setGifUrl(null);
      return next;
    });
    setFrameDelays((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFrameUp(index: number) {
    if (index <= 0) return;
    setFrames((prev) => {
      const next = prev.slice();
      const tmp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = tmp;
      setStatusType("info");
      setStatusMessage(`Moved frame ${index + 1} up.`);
      return next;
    });
    setFrameDelays((prev) => {
      const next = prev.slice();
      const t = next[index - 1];
      next[index - 1] = next[index];
      next[index] = t;
      return next;
    });
  }

  function moveFrameDown(index: number) {
    setFrames((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = prev.slice();
      const tmp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = tmp;
      setStatusType("info");
      setStatusMessage(`Moved frame ${index + 1} down.`);
      return next;
    });
    setFrameDelays((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = prev.slice();
      const t = next[index + 1];
      next[index + 1] = next[index];
      next[index] = t;
      return next;
    });
  }

  function clearFrames() {
    setFrames([]);
    setFrameDelays([]);
    setGifUrl(null);
    setStatusType("info");
    setStatusMessage("Cleared all frames.");
  }

  function applyGlobalDelayToAll() {
    setFrameDelays(frames.map(() => delayMs));
    setStatusType("info");
    setStatusMessage(`Applied global delay (${delayMs} ms) to all ${frames.length} frame${frames.length !== 1 ? "s" : ""}.`);
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(targetIndex: number) {
    const from = dragIndexRef.current;
    if (from == null || from === targetIndex) return;
    setFrames((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setFrameDelays((prev) => {
      const next = prev.slice();
      const [movedDelay] = next.splice(from!, 1);
      next.splice(targetIndex, 0, movedDelay);
      return next;
    });
    setStatusType("info");
    setStatusMessage(`Moved frame ${from + 1} to position ${targetIndex + 1}.`);
    dragIndexRef.current = null;
  }

  async function createGif() {
    if (!libReady || !window.GIF) {
      setStatusType("info");
      setStatusMessage("GIF library is still loading. Please wait a moment and try again.");
      return;
    }
    if (frames.length === 0) {
      setStatusType("error");
      setStatusMessage("No frames selected. Please choose images first.");
      return;
    }
    setGenerating(true);
    const workerScript = await prepareWorkerUrl();
    const gif = new window.GIF({ workers: 2, quality, workerScript });
    frames.forEach((frame, i) => gif.addFrame(frame, { delay: frameDelays[i] ?? delayMs }));
    gif.on("finished", (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setGenerating(false);
      setStatusType("success");
      setStatusMessage("GIF generated successfully. You can preview and download it now.");
    });
    gif.on("abort", () => {
      setGenerating(false);
      setStatusType("error");
      setStatusMessage("GIF generation aborted.");
    });
    gif.on("error", (e: any) => {
      console.error("GIF error", e);
      setGenerating(false);
      setStatusType("error");
      setStatusMessage("Failed to generate GIF. Try fewer frames or smaller images.");
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
        <Button as="label" variant="primary" className="cursor-pointer">
          Choose Images
          <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
      </Button>
        <label className="flex items-center gap-2">
          <span>Delay</span>
          <input type="number" min={50} max={2000} value={delayMs} onChange={(e) => setDelayMs(parseInt(e.target.value || "0"))} className="w-20 border rounded p-1" />
          <span>ms</span>
          <button
            type="button"
            className="ml-2 text-xs border px-2 py-1 rounded"
            disabled={frames.length === 0 || generating}
            onClick={applyGlobalDelayToAll}
          >
            Apply to all
          </button>
        </label>
        <label className="flex items-center gap-2">
          <span>Quality</span>
          <select value={quality} onChange={(e) => setQuality(parseInt(e.target.value))}>
            <option value={10}>High</option>
            <option value={20}>Medium</option>
            <option value={30}>Low</option>
          </select>
        </label>
        <button className="border px-3 py-1 rounded" disabled={!libReady || frames.length === 0 || generating} onClick={createGif}>Create GIF</button>
        <button className="border px-3 py-1 rounded" disabled={frames.length === 0 || generating} onClick={clearFrames}>Clear All</button>
        <button className="border px-3 py-1 rounded" disabled={!gifUrl} onClick={downloadGif}>Download</button>
      </div>

      {statusMessage && (
        <div className={`rounded px-3 py-2 text-sm ${statusType === "error" ? "bg-red-100 text-red-700 border border-red-300" : statusType === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-blue-100 text-blue-700 border border-blue-300"}`}>
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {frames.map((f, i) => (
          <div
            key={i}
            className="relative border rounded p-1 group"
            draggable={!generating}
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
          >
            <img src={f.toDataURL()} alt={`frame-${i}`} className="w-full" />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button className="text-xs px-2 py-1 rounded bg-gray-800 text-white" disabled={generating || i === 0} onClick={() => moveFrameUp(i)}>↑</button>
              <button className="text-xs px-2 py-1 rounded bg-gray-800 text-white" disabled={generating || i === frames.length - 1} onClick={() => moveFrameDown(i)}>↓</button>
              <button className="text-xs px-2 py-1 rounded bg-red-600 text-white" disabled={generating} onClick={() => removeFrame(i)}>✕</button>
            </div>
            <div className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">{i + 1}</div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-gray-700">Delay</span>
              <input
                type="number"
                min={50}
                max={2000}
                value={frameDelays[i] ?? delayMs}
                onChange={(e) => setDelayForFrame(i, parseInt(e.target.value || "0"))}
                className="w-16 border rounded px-1 py-0.5 text-xs"
              />
              <span className="text-xs text-gray-700">ms</span>
            </div>
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