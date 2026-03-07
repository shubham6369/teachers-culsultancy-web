import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Recommended for some Cloudflare setups if using static-like exports or remote images.
  }
};

export default nextConfig;
