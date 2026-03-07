import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enabled for static drag-and-drop deployment
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
