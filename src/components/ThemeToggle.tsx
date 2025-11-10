"use client";
import React, { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("theme-mode") as ThemeMode) || "system";
    setMode(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (m: ThemeMode) => {
    const root = document.documentElement;
    if (m === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", m);
    }
    localStorage.setItem("theme-mode", m);
  };

  const setAndApply = (m: ThemeMode) => {
    setMode(m);
    applyTheme(m);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}> 
      <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
      <div className="inline-flex rounded border overflow-hidden">
        <button
          className={`px-2 py-1 text-sm ${mode === "system" ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-800"}`}
          onClick={() => setAndApply("system")}
          title="Follow system preference"
        >
          System
        </button>
        <button
          className={`px-2 py-1 text-sm ${mode === "light" ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-800"}`}
          onClick={() => setAndApply("light")}
          title="Force light mode"
        >
          Light
        </button>
        <button
          className={`px-2 py-1 text-sm ${mode === "dark" ? "bg-blue-600 text-white" : "bg-white dark:bg-neutral-800"}`}
          onClick={() => setAndApply("dark")}
          title="Force dark mode"
        >
          Dark
        </button>
      </div>
    </div>
  );
}