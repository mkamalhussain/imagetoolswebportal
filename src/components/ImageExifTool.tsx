"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Button from "@/components/Button";

type TagRecord = Record<string, any>;

export default function ImageExifTool() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [tags, setTags] = useState<TagRecord | null>(null);
  const [allTags, setAllTags] = useState<TagRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"essential" | "full" | "json">("essential");

  // Load exifr from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).exifr) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.umd.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  const parseFile = useCallback(async (file: File) => {
    setError("");
    setLoading(true);
    setTags(null);
    setAllTags(null);

    try {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      const url = URL.createObjectURL(file);
      setSourceUrl(url);
      setFileName(file.name);

      // Wait for exifr to load if it hasn't yet
      let attempts = 0;
      while (typeof window !== "undefined" && !(window as any).exifr && attempts < 20) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      if (typeof window !== "undefined" && !(window as any).exifr) {
        throw new Error("Metadata library failed to load. Please check your internet connection.");
      }

      const exifr = (window as any).exifr;
      
      // Parse basic essential tags
      const essential = await exifr.parse(file, {
        pick: [
          'Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 
          'ISO', 'FocalLength', 'LensModel', 'Software', 'ImageWidth', 'ImageHeight',
          'GPSLatitude', 'GPSLongitude', 'GPSAltitude'
        ]
      });

      // Parse all available tags
      const full = await exifr.parse(file);

      setTags(essential || {});
      setAllTags(full || {});
    } catch (err: any) {
      console.error("EXIF parse error:", err);
      setError(err.message || "Failed to parse metadata.");
    } finally {
      setLoading(false);
    }
  }, [sourceUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const stripExifAndDownload = useCallback(() => {
    if (!sourceUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceUrl;
    img.onload = () => {
      const cnv = document.createElement("canvas");
      cnv.width = img.naturalWidth;
      cnv.height = img.naturalHeight;
      const ctx = cnv.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `private-${fileName || "image.jpg"}`;
      a.href = cnv.toDataURL("image/jpeg", 0.92);
      a.click();
    };
  }, [sourceUrl, fileName]);

  const downloadJson = () => {
    if (!allTags) return;
    const blob = new Blob([JSON.stringify(allTags, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName?.split('.')[0] || 'metadata'}.json`;
    a.click();
  };

  const getGpsLink = () => {
    if (!allTags || allTags.latitude === undefined || allTags.longitude === undefined) return null;
    return `https://www.google.com/maps?q=${allTags.latitude},${allTags.longitude}`;
  };

  const rows = useMemo(() => {
    if (!tags) return [];
    const items = [
      { label: "Camera Make", value: tags.Make },
      { label: "Camera Model", value: tags.Model },
      { label: "Lens", value: tags.LensModel },
      { label: "Date Taken", value: tags.DateTimeOriginal?.toLocaleString() },
      { label: "Resolution", value: tags.ImageWidth && tags.ImageHeight ? `${tags.ImageWidth} × ${tags.ImageHeight}` : null },
      { label: "Aperture", value: tags.FNumber ? `f/${tags.FNumber}` : null },
      { label: "Exposure", value: tags.ExposureTime ? (tags.ExposureTime < 1 ? `1/${Math.round(1/tags.ExposureTime)}s` : `${tags.ExposureTime}s`) : null },
      { label: "ISO", value: tags.ISO },
      { label: "Focal Length", value: tags.FocalLength ? `${tags.FocalLength}mm` : null },
      { label: "Software", value: tags.Software },
    ];
    
    if (allTags?.latitude !== undefined && allTags?.longitude !== undefined) {
      items.push({ 
        label: "GPS Location", 
        value: `${allTags.latitude.toFixed(5)}, ${allTags.longitude.toFixed(5)}` 
      });
    }

    return items.filter(i => i.value != null && i.value !== "");
  }, [tags, allTags]);

  const clear = () => {
    setSourceUrl(null);
    setFileName(null);
    setTags(null);
    setAllTags(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200 dark:bg-teal-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Image Metadata Viewer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Extract EXIF, IPTC, and XMP metadata from your photos. View camera settings, GPS location, and more.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Upload & Actions */}
          <div className="space-y-6">
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 transition-all duration-300 ${
                dragOver ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-dashed border-gray-300 dark:border-gray-700"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="primary" as="label">
                    Choose Photo
                    <input type="file" accept="image/jpeg,image/jpg,image/heic,image/heif,image/tiff,image/png" onChange={onFileChange} className="hidden" />
                  </Button>
                  {sourceUrl && (
                    <Button variant="secondary" onClick={clear}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {fileName ? `File: ${fileName}` : "Drop any photo here (JPEG, HEIC, TIFF, PNG)"}
                </p>
              </div>
            </div>

            {sourceUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="secondary" className="w-full flex items-center gap-2" onClick={stripExifAndDownload}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                    Privacy Download
                  </Button>
                  <Button variant="secondary" className="w-full flex items-center gap-2" onClick={downloadJson}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export JSON
                  </Button>
                  {getGpsLink() && (
                    <Button variant="secondary" as="a" href={getGpsLink() || "#"} target="_blank" className="w-full col-span-1 sm:col-span-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on Map
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 italic">"Privacy Download" strips all metadata by redrawing the image to canvas.</p>
              </div>
            )}
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2 uppercase tracking-wider">Information</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Photos taken with smartphones and digital cameras contain hidden metadata like camera settings, GPS coordinates, and date/time. This tool lets you view that information privately in your browser.
              </p>
            </div>
          </div>

          {/* Right: Data Display */}
          <div className="flex flex-col h-full min-h-[500px]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-grow flex flex-col relative overflow-hidden">
              {!sourceUrl ? (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <svg className="w-20 h-20 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold text-lg">Waiting for a photo...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                      {["essential", "full", "json"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                            activeTab === tab 
                              ? "bg-white dark:bg-gray-600 text-teal-600 dark:text-teal-300 shadow-sm" 
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent"></div>}
                  </div>

                  <div className="flex-grow overflow-auto custom-scrollbar">
                    {error ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/50">
                        {error}
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
                          <img src={sourceUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-contain bg-gray-50 dark:bg-gray-900" />
                        </div>

                        {activeTab === "essential" && (
                          <div className="space-y-1">
                            {rows.length === 0 && !loading && (
                              <p className="text-gray-500 text-center py-8">No essential tags found.</p>
                            )}
                            {rows.map((row, idx) => (
                              <div key={idx} className="flex border-b last:border-0 border-gray-100 dark:border-gray-700 py-3 px-2 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors">
                                <span className="w-1/3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{row.label}</span>
                                <span className="w-2/3 text-sm font-semibold text-gray-700 dark:text-gray-200">{String(row.value)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeTab === "full" && (
                          <div className="space-y-1">
                            {!allTags && !loading && <p className="text-gray-500 text-center py-8">No extended metadata found.</p>}
                            {allTags && Object.entries(allTags).filter(([_, v]) => typeof v !== 'object' && v != null).map(([k, v], idx) => (
                              <div key={idx} className="flex border-b last:border-0 border-gray-100 dark:border-gray-700 py-2 px-2 text-xs">
                                <span className="w-1/2 font-mono text-gray-400 dark:text-gray-500 overflow-hidden text-ellipsis">{k}</span>
                                <span className="w-1/2 font-semibold text-gray-700 dark:text-gray-300 break-words">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeTab === "json" && (
                          <pre className="text-[10px] font-mono p-4 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg overflow-auto max-h-[400px]">
                            {JSON.stringify(allTags, null, 2)}
                          </pre>
                        )}
                      </>
                    )}
                  </div>
                </>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}
