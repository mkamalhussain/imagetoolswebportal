"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";

export default function ImageAsciiArtConverter() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [columns, setColumns] = useState<number>(100);
  const [invert, setInvert] = useState<boolean>(false);
  const [ascii, setAscii] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(9);
  const [aspectCorrection, setAspectCorrection] = useState<number>(0.55); // correct for character aspect
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const charSet = useMemo(() => "@%#*+=-:. ", []); // darkest -> lightest

  useEffect(() => {
    if (!imageUrl) {
      setAscii("");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspect = img.height / img.width;
      const cols = Math.max(10, Math.min(240, Math.floor(columns)));
      const rows = Math.max(5, Math.floor(cols * aspect * aspectCorrection));
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, cols, rows);
      const imgData = ctx.getImageData(0, 0, cols, rows);
      const data = imgData.data;
      const shades = charSet.length - 1;
      let out = "";
      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // perceptual luminance
          const idx = Math.round(((invert ? lum : 255 - lum) / 255) * shades);
          line += charSet[idx];
        }
        out += line + "\n";
      }
      setAscii(out);
    };
    img.src = imageUrl;
  }, [imageUrl, columns, invert, charSet, aspectCorrection]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const copyText = async () => {
    if (!ascii) return;
    await navigator.clipboard.writeText(ascii);
    alert("ASCII art copied to clipboard.");
  };

  const downloadText = () => {
    if (!ascii) return;
    const blob = new Blob([ascii], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ascii-art.txt";
    a.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">ASCII Art Converter</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="primary" as="label">
          Choose Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </Button>
        <label className="flex items-center gap-2">
          <span>Columns</span>
          <input
            type="range"
            min={40}
            max={240}
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value))}
          />
          <span>{columns}</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Aspect</span>
          <input
            type="range"
            min={0.4}
            max={0.8}
            step={0.01}
            value={aspectCorrection}
            onChange={(e) => setAspectCorrection(parseFloat(e.target.value))}
          />
          <span>{aspectCorrection.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Font size</span>
          <input
            type="range"
            min={6}
            max={16}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <span>{fontSize}px</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => setInvert(e.target.checked)}
          />
          <span>Invert</span>
        </label>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={copyText}>
          Copy
        </button>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={downloadText}>
          Download .txt
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div
        style={{
          fontFamily: "monospace",
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
          whiteSpace: "pre",
        }}
        className="overflow-auto p-3 bg-gray-100 rounded border"
      >
        {ascii || "Upload an image to generate ASCII art."}
      </div>
    </div>
  );
}