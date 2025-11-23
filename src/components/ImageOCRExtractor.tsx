"use client";
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Tesseract?: any;
  }
}

export default function ImageOCRExtractor() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [loadingLib, setLoadingLib] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [language, setLanguage] = useState<string>("eng");
  const controllerRef = useRef<AbortController | null>(null);

  const ensureTesseractLoaded = async () => {
    if (window.Tesseract) return;
    setLoadingLib(true);
    const tryLoad = (src: string) => new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
    try {
      await tryLoad("https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js");
    } catch (_e) {
      // Fallback to unpkg if jsDelivr is blocked
      await tryLoad("https://unpkg.com/tesseract.js@4/dist/tesseract.min.js");
    }
    setLoadingLib(false);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setText("");
    setProgress(0);
    setError("");
  };

  const prepareImageForOCR = async (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const maxDim = 1600;
        const { width: iw, height: ih } = img;
        const scale = Math.min(1, maxDim / Math.max(iw, ih));
        const w = Math.max(1, Math.round(iw * scale));
        const h = Math.max(1, Math.round(ih * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
        // Draw and lightly sharpen by drawing twice (simple trick)
        ctx.drawImage(img, 0, 0, w, h);
        // Export as JPEG to reduce size
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  };

  const startOCR = async () => {
    if (!imageUrl) return;
    try {
      await ensureTesseractLoaded();
      setRunning(true);
      setError("");
      controllerRef.current = new AbortController();
      const { signal } = controllerRef.current;
      if (!window.Tesseract) throw new Error("OCR library not available. Please retry in a moment.");
      setProgress(5);
      const dataUrl = await prepareImageForOCR(imageUrl);
      setProgress(15);
      const result = await window.Tesseract.recognize(dataUrl, language || "eng", {
        logger: (m: any) => {
          if (m?.progress) {
            setProgress(Math.round((m.progress as number) * 100));
          } else if (typeof m?.progress === "number") {
            setProgress(Math.round(m.progress * 100));
          }
        },
        signal,
      });
      setText(result?.data?.text || "");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setRunning(false);
    }
  };

  const cancelOCR = () => {
    controllerRef.current?.abort();
    setRunning(false);
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ocr-text.txt";
    a.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">OCR Extractor</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="btn btn-primary cursor-pointer">
          Choose Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <label className="flex items-center gap-2">
          <span>Language</span>
          <select
            className="select select-bordered"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="eng">English</option>
            <option value="spa">Spanish</option>
            <option value="fra">French</option>
            <option value="deu">German</option>
            <option value="ita">Italian</option>
            <option value="por">Portuguese</option>
          </select>
        </label>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={!imageUrl || running || loadingLib}
          onClick={startOCR}
        >
          {loadingLib ? "Loading OCR Library..." : running ? "Running..." : "Extract Text"}
        </button>
        {running && (
          <button className="px-3 py-1 bg-gray-600 text-white rounded" onClick={cancelOCR}>
            Cancel
          </button>
        )}
        <span>Progress: {progress}%</span>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={downloadText} disabled={!text}>
          Download .txt
        </button>
      </div>
      {error && <div className="text-red-600">Error: {error}</div>}
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" className="max-h-64 rounded border" />
      )}
      <textarea
        className="w-full min-h-48 p-3 border rounded"
        placeholder="Extracted text will appear here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}