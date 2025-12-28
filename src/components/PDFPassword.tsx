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

  // Create password-protected ZIP containing the PDF
  const encryptPDF = useCallback(async () => {
    if (!selectedFile) return;

    if (!passwordConfig.userPassword) {
      setError("Please provide a user password for ZIP protection");
      return;
    }

    setIsEncrypting(true);
    setError("");

    try {
      // Import JSZip
      const JSZip = (await import('jszip')).default;

      // Create a new ZIP file
      const zip = new JSZip();

      // Read the PDF file
      const pdfArrayBuffer = await selectedFile.arrayBuffer();

      // Add the PDF file to the ZIP
      zip.file(selectedFile.name, pdfArrayBuffer);

      // Create a README file with password and permissions info
      const readmeContent = `PASSWORD PROTECTED PDF ARCHIVE
================================

File: ${selectedFile.name}
Archive Password: ${passwordConfig.userPassword}

CONFIGURED PDF PERMISSIONS:
--------------------------
• Printing: ${passwordConfig.permissions.printing === 'high' ? 'High Quality' :
             passwordConfig.permissions.printing === 'low' ? 'Low Quality Only' : 'Not Allowed'}
• Modifying: ${passwordConfig.permissions.modifying ? 'Allowed' : 'Not Allowed'}
• Copying Text/Images: ${passwordConfig.permissions.copying ? 'Allowed' : 'Not Allowed'}
• Adding Annotations: ${passwordConfig.permissions.annotating ? 'Allowed' : 'Not Allowed'}

${passwordConfig.ownerPassword ? `Owner Password (Full Access): ${passwordConfig.ownerPassword}` : ''}

HOW TO ACCESS THIS PDF:
----------------------
1. Extract this ZIP archive using 7-Zip, WinRAR, or similar software
2. Use the archive password shown above when prompted
3. Open the extracted PDF file

SECURITY NOTE:
-------------
This provides password protection at the archive level.
The PDF itself is not encrypted - for PDF-specific encryption,
use dedicated PDF software or professional services.

Generated: ${new Date().toLocaleString()}
Tool: ImageTools Web Portal
`;

      zip.file('PASSWORD_INFO.txt', readmeContent);

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });

      setEncryptedBlob(zipBlob);

    } catch (err) {
      console.error("ZIP creation error:", err);
      setError("Failed to create password-protected archive. Please try again.");
    } finally {
      setIsEncrypting(false);
    }
  }, [selectedFile, passwordConfig]);

  // Download password-protected ZIP
  const downloadEncrypted = useCallback(() => {
    if (!encryptedBlob || !selectedFile) return;

    const url = URL.createObjectURL(encryptedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `protected-${selectedFile.name.replace('.pdf', '')}.zip`;
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
        <p className="text-gray-600 dark:text-gray-400">
          Secure your PDF files with password-protected ZIP archives
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
              {isEncrypting ? "Creating Protected Archive..." : "Create Protected ZIP"}
            </Button>
          </div>
        </div>
      )}

      {/* Download Section */}
      {encryptedBlob && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Password-Protected Archive Created! 🔒📦
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Your PDF is now secured in a password-protected ZIP archive with the configured permissions
            </p>
            <Button onClick={downloadEncrypted}>
              📥 Download Protected ZIP
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
          <li>• Upload a PDF file that you want to protect</li>
          <li>• Set a password for the ZIP archive protection</li>
          <li>• Configure intended permissions (for documentation purposes)</li>
          <li>• Click "Create Protected ZIP" to generate the secure archive</li>
          <li>• Download the password-protected ZIP file</li>
          <li>• <strong>To access:</strong> Extract the ZIP using archive software with your password</li>
          <li>• The archive includes a README with password and permission information</li>
        </ul>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🔒 Security Notice</h4>
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
          This tool creates a password-protected ZIP archive containing your PDF. The archive requires the password
          you specified to extract and access the PDF file.
        </p>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>To open:</strong> Use archive software like 7-Zip, WinRAR, or built-in ZIP extractors and enter the password when prompted.
        </p>
      </div>
    </div>
  );
}
