import type { NextConfig } from "next";

/**
 * Base URL of the FastAPI backend. Resolution order:
 *   1. BACKEND_URL env var (set in .env.local for dev, or Vercel project settings)
 *   2. localhost:8000 in dev, the deployed backend in production
 * Any trailing slash is stripped so rewrites don't produce "//api/...".
 */

// const backendUrl = "http://localhost:8000"
const rawBackendUrl =
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://mindful-coach-challenge.vercel.app");

const backendUrl = rawBackendUrl.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /**
   * Proxy /api/* and /health to the FastAPI backend (same-origin from the
   * browser, so no CORS). Local dev hits localhost:8000; prod hits the
   * deployed backend.
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
