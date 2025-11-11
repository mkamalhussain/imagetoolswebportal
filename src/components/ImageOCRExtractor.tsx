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

  const startOCR = async () => {
    if (!imageUrl) return;
    try {
      await ensureTesseractLoaded();
      setRunning(true);
      setError("");
      controllerRef.current = new AbortController();
      const { signal } = controllerRef.current;
      if (!window.Tesseract) throw new Error("OCR library not available. Please retry in a moment.");
      const result = await window.Tesseract.recognize(imageUrl, "eng", {
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
        <input type="file" accept="image/*" onChange={onFile} />
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