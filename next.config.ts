import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
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
