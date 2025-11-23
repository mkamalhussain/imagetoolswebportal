"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";

export default function Anaglyph3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState<number>(12);
  const [fileName, setFileName] = useState<string>("");
  const [ready, setReady] = useState<boolean>(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    const img = imgRef.current;
    if (!img) return;
    img.onload = () => {
      setReady(true);
      renderAnaglyph();
    };
    img.onerror = () => {
      setReady(false);
    };
    img.src = url;
  };

  const renderAnaglyph = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Offscreen canvases for left (red) and right (cyan) images
    const left = document.createElement("canvas");
    const right = document.createElement("canvas");
    left.width = w; left.height = h;
    right.width = w; right.height = h;
    const lctx = left.getContext("2d");
    const rctx = right.getContext("2d");
    if (!lctx || !rctx) return;

    // Draw with horizontal offsets to create parallax
    lctx.clearRect(0, 0, w, h);
    rctx.clearRect(0, 0, w, h);
    lctx.drawImage(img, -offset, 0, w, h);
    rctx.drawImage(img, offset, 0, w, h);

    const lData = lctx.getImageData(0, 0, w, h);
    const rData = rctx.getImageData(0, 0, w, h);
    const out = ctx.createImageData(w, h);

    const lp = lData.data;
    const rp = rData.data;
    const op = out.data;
    for (let i = 0; i < op.length; i += 4) {
      // Red from left image
      op[i] = lp[i];
      // Cyan (G+B) from right image
      op[i + 1] = rp[i + 1];
      op[i + 2] = rp[i + 2];
      // Alpha
      op[i + 3] = Math.max(lp[i + 3], rp[i + 3]);
    }
    ctx.putImageData(out, 0, 0);
  };

  useEffect(() => {
    if (ready) {
      renderAnaglyph();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const onDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^.]+$/, "") + "-anaglyph.png" : "anaglyph.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          <Button variant="primary" as="label">
            Choose Image
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </Button>
          <p className="text-xs text-gray-500 mt-1">Tip: Use high-resolution images for best results.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Depth Offset (px)</label>
          <input
            type="range"
            min={0}
            max={50}
            value={offset}
            onChange={(e) => setOffset(parseInt(e.target.value, 10))}
          />
          <div className="text-sm text-gray-600 mt-1">Current: {offset}px</div>
        </div>
        <Button onClick={onDownload}>Download PNG</Button>
      </div>

      <div className="border rounded p-3 bg-white">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
        <img ref={imgRef} alt="source" style={{ display: "none" }} />
      </div>

      <p className="text-sm text-gray-600">Use red-cyan 3D glasses to view the anaglyph. Adjust the depth offset for stronger or subtler 3D.</p>
    </div>
  );
}