"use client";

import React, { useRef, useState, useEffect } from "react";
import Button from "@/components/Button";

type Mode = "encode" | "decode";

export default function ImageHiddenMessage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [message, setMessage] = useState("");
  const [keyStr, setKeyStr] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [imgUrl, setImgUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [decodedText, setDecodedText] = useState<string>("");

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    setStatus("");
    setDecodedText("");
    await drawImageToCanvas(url);
  };

  const drawImageToCanvas = async (url: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const encodeLSB = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data; // RGBA

    const encoder = new TextEncoder();
    const bytes = encoder.encode(message);
    const keyed = applyKey(bytes, keyStr);
    const lengthBits = 32; // store byte length in first 32 bits
    const requiredBits = lengthBits + keyed.length * 8;
    const capacityBits = (data.length / 4) * 3; // use R,G,B LSBs per pixel

    if (requiredBits > capacityBits) {
      setStatus(`Message too long for image capacity. Capacity=${Math.floor(capacityBits / 8)} bytes`);
      return;
    }

    // Helper: set nth bit into channel LSBs sequence across RGB channels
    let bitIdx = 0;

    const writeBit = (bit: number) => {
      const pixelIndex = Math.floor(bitIdx / 3); // which pixel
      const channelOffset = bitIdx % 3; // 0:R,1:G,2:B
      const base = pixelIndex * 4 + channelOffset; // RGBA stride
      const v = data[base];
      data[base] = (v & 0xfe) | (bit & 1); // set LSB
      bitIdx++;
    };

    // Write 32-bit length (big-endian)
    let len = keyed.length >>> 0;
    for (let i = 31; i >= 0; i--) {
      const bit = (len >> i) & 1;
      writeBit(bit);
    }

    // Write message bits
    for (let b = 0; b < keyed.length; b++) {
      const byte = keyed[b];
      for (let i = 7; i >= 0; i--) {
        const bit = (byte >> i) & 1;
        writeBit(bit);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setStatus(`Encoded ${keyed.length} bytes into image${keyStr ? " (with key)" : ""}.`);
  };

  const decodeLSB = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const readBit = (idx: number) => {
      const pixelIndex = Math.floor(idx / 3);
      const channelOffset = idx % 3;
      const base = pixelIndex * 4 + channelOffset;
      return data[base] & 1;
    };

    // Read 32-bit length
    let bitIdx = 0;
    let len = 0;
    for (let i = 31; i >= 0; i--) {
      const bit = readBit(bitIdx++);
      len |= bit << i;
    }
    const bytes = new Uint8Array(len);
    for (let b = 0; b < len; b++) {
      let val = 0;
      for (let i = 7; i >= 0; i--) {
        const bit = readBit(bitIdx++);
        val |= bit << i;
      }
      bytes[b] = val;
    }

    const plain = applyKey(bytes, keyStr);
    const decoder = new TextDecoder();
    const text = decoder.decode(plain);
    setDecodedText(text);
    setStatus(`Decoded ${len} bytes from image${keyStr ? " (with key)" : ""}.`);
  };

  const applyKey = (bytes: Uint8Array, key: string): Uint8Array => {
    if (!key) return bytes;
    const keyBytes = new TextEncoder().encode(key);
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return out;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "hidden-message.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="card p-3 space-y-2">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="font-medium">Mode</label>
          <select
            className="select select-bordered"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
          <Button as="label" variant="primary" className="cursor-pointer">
            Choose Image
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          </Button>
          <span className="text-sm text-gray-600">PNG recommended to preserve output fidelity.</span>
        </div>
      </div>

      {mode === "encode" && (
        <div className="card p-3 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="font-medium">Message</div>
              <textarea
                className="input min-h-28"
                placeholder="Enter message to hide"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <div className="font-medium">Secret Key (optional)</div>
              <input
                className="input"
                type="text"
                placeholder="Enter a key to encode"
                value={keyStr}
                onChange={(e) => setKeyStr(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">Use the same key when decoding.</p>
            </div>
          </div>
        </div>
      )}

      {mode === "decode" && decodedText && (
        <div className="card p-3 space-y-2">
          <div className="font-medium">Secret Key (optional)</div>
          <input
            className="input"
            type="text"
            placeholder="Enter key used during encoding"
            value={keyStr}
            onChange={(e) => setKeyStr(e.target.value)}
          />
          <div className="font-medium mt-2">Decoded Text</div>
          <div className="text-sm whitespace-pre-wrap">{decodedText}</div>
        </div>
      )}

      <div className="card p-3 flex flex-wrap gap-2 items-center">
        {mode === "encode" ? (
          <button className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={encodeLSB} disabled={!imgUrl || !message}>Encode Message</button>
        ) : (
          <button className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={decodeLSB} disabled={!imgUrl}>Decode Message</button>
        )}
        <button className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50" onClick={download} disabled={!imgUrl}>Download PNG</button>
        <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => { setMessage(""); setDecodedText(""); setStatus(""); setKeyStr(""); if (fileInputRef.current) fileInputRef.current.value = ""; setImgUrl(""); }}>Reset</button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-3">
          <div className="font-medium mb-2">Preview</div>
          <canvas ref={canvasRef} className="w-full max-w-full border rounded" />
        </div>
        <div className="card p-3">
          <div className="font-medium mb-2">Notes</div>
          <ul className="text-sm list-disc pl-4 text-gray-700 space-y-1">
            <li>PNG yields better output than JPEG.</li>
            <li>Secret key applies a simple XOR, reversible on decode.</li>
            <li>Keep messages within image capacity for best results.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}