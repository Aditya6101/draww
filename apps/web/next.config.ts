import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow WebSocket connections and Yjs binary data
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Enable turbopack since Next.js 16 uses it by default
  turbopack: {},
};

export default nextConfig;
