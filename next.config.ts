import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  /**
   * `npm run build` writes to the standard `.next` — required by Netlify's
   * (and most hosts') Next.js build plugin, which looks there specifically.
   *
   * `npm run build:local` sets NEXT_DIST_DIR=.next-build instead, so you can
   * sanity-check a production build on your machine WITHOUT clobbering a
   * `next dev` server that's running at the same time (both would otherwise
   * fight over `.next` — dev 500s with "Cannot find module './NNN.js'" and
   * its stylesheet 404s). Only use build:local for that manual check; real
   * deploys must go through the plain `build`/`start` scripts.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Long-cache immutable static assets (videos, fonts, placeholders)
        source: "/:path*.(webm|mp4|woff2|svg|png|jpg|avif|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
