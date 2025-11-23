"use client";

import React, { useRef, useState } from "react";

export default function CustomCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState("My Card");
  const [message, setMessage] = useState("Hello world!");
  const [bgColor, setBgColor] = useState("#0ea5e9");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(640);
  const [height, setHeight] = useState<number>(360);
  const [titleSize, setTitleSize] = useState<number>(28);
  const [messageSize, setMessageSize] = useState<number>(16);
  const [imageScale, setImageScale] = useState<number>(1.0); // 1.0 = natural fit in render
  const [imageXOffset, setImageXOffset] = useState<number>(0);
  const [imageYOffset, setImageYOffset] = useState<number>(0);

  function renderCanvas() {
    const cnv = canvasRef.current!;
    cnv.width = Math.max(200, Math.min(2000, width));
    cnv.height = Math.max(150, Math.min(2000, height));
    const ctx = cnv.getContext("2d")!;
    const w = cnv.width, h = cnv.height;
    // background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    // optional image
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        const fitRatio = Math.min(w * 0.8 / img.width, h * 0.5 / img.height);
        const ratio = fitRatio * Math.max(0.1, imageScale);
        const iw = img.width * ratio;
        const ih = img.height * ratio;
        const ix = (w - iw) / 2 + imageXOffset;
        const iy = 40 + imageYOffset;
        ctx.drawImage(img, ix, iy, iw, ih);
        drawText();
      };
      img.src = imageUrl;
    } else {
      drawText();
    }

    function drawText() {
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${titleSize}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(title, w / 2, h - Math.max(90, Math.round(height * 0.2)));
      ctx.font = `${messageSize}px system-ui, sans-serif`;
      wrapText(ctx, message, w / 2, h - Math.max(60, Math.round(height * 0.15)), w * 0.8, Math.max(18, Math.round(messageSize * 1.2)));
    }
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setTimeout(renderCanvas, 10);
  }

  function download() {
    const cnv = canvasRef.current;
    if (!cnv) return;
    const a = document.createElement("a");
    a.href = cnv.toDataURL("image/png");
    a.download = "custom-card.png";
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded p-1" placeholder="Title" />
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="border rounded p-1 w-64" placeholder="Message" />
        <label className="flex items-center gap-2">
          <span>Background</span>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span>Width</span>
          <input type="number" min={200} max={2000} value={width} onChange={(e) => setWidth(parseInt(e.target.value || "0"))} className="w-24 border rounded p-1" />
        </label>
        <label className="flex items-center gap-2">
          <span>Height</span>
          <input type="number" min={150} max={2000} value={height} onChange={(e) => setHeight(parseInt(e.target.value || "0"))} className="w-24 border rounded p-1" />
        </label>
        <label className="flex items-center gap-2">
          <span>Title Size</span>
          <input type="number" min={12} max={120} value={titleSize} onChange={(e) => setTitleSize(parseInt(e.target.value || "0"))} className="w-20 border rounded p-1" />
        </label>
        <label className="flex items-center gap-2">
          <span>Message Size</span>
          <input type="number" min={10} max={80} value={messageSize} onChange={(e) => setMessageSize(parseInt(e.target.value || "0"))} className="w-20 border rounded p-1" />
        </label>
        <label className="btn btn-primary cursor-pointer">
          Choose Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <label className="flex items-center gap-2">
          <span>Image Scale</span>
          <input type="range" min={0.1} max={3} step={0.05} value={imageScale} onChange={(e) => setImageScale(parseFloat(e.target.value))} />
          <span>{imageScale.toFixed(2)}×</span>
        </label>
        <label className="flex items-center gap-2">
          <span>Image X</span>
          <input type="range" min={-200} max={200} step={1} value={imageXOffset} onChange={(e) => setImageXOffset(parseInt(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          <span>Image Y</span>
          <input type="range" min={-200} max={200} step={1} value={imageYOffset} onChange={(e) => setImageYOffset(parseInt(e.target.value))} />
        </label>
        <button className="border px-3 py-1 rounded" onClick={() => renderCanvas()}>Render</button>
        <button className="border px-3 py-1 rounded" onClick={download}>Download</button>
      </div>
      <div className="rounded border p-4 inline-block">
        <canvas ref={canvasRef} width={width} height={height} />
      </div>
      <p className="text-sm text-gray-600">Tip: Render after updating text or color to refresh the card preview.</p>
    </div>
  );
}