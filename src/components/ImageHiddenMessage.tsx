"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/components/Button";

type Mode = "encode" | "decode";
type XRayPlane = "all" | "red" | "green" | "blue";

// Simple seeded random for pixel spreading
class SeededRandom {
  private seed: number;
  constructor(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    this.seed = Math.abs(hash) || 1;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export default function ImageHiddenMessage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [message, setMessage] = useState("");
  const [keyStr, setKeyStr] = useState<string>("");
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success" | "info"; text: string }>({ type: "idle", text: "" });
  const [imgUrl, setImgUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const [bitDepth, setBitDepth] = useState<number>(1);
  const [useRandomSpread, setUseRandomSpread] = useState(true);
  const [useCompression, setUseCompression] = useState(false);
  
  const [showXRay, setShowXRay] = useState(false);
  const [xrayPlane, setXRayPlane] = useState<XRayPlane>("all");
  const [decodedText, setDecodedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const setFileFromBlob = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Please select a valid image file." });
      return;
    }
    
    if (file.type.includes("jpeg") || file.type.includes("jpg")) {
      setStatus({ type: "info", text: "Warning: JPEG compression corrupts hidden data. Use PNG or BMP for safety." });
    } else {
      setStatus({ type: "idle", text: "" });
    }

    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setFileName(file.name);
    setDecodedText("");
    
    const img = new Image();
    img.onload = () => {
      originalImgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx?.drawImage(img, 0, 0);
      }
    };
    img.src = url;
  }, [imgUrl]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileFromBlob(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileFromBlob(file);
  }, [setFileFromBlob]);

  // XOR Encryption
  const applyKey = (bytes: Uint8Array, key: string): Uint8Array => {
    if (!key) return bytes;
    const keyBytes = new TextEncoder().encode(key);
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return out;
  };

  const capacity = useMemo(() => {
    if (!originalImgRef.current) return 0;
    const pixels = originalImgRef.current.width * originalImgRef.current.height;
    // 3 channels (RGB) * bitDepth bits per channel - 64 bits for header (length + flags)
    return Math.floor(((pixels * 3 * bitDepth) - 64) / 8);
  }, [originalImgRef.current, bitDepth]);

  const generateIndices = (count: number, total: number, seed: string) => {
    const indices = Array.from({ length: total }, (_, i) => i);
    if (!seed) return indices.slice(0, count);
    
    const rng = new SeededRandom(seed);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
  };

  const encodeLSB = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImgRef.current) return;
    
    setIsProcessing(true);
    setStatus({ type: "info", text: "Encoding message..." });
    await new Promise(r => setTimeout(r, 100));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(originalImgRef.current, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const encoder = new TextEncoder();
    let bytes = encoder.encode(message);
    
    // Header byte: [0: randomSpread, 1: compression, 2-7: reserved]
    let flags = 0;
    if (useRandomSpread) flags |= (1 << 0);

    // Validation Signature: 0x53544547 ('STEG' in hex)
    const signature = 0x53544547;
    
    const keyed = applyKey(bytes, keyStr);
    
    if (keyed.length > capacity) {
      setStatus({ type: "error", text: `Message too large. Max: ${capacity} bytes.` });
      setIsProcessing(false);
      return;
    }

    const totalBits = 96 + (keyed.length * 8); // 32 (len) + 32 (flags) + 32 (sig) + message
    const totalSlots = (canvas.width * canvas.height * 3 * bitDepth);
    
    // We'll write bits into slots. Each slot is (pixelIndex, channel, bitLevel)
    const getSlotCoords = (slotIdx: number) => {
      const pixelIdx = Math.floor(slotIdx / (3 * bitDepth));
      const subBitIdx = slotIdx % bitDepth;
      const channelIdx = Math.floor((slotIdx % (3 * bitDepth)) / bitDepth);
      return { pixelIdx, channelIdx, subBitIdx };
    };

    let slotOrder = Array.from({ length: totalBits }, (_, i) => i);
    if (useRandomSpread && keyStr) {
      const rng = new SeededRandom(keyStr + "spread");
      const allSlots = Array.from({ length: totalSlots }, (_, i) => i);
      // Shuffle all slots
      for (let i = allSlots.length - 1; i > 0 && i > allSlots.length - totalBits - 1000; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
      }
      slotOrder = allSlots.slice(0, totalBits);
    }

    const writeBitToSlot = (bit: number, slotIdx: number) => {
      const { pixelIdx, channelIdx, subBitIdx } = getSlotCoords(slotIdx);
      const base = pixelIdx * 4 + channelIdx;
      const mask = ~(1 << subBitIdx);
      data[base] = (data[base] & mask) | ((bit & 1) << subBitIdx);
    };

    let currentSlot = 0;

    // 1. Write 32-bit length
    let len = keyed.length >>> 0;
    for (let i = 0; i < 32; i++) {
      writeBitToSlot((len >> (31 - i)) & 1, slotOrder[currentSlot++]);
    }

    // 2. Write 32-bit flags
    for (let i = 0; i < 32; i++) {
      writeBitToSlot((flags >> (31 - i)) & 1, slotOrder[currentSlot++]);
    }

    // 3. Write 32-bit Signature (Encrypted with key)
    // We encrypt the signature too, so an incorrect key won't even find the 'STEG' marker
    const keyBytes = new TextEncoder().encode(keyStr || "default");
    let sigToHide = signature;
    if (keyStr) {
        // Simple XOR for the signature itself
        const sigXor = (keyBytes[0] << 24) | (keyBytes[1 % keyBytes.length] << 16) | (keyBytes[2 % keyBytes.length] << 8) | (keyBytes[3 % keyBytes.length]);
        sigToHide ^= sigXor;
    }

    for (let i = 0; i < 32; i++) {
      writeBitToSlot((sigToHide >> (31 - i)) & 1, slotOrder[currentSlot++]);
    }

    // 4. Write message bits
    for (let b = 0; b < keyed.length; b++) {
      const byte = keyed[b];
      for (let i = 0; i < 8; i++) {
        writeBitToSlot((byte >> (7 - i)) & 1, slotOrder[currentSlot++]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setStatus({ type: "success", text: `Securely hidden ${keyed.length} bytes.` });
    setIsProcessing(false);
  };

  const decodeLSB = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    setStatus({ type: "info", text: "Scanning image..." });
    await new Promise(r => setTimeout(r, 100));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const totalSlots = (canvas.width * canvas.height * 3 * bitDepth);

    const getBitFromSlot = (slotIdx: number) => {
      const pixelIdx = Math.floor(slotIdx / (3 * bitDepth));
      const subBitIdx = slotIdx % bitDepth;
      const channelIdx = Math.floor((slotIdx % (3 * bitDepth)) / bitDepth);
      const base = pixelIdx * 4 + channelIdx;
      return (data[base] >> subBitIdx) & 1;
    };

    try {
      // First, we need to know the slot order to read the header
      const getOrder = (count: number) => {
        if (useRandomSpread && keyStr) {
          const rng = new SeededRandom(keyStr + "spread");
          const allSlots = Array.from({ length: totalSlots }, (_, i) => i);
          for (let i = allSlots.length - 1; i > 0 && i > allSlots.length - count - 1000; i--) {
            const j = Math.floor(rng.next() * (i + 1));
            [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
          }
          return allSlots.slice(0, count);
        }
        return Array.from({ length: count }, (_, i) => i);
      };

      // Read header (96 bits: 32 len + 32 flags + 32 sig)
      const headerOrder = getOrder(96);
      let len = 0;
      for (let i = 0; i < 32; i++) {
        len |= (getBitFromSlot(headerOrder[i]) << (31 - i));
      }
      
      if (len < 0 || len > capacity + 1000) {
        throw new Error("Invalid header.");
      }

      // Read flags (32 bits)
      let flags = 0;
      for (let i = 0; i < 32; i++) {
        flags |= (getBitFromSlot(headerOrder[32 + i]) << (31 - i));
      }

      // Read Signature (32 bits) and Validate
      let extractedSig = 0;
      for (let i = 0; i < 32; i++) {
        extractedSig |= (getBitFromSlot(headerOrder[64 + i]) << (31 - i));
      }

      // Decrypt signature check
      const signature = 0x53544547; // 'STEG'
      const keyBytes = new TextEncoder().encode(keyStr || "default");
      const sigXor = (keyBytes[0] << 24) | (keyBytes[1 % keyBytes.length] << 16) | (keyBytes[2 % keyBytes.length] << 8) | (keyBytes[3 % keyBytes.length]);
      
      if ((extractedSig ^ sigXor) !== signature) {
        throw new Error("Invalid secret key or bit depth.");
      }

      // Read message
      const fullOrder = getOrder(96 + len * 8);
      const bytes = new Uint8Array(len);
      for (let b = 0; b < len; b++) {
        let val = 0;
        for (let i = 0; i < 8; i++) {
          val |= (getBitFromSlot(fullOrder[96 + b * 8 + i]) << (7 - i));
        }
        bytes[b] = val;
      }

      const plain = applyKey(bytes, keyStr);
      const text = new TextDecoder().decode(plain);
      setDecodedText(text);
      setStatus({ type: "success", text: `Found hidden message (${len} bytes).` });
    } catch (err: any) {
      setStatus({ type: "error", text: "Invalid secret key or no message found." });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderXRay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImgRef.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (showXRay) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const mask = (1 << bitDepth) - 1;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] & mask;
        let g = data[i+1] & mask;
        let b = data[i+2] & mask;

        if (xrayPlane === "red") { g = 0; b = 0; }
        else if (xrayPlane === "green") { r = 0; b = 0; }
        else if (xrayPlane === "blue") { r = 0; g = 0; }

        const hasAny = r || g || b;
        const intensity = hasAny ? 255 : 0;
        
        data[i] = (xrayPlane === "all" || xrayPlane === "red") ? (r ? 255 : 0) : 0;
        data[i+1] = (xrayPlane === "all" || xrayPlane === "green") ? (g ? 255 : 0) : 0;
        data[i+2] = (xrayPlane === "all" || xrayPlane === "blue") ? (b ? 255 : 0) : 0;
        data[i+3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.drawImage(originalImgRef.current, 0, 0);
    }
  }, [showXRay, xrayPlane, bitDepth]);

  useEffect(() => {
    renderXRay();
  }, [renderXRay]);

  const generateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let res = "";
    for (let i = 0; i < 16; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setKeyStr(res);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `secret-${fileName?.split('.')[0] || 'message'}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-slate-900 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Steganography Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Securely hide and extract messages within images. Use randomized pixel spreading and XOR encryption for ultimate privacy.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Column: Tools */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-xl flex border border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setMode("encode")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  mode === "encode" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Hide Message
              </button>
              <button
                onClick={() => setMode("decode")}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  mode === "decode" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Extract Message
              </button>
            </div>

            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    {mode === "encode" ? "Upload Cover Image" : "Upload Stego Image"}
                    <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                  </Button>
                  {fileName && <Button variant="secondary" onClick={() => { setImgUrl(""); setFileName(null); setDecodedText(""); }}>Clear</Button>}
                </div>
                <p className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                  {fileName || "PNG highly recommended"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Configuration
              </h3>
              
              <div className="space-y-6">
                {mode === "encode" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">Message to Hide</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your sensitive data..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 h-28 resize-none text-sm font-medium transition-all"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                        <span>Available Capacity</span>
                        <span className={message.length > capacity ? 'text-red-500' : 'text-emerald-500'}>
                          {message.length} / {capacity} Bytes
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${message.length > capacity ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} 
                          style={{ width: `${Math.min(100, (message.length / (capacity || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secret Key</label>
                      <button onClick={generateKey} className="text-[10px] text-indigo-500 font-bold hover:underline">Auto-Gen</button>
                    </div>
                    <input
                      type="password"
                      value={keyStr}
                      onChange={(e) => setKeyStr(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-mono transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bit Depth</label>
                    <select
                      value={bitDepth}
                      onChange={(e) => setBitDepth(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                    >
                      <option value={1}>1 Bit (Extreme Stealth)</option>
                      <option value={2}>2 Bits (Balanced)</option>
                      <option value={3}>3 Bits (High Capacity)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2 border-t dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" checked={useRandomSpread} onChange={(e) => setUseRandomSpread(e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Random Spread</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button variant="primary" className="w-full py-4 shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-0.5 transition-all" onClick={mode === "encode" ? encodeLSB : decodeLSB} disabled={!fileName || (mode === "encode" && !message) || isProcessing}>
                  {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mode === "encode" ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mode === "encode" ? "M3 3l18 18" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"} />
                      </svg>
                      {mode === "encode" ? "Hide Message Now" : "Extract Hidden Content"}
                    </>
                  )}
                </Button>
                {mode === "encode" && (
                  <Button variant="secondary" className="w-full py-3 font-bold" onClick={download} disabled={!fileName || isProcessing}>
                    Download Secret Image
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col min-h-[500px] relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Plane</h3>
                <div className="flex gap-2">
                  {showXRay && (
                    <select 
                      value={xrayPlane} 
                      onChange={(e) => setXRayPlane(e.target.value as XRayPlane)}
                      className="text-[10px] font-black bg-gray-100 dark:bg-gray-700 border-none rounded px-2 py-1 uppercase"
                    >
                      <option value="all">All Channels</option>
                      <option value="red">Red LSB</option>
                      <option value="green">Green LSB</option>
                      <option value="blue">Blue LSB</option>
                    </select>
                  )}
                  <button 
                    onClick={() => setShowXRay(!showXRay)}
                    disabled={!fileName}
                    className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${
                      showXRay ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {showXRay ? "Exit X-Ray" : "X-Ray View"}
                  </button>
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-auto border border-gray-100 dark:border-gray-700 shadow-inner p-4 relative group">
                {fileName ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-600">
                    <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-black uppercase tracking-tighter text-lg opacity-20">Secure Analysis Feed</p>
                  </div>
                )}
              </div>

              {status.text && (
                <div className={`mt-6 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border flex items-center gap-3 animate-in slide-in-from-bottom-2 ${
                  status.type === "error" ? "bg-red-50 text-red-600 border-red-100" :
                  status.type === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full animate-ping ${
                    status.type === "error" ? "bg-red-500" :
                    status.type === "success" ? "bg-emerald-500" : "bg-indigo-500"
                  }`} />
                  {status.text}
                </div>
              )}

              {mode === "decode" && decodedText && (
                <div className="mt-6 space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secret Content Recovered</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(decodedText); setStatus({type: "success", text: "Copied to clipboard!"}); }}
                      className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <div className="p-5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100 rounded-2xl text-sm font-bold border border-indigo-100 dark:border-indigo-800 whitespace-pre-wrap max-h-40 overflow-auto shadow-inner leading-relaxed">
                    {decodedText}
                  </div>
                </div>
              )}
            </div>
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
