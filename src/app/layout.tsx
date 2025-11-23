import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import AdSense from "@/components/AdSense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Tools Web Portal",
  description: "Centralized portal for image-related web modules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 text-gray-900 dark:text-gray-100`}>        
        <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-b">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold">Image Tools Web Portal</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <a href="#modules" className="hover:text-blue-600">Modules</a>
              <a href="#sponsored" className="hover:text-blue-600">Sponsored</a>
              <ThemeToggle className="ml-2" />
            </nav>
          </div>
        </header>

        {/* Sponsored section moved directly below the header to keep it above the fold */}
        <section id="sponsored" className="max-w-6xl mx-auto w-full px-6 py-2 border-b">
          <h2 className="text-lg font-medium mb-1">Sponsored</h2>
          <div className="card p-1">
            <AdSense className="w-full" style={{ display: 'block', minHeight: 60 }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Configure AdSense via NEXT_PUBLIC_ADS_CLIENT and NEXT_PUBLIC_ADS_SLOT.</p>
        </section>

        <div className="max-w-6xl mx-auto w-full px-6 py-6">
          {children}
        </div>


        <footer className="border-t mt-8">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-600 dark:text-gray-400">
            <div>© {new Date().getFullYear()} Image Tools Web Portal</div>
            <div className="mt-1">A curated set of browser-based image utilities.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
