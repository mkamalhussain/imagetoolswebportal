"use client";

import React, { useCallback, useRef, useState } from "react";
import Button from "@/components/Button";

interface FormField {
  id: string;
  name: string;
  type: string;
  value: string;
  page: number;
  options?: string[]; // For dropdown/choice fields
  readOnly?: boolean;
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
              type: annotation.fieldType || 'Tx', // Use PDF.js field type directly
              value: annotation.fieldValue || '',
              page: pageNum,
              readOnly: annotation.readOnly || false
            };

            console.log(`Detected field: ${field.name}, type: ${field.type}, value: ${field.value}`);

            // Extract options for choice/dropdown fields
            if (annotation.fieldType === 'choice' || annotation.fieldType === 'select' || annotation.fieldType === 'Ch') {
              const options = annotation.options || [];
              console.log(`Choice field ${field.name} options:`, options);
              if (options.length > 0) {
                field.options = options.map((opt: any) => {
                  // PDF.js options can be strings or objects with display/value
                  const optionValue = typeof opt === 'string' ? opt :
                                     opt.displayValue || opt.value || opt;
                  console.log(`  Option: ${optionValue}`);
                  return optionValue;
                });
              }
            }

            fields.push(field);
          }
        });
      }

      setFormFields(fields);

      // Initialize field values
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        // Set appropriate default values based on field type
        if (field.type === 'Btn') {
          // Checkboxes default to "Off" if not set
          initialValues[field.id] = field.value || 'Off';
        } else {
          initialValues[field.id] = field.value || '';
        }
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
      const { PDFDocument } = await import('pdf-lib');

      // Load the PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get the form
      const form = pdfDoc.getForm();
      const allFormFields = form.getFields();
      console.log('PDF-lib form fields:', allFormFields.map(f => ({
        name: f.getName(),
        type: f.constructor.name
      })));

      // Fill form fields with user values
      formFields.forEach(field => {
        try {
          const fieldValue = fieldValues[field.id] || field.value || '';
          console.log(`Attempting to fill field: ${field.name}, type: ${field.type}, value: ${fieldValue}`);

          // Try to find the form field by name
          let pdfField;
          try {
            pdfField = form.getField(field.name);
          } catch (getFieldError) {
            console.warn(`Could not get field by name ${field.name}:`, getFieldError);
            // Try alternative approaches
            const allFields = form.getFields();
            console.log('Available form fields:', allFields.map(f => f.getName()));
            pdfField = allFields.find(f => f.getName() === field.name);
          }

          if (pdfField) {
            console.log(`Found PDF field: ${pdfField.getName()}, type: ${pdfField.constructor.name}`);

            // Set the field value based on PDF.js field type and pdf-lib field class
            const pdfFieldType = pdfField.constructor.name;

            if (field.type === 'Tx' || pdfFieldType === 'PDFTextField') {
              // Text field
              try {
                (pdfField as any).setText(fieldValue);
                console.log(`Set text field ${field.name} to: ${fieldValue}`);
              } catch (textError) {
                console.warn(`Failed to set text for ${field.name}:`, textError);
              }
            } else if (field.type === 'Btn' || pdfFieldType === 'PDFCheckBox') {
              // Checkbox field - handle "On"/"Off" values from UI
              try {
                if (fieldValue === 'On' || fieldValue === 'true') {
                  (pdfField as any).check();
                  console.log(`Checked checkbox field ${field.name}`);
                } else {
                  (pdfField as any).uncheck();
                  console.log(`Unchecked checkbox field ${field.name}`);
                }
              } catch (checkboxError) {
                console.warn(`Failed to set checkbox for ${field.name}:`, checkboxError);
              }
            } else if (field.type === 'Ch' || pdfFieldType === 'PDFDropdown' || pdfFieldType === 'PDFChoiceField') {
              // Choice/Dropdown field
              try {
                if ((pdfField as any).select && fieldValue) {
                  (pdfField as any).select(fieldValue);
                  console.log(`Selected value ${fieldValue} for choice field ${field.name}`);
                } else {
                  console.warn(`Dropdown field ${field.name} has no select method or empty value`);
                }
              } catch (choiceError) {
                console.warn(`Failed to set choice field ${field.name}:`, choiceError);
                // Try fallback to setText
                try {
                  (pdfField as any).setText(fieldValue);
                  console.log(`Fallback: Set text ${fieldValue} for choice field ${field.name}`);
                } catch (fallbackError) {
                  console.warn(`Fallback also failed for ${field.name}:`, fallbackError);
                }
              }
            } else if (fieldValue) {
              // Fallback for other field types
              try {
                (pdfField as any).setText(fieldValue);
                console.log(`Set fallback text for field ${field.name}: ${fieldValue}`);
              } catch (fallbackError) {
                console.warn(`Failed fallback for ${field.name}:`, fallbackError);
              }
            }
          } else {
            console.warn(`PDF field not found for: ${field.name}`);
          }
        } catch (fieldFillError) {
          console.warn(`Could not fill field ${field.name}:`, fieldFillError);
        }
      });

      // Save the filled PDF
      const filledPdfBytes = await pdfDoc.save();
      const filledBlob = new Blob([new Uint8Array(filledPdfBytes)], { type: 'application/pdf' });

      setFilledBlob(filledBlob);

    } catch (err) {
      console.error("Form filling error:", err);
      setError("Failed to fill PDF form. Please try again.");
    } finally {
      setIsFilling(false);
    }
  }, [selectedFile, formFields, fieldValues]);

  // Download filled PDF
  const downloadFilled = useCallback(() => {
    if (!filledBlob || !selectedFile) return;

    const url = URL.createObjectURL(filledBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filled-${selectedFile.name}`;
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
                    {field.type === 'Tx' ? (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={field.readOnly}
                      />
                    ) : field.type === 'Btn' ? (
                      <input
                        type="checkbox"
                        checked={fieldValues[field.id] === 'On'}
                        onChange={(e) => updateFieldValue(field.id, e.target.checked ? 'On' : 'Off')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={field.readOnly}
                      />
                    ) : field.type === 'Ch' ? (
                      field.options && field.options.length > 0 ? (
                        <select
                          value={fieldValues[field.id] || ''}
                          onChange={(e) => updateFieldValue(field.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          disabled={field.readOnly}
                        >
                          <option value="">Select an option...</option>
                          {field.options.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={fieldValues[field.id] || ''}
                          onChange={(e) => updateFieldValue(field.id, e.target.value)}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          disabled={field.readOnly}
                        />
                      )
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => updateFieldValue(field.id, e.target.value)}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={field.readOnly}
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
              {isFilling ? "Filling PDF Form..." : "Fill PDF Form"}
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
              Form Filled Successfully! ✅📝
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your PDF form has been filled with the entered data and is ready for download.
            </p>
            <Button onClick={downloadFilled}>
              📥 Download Filled PDF
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
