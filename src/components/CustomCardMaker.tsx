"use client";

import React, { useRef, useState } from "react";

export default function CustomCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState("My Card");
  const [message, setMessage] = useState("Hello world!");
  const [bgColor, setBgColor] = useState("#0ea5e9");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  function renderCanvas() {
    const cnv = canvasRef.current!;
    const ctx = cnv.getContext("2d")!;
    const w = cnv.width, h = cnv.height;
    // background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    // optional image
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(w * 0.8 / img.width, h * 0.5 / img.height);
        const iw = img.width * ratio;
        const ih = img.height * ratio;
        const ix = (w - iw) / 2;
        const iy = 40;
        ctx.drawImage(img, ix, iy, iw, ih);
        drawText();
      };
      img.src = imageUrl;
    } else {
      drawText();
    }

    function drawText() {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, w / 2, h - 90);
      ctx.font = "16px system-ui, sans-serif";
      wrapText(ctx, message, w / 2, h - 60, w * 0.8, 20);
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
        <input type="file" accept="image/*" onChange={onFile} />
        <button className="border px-3 py-1 rounded" onClick={() => renderCanvas()}>Render</button>
        <button className="border px-3 py-1 rounded" onClick={download}>Download</button>
      </div>
      <div className="rounded border p-4 inline-block">
        <canvas ref={canvasRef} width={640} height={360} />
      </div>
      <p className="text-sm text-gray-600">Tip: Render after updating text or color to refresh the card preview.</p>
    </div>
  );
}