"use client";

import React, { useCallback, useRef, useState, useEffect, useMemo } from "react";
import Button from "@/components/Button";

declare global {
  interface Window {
    Tesseract?: any;
  }
}

const LANGUAGES = [
  { id: "eng", name: "English" },
  { id: "spa", name: "Spanish" },
  { id: "fra", name: "French" },
  { id: "deu", name: "German" },
  { id: "ita", name: "Italian" },
  { id: "por", name: "Portuguese" },
  { id: "chi_sim", name: "Chinese (Simplified)" },
  { id: "chi_tra", name: "Chinese (Traditional)" },
  { id: "jpn", name: "Japanese" },
  { id: "kor", name: "Korean" },
  { id: "ara", name: "Arabic" },
  { id: "rus", name: "Russian" },
  { id: "hin", name: "Hindi" },
];

export default function ImageOCRExtractor() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [text, setText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("idle");
  const [language, setLanguage] = useState<string>("eng");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  
  const [grayscale, setGrayscale] = useState(true);
  const [invert, setInvert] = useState(false);
  const [threshold, setThreshold] = useState(0); 
  const [sharpness, setSharpness] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const workerRef = useRef<any>(null);

  // Load jsPDF from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      script.onload = () => setPdfReady(true);
      document.head.appendChild(script);
    } else if ((window as any).jspdf) {
      setPdfReady(true);
    }
  }, []);

  const ensureTesseractLoaded = async () => {
    if (window.Tesseract) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
    script.async = true;
    const promise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    document.head.appendChild(script);
    await promise;
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      setSourceUrl(url);
      setFileName(file.name);
      setText("");
      setProgress(0);
      setStatus("idle");
      setError(null);
    };
    img.src = url;
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const prepareImage = useCallback(() => {
    const img = originalImgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    let filters = "";
    if (grayscale) filters += " grayscale(100%)";
    if (sharpness !== 100) filters += ` contrast(${sharpness}%)`;
    if (invert) filters += " invert(100%)";
    
    ctx.filter = filters || "none";
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    if (threshold > 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const t = threshold * 2.55; 
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        const val = avg >= t ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [grayscale, threshold, sharpness, invert]);

  useEffect(() => {
    if (sourceUrl) prepareImage();
  }, [prepareImage, sourceUrl]);

  const startOCR = async () => {
    if (!sourceUrl || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatus("initializing");

    try {
      await ensureTesseractLoaded();
      const Tesseract = window.Tesseract;
      
      const worker = await Tesseract.createWorker({
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setStatus("recognizing");
          } else {
            setStatus(m.status);
          }
        },
      });
      
      workerRef.current = worker;
      await worker.loadLanguage(language);
      await worker.initialize(language);
      
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const { data } = await worker.recognize(dataUrl);
      
      setText(data.text);
      setProgress(100);
      setStatus("complete");
    } catch (err: any) {
      setError(err.message || "Failed to process image");
      setStatus("error");
    } finally {
      setIsProcessing(false);
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setStatus("copied");
    setTimeout(() => setStatus("complete"), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.split(".")[0] || "extracted"}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!text || !pdfReady) return;
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 15, 20);
    doc.save(`${fileName?.split(".")[0] || "extracted"}.pdf`);
  };

  const stats = useMemo(() => {
    if (!text) return { words: 0, chars: 0, lines: 0 };
    return {
      words: text.trim().split(/\s+/).length,
      chars: text.length,
      lines: text.split("\n").length
    };
  }, [text]);

  const autoClean = () => {
    const cleaned = text
      .replace(/\n\s*\n/g, "\n\n") // Multiple newlines to double
      .replace(/[^\S\r\n]+/g, " ") // Multiple spaces to single
      .trim();
    setText(cleaned);
  };

  const clear = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setFileName(null);
    setText("");
    setProgress(0);
    setStatus("idle");
    setError(null);
    originalImgRef.current = null;
    if (canvasRef.current) {
      canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pro OCR Extractor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extract text from any image with studio-grade precision. Features multi-language support and advanced image pre-processing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Upload Document
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && <Button variant="secondary" onClick={clear}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {fileName || "Click or Drag & Drop"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Engine Tuning
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Primary Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      >
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t dark:border-gray-700">
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input type="checkbox" checked={grayscale} onChange={e => setGrayscale(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-blue-500">B&W Filter</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input type="checkbox" checked={invert} onChange={e => setInvert(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-blue-500">Invert Colors</span>
                        </label>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                            <span>Sharpness</span>
                            <span>{sharpness}%</span>
                          </label>
                          <input type="range" min={50} max={200} value={sharpness} onChange={e => setSharpness(parseInt(e.target.value))} className="w-full h-1.5 accent-blue-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                            <span>Noise Gate</span>
                            <span>{threshold === 0 ? "AUTO" : `${threshold}%`}</span>
                          </label>
                          <input type="range" min={0} max={100} value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} className="w-full h-1.5 accent-blue-600 appearance-none bg-gray-100 dark:bg-gray-700 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" className="w-full py-4 shadow-lg flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition-all" onClick={startOCR} disabled={isProcessing}>
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span className="font-bold tracking-widest uppercase text-xs">{status}...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Feed */}
          <div className="flex flex-col h-full space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[350px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Feed</h3>
                {isProcessing && <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">{progress}% Scanned</div>}
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 relative group">
                {sourceUrl ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-sm transition-all duration-300" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-black uppercase tracking-tighter text-lg opacity-20">Optical Feed Ready</p>
                  </div>
                )}
              </div>
            </div>

            {text && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Result</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stats.words} Words • {stats.chars} Chars</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={autoClean} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors uppercase border border-blue-100">Clean</button>
                    <button onClick={copyToClipboard} className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors uppercase border border-blue-100">Copy</button>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="w-full text-xs font-bold flex items-center justify-center gap-2" onClick={downloadText}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    TEXT
                  </Button>
                  <Button variant="secondary" className="w-full text-xs font-bold flex items-center justify-center gap-2" onClick={downloadPdf} disabled={!pdfReady}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    PDF
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
