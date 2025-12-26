"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";

export default function FaviconMaker() {
  const fileUrlRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [padding, setPadding] = useState<number>(0);
  const [backgroundMode, setBackgroundMode] = useState<"transparent" | "solid">("transparent");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [mask, setMask] = useState<"square" | "rounded" | "circle">("square");
  const [roundedRadius, setRoundedRadius] = useState<number>(6);

  const commonSizes = useMemo(() => [16, 32, 48, 64, 96, 128, 180, 192, 256, 512], []);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 128, 256]);
  const [activeSize, setActiveSize] = useState<number>(64);
  const [generated, setGenerated] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message: string }>({
    type: "idle",
    message: "",
  });

  const selectedSizesSorted = useMemo(() => [...new Set(selectedSizes)].sort((a, b) => a - b), [selectedSizes]);

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please choose an image file (PNG/JPG/WebP/etc.)." });
      return;
    }

    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    const url = URL.createObjectURL(file);
    fileUrlRef.current = url;

    setFileName(file.name);
    setSourceUrl(url);
    setStatus({ type: "success", message: "Image loaded. Adjust settings and download your favicon sizes." });
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileFromBlob(file);
      // allow selecting the same file again
      e.target.value = "";
    },
    [setFileFromBlob]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      setFileFromBlob(file);
    },
    [setFileFromBlob]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const toggleSize = useCallback((s: number) => {
    setSelectedSizes((prev) => {
      const set = new Set(prev);
      if (set.has(s)) set.delete(s);
      else set.add(s);
      const next = [...set];
      if (!next.length) return prev;
      return next;
    });
  }, []);

  function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === "function") {
      (ctx as any).roundRect(x, y, w, h, rr);
    } else {
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
    }
    ctx.closePath();
  }

  const renderOne = useCallback(
    (img: HTMLImageElement, sizePx: number) => {
      const cnv = document.createElement("canvas");
      cnv.width = sizePx;
      cnv.height = sizePx;
      const ctx = cnv.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.clearRect(0, 0, sizePx, sizePx);
      ctx.save();

      // mask
      if (mask === "circle") {
        ctx.beginPath();
        ctx.arc(sizePx / 2, sizePx / 2, sizePx / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else if (mask === "rounded") {
        drawRoundedRect(ctx, 0, 0, sizePx, sizePx, roundedRadius);
        ctx.clip();
      }

      // optional background (now inside mask)
      if (backgroundMode === "solid") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, sizePx, sizePx);
      }

      const pad = Math.max(0, Math.min(sizePx * 0.45, padding));
      const inner = Math.max(1, sizePx - pad * 2);

      let drawW = inner;
      let drawH = inner;
      const srcRatio = img.width / img.height;
      if (fitMode === "contain") {
        if (srcRatio >= 1) {
          drawW = inner;
          drawH = inner / srcRatio;
        } else {
          drawH = inner;
          drawW = inner * srcRatio;
        }
      } else {
        // cover
        if (srcRatio >= 1) {
          drawH = inner;
          drawW = inner * srcRatio;
        } else {
          drawW = inner;
          drawH = inner / srcRatio;
        }
      }

      const x = (sizePx - drawW) / 2;
      const y = (sizePx - drawH) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, drawW, drawH);
      ctx.restore();

      return cnv.toDataURL("image/png");
    },
    [backgroundMode, backgroundColor, fitMode, mask, padding, roundedRadius]
  );

  // Generate outputs
  useEffect(() => {
    let cancelled = false;
    if (!sourceUrl) {
      setGenerated({});
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      try {
        const out: Record<number, string> = {};
        for (const s of selectedSizesSorted) {
          out[s] = renderOne(img, s);
        }
        setGenerated(out);
        // keep active size reasonable
        if (!out[activeSize]) {
          const next = selectedSizesSorted[0] ?? 32;
          setActiveSize(next);
        }
      } catch (e: any) {
        setStatus({ type: "error", message: e?.message || "Failed to render favicon." });
      }
    };
    img.onerror = () => {
      if (cancelled) return;
      setStatus({ type: "error", message: "Failed to load the image. Try a different file." });
    };
    img.src = sourceUrl;

    return () => {
      cancelled = true;
    };
  }, [sourceUrl, selectedSizesSorted, renderOne, activeSize]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, []);

  const downloadDataUrl = useCallback((dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }, []);

  const downloadOne = useCallback(() => {
    const dataUrl = generated[activeSize];
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, `favicon-${activeSize}.png`);
  }, [generated, activeSize, downloadDataUrl]);

  const downloadAll = useCallback(async () => {
    // Browsers may block too many downloads at once; space them out.
    const sizes = selectedSizesSorted.filter((s) => generated[s]);
    if (!sizes.length) return;
    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i];
      downloadDataUrl(generated[s], `favicon-${s}.png`);
      // small delay to reduce popup blocking
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 250));
    }
  }, [downloadDataUrl, generated, selectedSizesSorted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Favicon Maker</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create crisp, multi-size PNG favicons from any image. Tweak padding, crop mode, background, and shape.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: upload + settings */}
            <div className="space-y-6">
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-colors ${
                  dragOver ? "border-blue-400" : "border-transparent"
                }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Image
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setFileName(null);
                        setSourceUrl(null);
                        setGenerated({});
                        if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
                        fileUrlRef.current = null;
                        setStatus({ type: "idle", message: "" });
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {fileName ? (
                      <>
                        <span className="font-medium">{fileName}</span>
                        <span className="text-gray-500 dark:text-gray-400"> (drop another to replace)</span>
                      </>
                    ) : (
                      <span>Drag & drop an image here, or choose a file.</span>
                    )}
                  </div>
                </div>

                {status.type !== "idle" && (
                  <div
                    className={`mt-4 text-sm rounded-lg px-3 py-2 ${
                      status.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900/50"
                        : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/50"
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v10.5H3.75V6.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5h9v3h-9v-3z" />
                  </svg>
                  Settings
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crop Mode</label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="contain">Fit (no crop)</option>
                      <option value="cover">Fill (crop)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Padding: {padding}px
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={64}
                      step={1}
                      value={padding}
                      onChange={(e) => setPadding(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background</label>
                    <select
                      value={backgroundMode}
                      onChange={(e) => setBackgroundMode(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="transparent">Transparent</option>
                      <option value="solid">Solid Color</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        disabled={backgroundMode !== "solid"}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{backgroundColor}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shape</label>
                    <select
                      value={mask}
                      onChange={(e) => setMask(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="square">Square</option>
                      <option value="rounded">Rounded</option>
                      <option value="circle">Circle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rounded Radius: {roundedRadius}px
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={64}
                      step={1}
                      value={roundedRadius}
                      onChange={(e) => setRoundedRadius(parseInt(e.target.value))}
                      disabled={mask !== "rounded"}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Output Sizes
                </h2>

                <div className="flex flex-wrap gap-2">
                  {commonSizes.map((s) => {
                    const checked = selectedSizesSorted.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          checked
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {s}px
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button variant="primary" onClick={downloadOne} disabled={!generated[activeSize]}>
                    Download {activeSize}px
                  </Button>
                  <Button variant="secondary" onClick={downloadAll} disabled={!sourceUrl || selectedSizesSorted.length === 0}>
                    Download Selected
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: preview */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-violet-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Preview
                </h2>

                <div className="flex items-center justify-center">
                  <div 
                    className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 relative"
                    style={{
                      backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    {generated[activeSize] ? (
                      <img
                        src={generated[activeSize]}
                        alt={`${activeSize}px preview`}
                        className="block"
                        style={{ width: 160, height: 160, imageRendering: activeSize <= 32 ? "pixelated" : "auto" }}
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        Upload an image to preview
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-5 gap-3">
                  {selectedSizesSorted.map((s) => {
                    const url = generated[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActiveSize(s)}
                        className={`rounded-lg border p-2 text-left transition-colors ${
                          s === activeSize
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {url ? (
                            <img src={url} alt={`${s}px`} style={{ width: 32, height: 32, imageRendering: s <= 32 ? "pixelated" : "auto" }} />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{s}px</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}