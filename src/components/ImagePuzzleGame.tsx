"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Button from "./Button";

type Mapping = number[];

export default function ImagePuzzleGame() {
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [gridSize, setGridSize] = useState<number>(3);
  const [mapping, setMapping] = useState<Mapping>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [ghostOpacity, setGhostOpacity] = useState<number>(0);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("none");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const canvasSize = 540;

  // Load best score from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`puzzle-best-${gridSize}`);
    if (saved) setBestScore(JSON.parse(saved));
    else setBestScore(null);
  }, [gridSize]);

  // Timer logic
  useEffect(() => {
    if (startTime && !solved) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, solved]);

  const initMapping = useCallback((size: number) => {
    const n = size * size;
    const arr = Array.from({ length: n }, (_, i) => i);
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure it's not solved
    if (arr.every((v, i) => v === i)) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    setMapping(arr);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!canvas || !ctx || !img) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    const offsetX = Math.floor((canvasSize - w) / 2);
    const offsetY = Math.floor((canvasSize - h) / 2);

    ctx.save();
    if (isMirrored) {
      ctx.translate(canvasSize, 0);
      ctx.scale(-1, 1);
    }

    if (filter !== "none") {
      ctx.filter = filter;
    }

    const sTileW = Math.floor(img.width / gridSize);
    const sTileH = Math.floor(img.height / gridSize);
    const dTileW = Math.floor(w / gridSize);
    const dTileH = Math.floor(h / gridSize);

    // INNOVATION: Peek Original (Full Overlay)
    if (showOriginal && !solved) {
      ctx.drawImage(img, offsetX, offsetY, w, h);
      ctx.restore(); // Restore before drawing label so text isn't mirrored
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PEEKING...", canvasSize / 2, canvasSize / 2);
      return;
    }

    mapping.forEach((srcIndex, idx) => {
      const sx = srcIndex % gridSize;
      const sy = Math.floor(srcIndex / gridSize);
      const dx = idx % gridSize;
      const dy = Math.floor(idx / gridSize);

      const dxPix = offsetX + dx * dTileW;
      const dyPix = offsetY + dy * dTileH;

      ctx.drawImage(
        img,
        sx * sTileW, sy * sTileH, sTileW, sTileH,
        dxPix, dyPix, dTileW, dTileH
      );

      // INNOVATION: Correct Position Glow
      if (srcIndex === idx && !solved) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        ctx.fillRect(dxPix, dyPix, dTileW, dTileH);
        ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dxPix + 1, dyPix + 1, dTileW - 2, dTileH - 2);
      }

      // Numbers overlay
      if (showNumbers && !solved) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(dxPix + 5, dyPix + 5, 24, 24);
        ctx.fillStyle = "white";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(srcIndex + 1), dxPix + 17, dyPix + 17);
      }

      // Selected highlight
      if (selected === idx) {
        ctx.save();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 4;
        ctx.strokeRect(dxPix + 2, dyPix + 2, dTileW - 4, dTileH - 4);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(dxPix + 2, dyPix + 2, dTileW - 4, dTileH - 4);
        ctx.restore();
      }
    });

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + i * dTileW, offsetY);
      ctx.lineTo(offsetX + i * dTileW, offsetY + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * dTileH);
      ctx.lineTo(offsetX + w, offsetY + i * dTileH);
      ctx.stroke();
    }

    // INNOVATION: Ghost Guide (Now as semi-transparent overlay)
    if (ghostOpacity > 0 && !solved) {
      ctx.globalAlpha = ghostOpacity / 100;
      ctx.drawImage(img, offsetX, offsetY, w, h);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }, [mapping, selected, solved, showNumbers, showOriginal, gridSize, ghostOpacity, isMirrored, filter]);

  useEffect(() => {
    if (!sourceUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      initMapping(gridSize);
    };
    img.src = sourceUrl;
  }, [sourceUrl, gridSize, initMapping]);

  useEffect(() => {
    draw();
  }, [draw]);

  const resetGame = useCallback(() => {
    setSelected(null);
    setMoves(0);
    setStartTime(Date.now());
    setCurrentTime(0);
    setSolved(false);
    setHintUsed(false);
    initMapping(gridSize);
  }, [gridSize, initMapping]);

  const useSmartHint = () => {
    if (solved || !sourceUrl) return;
    
    // Find first tile not in correct position
    const firstWrongIdx = mapping.findIndex((srcIdx, currentIdx) => srcIdx !== currentIdx);
    if (firstWrongIdx === -1) return;

    // Find where that tile's correct content is currently located
    const currentPosOfCorrectTile = mapping.indexOf(firstWrongIdx);
    
    const newMap = [...mapping];
    [newMap[firstWrongIdx], newMap[currentPosOfCorrectTile]] = [newMap[currentPosOfCorrectTile], newMap[firstWrongIdx]];
    
    setMapping(newMap);
    setMoves(m => m + 5); // Penalty for hint
    setHintUsed(true);

    if (newMap.every((v, i) => v === i)) {
      setSolved(true);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileFromBlob(file);
    e.target.value = "";
  };

  const setFileFromBlob = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setFileName(file.name);
    resetGame();
  }, [resetGame]);

  const canvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (solved || !imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const img = imgRef.current;
    const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    const offsetX = Math.floor((canvasSize - w) / 2);
    const offsetY = Math.floor((canvasSize - h) / 2);

    if (x < offsetX || x >= offsetX + w || y < offsetY || y >= offsetY + h) return;

    const dTileW = Math.floor(w / gridSize);
    const dTileH = Math.floor(h / gridSize);
    const dx = Math.floor((x - offsetX) / dTileW);
    const dy = Math.floor((y - offsetY) / dTileH);
    const idx = dy * gridSize + dx;

    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      const newMap = [...mapping];
      [newMap[selected], newMap[idx]] = [newMap[idx], newMap[selected]];
      setMapping(newMap);
      setSelected(null);
      setMoves(m => m + 1);
      
      if (newMap.every((v, i) => v === i)) {
        setSolved(true);
        const finalTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
        checkBestScore(moves + 1, finalTime);
      }
    }
  };

  const checkBestScore = (finalMoves: number, finalTime: number) => {
    const currentBest = localStorage.getItem(`puzzle-best-${gridSize}`);
    if (!currentBest || finalTime < JSON.parse(currentBest).time) {
      const score = { moves: finalMoves, time: finalTime };
      localStorage.setItem(`puzzle-best-${gridSize}`, JSON.stringify(score));
      setBestScore(score);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-orange-900/10 dark:to-amber-900/10 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Photo Tile Puzzle
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload any photo and challenge yourself to solve the grid. Switch tiles to restore the original image!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Game Controls & Stats */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={resetGame}>
                      New Game
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {fileName ? `Photo: ${fileName}` : "Drop any image here to start"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Difficulty & Aids</h3>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 4, 5, 6].map((size) => (
                      <button
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                          gridSize === size 
                            ? "bg-orange-600 text-white border-orange-600 shadow-lg scale-105" 
                            : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-orange-50"
                        }`}
                      >
                        {size}×{size}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600">Tile Numbers</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={isMirrored} onChange={(e) => setIsMirrored(e.target.checked)} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600">Mirror Mode</span>
                      </label>
                      <label 
                        className="flex items-center gap-2 cursor-pointer group select-none"
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onMouseLeave={() => setShowOriginal(false)}
                        onTouchStart={(e) => { e.preventDefault(); setShowOriginal(true); }}
                        onTouchEnd={() => setShowOriginal(false)}
                      >
                        <div className="w-4 h-4 border-2 border-orange-600 rounded flex items-center justify-center">
                          <div className={`w-2 h-2 bg-orange-600 rounded-full transition-opacity ${showOriginal ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 uppercase text-[10px] font-bold">Hold to Peek</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span>Ghost Guide</span>
                        <span>{ghostOpacity}%</span>
                      </div>
                      <input 
                        type="range" min={0} max={50} step={5} 
                        value={ghostOpacity} 
                        onChange={(e) => setGhostOpacity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Atmosphere</label>
                      <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="none">Standard</option>
                        <option value="grayscale(100%)">Noir (B&W)</option>
                        <option value="sepia(100%)">Vintage</option>
                        <option value="hue-rotate(180deg)">Neon Invert</option>
                        <option value="contrast(150%) brightness(120%)">High Octane</option>
                        <option value="blur(2px)">Blur Challenge</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                      <span className="block text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Moves</span>
                      <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{moves}</span>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                      <span className="block text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Time</span>
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{currentTime}s</span>
                    </div>
                  </div>
                  
                  {/* Smart Power-up */}
                  <div className="mt-6">
                    <button
                      onClick={useSmartHint}
                      disabled={solved}
                      className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="font-bold leading-none">Smart Solve</div>
                          <div className="text-[10px] opacity-80 uppercase tracking-widest mt-1">Fixes 1 tile (+5 moves)</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {bestScore && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Best for {gridSize}×{gridSize}</span>
                      <span className="text-xs font-mono font-bold text-green-600 dark:text-green-300">{bestScore.moves} moves in {bestScore.time}s</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Puzzle Board */}
          <div className="flex flex-col h-full items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 relative border-8 border-white dark:border-gray-700">
              {!sourceUrl ? (
                <div className="w-[500px] h-[500px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <svg className="w-24 h-24 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-bold text-xl">Waiting for your photo</p>
                </div>
              ) : (
                <div className="relative group">
                  <canvas
                    ref={canvasRef}
                    className={`rounded-xl shadow-inner cursor-pointer transition-all duration-500 ${solved ? 'brightness-110 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : ''}`}
                    onClick={canvasClick}
                  />
                  
                  {solved && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl text-center border-4 border-green-500 scale-110">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Puzzle Solved!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You completed it in {moves} moves and {currentTime} seconds.</p>
                        <Button variant="primary" onClick={resetGame} className="w-full py-3">Play Again</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {sourceUrl && !solved && (
              <div className="mt-6 flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border rounded-md shadow-sm">Click</kbd>
                <span>two tiles to swap them</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
