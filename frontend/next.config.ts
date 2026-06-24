import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  /**
   * In local dev, proxy /api/* to the FastAPI server on port 8000.
   * On Vercel, vercel.json routes /api/* to api/index.py instead.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/`,
      },
    ];
  },
};

export default nextConfig;
