"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie-consent");
      if (consent !== "accepted") {
        setShow(true);
      }
    } catch {
      // Ignore storage errors (e.g., private mode, blocked cookies).
      setShow(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("cookie-consent", "accepted");
    } catch {
      // Ignored.
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-gray-900/95 border-t border-gray-200/60 dark:border-gray-800/60 backdrop-blur-md shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
          This site uses cookies for analytics and advertising (via Google AdSense). By using our tools, you agree to our{" "}
          <Link href="/privacy" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
            Privacy Policy
          </Link>
          . You can manage preferences at any time.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href="/privacy"
            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            Learn more
          </Link>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            aria-label="Accept cookie use"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
