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
  const [renderKey, setRenderKey] = useState<number>(0);
  const loadedCdnRef = useRef<"cdnjs" | "unpkg" | null>(null);
  const workerBlobUrlRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    let appended: HTMLScriptElement | null = null;

    const loadGifLib = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
          setLibReady(true);
          resolve();
        };
        script.onerror = (e) => {
          console.error("Failed to load GIF library:", src, e);
          reject(new Error(`Failed to load: ${src}`));
        };
        document.head.appendChild(script);
        appended = script;
      });
    };

    // Try multiple CDNs in sequence
    (async () => {
      const cdns = [
        "https://unpkg.com/gif.js@0.2.0/dist/gif.js",
        "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js",
        "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"
      ];

      for (const cdn of cdns) {
        try {
          await loadGifLib(cdn);
          return;
        } catch (e) {
          continue;
        }
      }
      setStatusType("error");
      setStatusMessage("Failed to load GIF library. Please refresh the page and try again.");
    })();

    return () => {
      if (appended) document.head.removeChild(appended);
      if (workerBlobUrlRef.current) {
        URL.revokeObjectURL(workerBlobUrlRef.current);
        workerBlobUrlRef.current = null;
      }
    };
  }, []);

  // Force re-render when state changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [frames, libReady, generating]);

  async function prepareWorkerUrl(): Promise<string> {
    // Always try to create a blob URL first to avoid CORS issues
    const cdn = loadedCdnRef.current;
    const workerUrl = cdn === "cdnjs"
      ? "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js"
      : "https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js";

    try {
      const response = await fetch(workerUrl, { mode: 'cors' });
      if (response.ok) {
        const code = await response.text();
        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        workerBlobUrlRef.current = url;
        return url;
      } else {
        console.log("Worker fetch failed with status:", response.status);
      }
    } catch (error) {
      console.log("Failed to create blob URL, trying direct URL:", error);
    }

    // Fallback to direct URL (might work in some environments)
    console.log("Using direct worker URL:", workerUrl);
    return workerUrl;
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const processed: HTMLCanvasElement[] = [];
    const cap = 20;

    // Calculate how many more frames we can add
    const remainingSlots = cap - frames.length;
    if (remainingSlots <= 0) {
      setStatusType("error");
      setStatusMessage(`Cannot add more frames. Maximum ${cap} frames allowed.`);
      return;
    }

    const picked = files.slice(0, remainingSlots);
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

    if (processed.length > 0) {
    setFrames(prev => {
      const newFrames = [...prev, ...processed];
      console.log("Setting frames to:", newFrames.length, "frames. Previous length:", prev.length);
      return newFrames;
    });
      setFrameDelays(prev => [...prev, ...processed.map(() => delayMs)]);
      setGifUrl(null);
      setStatusType("success");
      setStatusMessage(`Added ${processed.length} frame${processed.length !== 1 ? "s" : ""}. Total frames: ${frames.length + processed.length}/${cap}`);
    }

    if (files.length > remainingSlots) {
      setStatusType("info");
      setStatusMessage(`Only added ${processed.length} frames. Maximum ${cap} frames allowed.`);
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
    console.log("Clearing frames - was called from:", new Error().stack);
    console.log("Setting frames to empty array");
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

    if (!libReady) {
      console.log("Library not ready yet");
      setStatusType("info");
      setStatusMessage("GIF library is still loading. Please wait a moment and try again.");
      return;
    }

    if (!window.GIF) {
      console.log("window.GIF is not available");
      setStatusType("error");
      setStatusMessage("GIF library failed to load. Please refresh the page and try again.");
      return;
    }

    if (frames.length === 0) {
      setStatusType("error");
      setStatusMessage("No frames selected. Please choose images first.");
      return;
    }

    setGenerating(true);
    setStatusType("info");
    setStatusMessage("Generating GIF...");

    try {
      const workerScript = await prepareWorkerUrl();
      const gif = new window.GIF({
        workers: 1, // Use 1 worker with blob URL
        quality: quality,
        workerScript: workerScript,
        width: frames[0].width,
        height: frames[0].height
      });

      frames.forEach((frame, i) => {
        const delay = frameDelays[i] ?? delayMs;
        gif.addFrame(frame, { delay: delay });
      });

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGifUrl(url);
        setGenerating(false);
        setStatusType("success");
        setStatusMessage(`GIF generated successfully! Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      });

      gif.on("progress", (progress: number) => {
        setStatusMessage(`Generating GIF... ${(progress * 100).toFixed(1)}%`);
      });

      gif.on("abort", () => {
        console.log("GIF generation aborted");
        setGenerating(false);
        setStatusType("error");
        setStatusMessage("GIF generation was cancelled.");
      });

      gif.on("error", (error: any) => {
        console.error("GIF generation error:", error);
        setGenerating(false);
        setStatusType("error");
        setStatusMessage("Failed to generate GIF. Try with fewer frames or lower quality.");
      });

      console.log("Starting GIF rendering...");
      gif.render();

    } catch (error) {
      console.error("Unexpected error in createGif:", error);
      setGenerating(false);
      setStatusType("error");
      setStatusMessage("An unexpected error occurred. Please try again.");
    }
  }

  function downloadGif() {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "animated.gif";
    a.click();
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-start py-16 px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background blobs/shapes */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:bg-green-600"></div>
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:bg-blue-600" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:bg-purple-600" style={{ animationDelay: '4s' }}></div>

      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center relative z-10">
        Animated GIF Maker
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 text-center relative z-10">
        Create stunning animated GIFs from your images in seconds.
      </p>

      <div
        className={`relative w-full max-w-4xl p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 mb-8 bg-white dark:bg-gray-800 shadow-lg`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
          if (files.length > 0) {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            const dt = new DataTransfer();
            files.forEach(f => dt.items.add(f));
            input.files = dt.files;
            const event = { target: { files: input.files } } as React.ChangeEvent<HTMLInputElement>;
            onFiles(event);
          }
        }}
      >
        <div className="flex gap-4 mb-6 relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-400 dark:text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-400 dark:text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 6.75l-.952-1.269a1.5 1.5 0 00-1.782-.345l-5.69 3.315a1.5 1.5 0 00-.345 1.782l.952 1.269a1.5 1.5 0 001.782.345l5.69-3.315a1.5 1.5 0 00.345-1.782zM12.75 6.75L12 5.25m.75 1.5l.952-1.269a1.5 1.5 0 011.782-.345l5.69 3.315c.571.332.68.961.345 1.782L21 12m-8.25-5.25h-.008v.008h.008V6.75zm0 10.5H12v.008h.75V17.25zM21 12l-.952 1.269a1.5 1.5 0 01-1.782.345l-5.69-3.315a1.5 1.5 0 01-.345-1.782l.952-1.269A1.5 1.5 0 0115 8.25l5.69 3.315c.571.332.68.961.345 1.782z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-purple-400 dark:text-purple-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        </div>

        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Drag & Drop images here to create your GIF</p>

        <div className="flex items-center gap-4 mb-6">
          <Button as="label" variant="primary" className="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 12.75v-1.5M10.5 12h-3v2.25h3v-2.25z" />
            </svg>
            Choose Images
            <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
          </Button>
        </div>

        <div className="flex justify-between w-full text-sm text-gray-500 dark:text-gray-400 mt-4">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Privacy Protected: We do not transmit or store any data.
          </span>
          <span className="flex items-center gap-2">
            {!libReady && (
              <>
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                Loading GIF library...
              </>
            )}
            {libReady && (
              <>
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                GIF library ready
              </>
            )}
            | Supported files: JPG, PNG, GIF, WebP
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className={`w-full max-w-4xl rounded-lg px-4 py-3 text-sm mb-6 ${statusType === "error" ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" : statusType === "success" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"}`}>
          <div className="flex items-center gap-2">
            {statusType === "error" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>}
            {statusType === "success" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
            {statusType === "info" && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>}
            {statusMessage}
          </div>
        </div>
      )}

      {frames.length > 0 && (
        <div
          key={`gif-settings-${frames.length}-${libReady}-${generating}`}
          className="w-full max-w-6xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              GIF Settings ({frames.length} frame{frames.length !== 1 ? 's' : ''})
            </h3>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">Delay:</span>
                <input
                  type="number"
                  min={50}
                  max={2000}
                  value={delayMs}
                  onChange={(e) => setDelayMs(parseInt(e.target.value || "0"))}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-gray-600 dark:text-gray-400">ms</span>
              </label>

              <button
                type="button"
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                disabled={frames.length === 0 || generating}
                onClick={applyGlobalDelayToAll}
              >
                Apply to all
              </button>

              <label className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">Quality:</span>
                <select
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={10}>High</option>
                  <option value={20}>Medium</option>
                  <option value={30}>Low</option>
                </select>
              </label>

              <button
                key={`create-gif-${renderKey}`}
                onClick={() => {
                  if (!libReady || frames.length === 0 || generating) {
                    return;
                  }
                  createGif();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  !libReady || frames.length === 0 || generating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-md hover:shadow-lg'
                }`}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating GIF...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    {(!libReady || frames.length === 0 || generating) ? "Create GIF (Disabled)" : "Create GIF"}
                  </>
                )}
              </button>


              <button
                onClick={clearFrames}
                disabled={frames.length === 0 || generating}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  frames.length === 0 || generating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Clear All
              </button>

              <button
                onClick={downloadGif}
                disabled={!gifUrl}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  !gifUrl
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                Download GIF
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Frames ({frames.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {frames.map((f, i) => (
                <div
                  key={i}
                  className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-2 group bg-gray-50 dark:bg-gray-900 hover:shadow-md transition-shadow"
                  draggable={!generating}
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(i)}
                >
                  <img src={f.toDataURL()} alt={`frame-${i}`} className="w-full aspect-square object-cover rounded" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center text-xs"
                      disabled={generating || i === 0}
                      onClick={() => moveFrameUp(i)}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center text-xs"
                      disabled={generating || i === frames.length - 1}
                      onClick={() => moveFrameDown(i)}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="w-6 h-6 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center text-xs"
                      disabled={generating}
                      onClick={() => removeFrame(i)}
                      title="Remove frame"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                    {i + 1}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <input
                      type="number"
                      min={50}
                      max={2000}
                      value={frameDelays[i] ?? delayMs}
                      onChange={(e) => setDelayForFrame(i, parseInt(e.target.value || "0"))}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                      disabled={generating}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(generating || gifUrl) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">GIF Preview</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
                {generating && (
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Generating your GIF...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments depending on the number of frames and quality settings.</p>
                  </div>
                )}
                {gifUrl && !generating && (
                  <div className="text-center">
                    <img src={gifUrl} alt="animated gif" className="max-w-full max-h-96 rounded-lg shadow-lg mb-4" />
                    <p className="text-green-600 dark:text-green-400 font-medium">GIF created successfully!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Click "Download GIF" to save your creation.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}