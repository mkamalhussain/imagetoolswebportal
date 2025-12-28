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
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const encryptFileInputRef = React.useRef<HTMLInputElement>(null);
  const decryptFileInputRef = React.useRef<HTMLInputElement>(null);

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

  // Encrypt PDF using Web Crypto API (AES-GCM)
  const encryptPDF = useCallback(async () => {
    if (!selectedFile) return;

    if (!passwordConfig.userPassword) {
      setError("Please provide a password for encryption");
      return;
    }

    setIsEncrypting(true);
    setError("");

    try {
      // Read the PDF file
      const pdfArrayBuffer = await selectedFile.arrayBuffer();
      const pdfData = new Uint8Array(pdfArrayBuffer);

      // Create a key from the password
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(passwordConfig.userPassword);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive a key using PBKDF2
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the PDF data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        pdfData
      );

      // Create metadata object
      const metadata = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        encryptedDate: new Date().toISOString(),
        permissions: passwordConfig.permissions,
        ownerPassword: passwordConfig.ownerPassword || null,
        encryptionInfo: {
          algorithm: 'AES-GCM',
          keyDerivation: 'PBKDF2',
          iterations: 100000,
          salt: Array.from(salt),
          iv: Array.from(iv)
        }
      };

      // Combine metadata and encrypted data
      const metadataString = JSON.stringify(metadata);
      const metadataBytes = encoder.encode(metadataString);
      const metadataLength = new Uint8Array(4);
      new DataView(metadataLength.buffer).setUint32(0, metadataBytes.length, true);

      // Create final encrypted file: [metadata_length][metadata][encrypted_data]
      const finalData = new Uint8Array(4 + metadataBytes.length + encryptedData.byteLength);
      finalData.set(metadataLength, 0);
      finalData.set(metadataBytes, 4);
      finalData.set(new Uint8Array(encryptedData), 4 + metadataBytes.length);

      // Create encrypted blob with custom extension
      const encryptedBlob = new Blob([finalData], { type: 'application/octet-stream' });
      setEncryptedBlob(encryptedBlob);

    } catch (err) {
      console.error("Encryption error:", err);
      setError("Failed to encrypt PDF. Please try again.");
    } finally {
      setIsEncrypting(false);
    }
  }, [selectedFile, passwordConfig]);

  // Decrypt an encrypted file
  const decryptFile = useCallback(async (encryptedFile: File, password: string) => {
    try {
      const encryptedArrayBuffer = await encryptedFile.arrayBuffer();
      const encryptedData = new Uint8Array(encryptedArrayBuffer);

      // Read metadata length
      const metadataLength = new DataView(encryptedData.buffer).getUint32(0, true);

      // Read metadata
      const metadataBytes = encryptedData.slice(4, 4 + metadataLength);
      const decoder = new TextDecoder();
      const metadata = JSON.parse(decoder.decode(metadataBytes));

      // Extract encrypted data
      const encryptedContent = encryptedData.slice(4 + metadataLength);

      // Recreate the key from password
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive the same key
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new Uint8Array(metadata.encryptionInfo.salt),
          iterations: metadata.encryptionInfo.iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(metadata.encryptionInfo.iv)
        },
        key,
        encryptedContent
      );

      return {
        data: decryptedData,
        metadata: metadata
      };

    } catch (err) {
      throw new Error('Failed to decrypt file. Wrong password or corrupted file.');
    }
  }, []);

  // Handle decryption
  const handleDecrypt = useCallback(async () => {
    if (!selectedFile || !passwordConfig.userPassword) {
      setError("Please select an encrypted file and enter the password");
      return;
    }

    setIsDecrypting(true);
    setError("");

    try {
      const result = await decryptFile(selectedFile, passwordConfig.userPassword);

      // Create the decrypted PDF blob
      const decryptedPdfBlob = new Blob([result.data], { type: 'application/pdf' });
      setDecryptedBlob(decryptedPdfBlob);

    } catch (err) {
      console.error("Decryption error:", err);
      setError(err instanceof Error ? err.message : "Failed to decrypt file");
    } finally {
      setIsDecrypting(false);
    }
  }, [selectedFile, passwordConfig.userPassword, decryptFile]);

  // Download encrypted file
  const downloadEncrypted = useCallback(() => {
    if (!encryptedBlob || !selectedFile) return;

    const url = URL.createObjectURL(encryptedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `encrypted-${selectedFile.name.replace('.pdf', '')}.encrypted`;
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
          PDF Encryption Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Encrypt and decrypt PDF files with AES-256 encryption
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('encrypt')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'encrypt'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🔒 Encrypt PDF
            </button>
            <button
              onClick={() => setActiveTab('decrypt')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'decrypt'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🔓 Decrypt File
            </button>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-yellow-600 dark:text-yellow-400 mr-3">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Browser Encryption Limitations
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This tool creates encrypted files that are NOT standard PDFs. You must use this tool's
                decryption feature to access your files. For standard PDF password protection, use desktop software.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Solutions Toggle */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline text-sm"
          >
            {showAlternatives ? 'Hide' : 'Show'} Standard PDF Password Solutions →
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
      {activeTab === 'encrypt' && (
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
              <p className="text-sm text-gray-400 mt-1">Encrypt your PDF with AES-256 encryption</p>
            </div>
            <Button
              className="mt-4"
              onClick={() => encryptFileInputRef.current?.click()}
            >
              Select PDF File
            </Button>
          </div>
          <input
            ref={encryptFileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              setDecryptedBlob(null);
            }}
            className="hidden"
          />
        </div>
      )}

      {activeTab === 'decrypt' && (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M16.5 37.5V33.75a4.5 4.5 0 109 0v3.75m6-3.75h-10.5a2.25 2.25 0 01-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25H26.25a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>Drop an encrypted file here, or click to select</p>
              <p className="text-sm text-gray-400 mt-1">Decrypt your AES-encrypted files</p>
            </div>
            <Button
              className="mt-4"
              onClick={() => decryptFileInputRef.current?.click()}
            >
              Select Encrypted File
            </Button>
          </div>
          <input
            ref={decryptFileInputRef}
            type="file"
            accept=".encrypted,*/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              setEncryptedBlob(null);
            }}
            className="hidden"
          />
        </div>
      )}

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
              {activeTab === 'encrypt' ? 'Encryption Password' : 'Decryption Password'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {activeTab === 'encrypt' ? 'Password for Encryption' : 'Password for Decryption'}
                </label>
                <input
                  type="password"
                  value={passwordConfig.userPassword}
                  onChange={(e) => setPasswordConfig(prev => ({
                    ...prev,
                    userPassword: e.target.value
                  }))}
                  placeholder={activeTab === 'encrypt' ? "Enter encryption password" : "Enter decryption password"}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {activeTab === 'encrypt' && (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Security:</strong> Files are encrypted using AES-256-GCM with PBKDF2 key derivation (100,000 iterations).
                  </div>
                </>
              )}
            </div>
          </div>


          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={activeTab === 'encrypt' ? encryptPDF : handleDecrypt}
              disabled={(activeTab === 'encrypt' ? isEncrypting : isDecrypting) || !passwordConfig.userPassword}
            >
              {activeTab === 'encrypt'
                ? (isEncrypting ? "Encrypting PDF..." : "Encrypt PDF")
                : (isDecrypting ? "Decrypting File..." : "Decrypt File")
              }
            </Button>
          </div>
        </div>
      )}

      {/* Download Sections */}
      {encryptedBlob && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              File Encrypted Successfully! 🔒🛡️
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-2">
              <strong>Your PDF has been encrypted with AES-256-GCM!</strong>
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm">
                <strong>⚠️ IMPORTANT:</strong> This is NOT a standard PDF file. It cannot be opened by PDF readers.
                You MUST use this tool's "Decrypt File" tab to access your content.
              </p>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-4">
              Keep your password safe - the file cannot be decrypted without it!
            </p>
            <div className="space-y-2">
              <Button onClick={downloadEncrypted} className="mr-2">
                📥 Download Encrypted File (.encrypted)
              </Button>
              <p className="text-xs text-green-600 dark:text-green-400">
                🔄 Use "Decrypt File" tab to access your PDF
              </p>
            </div>
          </div>
        </div>
      )}

      {decryptedBlob && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              PDF Decrypted Successfully! 🔓📄
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              Your encrypted file has been successfully decrypted and is ready for download.
            </p>
            <Button onClick={() => {
              if (!decryptedBlob) return;
              const url = URL.createObjectURL(decryptedBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'decrypted-document.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}>
              📥 Download Decrypted PDF
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
        {activeTab === 'encrypt' ? (
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Switch to "🔒 Encrypt PDF" tab</li>
            <li>• Upload a <strong>PDF file</strong> you want to protect</li>
            <li>• Enter a strong encryption password</li>
            <li>• Click "Encrypt PDF" to apply AES-256 encryption</li>
            <li>• Download the <strong>.encrypted file</strong> (not a PDF!)</li>
            <li>• <strong>⚠️ Cannot be opened by PDF readers like Acrobat</strong></li>
            <li>• Use "Decrypt File" tab to access your PDF later</li>
          </ul>
        ) : (
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Switch to "🔓 Decrypt File" tab</li>
            <li>• Upload an <strong>.encrypted file</strong> created by this tool</li>
            <li>• Enter the exact password used for encryption</li>
            <li>• Click "Decrypt File" to unlock and restore your PDF</li>
            <li>• Download the <strong>original PDF</strong> (file extension restored)</li>
            <li>• <strong>Note:</strong> Wrong password will fail decryption</li>
          </ul>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔐 AES-256 Encryption Tool</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
          <strong>This tool provides genuine AES-256-GCM encryption</strong> for your PDF files using the Web Crypto API.
          However, the encrypted output is NOT a standard PDF - it's a custom encrypted container.
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>For standard PDF password protection:</strong> Use desktop software like Adobe Acrobat or professional PDF tools.
          This tool offers encryption but requires decryption through this interface.
        </p>
      </div>
    </div>
  );
}
