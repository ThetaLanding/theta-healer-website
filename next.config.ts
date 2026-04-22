import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
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
