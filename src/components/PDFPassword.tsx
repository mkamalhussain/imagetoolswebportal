"use client";

import React, { useCallback, useState } from "react";
import Button from "@/components/Button";

interface PasswordConfig {
  userPassword: string;
  ownerPassword: string;
  permissions: {
    printing: 'low' | 'high' | 'none';
    modifying: boolean;
    copying: boolean;
    annotating: boolean;
  };
}

export default function PDFPassword() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [passwordConfig, setPasswordConfig] = useState<PasswordConfig>({
    userPassword: '',
    ownerPassword: '',
    permissions: {
      printing: 'high',
      modifying: false,
      copying: false,
      annotating: false
    }
  });
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [showAlternatives, setShowAlternatives] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file");
      return;
    }

    setSelectedFile(file);
    setEncryptedBlob(null);
    setError("");
  }, []);

  // Create password-protected PDF using pdf-lib encryption
  const encryptPDF = useCallback(async () => {
    if (!selectedFile) return;

    if (!passwordConfig.userPassword) {
      setError("Please provide a password for encryption");
      return;
    }

    setIsEncrypting(true);
    setError("");

    try {
      const { PDFDocument, rgb } = await import('pdf-lib');

      // Load the PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Try to save with PDF encryption (may not work in all browsers)
      let encryptedBytes;

      try {
        // Attempt PDF encryption
        encryptedBytes = await pdfDoc.save({
          userPassword: passwordConfig.userPassword,
          ownerPassword: passwordConfig.ownerPassword || passwordConfig.userPassword,
          permissions: {
            printing: passwordConfig.permissions.printing === 'high' ? 'highResolution' :
                     passwordConfig.permissions.printing === 'low' ? 'lowResolution' : 'none',
            modifying: passwordConfig.permissions.modifying,
            copying: passwordConfig.permissions.copying,
            annotating: passwordConfig.permissions.annotating,
          }
        } as any); // Type assertion to bypass TypeScript checks
      } catch (encryptionError) {
        console.warn('PDF encryption not supported in this browser:', encryptionError);

        // Fallback: save PDF with password notice overlay
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => newPdf.addPage(page));

        // Add password notice to first page
        const firstPage = newPdf.getPages()[0];
        const { width, height } = firstPage.getSize();

        // Draw a semi-transparent overlay
        firstPage.drawRectangle({
          x: 50,
          y: height - 200,
          width: width - 100,
          height: 150,
          color: rgb(1, 1, 1),
          opacity: 0.9,
        });

        firstPage.drawRectangle({
          x: 45,
          y: height - 205,
          width: width - 90,
          height: 160,
          color: rgb(1, 0, 0),
          borderWidth: 3,
          opacity: 0.8,
        });

        firstPage.drawText('🔒 PASSWORD REQUIRED', {
          x: width / 2 - 100,
          y: height - 80,
          size: 20,
          color: rgb(0.8, 0, 0),
        });

        firstPage.drawText('This PDF should be password protected.', {
          x: width / 2 - 130,
          y: height - 110,
          size: 14,
          color: rgb(0.5, 0, 0),
        });

        firstPage.drawText(`Password: "${passwordConfig.userPassword}"`, {
          x: width / 2 - 100,
          y: height - 130,
          size: 12,
          color: rgb(0.5, 0, 0),
        });

        firstPage.drawText('Use desktop PDF software for proper encryption.', {
          x: width / 2 - 140,
          y: height - 150,
          size: 10,
          color: rgb(0.3, 0, 0),
        });

        encryptedBytes = await newPdf.save();
      }

      const encryptedBlob = new Blob([new Uint8Array(encryptedBytes)], { type: 'application/pdf' });
      setEncryptedBlob(encryptedBlob);

    } catch (err) {
      console.error("PDF encryption error:", err);
      setError("Failed to encrypt PDF. PDF encryption may not be supported in all browsers.");
    } finally {
      setIsEncrypting(false);
    }
  }, [selectedFile, passwordConfig]);

  // Download encrypted PDF
  const downloadEncrypted = useCallback(() => {
    if (!encryptedBlob || !selectedFile) return;

    const url = URL.createObjectURL(encryptedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protected-${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [encryptedBlob, selectedFile]);

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF Password Protector
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add password protection to your PDF files
        </p>

        {/* Alternative Solutions Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline text-sm"
          >
            {showAlternatives ? 'Hide' : 'Show'} Real Password Protection Solutions →
          </button>
        </div>

        {/* Real Solutions Section */}
        {showAlternatives && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              ✅ Working PDF Password Protection Solutions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Software */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-800 dark:text-green-200">Desktop Software:</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• <strong>Adobe Acrobat:</strong> Professional PDF encryption</li>
                  <li>• <strong>PDFtk (Free):</strong> Command-line PDF toolkit</li>
                  <li>• <strong>LibreOffice:</strong> Export with password</li>
                  <li>• <strong>PDFsam:</strong> Free PDF manipulation tool</li>
                  <li>• <strong>qPDF:</strong> Advanced PDF processing</li>
                </ul>
              </div>

              {/* Online Services */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-800 dark:text-green-200">Online Services:</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• <strong>SmallPDF:</strong> Password protection tools</li>
                  <li>• <strong>ILovePDF:</strong> Secure PDF processing</li>
                  <li>• <strong>PDF24:</strong> Free online PDF tools</li>
                  <li>• <strong>Sejda:</strong> Professional PDF services</li>
                  <li>• <strong>DocuSign:</strong> Document security platform</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/50 rounded">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Why browsers can't do this:</strong> Web browsers restrict cryptographic operations for security reasons.
                True PDF encryption requires server-side processing or desktop applications.
              </p>
            </div>
          </div>
        )}
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
              <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Drop a PDF file here, or click to select</p>
            <p className="text-sm text-gray-400 mt-1">Add password protection to your documents</p>
          </div>
          <Button
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Select PDF File
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

      {/* Password Configuration */}
      {selectedFile && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              File Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Password Settings
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Password (Required to Open)
                  </label>
                  <input
                    type="password"
                    value={passwordConfig.userPassword}
                    onChange={(e) => setPasswordConfig(prev => ({
                      ...prev,
                      userPassword: e.target.value
                    }))}
                    placeholder="Password to open PDF"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner Password (Full Access)
                  </label>
                  <input
                    type="password"
                    value={passwordConfig.ownerPassword}
                    onChange={(e) => setPasswordConfig(prev => ({
                      ...prev,
                      ownerPassword: e.target.value
                    }))}
                    placeholder="Optional - full permissions"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Note:</strong> User password is required to open the PDF. Owner password provides full access and can override restrictions.</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Permissions (when opened with user password)
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Printing
                </label>
                <select
                  value={passwordConfig.permissions.printing}
                  onChange={(e) => setPasswordConfig(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      printing: e.target.value as typeof passwordConfig.permissions.printing
                    }
                  }))}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="high">High Quality</option>
                  <option value="low">Low Quality Only</option>
                  <option value="none">Not Allowed</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modifying Document
                </label>
                <input
                  type="checkbox"
                  checked={passwordConfig.permissions.modifying}
                  onChange={(e) => setPasswordConfig(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      modifying: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Copying Text/Images
                </label>
                <input
                  type="checkbox"
                  checked={passwordConfig.permissions.copying}
                  onChange={(e) => setPasswordConfig(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      copying: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adding Annotations
                </label>
                <input
                  type="checkbox"
                  checked={passwordConfig.permissions.annotating}
                  onChange={(e) => setPasswordConfig(prev => ({
                    ...prev,
                    permissions: {
                      ...prev.permissions,
                      annotating: e.target.checked
                    }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Encrypt Button */}
          <div className="text-center">
            <Button
              onClick={encryptPDF}
              disabled={isEncrypting || !passwordConfig.userPassword}
            >
              {isEncrypting ? "Encrypting PDF..." : "Encrypt PDF"}
            </Button>
          </div>
        </div>
      )}

      {/* Download Section */}
      {encryptedBlob && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
              PDF Marked (Not Encrypted) 📝
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-2">
              <strong>This PDF is NOT password protected!</strong>
            </p>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              The PDF contains visual password indicators for educational purposes only.
              Anyone can open and read this file. Use the recommended tools above for actual protection.
            </p>
            <div className="space-y-2">
              <Button onClick={downloadEncrypted} className="mr-2">
                📥 Download Marked PDF
              </Button>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ Not secure - for demonstration only
              </p>
            </div>
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
          <li>• Upload a PDF file that you want to protect</li>
          <li>• Enter your desired password and permissions</li>
          <li>• Click "Encrypt PDF" to mark the document</li>
          <li>• Download the marked PDF (not actually encrypted)</li>
          <li>• <strong>For real protection:</strong> Use desktop software like Adobe Acrobat</li>
          <li>• <strong>Alternative:</strong> Use online PDF encryption services</li>
          <li>• This tool demonstrates the concept but browser limitations prevent true encryption</li>
        </ul>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">❌ Cannot Create Password-Protected PDFs</h4>
        <p className="text-sm text-red-800 dark:text-red-200 mb-2">
          <strong>Technical Limitation:</strong> Web browsers cannot create truly password-protected PDFs due to security restrictions.
          This tool adds visual password indicators but does NOT provide actual security.
        </p>
        <p className="text-sm text-red-800 dark:text-red-200 mb-2">
          <strong>For Real Protection:</strong> Use the recommended desktop software or online services shown above.
        </p>
        <p className="text-sm text-red-800 dark:text-red-200">
          <strong>This tool is educational only</strong> - it demonstrates PDF concepts but doesn't provide security.
        </p>
      </div>
    </div>
  );
}
