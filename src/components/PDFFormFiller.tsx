"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface FormField {
  id: string;
  name: string;
  type: string;
  value: string;
  page: number;
}

export default function PDFFormFiller() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [filledBlob, setFilledBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle file selection and analyze form fields
  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setFormFields([]);
    setFieldValues({});
    setFilledBlob(null);
    setError("");
    setIsAnalyzing(true);

    try {
      // Import PDF.js
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker path to local file
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const fields: FormField[] = [];

      // Analyze each page for form fields
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const annotations = await page.getAnnotations();

        annotations.forEach((annotation, index) => {
          if (annotation.subtype === 'Widget') {
            // This is a form field
            const field: FormField = {
              id: `field-${pageNum}-${index}`,
              name: annotation.fieldName || `Field ${index + 1}`,
              type: annotation.fieldType || 'text',
              value: annotation.fieldValue || '',
              page: pageNum
            };
            fields.push(field);
          }
        });
      }

      setFormFields(fields);

      // Initialize field values
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.id] = field.value;
      });
      setFieldValues(initialValues);

    } catch (err) {
      console.error("Form analysis error:", err);
      setError("Failed to analyze PDF form fields. The PDF may not contain fillable forms.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Update field value
  const updateFieldValue = useCallback((fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // Fill PDF form
  const fillForm = useCallback(async () => {
    if (!selectedFile || formFields.length === 0) return;

    setIsFilling(true);
    setError("");

    try {
      // For now, we'll create a simple filled form representation
      // In a full implementation, you'd use PDF-lib to actually fill form fields
      const filledData = {
        originalFile: selectedFile.name,
        fields: formFields.map(field => ({
          name: field.name,
          value: fieldValues[field.id] || field.value,
          page: field.page
        })),
        timestamp: new Date().toISOString()
      };

      // Create a JSON representation (in production, you'd fill the actual PDF)
      const jsonBlob = new Blob([JSON.stringify(filledData, null, 2)], {
        type: 'application/json'
      });

      setFilledBlob(jsonBlob);

    } catch (err) {
      console.error("Form filling error:", err);
      setError("Failed to fill PDF form. Please try again.");
    } finally {
      setIsFilling(false);
    }
  }, [selectedFile, formFields, fieldValues]);

  // Download filled form
  const downloadFilled = useCallback(() => {
    if (!filledBlob || !selectedFile) return;

    const url = URL.createObjectURL(filledBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filled-${selectedFile.name.replace('.pdf', '.json')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filledBlob, selectedFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Form Filler
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Automatically detect and fill PDF form fields
        </p>
      </div>

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">728x90 Banner Ad</p>
      </div>

      {/* File Upload */}
      <div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M9 12h6m-6 4h6m-6 4h6m6-8h6m-6 4h6m-6 4h6M9 8h6m6 0h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v6M3 6v24a3 3 0 003 3h24a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop a PDF form here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Upload fillable PDF forms to auto-detect fields</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select PDF Form
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form Analysis Status */}
      {selectedFile && isAnalyzing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 dark:text-blue-300">
            Analyzing PDF for form fields...
          </p>
        </div>
      )}

      {/* Form Fields */}
      {formFields.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detected Form Fields ({formFields.length})
            </h3>

            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.name}
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {field.type} • Page {field.page}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    {field.type === 'text' ? (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : field.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={fieldValues[field.id] === 'true'}
                        onChange={(e) => updateFieldValue(field.id, e.target.checked ? 'true' : 'false')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fill Form Button */}
          <div className="text-center">
            <Button
              onClick={fillForm}
              disabled={isFilling}
            >
              {isFilling ? "Filling Form..." : "Fill Form & Download"}
            </Button>
          </div>
        </div>
      )}

      {/* No Form Fields Found */}
      {selectedFile && !isAnalyzing && formFields.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No fillable form fields were detected in this PDF. The document may not contain interactive forms, or the forms may be image-based rather than digital fields.
          </p>
        </div>
      )}

      {/* Download Section */}
      {filledBlob && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Form Data Extracted! 📋
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Form fields have been filled with your data. Download the filled form data.
            </p>
            <Button onClick={downloadFilled}>
              📥 Download Form Data
            </Button>
          </div>
        </div>
      )}

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mt-8">
        <p className="text-gray-500 dark:text-gray-400">📢 Google AdSense Placeholder</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">300x250 Rectangle Ad</p>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Upload a PDF with fillable form fields</li>
          <li>• The tool will automatically detect and analyze form fields</li>
          <li>• Fill in the detected fields with your information</li>
          <li>• Click "Fill Form & Download" to export your filled form data</li>
          <li>• Perfect for applications, surveys, and official documents</li>
          <li>• <strong>Note:</strong> This tool extracts form data - for actual PDF filling, use PDF editing software</li>
        </ul>
      </div>
    </div>
  );
}
