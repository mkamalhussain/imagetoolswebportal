export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tip"; text: string }
  | { type: "cta"; toolSlug: string; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  keywords: string[];
  intro: string[];
  blocks: BlogBlock[];
  relatedTools: string[];
  relatedGuides: string[];
}

export function formatPostDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality",
    description:
      "A scanned contract that won't fit through email, an upload portal that rejects your 8MB file — here's how to shrink PDFs by 50-90% without ruining them, and which compression level to pick for each situation.",
    date: "2026-10-14",
    category: "PDF",
    readTime: "8 min read",
    keywords: [
      "compress pdf",
      "reduce pdf size",
      "compress pdf without losing quality",
      "pdf compressor",
      "pdf file too large",
      "reduce pdf file size for email",
    ],
    intro: [
      "A 40-page scanned contract that won't fit through an email gateway. An application portal that rejects your upload because the file is 8MB and the limit is 2MB. Oversized PDFs are one of the most common document problems — and most of the time you can shrink them dramatically without anyone noticing a difference.",
      "This guide explains what actually makes PDF files large, walks through the two methods that work in 2026, and shows exactly which compression level to pick for contracts, scans, and print-ready documents.",
    ],
    blocks: [
      { type: "h2", text: "What actually makes a PDF file large" },
      {
        type: "p",
        text: "A PDF is a container. Text and vector graphics take up almost no space — a text-only, ten-page PDF is usually under 200KB. What bloats files is everything else: images, fonts, and the leftover objects from editing.",
      },
      {
        type: "ul",
        items: [
          "Scanned pages — each page is stored as an image, usually at 300 DPI or more. This is why scanned documents are often 10–50× larger than digital ones",
          "High-resolution photos — images embedded at print quality (2400 × 3000 pixels or more) stay heavy even when you only view them on a screen",
          "Embedded fonts — full font files, sometimes several copies of the same one, can add megabytes by themselves",
          "Metadata and leftovers — revision history, thumbnails, and unused objects accumulate every time a PDF is edited and re-saved",
        ],
      },
      { type: "h2", text: "Method 1: Compress the PDF in your browser (recommended)" },
      {
        type: "p",
        text: "For most documents, a browser-based compressor gives you the best balance: large reductions, a preview before you commit, and nothing to install. Here is the full workflow using our free PDF Compressor.",
      },
      {
        type: "ol",
        items: [
          "Open the PDF Compressor — it works in any modern browser on desktop or mobile",
          "Drag in your file. PDFs up to 100MB are supported; larger files simply take a little more processing time",
          "Pick a compression level. Start with Standard — it typically cuts file size by 50–70% while keeping documents crisp on screen and on most office printers",
          "Check the preview. Before processing, the tool shows the estimated size reduction so you can balance size against quality",
          "Open the advanced options if you need more: image quality, removing unused elements, font optimization, and metadata removal are the biggest wins",
          "Compress and download, then scroll through the result before sending. Pay extra attention to small print and signature lines",
        ],
      },
      {
        type: "tip",
        text: "Everything happens directly in your browser — the file is never uploaded to a server. That matters when you're compressing contracts, medical records, or financial documents.",
      },
      { type: "h2", text: "Method 2: Re-export with \u201cPrint to PDF\u201d" },
      {
        type: "p",
        text: "Any PDF viewer can re-render a document: open the file, choose Print, and pick \u201cSave as PDF\u201d instead of a physical printer. The re-export strips some embedded objects and often shrinks the file.",
      },
      {
        type: "ul",
        items: [
          "Pros — built into every system, no tools needed",
          "Cons — you can lose interactive form fields and bookmarks, and it doesn't help much when the images themselves are heavy",
          "Best for — quick, one-off reductions where losing interactivity doesn't matter",
        ],
      },
      {
        type: "p",
        text: "For documents you'll share more than once — resumes, reports, brochures — the dedicated compressor gives you more control and preserves the document structure.",
      },
      { type: "h2", text: "Which compression level should you pick?" },
      {
        type: "ul",
        items: [
          "Light — only oversized images are optimized. The result is visually lossless, with savings around 10–30%. Use it for print-ready documents and files that must stay pixel-perfect",
          "Standard — images are recompressed and metadata is removed. Expect 50–70% smaller files that still look sharp on screens and typical office printers. This is the right default for most documents",
          "Maximum — the most aggressive setting. Savings reach 70–90%, with quality loss visible when you zoom in. Perfect for previews, email attachments, and anything that just needs to be readable",
        ],
      },
      {
        type: "p",
        text: "Rule of thumb: compress for the destination. If the PDF ends its life on a screen, Maximum is usually fine. If it will be printed professionally or archived long-term, stay on Light.",
      },
      { type: "h2", text: "When compression hurts (and how to avoid it)" },
      {
        type: "ul",
        items: [
          "Print-shop documents — professional printers want 300 DPI images. Use Light, or skip compression entirely",
          "Fine-detail scans — X-rays, architectural drawings, and dense spreadsheets degrade first. Inspect the result at 100% zoom before sending",
          "Already-optimized files — if a file is mostly text or was compressed before, another pass saves little and costs quality",
          "Documents that must stay searchable — keep text layers intact by staying on Light or Standard, and verify you can still select text in the result",
        ],
      },
      { type: "h2", text: "How small should your PDF be?" },
      {
        type: "ul",
        items: [
          "Email attachments — under 10MB is the safe zone (Gmail allows 25MB, but corporate mail servers often cut off at 5–10MB)",
          "Website downloads — under 3–5MB so pages stay fast on mobile connections",
          "Application portals (jobs, visas, universities) — many enforce 1–2MB limits, so Maximum compression is usually required",
          "Archives and legal records — prioritize fidelity over size; use Light",
        ],
      },
      {
        type: "cta",
        toolSlug: "pdf-compressor",
        text: "Compress your first PDF free — no signup, files never leave your browser",
      },
      { type: "h2", text: "Quick troubleshooting" },
      {
        type: "ul",
        items: [
          "The file barely shrank — it was probably mostly text or already compressed. Check whether the bulk is images; if not, there's little to gain",
          "Text looks fuzzy after Maximum — re-run at Standard, which keeps text edges clean while still cutting the size substantially",
          "The compressed file opens slowly — very large page counts take a moment to render in older viewers. Try opening it in your browser instead",
          "A form stopped working — interactive fields can't always survive heavy compression. Compress a copy and keep the original for filling",
        ],
      },
      {
        type: "p",
        text: "Want the complete walkthrough with advanced options explained? Read the full PDF Compressor guide, or jump straight in — the whole process takes under a minute for most documents.",
      },
    ],
    relatedTools: ["pdf-compressor", "pdf-merger", "pdf-splitter"],
    relatedGuides: ["pdf-compressor"],
  },
  {
    slug: "social-media-image-sizes-2026",
    title: "Social Media Image Sizes in 2026: The Complete Cheat Sheet",
    description:
      "Exact image dimensions for Instagram, Facebook, X, LinkedIn, YouTube, Pinterest, and TikTok — plus how to resize any photo correctly in 30 seconds so nothing gets cropped or blurred.",
    date: "2026-10-14",
    category: "Social Media",
    readTime: "9 min read",
    keywords: [
      "social media image sizes",
      "instagram image size",
      "youtube thumbnail size",
      "linkedin banner size",
      "facebook post size",
      "resize image for social media",
    ],
    intro: [
      "Whether you're posting a product photo on Instagram, uploading a YouTube thumbnail, or refreshing a LinkedIn banner, one rule beats every filter and crop tool: create the image at the size the platform expects. Upload the wrong dimensions and the platform will crop, stretch, or compress your image for you — usually badly.",
      "This cheat sheet covers the sizes that matter in 2026, explains aspect ratios in plain language, and shows how to resize any image correctly in about 30 seconds.",
    ],
    blocks: [
      { type: "h2", text: "The 2026 social media image size cheat sheet" },
      {
        type: "ul",
        items: [
          "Instagram — Square post: 1080 × 1080 (1:1)",
          "Instagram — Portrait post: 1080 × 1350 (4:5) — the tallest size that keeps its full height in the feed",
          "Instagram — Stories & Reels: 1080 × 1920 (9:16)",
          "Facebook — Feed post: 1200 × 630 for links, 1080 × 1080 for photo posts",
          "Facebook — Cover photo: 820 × 312",
          "X (Twitter) — In-stream image: 1600 × 900 (16:9)",
          "LinkedIn — Feed image: 1200 × 627",
          "LinkedIn — Profile banner: 1584 × 396",
          "YouTube — Thumbnail: 1280 × 720 (16:9)",
          "YouTube — Channel banner: 2048 × 1152 (keep text and logos inside the central 1235 × 338 safe area)",
          "Pinterest — Standard pin: 1000 × 1500 (2:3)",
          "TikTok — Video cover: 1080 × 1920 (9:16)",
        ],
      },
      { type: "h2", text: "Aspect ratios, explained simply" },
      {
        type: "p",
        text: "An aspect ratio is just width : height. 1:1 is a square, 16:9 is a widescreen rectangle, 9:16 is a phone screen standing upright. Platforms display images in specific ratios — when your upload doesn't match, the platform crops from the edges at best, and stretches the image at worst.",
      },
      {
        type: "p",
        text: "Two habits keep you out of trouble. First, match the platform's ratio when you export. Second, keep important content away from the edges — Stories and Reels cover roughly the top 250 and bottom 340 pixels with interface elements, so center your subject and keep text in the middle band.",
      },
      { type: "h2", text: "DPI doesn't matter for social media (resolution does)" },
      {
        type: "p",
        text: "The classic 72 vs 300 DPI debate is a print-world relic. Screens only care about pixel dimensions: a 1080 × 1080 image is identical on Instagram whether it's tagged 72, 150, or 300 DPI. What genuinely matters is having enough pixels — upload at the native size, and avoid upscaling small images. Enlarging a 600px image to 1080px produces visible blur, and every platform re-compresses your upload anyway, so a correctly sized JPG almost always looks better than a giant one.",
      },
      { type: "h2", text: "How to resize an image in 30 seconds" },
      {
        type: "ol",
        items: [
          "Find your target size in the cheat sheet above",
          "Open the free Image Resizer in your browser",
          "Drag in your photo or graphic — files stay on your device and are never uploaded",
          "Enter the target width and height, or lock the aspect ratio and change just one side",
          "Keep the aspect-ratio lock on for photos and profile pictures to avoid stretching",
          "Download the resized image — as JPG for photos, PNG if you need transparency",
        ],
      },
      {
        type: "tip",
        text: "Working through a content calendar? Export in batches by platform: one 1080 × 1350 version for the Instagram feed, one 1080 × 1920 cut for Stories, and reuse the same width everywhere to stay visually consistent.",
      },
      { type: "h2", text: "Pick the right format too" },
      {
        type: "p",
        text: "Getting the size right gets you past the crop, but the file format decides how your image looks and how heavy it is.",
      },
      {
        type: "ul",
        items: [
          "JPG — best for photos: small files, universal support, no transparency",
          "PNG — best for logos, screenshots, and graphics with text: crisp edges and transparency support, but much larger files",
          "WebP — the modern all-rounder: typically 25–50% smaller than JPG at the same quality, supported by all major browsers and platforms",
        ],
      },
      {
        type: "p",
        text: "If your image is in the wrong format, our Image Format Converter switches between JPG, PNG, and WebP in one click.",
      },
      { type: "h2", text: "The five mistakes that give away an amateur post" },
      {
        type: "ul",
        items: [
          "Uploading a 4000px original — the platform re-compresses it anyway, sometimes softening the result. Pre-size it yourself for full control",
          "Stretching to fit — if your image doesn't match the ratio, crop it. Never let it distort",
          "Text in the danger zones — Stories and Reels overlay buttons on the top and bottom. Keep text centered",
          "Upscaling small images — enlarging beyond the original pixels always shows. Shoot or export large enough to begin with",
          "Forgetting YouTube's banner safe area — you see the full 2048 × 1152 upload in Studio, but phones and TVs crop to the center. Keep your channel name and schedule visible in the middle",
        ],
      },
      {
        type: "cta",
        toolSlug: "image-resizer",
        text: "Resize an image for any platform — free, in your browser",
      },
      {
        type: "cta",
        toolSlug: "image-format-converter",
        text: "Need JPG, PNG, or WebP instead? Convert it in one click",
      },
      {
        type: "p",
        text: "Sizes change slowly but they do change — if a platform redesigns, re-check its help center before a big campaign. For everything else, save this cheat sheet and you'll never upload an 8MB PNG to Instagram again.",
      },
    ],
    relatedTools: ["image-resizer", "image-format-converter", "image-grid-maker"],
    relatedGuides: ["image-resizer"],
  },
];
