import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* Cloudflare Pages specific optimizations */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
