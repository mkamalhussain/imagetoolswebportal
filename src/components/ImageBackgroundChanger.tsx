"use client";
import React, { useEffect, useRef, useState } from "react";

function colorDiff(a: [number, number, number], b: [number, number, number]) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export default function ImageBackgroundChanger() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [color, setColor] = useState<string>("#00ff00");
  const [tolerance, setTolerance] = useState<number>(40);
  const [resultUrl, setResultUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setResultUrl("");
      return;
    }
    process();
  }, [imageUrl, color, tolerance]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const m = hex.replace('#', '');
    const r = parseInt(m.substring(0, 2), 16);
    const g = parseInt(m.substring(2, 4), 16);
    const b = parseInt(m.substring(4, 6), 16);
    return [r, g, b];
  };

  const process = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const target = hexToRgb(color);
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff = colorDiff([r, g, b], target);
        if (diff <= tolerance) {
          // make background transparent
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setResultUrl(canvas.toDataURL("image/png"));
    };
    img.src = imageUrl;
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "background-removed.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Background Changer (Chroma Key)</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <input type="file" accept="image/*" onChange={onFile} />
        <label className="flex items-center gap-2">
          <span>Target color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span>Tolerance</span>
          <input
            type="range"
            min={0}
            max={128}
            value={tolerance}
            onChange={(e) => setTolerance(parseInt(e.target.value))}
          />
          <span>{tolerance}</span>
        </label>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={download} disabled={!resultUrl}>
          Download PNG
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Original</h3>
          {imageUrl ? (
            <img src={imageUrl} alt="Original" className="max-h-80 rounded border" />
          ) : (
            <div className="text-gray-600">Upload an image to begin.</div>
          )}
        </div>
        <div>
          <h3 className="font-medium">Result</h3>
          {resultUrl ? (
            <img src={resultUrl} alt="Result" className="max-h-80 rounded border bg-checker" />
          ) : (
            <div className="text-gray-600">Choose target color and tolerance.</div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}