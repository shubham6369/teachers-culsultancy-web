import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /* Cloudflare Pages specific optimizations */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
