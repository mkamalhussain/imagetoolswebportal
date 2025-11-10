import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensures optimal compatibility; safe defaults for Vercel
  },
};

export default nextConfig;
