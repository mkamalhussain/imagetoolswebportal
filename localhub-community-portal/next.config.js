/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // For Vercel compatibility
  },
  // Enable API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb', // For file uploads
    },
  },
  // Environment variables
  env: {
    DATABASE_PATH: process.env.DATABASE_PATH || './localhub.db',
  },
}

module.exports = nextConfig

