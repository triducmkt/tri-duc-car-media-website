import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Low-RAM machines can cap build workers: NEXT_BUILD_CPUS=2 npm run build.
  // Unset (CI) keeps Next's default.
  experimental: {
    ...(process.env.NEXT_BUILD_CPUS ? { cpus: Number(process.env.NEXT_BUILD_CPUS) } : {}),
    // OpenNext's cache interceptor (@opennextjs/aws 4.1) only serves per-segment
    // prefetch data when inlining is OFF; with Next 16's default (on) it answers
    // every segment request with the full page RSC and the client re-requests
    // in a loop (hq/lesson.md ERR-WEB-009).
    prefetchInlining: false,
  },
  images: {
    // Sanity's urlForImage() already serves pre-resized images via query
    // params, and Cloudflare's own image optimizer needs a paid Images
    // binding — so the built-in Next.js optimizer is skipped entirely.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

// Enables `wrangler`-backed local bindings (env vars, etc.) when running
// `next dev`, so local dev matches the Cloudflare Pages runtime. Next's
// config loader transpiles this file down to CommonJS, which can't use
// top-level await, so this stays a fire-and-forget promise chain instead.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
    initOpenNextCloudflareForDev(),
  );
}
