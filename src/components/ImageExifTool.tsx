"use client";

import React, { useState } from "react";

type TagRecord = Record<string, any>;

function formatFraction(value: any) {
  if (!value) return "";
  if (typeof value === "number") return value.toFixed(2);
  if (Array.isArray(value) && value.length === 2) {
    const [num, den] = value;
    if (den === 0) return `${num}`;
    return (num / den).toFixed(2);
  }
  return String(value);
}

function dmsToDecimal(dms: any, ref: string | undefined) {
  if (!Array.isArray(dms) || dms.length < 3) return null;
  const [d, m, s] = dms.map(formatFraction).map(parseFloat);
  if ([d, m, s].some(isNaN)) return null;
  let dec = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") dec *= -1;
  return dec;
}

function formatGPS(lat: any, latRef: string | undefined, lon: any, lonRef: string | undefined) {
  const latDec = dmsToDecimal(lat, latRef);
  const lonDec = dmsToDecimal(lon, lonRef);
  if (latDec == null || lonDec == null) return null;
  const latStr = `${Math.abs(latDec).toFixed(4)}°${latDec >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lonDec).toFixed(4)}°${lonDec >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lonStr}`;
}

export default function ImageExifTool() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [tags, setTags] = useState<TagRecord | null>(null);

  function isValidJPEG(file: File | undefined) {
    return !!file && file.type === "image/jpeg" && file.size <= 10 * 1024 * 1024;
  }

  function parseEXIF(arrayBuffer: ArrayBuffer): TagRecord {
    try {
      const dataView = new DataView(arrayBuffer);
      let offset = 2; // skip SOI 0xFFD8
      const length = dataView.byteLength;
      const TAGS: Record<number, string> = {
        0x010f: "Make",
        0x0110: "Model",
        0x0132: "DateTime",
        0x829a: "ExposureTime",
        0x829d: "FNumber",
        0x8827: "ISO",
        0x920a: "FocalLength",
      };
      const GPS_TAGS: Record<number, string> = {
        0x0001: "GPSLatitudeRef",
        0x0002: "GPSLatitude",
        0x0003: "GPSLongitudeRef",
        0x0004: "GPSLongitude",
      };
      const read16 = (o: number, little: boolean) => (little ? dataView.getUint16(o, true) : dataView.getUint16(o, false));
      const read32 = (o: number, little: boolean) => (little ? dataView.getUint32(o, true) : dataView.getUint32(o, false));

      function readIFDEntry(o: number, little: boolean, base: number) {
        const tag = read16(o, little);
        const type = read16(o + 2, little);
        const count = read32(o + 4, little);
        const valueOffset = o + 8;
        const valueOrOffset = read32(valueOffset, little);
        const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 };
        const size = (TYPE_SIZES[type] || 0) * count;
        let valueBytesOffset = size > 4 ? base + valueOrOffset : valueOffset;

        function readValue(): any {
          switch (type) {
            case 2: { // ASCII
              const bytes = new Uint8Array(dataView.buffer, valueBytesOffset, count);
              let str = "";
              for (let i = 0; i < bytes.length; i++) { if (bytes[i] === 0) break; str += String.fromCharCode(bytes[i]); }
              return str;
            }
            case 3: { // SHORT
              if (count === 1) return read16(valueBytesOffset, little);
              const arr: number[] = [];
              for (let i = 0; i < count; i++) arr.push(read16(valueBytesOffset + i * 2, little));
              return arr;
            }
            case 4: { // LONG
              if (count === 1) return read32(valueBytesOffset, little);
              const arr: number[] = [];
              for (let i = 0; i < count; i++) arr.push(read32(valueBytesOffset + i * 4, little));
              return arr;
            }
            case 5: { // RATIONAL
              const arr: [number, number][] = [];
              for (let i = 0; i < count; i++) {
                const num = read32(valueBytesOffset + i * 8, little);
                const den = read32(valueBytesOffset + i * 8 + 4, little);
                arr.push([num, den]);
              }
              if (count === 1) return arr[0];
              return arr;
            }
            case 1: { // BYTE
              const arr = new Uint8Array(dataView.buffer, valueBytesOffset, count);
              if (count === 1) return arr[0];
              return Array.from(arr);
            }
            default:
              return null;
          }
        }
        return { tag, type, count, value: readValue() };
      }

      while (offset < length) {
        const marker = dataView.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) { // APP1
          const size = dataView.getUint16(offset, false);
          const exifStart = offset + 2;
          const headerBytes = new Uint8Array(arrayBuffer, exifStart, 6);
          const hdr = new TextDecoder("ascii").decode(headerBytes);
          if (!hdr.startsWith("Exif\u0000\u0000")) break;
          const tiffStart = exifStart + 6;
          const little = new TextDecoder("ascii").decode(new Uint8Array(arrayBuffer, tiffStart, 2)) === "II";
          const firstIFDOffset = read32(tiffStart + 4, little);
          const ifd0 = tiffStart + firstIFDOffset;
          const numEntries = read16(ifd0, little);
          const t: TagRecord = {};
          for (let i = 0; i < numEntries; i++) {
            const entry = readIFDEntry(ifd0 + 2 + i * 12, little, tiffStart);
            const name = (TAGS as any)[entry.tag];
            if (name) t[name] = entry.value;
            if (entry.tag === 0x8825) { // GPS IFD pointer
              const gpsOffset = Array.isArray(entry.value) ? (entry.value as any)[0] : (entry.value as any);
              const gpsIfd = tiffStart + gpsOffset;
              const gpsCount = read16(gpsIfd, little);
              for (let g = 0; g < gpsCount; g++) {
                const gEntry = readIFDEntry(gpsIfd + 2 + g * 12, little, tiffStart);
                const gName = (GPS_TAGS as any)[gEntry.tag];
                if (gName) t[gName] = gEntry.value;
              }
            }
          }
          return t;
        } else {
          const segmentSize = dataView.getUint16(offset, false);
          offset += segmentSize;
        }
      }
      return {};
    } catch (e) {
      console.warn("EXIF parse error:", e);
      return {};
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setError("Please upload a file.");
      setTags(null);
      setPreviewUrl(null);
      return;
    }
    if (!isValidJPEG(file)) {
      if (file.type !== "image/jpeg") setError("Please upload a JPEG image.");
      else if (file.size > 10 * 1024 * 1024) setError("File too large. Max 10MB.");
      setTags(null);
      setPreviewUrl(null);
      return;
    }
    setError("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const buf = await file.arrayBuffer();
    const t = parseEXIF(buf);
    setTags(t);
  }

  function stripExifAndDownload() {
    if (!previewUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;
    img.onload = () => {
      const cnv = document.createElement("canvas");
      cnv.width = img.width;
      cnv.height = img.height;
      const ctx = cnv.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "image-no-exif.jpg";
      a.href = cnv.toDataURL("image/jpeg", 0.92);
      a.click();
    };
  }

  const rows: { label: string; value: any }[] = [];
  if (tags) {
    const gps = formatGPS(tags["GPSLatitude"], tags["GPSLatitudeRef"], tags["GPSLongitude"], tags["GPSLongitudeRef"]);
    rows.push({ label: "Camera Make", value: tags["Make"] });
    rows.push({ label: "Camera Model", value: tags["Model"] });
    rows.push({ label: "Date/Time", value: tags["DateTime"] });
    rows.push({ label: "Aperture", value: tags["FNumber"] ? `f/${formatFraction(tags["FNumber"])}` : null });
    rows.push({ label: "Shutter Speed", value: tags["ExposureTime"] ? `${formatFraction(tags["ExposureTime"])}s` : null });
    rows.push({ label: "ISO", value: tags["ISO"] });
    rows.push({ label: "Focal Length", value: tags["FocalLength"] ? `${formatFraction(tags["FocalLength"])}` : null });
    rows.push({ label: "GPS", value: gps });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="file" accept="image/jpeg" onChange={onFile} />
        <button className="border px-3 py-1 rounded" disabled={!previewUrl} onClick={stripExifAndDownload}>Download without EXIF</button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {previewUrl && (
        <img src={previewUrl} alt="preview" className="max-w-full border rounded" />
      )}
      <div className="rounded border">
        <table className="w-full text-sm">
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="p-2 text-gray-500">No EXIF data found.</td></tr>
            ) : (
              rows.filter(r => r.value != null && r.value !== "").map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border-r w-48 text-gray-700">{r.label}</td>
                  <td className="p-2">{String(r.value)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}