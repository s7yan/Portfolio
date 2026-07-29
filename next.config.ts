import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  /**
   * Production builds write to `.next-build` (set by the npm scripts) while
   * `next dev` keeps `.next`. Without this, running `npm run build` while the
   * dev server is up clobbers its chunks mid-flight and the running app 500s
   * with "Cannot find module './NNN.js'" and 404s its stylesheet.
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
