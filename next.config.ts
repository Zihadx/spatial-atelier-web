import type { NextConfig } from "next";
// Relative import on purpose: validates the environment when the config loads, so a bad production
// environment (e.g. missing NEXT_PUBLIC_SITE_URL) fails `next build` / `next start` instead of shipping wrong URLs.
import { getEnv } from "./src/env";

const env = getEnv();
const isProd = env.NODE_ENV === "production";

/**
 * Content-Security-Policy. 'unsafe-inline' scripts are required by Next's inline bootstrap; a nonce-based policy would
 * force every page to render dynamically (see ARCHITECTURE.md → Security). 'wasm-unsafe-eval' is needed by the
 * meshopt decoder used for the compressed 3D models; blob: is how glTF textures are decoded.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' blob:${isProd ? "" : " ws: wss:"}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"], qualities: [72, 75] },
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
        ],
      },
      { source: "/:dir(textures|models|images|fonts)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      // Frame sequences are requested with ?v=<content hash> (see lib/image-sequence.ts), so they can be cached forever.
      { source: "/:dir(hero|process)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
