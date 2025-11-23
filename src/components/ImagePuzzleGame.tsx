"use client";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";

type Mapping = number[]; // maps tile index -> source index

export default function ImagePuzzleGame() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [gridSize, setGridSize] = useState<number>(3);
  const [mapping, setMapping] = useState<Mapping>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [solved, setSolved] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const canvasSize = 480;

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      initMapping();
      draw();
    };
    img.src = imageUrl;
  }, [imageUrl, gridSize]);

  useEffect(() => {
    draw();
  }, [mapping, selected, solved]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    resetGame();
  };

  const resetGame = () => {
    setSelected(null);
    setMoves(0);
    setStartTime(Date.now());
    setSolved(false);
  };

  const initMapping = () => {
    const n = gridSize * gridSize;
    const arr = Array.from({ length: n }, (_, i) => i);
    // simple shuffle; ensure not already solved
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.every((v, i) => v === i)) {
      // if accidentally solved, swap first two
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    setMapping(arr);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!canvas || !ctx || !img) return;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tileW = Math.floor(canvasSize / gridSize);
    const tileH = Math.floor(canvasSize / gridSize);

    // scale image to fit canvas square
    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    const offsetX = Math.floor((canvasSize - w) / 2);
    const offsetY = Math.floor((canvasSize - h) / 2);

    for (let idx = 0; idx < gridSize * gridSize; idx++) {
      const srcIndex = mapping[idx];
      const sx = srcIndex % gridSize;
      const sy = Math.floor(srcIndex / gridSize);
      const dx = idx % gridSize;
      const dy = Math.floor(idx / gridSize);

      // source tile in the scaled image space
      const sTileW = Math.floor(w / gridSize);
      const sTileH = Math.floor(h / gridSize);
      const sxPix = sx * sTileW;
      const syPix = sy * sTileH;

      const dxPix = dx * tileW;
      const dyPix = dy * tileH;

      // draw the portion of the scaled image into tile space
      ctx.drawImage(
        img,
        sxPix / scale,
        syPix / scale,
        sTileW / scale,
        sTileH / scale,
        offsetX + dxPix,
        offsetY + dyPix,
        sTileW,
        sTileH
      );

      // highlight selection
      if (selected === idx) {
        ctx.strokeStyle = "#22c55e"; // green
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX + dxPix, offsetY + dyPix, sTileW, sTileH);
      }
    }

    // grid lines
    ctx.strokeStyle = "#00000022";
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + i * Math.floor(w / gridSize), offsetY);
      ctx.lineTo(offsetX + i * Math.floor(w / gridSize), offsetY + h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * Math.floor(h / gridSize));
      ctx.lineTo(offsetX + w, offsetY + i * Math.floor(h / gridSize));
      ctx.stroke();
    }
  };

  const canvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    const offsetX = Math.floor((canvasSize - w) / 2);
    const offsetY = Math.floor((canvasSize - h) / 2);

    if (x < offsetX || x >= offsetX + w || y < offsetY || y >= offsetY + h) return;
    const sTileW = Math.floor(w / gridSize);
    const sTileH = Math.floor(h / gridSize);
    const dx = Math.floor((x - offsetX) / sTileW);
    const dy = Math.floor((y - offsetY) / sTileH);
    const idx = dy * gridSize + dx;

    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      const newMap = mapping.slice();
      [newMap[selected], newMap[idx]] = [newMap[idx], newMap[selected]];
      setMapping(newMap);
      setSelected(null);
      setMoves((m) => m + 1);
      const done = newMap.every((v, i) => v === i);
      setSolved(done);
    }
  };

  const shuffle = () => {
    initMapping();
    setMoves(0);
    setStartTime(Date.now());
    setSolved(false);
  };

  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Image Puzzle Game</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="primary" as="label">
          Choose Image
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </Button>
        <label className="flex items-center gap-2">
          <span>Grid</span>
          <input
            type="range"
            min={3}
            max={6}
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
          />
          <span>{gridSize}×{gridSize}</span>
        </label>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={shuffle} disabled={!imageUrl}>
          Shuffle
        </button>
        <span>Moves: {moves}</span>
        <span>Time: {elapsed}s</span>
        {solved && <span className="text-green-600 font-medium">Solved!</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border rounded"
        onClick={canvasClick}
      />
      {!imageUrl && <div className="text-gray-600">Upload an image to start the puzzle.</div>}
    </div>
  );
}