"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

type ChartType = 'bar' | 'pie' | 'line' | 'doughnut';

export default function InfographicCreator() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([
    { label: 'Data 1', value: 40, color: '#3B82F6' },
    { label: 'Data 2', value: 30, color: '#EF4444' },
    { label: 'Data 3', value: 20, color: '#10B981' },
    { label: 'Data 4', value: 10, color: '#F59E0B' }
  ]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: 'title',
      text: 'Your Infographic Title',
      x: 400,
      y: 50,
      fontSize: 32,
      color: '#1F2937',
      fontFamily: 'Arial'
    }
  ]);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [generatedInfographic, setGeneratedInfographic] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

  // Generate chart on canvas
  const drawChart = useCallback((
    ctx: CanvasRenderingContext2D,
    data: ChartData[],
    type: ChartType,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const maxValue = Math.max(...data.map(d => d.value));

    if (type === 'bar') {
      const barWidth = (width - 40) / data.length;
      const barSpacing = 10;

      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 60);
        const barX = x + 20 + index * (barWidth + barSpacing);
        const barY = y + height - 40 - barHeight;

        // Draw bar
        ctx.fillStyle = item.color;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Draw border
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Draw label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, barX + barWidth / 2, y + height - 20);

        // Draw value
        ctx.fillText(item.value.toString(), barX + barWidth / 2, barY - 5);
      });
    } else if (type === 'pie' || type === 'doughnut') {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const radius = Math.min(width, height) / 3;

      let startAngle = 0;
      const total = data.reduce((sum, item) => sum + item.value, 0);

      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw doughnut hole
        if (type === 'doughnut') {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, labelX, labelY);

        startAngle += sliceAngle;
      });
    } else if (type === 'line') {
      const pointSpacing = (width - 40) / (data.length - 1);
      const points: Array<{x: number, y: number}> = [];

      // Calculate points
      data.forEach((item, index) => {
        const pointX = x + 20 + index * pointSpacing;
        const pointY = y + height - 40 - (item.value / maxValue) * (height - 60);
        points.push({ x: pointX, y: pointY });
      });

      // Draw line
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // Draw points
      points.forEach((point, index) => {
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(data[index].label, point.x, y + height - 20);
        ctx.fillText(data[index].value.toString(), point.x, point.y - 10);
      });
    }
  }, []);

  // Generate infographic
  const generateInfographic = useCallback(async () => {
    setIsGenerating(true);
    setError("");

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError("Canvas not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Clear canvas
      ctx.clearRect(0, 0, 800, 600);

      // Draw background image if available
      if (backgroundImage) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = backgroundImage;
        });

        // Scale image to fit canvas
        const scale = Math.max(800 / img.width, 600 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (800 - scaledWidth) / 2;
        const offsetY = (600 - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#667EEA');
        gradient.addColorStop(1, '#764BA2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
      }

      // Draw chart in bottom area
      if (chartData.length > 0) {
        drawChart(ctx, chartData, chartType, 50, 300, 700, 250);
      }

      // Draw text elements
      textElements.forEach(element => {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.fillText(element.text, element.x, element.y);
      });

      // Generate data URL
      const infographicDataUrl = canvas.toDataURL('image/png');
      setGeneratedInfographic(infographicDataUrl);

    } catch (err) {
      console.error("Infographic generation error:", err);
      setError("Failed to generate infographic. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [backgroundImage, chartData, chartType, textElements, drawChart]);

  // Handle background image upload
  const handleBackgroundUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setBackgroundImage(url);
  }, []);

  // Add text element
  const addTextElement = useCallback(() => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: 400,
      y: 300,
      fontSize: 24,
      color: '#1F2937',
      fontFamily: 'Arial'
    };
    setTextElements(prev => [...prev, newElement]);
  }, []);

  // Update text element
  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  // Remove text element
  const removeTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedTextElement === id) {
      setSelectedTextElement(null);
    }
  }, [selectedTextElement]);

  // Download infographic
  const downloadInfographic = useCallback(() => {
    if (!generatedInfographic) return;

    const link = document.createElement('a');
    link.href = generatedInfographic;
    link.download = `infographic-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedInfographic]);

  const fontOptions = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Impact'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Infographic Creator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create stunning infographics with charts, text, and background images
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Background Image */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Background Image
            </h3>
            <div
              onClick={() => backgroundInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              {backgroundImage ? (
                <div>
                  <img
                    src={backgroundImage}
                    alt="Background"
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to change background</p>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm">Click to add background image</p>
                </div>
              )}
            </div>
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBackgroundUpload(file);
              }}
              className="hidden"
            />
          </div>

          {/* Chart Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Chart Settings
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as ChartType)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>

              {/* Chart Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Points
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const newData = [...chartData];
                          newData[index].label = e.target.value;
                          setChartData(newData);
                        }}
                        className="flex-1 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        placeholder="Label"
                      />
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => {
                          const newData = [...chartData];
                          newData[index].value = parseInt(e.target.value) || 0;
                          setChartData(newData);
                        }}
                        className="w-16 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        placeholder="Value"
                      />
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => {
                          const newData = [...chartData];
                          newData[index].color = e.target.value;
                          setChartData(newData);
                        }}
                        className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => setChartData(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setChartData(prev => [...prev, { label: `Data ${prev.length + 1}`, value: 25, color: '#6366F1' }])}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
                >
                  + Add Data Point
                </button>
              </div>
            </div>
          </div>

          {/* Text Elements */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Text Elements
              </h3>
              <button
                onClick={addTextElement}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                + Add Text
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedTextElement === element.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => setSelectedTextElement(element.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{element.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTextElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button onClick={generateInfographic} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate Infographic"}
            </Button>
          </div>
        </div>

        {/* Preview/Editor Panel */}
        <div className="lg:col-span-2">
          {generatedInfographic ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generated Infographic
                </h3>
                <Button onClick={downloadInfographic}>
                  📥 Download PNG
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={generatedInfographic}
                  alt="Generated infographic"
                  className="w-full h-auto rounded border border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Configure your settings and click "Generate Infographic" to create your design
              </p>
            </div>
          )}

          {/* Text Element Editor */}
          {selectedTextElement && (
            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Edit Text Element
              </h4>

              {(() => {
                const element = textElements.find(el => el.id === selectedTextElement);
                if (!element) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={element.text}
                        onChange={(e) => updateTextElement(element.id, { text: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Font Family
                      </label>
                      <select
                        value={element.fontFamily}
                        onChange={(e) => updateTextElement(element.id, { fontFamily: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {fontOptions.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Font Size
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={element.fontSize}
                        onChange={(e) => updateTextElement(element.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {element.fontSize}px
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={element.color}
                        onChange={(e) => updateTextElement(element.id, { color: e.target.value })}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Hidden canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload a background image or use the default gradient</li>
          <li>• Configure your chart type and add data points with custom colors</li>
          <li>• Add text elements and customize their appearance</li>
          <li>• Click "Generate Infographic" to create your design</li>
          <li>• Download your infographic as a high-quality PNG</li>
        </ul>
      </div>
    </div>
  );
}
