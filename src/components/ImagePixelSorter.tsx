"use client";

import React, { useRef, useState, useEffect } from "react";
import "./ImagePixelSorter.css";

type Mode = "brightness" | "hue" | "red" | "green" | "blue";
type Direction = "rows" | "columns" | "all";

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}

function getMetric(r: number, g: number, b: number, mode: Mode) {
  if (mode === "brightness") return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (mode === "hue") return rgbToHsv(r, g, b).h;
  if (mode === "red") return r;
  if (mode === "green") return g;
  return b;
}

export default function ImagePixelSorter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("brightness");
  const [direction, setDirection] = useState<Direction>("rows");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [strength, setStrength] = useState<number>(50);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<ImageData | null>(null);

  useEffect(() => {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    if (!ctx) return;
    // Initialize blank canvas
    ctx.clearRect(0, 0, cnv.width, cnv.height);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cnv = canvasRef.current!;
      const ctx = cnv.getContext("2d")!;
      cnv.width = img.width;
      cnv.height = img.height;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, cnv.width, cnv.height);
      setOriginalData(data);
      setHasImage(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function sortAll() {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, cnv.width, cnv.height);
    const { data, width, height } = imageData;
    const asc = order === "asc";
    const strengthFactor = Math.max(1, Math.round((strength / 100) * 20));

    function compare(a: number, b: number) {
      return asc ? a - b : b - a;
    }

    if (direction === "rows") {
      for (let y = 0; y < height; y++) {
        const row: { metric: number; rgba: [number, number, number, number] }[] = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          const m = getMetric(r, g, b, mode);
          row.push({ metric: m, rgba: [r, g, b, a] });
        }
        row.sort((p, q) => compare(p.metric, q.metric));
        // Partial sort: take some items from sorted row based on strength
        const mixed = row.slice();
        for (let s = 0; s < strengthFactor; s++) {
          const idx = Math.floor((s / strengthFactor) * row.length);
          mixed[idx] = row[idx];
        }
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const [r, g, b, a] = mixed[x].rgba;
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
        }
      }
    } else if (direction === "columns") {
      for (let x = 0; x < width; x++) {
        const col: { metric: number; rgba: [number, number, number, number] }[] = [];
        for (let y = 0; y < height; y++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          const m = getMetric(r, g, b, mode);
          col.push({ metric: m, rgba: [r, g, b, a] });
        }
        col.sort((p, q) => compare(p.metric, q.metric));
        const mixed = col.slice();
        for (let s = 0; s < strengthFactor; s++) {
          const idx = Math.floor((s / strengthFactor) * col.length);
          mixed[idx] = col[idx];
        }
        for (let y = 0; y < height; y++) {
          const i = (y * width + x) * 4;
          const [r, g, b, a] = mixed[y].rgba;
          data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
        }
      }
    } else {
      // direction === 'all': sort entire pixel array by metric partially
      const pixels: { metric: number; rgba: [number, number, number, number] }[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        pixels.push({ metric: getMetric(r, g, b, mode), rgba: [r, g, b, a] });
      }
      pixels.sort((p, q) => compare(p.metric, q.metric));
      const mixed = pixels.slice();
      const take = Math.floor((strength / 100) * mixed.length);
      for (let i = 0; i < take; i++) mixed[i] = pixels[i];
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const [r, g, b, a] = mixed[j].rgba;
        data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function reset() {
    if (!originalData) return;
    const cnv = canvasRef.current!;
    const ctx = cnv.getContext("2d")!;
    ctx.putImageData(originalData, 0, 0);
  }

  function download() {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const link = document.createElement("a");
    link.download = "pixel-sorted.png";
    link.href = cnv.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="pixel-sorter-container">
      <div className="controls">
        <div className="row">
          <label className="btn btn-primary cursor-pointer">
            Choose Image
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        <div className="row">
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="brightness">Brightness</option>
            <option value="hue">Hue</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </select>
        </div>
        <div className="row">
          <label>Direction</label>
          <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
            <option value="rows">Rows</option>
            <option value="columns">Columns</option>
            <option value="all">Entire Image</option>
          </select>
        </div>
        <div className="row">
          <label>Order</label>
          <select value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")}> 
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="row">
          <label>Strength</label>
          <input type="range" min={0} max={100} value={strength} onChange={(e) => setStrength(parseInt(e.target.value))} />
          <span>{strength}%</span>
        </div>
      </div>

      <div className="button-row">
        <button className="border px-3 py-1 rounded" disabled={!hasImage} onClick={sortAll}>Sort</button>
        <button className="border px-3 py-1 rounded" disabled={!hasImage} onClick={reset}>Reset</button>
        <button className="border px-3 py-1 rounded" disabled={!hasImage} onClick={download}>Download</button>
      </div>

      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={640} height={480} />
        {!hasImage && (
          <p className="text-sm text-gray-600">Load an image to begin.</p>
        )}
      </div>
    </div>
  );
}