import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /** Replace files under `public/` without stale optimized cache. */
    minimumCacheTTL: 0,
    /**
     * Next.js 16: local `Image` src with a query string must match `localPatterns`.
     * We append `?t=<mtime>` in code for `/images/*` cache bust; omit `search` to allow any query on these paths.
     */
    localPatterns: [{ pathname: "/images/**" }],
  },
};

export default nextConfig;
