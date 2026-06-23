import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export', // Generates a static HTML/CSS/JS export
  basePath: isProd ? '/your-repo-name' : '', // Replace with your exact repository name
  images: {
    unoptimized: true, // Required because Next.js image optimization requires a server
  },
};

export default nextConfig;