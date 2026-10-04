import type { ToolContent } from "./types";

export const pdfToolContent: Record<string, ToolContent> = {
  "pdf-compressor": {
    overview:
      "Large PDF files are a common problem when emailing contracts, reports, or application documents. The PDF Compressor reduces file size directly in your browser using adjustable compression levels. Choose Light, Standard, or Maximum, then fine-tune the result with advanced options for image quality, unused elements, fonts, and metadata removal. A preview shows the estimated size reduction before you commit, and Standard compression typically cuts file size by 50-70% with minimal quality loss. Because the entire process runs on your own device, confidential contracts, financial records, and medical documents are never uploaded to a server, so sensitive pages stay under your control from start to finish.",
    features: [
      "Adjustable compression levels: Light, Standard, or Maximum",
      "Supports PDF files up to 100MB",
      "Advanced options for image quality, fonts, and metadata",
      "Preview shows estimated file size reduction",
      "Standard compression typically reduces size by 50-70%",
      "Runs entirely in your browser, files never uploaded",
    ],
    steps: [
      {
        title: "Upload your PDF file",
        text: "Select the PDF document you want to compress. Files up to 100MB are supported, though larger files may need more processing time.",
      },
      {
        title: "Choose a compression level",
        text: "Pick from the Light, Standard, or Maximum presets. Standard compression typically reduces size by 50-70% with minimal quality loss.",
      },
      {
        title: "Configure advanced options",
        text: "Adjust image quality, remove unused elements, optimize fonts, and enable \"Remove metadata\" to shrink the file further.",
      },
      {
        title: "Preview compression results",
        text: "Review the estimated file size reduction before processing so you can balance compression against acceptable quality.",
      },
      {
        title: "Compress and download",
        text: "Click \"Compress PDF\" to begin the optimization process, then download the optimized file and verify readability.",
      },
    ],
    useCases: [
      "A job applicant shrinks a scanned resume so it fits under an employer's 5MB email attachment limit.",
      "A real estate agent compresses a photo-heavy property brochure before sending it to clients.",
      "A student reduces a research paper to upload it through a university portal with size restrictions.",
      "An office manager optimizes a quarterly report for distribution to a company mailing list.",
      "A freelancer compresses portfolio PDFs so they load faster on a client-facing website.",
    ],
    faqs: [
      {
        q: "Where does my PDF go when I compress it?",
        a: "Nowhere. The compressor runs entirely in your browser and never uploads your file to a server. Your document stays on your device the whole time, which matters for confidential contracts, financial records, and medical documents.",
      },
      {
        q: "How much can I reduce my PDF's file size?",
        a: "With Standard compression you can typically expect a 50-70% reduction with minimal quality loss. Image-heavy PDFs compress much more than text-only documents, while Maximum compression may reduce image quality noticeably.",
      },
      {
        q: "Is the PDF Compressor free? Do I need an account?",
        a: "It is completely free with no signup, subscription, or account required. There are no usage limits or watermarks, and no file ever leaves your device.",
      },
    ],
  },
  "pdf-merger": {
    overview:
      "Combining scattered PDF files into one ordered document is a routine task for students, office staff, and anyone assembling reports or applications. The PDF Merger lets you add up to 20 PDF files at once, then arrange them by dragging and dropping each file into the right position in the list. Before merging, you can review page counts and file sizes, and configure output settings such as compression level and metadata preservation. Clicking \"Merge PDFs\" combines everything into a single file you can download. The merge happens entirely in your browser, so contracts, financial statements, and medical records are never uploaded to a server and remain fully under your control.",
    features: [
      "Merge up to 20 PDF files at once",
      "Drag and drop files to reorder them",
      "Review page counts and file sizes before merging",
      "Choose compression level and metadata preservation options",
      "Merges files in the exact order shown",
      "Runs entirely in your browser, files never uploaded",
    ],
    steps: [
      {
        title: "Upload your PDF files",
        text: "Select multiple PDF files to combine. You can upload up to 20 PDF files at once.",
      },
      {
        title: "Arrange the page order",
        text: "Drag and drop files in the list to reorder them. Files are merged in the order they appear in the list.",
      },
      {
        title: "Review file details",
        text: "Check the page counts and file sizes of each PDF to make sure everything is included and valid.",
      },
      {
        title: "Configure output settings",
        text: "Choose a compression level and decide whether to preserve metadata in the combined document.",
      },
      {
        title: "Merge and download",
        text: "Click \"Merge PDFs\" to combine all files into one document, then download the merged PDF and verify the page order.",
      },
    ],
    useCases: [
      "A student combines separate chapter PDFs into one document before printing.",
      "An accountant merges monthly bank statements into a single year-end file.",
      "A job seeker combines a cover letter, resume, and certificates into one application PDF.",
      "A project manager merges individual status reports from each team into one weekly report.",
      "A landlord combines signed lease pages and addenda into a single rental agreement.",
    ],
    faqs: [
      {
        q: "Are my PDFs uploaded to a server when merging?",
        a: "No. The merger combines your files locally in your browser, and nothing is sent to any server. This keeps confidential contracts, financial statements, and medical records private throughout the process.",
      },
      {
        q: "How many PDF files can I merge at once?",
        a: "You can merge up to 20 PDF files in a single session. Files are combined in the order shown in the upload list, which you can rearrange by dragging and dropping.",
      },
      {
        q: "Does the PDF Merger cost anything or require signup?",
        a: "The PDF Merger is completely free and requires no account, subscription, or registration. You can merge as many documents as you like without watermarks.",
      },
    ],
  },
  "pdf-splitter": {
    overview:
      "Long PDFs are awkward to email, share, and store, so people often need just one section rather than the whole file. The PDF Splitter divides a PDF into smaller documents: upload a file of up to 100MB, choose a split method (page ranges, individual pages, or even/odd pages), and enter ranges such as 1-3,7-9,15. A preview shows exactly which pages each output file will contain before you click \"Split PDF\". Each range becomes its own PDF, named with its page range, and you can download the results individually or as a ZIP archive. Everything runs locally in your browser, so sensitive material such as contracts, financial records, or medical documents never touches a server.",
    features: [
      "Split by page ranges, individual pages, or even/odd",
      "Supports PDF files up to 100MB",
      "Enter multiple ranges like 1-3,7-9,15",
      "Preview shows pages in each output file",
      "Download files individually or as a ZIP archive",
      "Output files named with their page ranges",
    ],
    steps: [
      {
        title: "Upload your PDF file",
        text: "Select the PDF document you want to split. Files up to 100MB are supported for splitting operations.",
      },
      {
        title: "Choose a split method",
        text: "Select how to split: by page ranges, individual pages, or even/odd pages. Page ranges are the most commonly used option.",
      },
      {
        title: "Specify page ranges",
        text: "Enter page numbers or ranges such as 1-5 or 8-12, using commas to separate multiple ranges like 1-3,7-9,15.",
      },
      {
        title: "Preview your selection",
        text: "Review which pages will be included in each output file so you can verify the ranges before processing.",
      },
      {
        title: "Split and download",
        text: "Click \"Split PDF\" to create separate documents, then save your split files individually or as a ZIP archive.",
      },
    ],
    useCases: [
      "An attorney extracts only the relevant exhibits from a lengthy case file to share with a client.",
      "A teacher splits a semester packet so each student receives just one chapter.",
      "An office worker separates even and odd pages of a document for double-sided printing.",
      "A researcher pulls individual journal articles out of a combined conference proceedings PDF.",
      "A human resources manager extracts a single page from a personnel record for a payroll request.",
    ],
    faqs: [
      {
        q: "Where do my files go when I split a PDF?",
        a: "They stay on your device. The splitter processes everything inside your browser and never uploads your document to a server. That makes it suitable for confidential contracts, financial records, and medical files.",
      },
      {
        q: "How do I enter page ranges, and what sizes are supported?",
        a: "Type ranges like 1-5 or 8-12 and separate multiple ranges with commas, for example 1-3,7-9,15. PDFs up to 100MB are supported, and each page range becomes its own output file.",
      },
      {
        q: "Is the PDF Splitter free? Do I need an account?",
        a: "Yes, it is completely free, with no signup, account, or subscription required. You can split as many documents as you need, and nothing is ever uploaded or stored on a server.",
      },
    ],
  },
  "text-to-pdf": {
    overview:
      "People who draft content in a notes app, code editor, or markdown file often need a polished, fixed-layout document they can print or share. Text to PDF turns plain text, markdown, or basic HTML into a formatted PDF without any desktop software. Paste your content or upload a text file, choose a preset template such as Modern, Classic, or Minimal, then adjust fonts, sizes, colors, margins, and spacing. You can add headers and footers with page numbers, titles, or dates, and set page size and orientation for A4 or Letter output. Clicking \"Convert to PDF\" produces the document instantly, and because conversion happens in your browser, drafts of contracts, financial summaries, or medical notes are never uploaded anywhere.",
    features: [
      "Paste text or upload .txt and .md files",
      "Supports plain text, markdown, and basic HTML",
      "Preset templates: Modern, Classic, Minimal, and more",
      "Customize fonts, sizes, colors, margins, and spacing",
      "Add headers and footers with page numbers",
      "Set page size, orientation, and layout options",
    ],
    steps: [
      {
        title: "Enter or upload your text",
        text: "Paste text content into the editor or upload a text file such as a .txt or .md document. Plain text, markdown, and basic HTML formatting are supported.",
      },
      {
        title: "Choose a PDF template",
        text: "Select a preset document style such as Modern, Classic, or Minimal that matches your content type and audience.",
      },
      {
        title: "Customize the formatting",
        text: "Adjust fonts, sizes, colors, margins, and spacing for a consistent, readable layout.",
      },
      {
        title: "Add headers and footers",
        text: "Include page numbers, titles, dates, or custom text to organize and identify the document.",
      },
      {
        title: "Configure page settings",
        text: "Set the page size, orientation, and layout. A4 and Letter sizes work for most business and academic documents.",
      },
      {
        title: "Convert and download",
        text: "Click \"Convert to PDF\" to create your formatted document, then download your PDF file.",
      },
    ],
    useCases: [
      "A developer converts meeting notes written in markdown into a formatted PDF for the team archive.",
      "A writer turns a plain text manuscript draft into a Classic-styled document for a publisher.",
      "An administrative assistant generates a Letter-size PDF report from an exported .txt file.",
      "A job seeker formats a plain text resume with headers and page numbers before submitting it online.",
      "A teacher converts lesson notes into a Minimal PDF handout for students.",
    ],
    faqs: [
      {
        q: "Is my text uploaded anywhere when I convert it?",
        a: "No. Conversion runs entirely in your browser, and your text is never sent to a server. Drafts that mention contracts, finances, or health information stay on your device.",
      },
      {
        q: "What input formats does Text to PDF accept?",
        a: "You can paste plain text directly or upload files such as .txt and .md. Markdown and basic HTML formatting are supported when generating the PDF.",
      },
      {
        q: "Does this tool cost anything or require an account?",
        a: "Text to PDF is completely free with no signup, account, or subscription. You can convert as much text as you like without watermarks or limits.",
      },
    ],
  },
  "pdf-password": {
    overview:
      "When a document is too sensitive to send unprotected, password encryption is the standard safeguard. The PDF Encryption Tool adds or removes password protection using AES-256 encryption, the same algorithm approved for classified government data. Start by choosing whether to encrypt or decrypt, upload a PDF of up to 50MB, and either set a new strong password or enter the existing one, which is case-sensitive. You can also configure permissions for printing, copying, and editing so recipients can only do what you allow. Because encryption runs entirely in your browser, the confidential contracts, financial records, and medical documents you protect are never exposed to a server.",
    features: [
      "Encrypt PDFs with AES-256 encryption",
      "Decrypt PDFs when you know the password",
      "Supports PDF files up to 50MB",
      "Set printing, copying, and editing permissions",
      "Separate modes for adding or removing passwords",
      "Runs entirely in your browser, files never uploaded",
    ],
    steps: [
      {
        title: "Choose your operation",
        text: "Select whether to encrypt (add a password) or decrypt (remove a password) a PDF. You must know the existing password to decrypt a protected PDF.",
      },
      {
        title: "Upload the PDF file",
        text: "Select the PDF document to encrypt or decrypt. Files up to 50MB are supported for password operations.",
      },
      {
        title: "Set or enter the password",
        text: "For encryption, create a strong password using a combination of letters, numbers, and symbols. For decryption, enter the current password, which is case-sensitive.",
      },
      {
        title: "Configure permissions",
        text: "Set access controls for printing, copying, and editing based on how the document will be shared.",
      },
      {
        title: "Process and download",
        text: "Click \"Encrypt PDF\" or \"Decrypt PDF\" to apply the changes, then download the resulting file and store the password separately.",
      },
    ],
    useCases: [
      "A lawyer password-protects a contract before emailing it to the opposing party.",
      "An accountant locks a client's tax return and sends the password separately by phone.",
      "A medical office encrypts patient intake forms so only the recipient can open them.",
      "A manager removes a password from an archived report after it is no longer sensitive.",
      "A freelancer restricts printing and copying on a paid design brief sent to a client.",
    ],
    faqs: [
      {
        q: "Are my documents uploaded to encrypt or decrypt them?",
        a: "No. All encryption and decryption happens locally in your browser, so the file never leaves your device. This matters when you are protecting confidential contracts, financial records, or medical documents.",
      },
      {
        q: "What encryption does it use, and what sizes are supported?",
        a: "PDFs are protected with AES-256 encryption, and files up to 50MB are supported. You can also set permissions that control printing, copying, and editing.",
      },
      {
        q: "Is the PDF Encryption Tool free? Do I need to sign up?",
        a: "It is completely free and requires no account, signup, or subscription. There are no limits on how many PDFs you encrypt or decrypt.",
      },
    ],
  },
  "pdf-form-filler": {
    overview:
      "Paperwork that arrives as a fillable PDF still demands tedious typing in many viewers. The PDF Form Filler opens a PDF form in your browser, automatically detects its interactive fields, including text boxes, checkboxes, radio buttons, and dropdowns, and lets you type directly into each one. Enter text with appropriate formatting for dates, phone numbers, and addresses, make dropdown and radio button selections, and review everything for accuracy before saving. The finished form downloads with your data permanently embedded and the original layout intact. Since the whole process runs on your device, applications, tax forms, and medical intake documents are never uploaded to a server.",
    features: [
      "Automatically detects interactive PDF form fields",
      "Fill text fields, checkboxes, radio buttons, dropdowns",
      "Data is permanently embedded in the saved PDF",
      "Preserves the original formatting and structure",
      "Works with fillable applications, surveys, and official forms",
      "Runs entirely in your browser, files never uploaded",
    ],
    steps: [
      {
        title: "Upload your PDF form",
        text: "Select a PDF document containing interactive form fields, such as fillable applications, surveys, or official documents.",
      },
      {
        title: "Review detected fields",
        text: "Check which form fields were automatically detected, including text boxes, checkboxes, radio buttons, and dropdowns.",
      },
      {
        title: "Fill the text fields",
        text: "Enter text into the detected input fields and text areas, using appropriate formatting for dates, phone numbers, and addresses.",
      },
      {
        title: "Select checkboxes and options",
        text: "Make your selections from dropdown menus, radio buttons, and checkboxes to match the form requirements.",
      },
      {
        title: "Review and save the form",
        text: "Check all filled fields for accuracy and completeness, then save the filled form to download it with all data embedded.",
      },
    ],
    useCases: [
      "A patient completes a medical intake form on a phone instead of printing it at the clinic.",
      "A taxpayer fills in a government tax form and downloads it ready for submission.",
      "A job candidate types answers into an interactive employment application PDF.",
      "A property manager fills a rental application with applicant details before forwarding it.",
      "A survey coordinator completes checkbox responses in a feedback form and saves a copy for records.",
    ],
    faqs: [
      {
        q: "Where does my form go when I fill it?",
        a: "It never leaves your device. The form is opened, filled, and saved entirely in your browser with no upload to any server. That is important when forms contain personal, financial, or medical information.",
      },
      {
        q: "Which PDF forms work with the form filler?",
        a: "It works with interactive PDF forms that contain form fields, such as applications and surveys. The tool detects text boxes, checkboxes, radio buttons, and dropdowns, and your entries are permanently embedded in the PDF.",
      },
      {
        q: "Is the PDF Form Filler free? Do I need an account?",
        a: "Yes, it is completely free and requires no signup, account, or subscription. Fill and save as many forms as you need without watermarks.",
      },
    ],
  },
  "pdf-text-extractor": {
    overview:
      "Text locked inside a PDF is hard to quote, reformat, or analyze with other software. The PDF Text Extractor pulls that text out so you can work with it in an editor or spreadsheet. Upload a PDF; it is most reliable with text-based documents rather than image-based scans. Then choose between plain text or formatted output that preserves paragraphs and spacing. Language detection helps with mixed-content documents, and OCR can be applied to image-based content for better results. After clicking \"Extract Text\", you can review the result and download it as a .txt or .docx file. Extraction runs entirely in your browser, so confidential reports, financial statements, and medical records are never uploaded to a server.",
    features: [
      "Extract text from text-based PDF documents",
      "Plain text or formatted output with layout preservation",
      "Language detection for mixed-content documents",
      "OCR support for image-based PDF content",
      "Download extracted text as .txt or .docx",
      "Runs entirely in your browser, files never uploaded",
    ],
    steps: [
      {
        title: "Upload your PDF document",
        text: "Select a PDF file containing text content to extract. The tool works best with text-based PDFs rather than image-based scans.",
      },
      {
        title: "Choose the output format",
        text: "Select plain text or formatted text with layout preservation, which maintains paragraphs and spacing better.",
      },
      {
        title: "Configure extraction options",
        text: "Set language detection and text processing preferences, with multiple language support for mixed-content documents.",
      },
      {
        title: "Extract and review the text",
        text: "Click \"Extract Text\" to begin the conversion process, then check the accuracy and formatting of the extracted content.",
      },
      {
        title: "Download the text file",
        text: "Save the extracted text as a .txt, .docx, or other editable format for repurposing, accessibility, or data analysis.",
      },
    ],
    useCases: [
      "A researcher extracts quotes from journal articles into a notes file for a literature review.",
      "An analyst pulls figures from financial statement PDFs into a spreadsheet for modeling.",
      "A student converts a textbook chapter to text so a screen reader can read it aloud.",
      "A journalist retrieves paragraphs from a released report to quote in an article.",
      "An assistant exports text from archived invoices for entry into an accounting system.",
    ],
    faqs: [
      {
        q: "Is my PDF uploaded to a server during text extraction?",
        a: "No. Extraction is performed locally in your browser, and the file is never transmitted anywhere. This keeps confidential reports, financial statements, and medical records private.",
      },
      {
        q: "What formats can I export, and which PDFs work best?",
        a: "You can download extracted text as .txt, .docx, or other editable formats. Text-based PDFs produce the cleanest results, while image-based scans may need OCR for accurate extraction.",
      },
      {
        q: "Does the PDF Text Extractor cost anything or need signup?",
        a: "It is completely free and requires no account, signup, or subscription. Extract text from as many PDFs as you like, with no watermarks or file uploads.",
      },
    ],
  },
};
