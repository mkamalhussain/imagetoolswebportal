"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";

const CHAR_SETS = {
  standard: "@%#*+=-:. ",
  minimal: "#+-. ",
  blocks: "█▓▒░ ",
  complex: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  binary: "01 ",
};

export default function ImageAsciiArtConverter() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [columns, setColumns] = useState<number>(100);
  const [invert, setInvert] = useState<boolean>(false);
  const [ascii, setAscii] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(10);
  const [aspectCorrection, setAspectCorrection] = useState<number>(0.55);
  
  const [charSetType, setCharSetType] = useState<keyof typeof CHAR_SETS | "custom">("standard");
  const [customCharSet, setCustomCharSet] = useState<string>("");
  
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  
  const [textColor, setTextColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [isColorized, setIsColorized] = useState<boolean>(false);
  const [pixelColors, setPixelColors] = useState<string[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const charSet = useMemo(() => {
    if (charSetType === "custom") return customCharSet || " ";
    return CHAR_SETS[charSetType];
  }, [charSetType, customCharSet]);

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFromBlob(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  useEffect(() => {
    if (!sourceUrl) {
      setAscii("");
      setPixelColors([]);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspect = img.height / img.width;
      const cols = Math.max(10, Math.min(300, Math.floor(columns)));
      const rows = Math.max(5, Math.floor(cols * aspect * aspectCorrection));
      
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Apply brightness and contrast filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, cols, rows);
      
      const imgData = ctx.getImageData(0, 0, cols, rows);
      const data = imgData.data;
      const shades = charSet.length - 1;
      
      let out = "";
      const colors: string[][] = [];

      for (let y = 0; y < rows; y++) {
        let line = "";
        const colorRow: string[] = [];
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Perceptual luminance
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const idx = Math.round(((invert ? lum : 255 - lum) / 255) * shades);
          line += charSet[idx] || charSet[0];
          
          if (isColorized) {
            colorRow.push(`rgb(${r},${g},${b})`);
          }
        }
        out += line + "\n";
        if (isColorized) colors.push(colorRow);
      }
      setAscii(out);
      setPixelColors(colors);
    };
    img.src = sourceUrl;
  }, [sourceUrl, columns, invert, charSet, aspectCorrection, brightness, contrast, isColorized]);

  const copyText = async () => {
    if (!ascii) return;
    await navigator.clipboard.writeText(ascii);
  };

  const downloadText = () => {
    if (!ascii) return;
    const blob = new Blob([ascii], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName?.split(".")[0] || "ascii"}-art.txt`;
    a.click();
  };

  const downloadImage = () => {
    if (!ascii) return;
    const lines = ascii.split("\n").filter(l => l.length > 0);
    const rows = lines.length;
    const cols = lines[0].length;
    
    const canvas = document.createElement("canvas");
    const charWidth = fontSize * 0.6; // Approximate for monospace
    const charHeight = fontSize;
    
    canvas.width = cols * charWidth + 20;
    canvas.height = rows * charHeight + 20;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (isColorized && pixelColors[y]?.[x]) {
          ctx.fillStyle = pixelColors[y][x];
        } else {
          ctx.fillStyle = textColor;
        }
        ctx.fillText(lines[y][x], 10 + x * charWidth, 10 + y * charHeight);
      }
    }
    
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${fileName?.split(".")[0] || "ascii"}-art.png`;
    a.click();
  };

  const clear = () => {
    setSourceUrl(null);
    setFileName(null);
    setAscii("");
    setPixelColors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ASCII Art Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform any image into stunning text-based art. Customize characters, colors, and more.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <Button variant="primary" as="label">
                    Choose Image
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={clear}>
                      Clear Image
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {fileName ? `Selected: ${fileName}` : "or drag and drop your image here"}
                </p>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
                Conversion Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resolution (Columns): {columns}
                    </label>
                    <input
                      type="range" min={40} max={300} value={columns}
                      onChange={(e) => setColumns(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Character Aspect: {aspectCorrection.toFixed(2)}
                    </label>
                    <input
                      type="range" min={0.3} max={1.0} step={0.01} value={aspectCorrection}
                      onChange={(e) => setAspectCorrection(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range" min={6} max={24} value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Processing Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brightness: {brightness}%
                    </label>
                    <input
                      type="range" min={0} max={200} value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contrast: {contrast}%
                    </label>
                    <input
                      type="range" min={0} max={200} value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox" checked={invert}
                        onChange={(e) => setInvert(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">Invert Shades</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Character Sets */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Character Set
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(CHAR_SETS).map((key) => (
                    <button
                      key={key}
                      onClick={() => setCharSetType(key as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                        charSetType === key 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={() => setCharSetType("custom")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      charSetType === "custom" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {charSetType === "custom" && (
                  <input
                    type="text"
                    value={customCharSet}
                    onChange={(e) => setCustomCharSet(e.target.value)}
                    placeholder="Enter custom characters..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                )}
              </div>
            </div>

            {/* Styling & Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
                Style & Export
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Colorized ASCII</span>
                    <input
                      type="checkbox" checked={isColorized}
                      onChange={(e) => setIsColorized(e.target.checked)}
                      className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-4 after:h-4 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 after:transition-transform checked:after:translate-x-5"
                    />
                  </div>
                  
                  {!isColorized && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Color</span>
                      <input
                        type="color" value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</span>
                    <input
                      type="color" value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="primary" onClick={downloadImage} disabled={!ascii}>
                    Download as Image (PNG)
                  </Button>
                  <Button variant="secondary" onClick={downloadText} disabled={!ascii}>
                    Download as Text (.txt)
                  </Button>
                  <Button variant="secondary" onClick={copyText} disabled={!ascii}>
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Art Preview
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Live Rendering
                </span>
              </div>
              
              <div
                ref={outputRef}
                style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize}px`,
                  backgroundColor: bgColor,
                  color: textColor,
                  whiteSpace: "pre",
                }}
                className="flex-grow overflow-auto p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
              >
                {!ascii ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    <p className="font-medium">Waiting for image...</p>
                  </div>
                ) : (
                  <div className="inline-block min-w-full">
                    {isColorized ? (
                      ascii.split("\n").map((line, y) => (
                        <div key={y} className="flex h-[inherit]">
                          {line.split("").map((char, x) => (
                            <span key={x} style={{ color: pixelColors[y]?.[x] }}>
                              {char}
                            </span>
                          ))}
                        </div>
                      ))
                    ) : (
                      ascii
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>Tip: Monospace fonts look best for ASCII art.</span>
                {ascii && (
                  <span>
                    Size: {ascii.split("\n")[0].length}x{ascii.split("\n").length} chars
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
