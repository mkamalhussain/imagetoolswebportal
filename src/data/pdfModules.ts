export interface Module {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export const pdfModules: Module[] = [
  {
    slug: 'pdf-compressor',
    title: 'PDF Compressor',
    description: 'Reduce PDF file size with adjustable compression levels. Perfect for email attachments and web sharing.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#compressGradient)" stroke="#16a34a" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">PDF</text><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><rect x="8" y="15" width="8" height="1" fill="#ffffff"/><circle cx="18" cy="14" r="1" fill="#16a34a"/><path d="M16 14h4" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="compressGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#16a34a"/><stop offset="100%" style="stop-color:#22c55e"/></linearGradient></defs></svg>'
  },
  {
    slug: 'pdf-merger',
    title: 'PDF Merger',
    description: 'Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#mergeGradient)" stroke="#2563eb" stroke-width="1.5"/><text x="8" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ffffff">PDF</text><text x="16" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ffffff">PDF</text><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><path d="M12 8v6" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><path d="M9 11h6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="mergeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2563eb"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'pdf-splitter',
    title: 'PDF Splitter',
    description: 'Extract specific pages or split PDF into multiple documents. Perfect for sharing individual sections.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#splitGradient)" stroke="#ea580c" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">PDF</text><rect x="5" y="13" width="6" height="1" fill="#ffffff"/><rect x="5" y="15" width="4" height="1" fill="#ffffff"/><rect x="13" y="13" width="6" height="1" fill="#ffffff"/><rect x="15" y="15" width="4" height="1" fill="#ffffff"/><path d="M11 8v10" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><defs><linearGradient id="splitGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ea580c"/><stop offset="100%" style="stop-color:#f97316"/></linearGradient></defs></svg>'
  },
  {
    slug: 'text-to-pdf',
    title: 'Text to PDF',
    description: 'Convert text content into beautifully formatted PDF documents with custom styling and layouts.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#textPdfGradient)" stroke="#7c3aed" stroke-width="1.5"/><text x="8" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ffffff">TXT</text><text x="16" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#ffffff">PDF</text><rect x="5" y="13" width="6" height="1" fill="#ffffff"/><rect x="5" y="15" width="4" height="1" fill="#ffffff"/><rect x="13" y="13" width="6" height="1" fill="#ffffff"/><rect x="15" y="15" width="4" height="1" fill="#ffffff"/><path d="M11 8l2 2 2-2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none"/><defs><linearGradient id="textPdfGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'pdf-password',
    title: 'PDF Encryption Tool',
    description: 'Encrypt and decrypt PDF files with AES-256 encryption. Secure your documents with military-grade encryption.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#encryptGradient)" stroke="#dc2626" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">PDF</text><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><rect x="8" y="15" width="8" height="1" fill="#ffffff"/><circle cx="18" cy="14" r="1.5" fill="#dc2626"/><path d="M16 14h4M17 12v4M19 12v4" stroke="#dc2626" stroke-width="1" stroke-linecap="round"/><defs><linearGradient id="encryptGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#dc2626"/><stop offset="100%" style="stop-color:#ef4444"/></linearGradient></defs></svg>'
  },
  {
    slug: 'pdf-form-filler',
    title: 'PDF Form Filler',
    description: 'Automatically detect and fill PDF form fields. Save time on form completion and submissions.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#formGradient)" stroke="#6366f1" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">PDF</text><rect x="5" y="13" width="14" height="1" fill="#ffffff"/><rect x="5" y="15" width="10" height="1" fill="#ffffff"/><rect x="7" y="13" width="10" height="4" fill="none" stroke="#6366f1" stroke-width="1" rx="1"/><circle cx="9" cy="15" r="0.5" fill="#6366f1"/><defs><linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs></svg>'
  },
  {
    slug: 'pdf-text-extractor',
    title: 'PDF Text Extractor',
    description: 'Extract text content from PDF files and export as editable text or HTML for easy editing.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-8 h-8"><rect x="2" y="3" width="20" height="18" rx="3" fill="url(#extractGradient)" stroke="#14b8a6" stroke-width="1.5"/><text x="12" y="11" text-anchor="middle" font-family="Arial, sans-serif" font-size="6" font-weight="bold" fill="#ffffff">PDF</text><text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="4" font-weight="bold" fill="#ffffff">TXT</text><rect x="6" y="13" width="12" height="1" fill="#ffffff"/><path d="M8 8l4 4 4-4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="extractGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#14b8a6"/><stop offset="100%" style="stop-color:#06b6d4"/></linearGradient></defs></svg>'
  }
];
