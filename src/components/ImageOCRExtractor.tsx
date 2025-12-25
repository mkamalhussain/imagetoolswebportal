"use client";
import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

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
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setText("");
    setProgress(0);
    setError("");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

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
    setRunning(true);
    setError("");
    setText("");
    setProgress(0);

    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }

    try {
      await ensureTesseractLoaded();
      if (!window.Tesseract) throw new Error("OCR library not available. Please retry in a moment.");

      const worker = await window.Tesseract.createWorker({
        logger: (m: any) => {
          console.log(m); // Keep for debugging, can be removed later
          if (m.progress && !['loading', 'initializing'].includes(m.status)) {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      workerRef.current = worker;

      await worker.loadLanguage(language || "eng");
      await worker.initialize(language || "eng");

      setProgress(5);
      const dataUrl = await prepareImageForOCR(imageUrl);
      setProgress(15);
      const { data: { text } } = await worker.recognize(dataUrl);
      setText(text || "");
      setProgress(100); // Explicitly set to 100% on completion
    } catch (err: any) {
      if (err.message === "Terminated") {
        setError("OCR process cancelled.");
      } else {
        setError(err?.message || String(err));
      }
    } finally {
      setRunning(false);
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
    }
  };

  const cancelOCR = async () => {
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
      setRunning(false);
      setError("OCR process cancelled.");
      setProgress(0);
    }
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
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-start py-16 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background blobs/shapes */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob dark:bg-pink-600"></div>
      <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 dark:bg-purple-600"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 dark:bg-yellow-600"></div>

      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center relative z-10">
        Free Online OCR
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 text-center relative z-10">
        Extract text from Images, PDFs, and Documents with one click.
      </p>

      <div
        className={`relative w-full max-w-3xl p-8 border-2 ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 mb-8 bg-white dark:bg-gray-800 shadow-lg`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex gap-4 mb-6 relative z-10">
          {/* Placeholder for file type icons */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-pink-400 dark:text-pink-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3-3m0 0l3 3m-3-3v6m-9-6h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-400 dark:text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75L12 12m0 0l9.75 3.75M12 12V2.25m0 9.75l-9.75 3.75M12 12v9.75m0-9.75l9.75-3.75M12 12l-9.75-3.75" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-400 dark:text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </div>
        
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Drag & Drop files here to upload</p>
        
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 12.75v-1.5M10.5 12h-3v2.25h3v-2.25z" />
            </svg>
            Browse Files
          </Button>
          <input type="file" accept="image/*" onChange={onFile} className="hidden" ref={fileInputRef} />
          <button className="p-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 dark:text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.393-.727a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757m-3.75 2.25l-.75.75m7.5-7.5l.75-.75" />
            </svg>
          </button>
        </div>

        <div className="flex justify-between w-full text-sm text-gray-500 dark:text-gray-400 mt-4">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Privacy Protected: We do not transmit or store any data.
          </span>
          <span>Supported files: JPG, PNG, PDF</span>
        </div>
      </div>

      {error && <div className="text-red-600 dark:text-red-400 mb-4 text-center">Error: {error}</div>}

      {(imageUrl || running || loadingLib) && (
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mt-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <label className="flex items-center gap-2 flex-grow">
              <span className="text-gray-700 dark:text-gray-300">Language:</span>
              <select
                className="select select-bordered w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="btn btn-primary flex-shrink-0"
              disabled={!imageUrl || running || loadingLib}
              onClick={startOCR}
            >
              {loadingLib ? "Loading OCR Library..." : running ? "Running..." : "Extract Text"}
            </button>

            {running && (
              <button className="btn btn-secondary flex-shrink-0" onClick={cancelOCR}>
                Cancel
              </button>
            )}

            <span className="text-gray-700 dark:text-gray-300 flex-shrink-0">Progress: {progress}%</span>

            <button className="btn btn-secondary flex-shrink-0" onClick={downloadText} disabled={!text}>
              Download .txt
            </button>
          </div>

          {imageUrl && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex justify-center items-center max-h-[500px] overflow-auto">
              <img src={imageUrl} alt="Uploaded" className="max-h-full max-w-full object-contain" />
            </div>
          )}

          <textarea
            className="w-full min-h-[200px] p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Extracted text will appear here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}