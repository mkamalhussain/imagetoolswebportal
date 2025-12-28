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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75c0 1.24.775 2.306 1.875 2.75h.75m-3-6.75h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" /></svg>'
  },
  {
    slug: 'pdf-merger',
    title: 'PDF Merger',
    description: 'Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-9-6h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75" /></svg>'
  },
  {
    slug: 'pdf-splitter',
    title: 'PDF Splitter',
    description: 'Extract specific pages or split PDF into multiple documents. Perfect for sharing individual sections.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-orange-500"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3-3m0 0l3 3m-3-3v12.75" /></svg>'
  },
  {
    slug: 'text-to-pdf',
    title: 'Text to PDF',
    description: 'Convert text content into beautifully formatted PDF documents with custom styling and layouts.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-purple-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75c0 1.24.775 2.306 1.875 2.75h.75m-3-6.75h3M5.25 7.5h3A2.25 2.25 0 0010.5 9.75v1.5a2.25 2.25 0 002.25 2.25H18m0-12.75h.225c.038-.035.074-.067.11-.099L21 7.279m0 0l-3.21 3.21M21 7.279v7.5M10.5 9.75l-4.72-4.72a.75.75 0 00-1.06 0L2.25 7.5V21h19.5V7.5l-2.695-2.695a.75.75 0 00-1.06 0L14.25 9.75M5.25 14.25h3V16.5h-3v-2.25zM5.25 18h3v2.25h-3V18zM10.5 14.25h3V16.5h-3v-2.25zM10.5 18h3v2.25h-3V18zM15.75 14.25h3V16.5h-3v-2.25zM15.75 18h3v2.25h-3V18z" /></svg>'
  },
  {
    slug: 'pdf-password',
    title: 'PDF Encryption Tool',
    description: 'Encrypt and decrypt PDF files with AES-256 encryption. Secure your documents with military-grade encryption.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>'
  },
  {
    slug: 'pdf-form-filler',
    title: 'PDF Form Filler',
    description: 'Automatically detect and fill PDF form fields. Save time on form completion and submissions.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h3.75m0 0h3.75m0 0h3.75m0 0H19.875c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H16.5m0 0H12m0 0H8.25m0 0H4.875" /></svg>'
  },
  {
    slug: 'pdf-text-extractor',
    title: 'PDF Text Extractor',
    description: 'Extract text content from PDF files and export as editable text or HTML for easy editing.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-teal-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>'
  }
];
