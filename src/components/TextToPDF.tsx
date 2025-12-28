"use client";

import React from "react";

export default function TextToPDF() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Text to PDF
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert text content into beautifully formatted PDF documents
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
        <p className="text-yellow-800 dark:text-yellow-200">
          🚧 Text to PDF converter is coming soon! This will allow you to create styled PDFs from text with custom layouts and formatting.
        </p>
      </div>
    </div>
  );
}
