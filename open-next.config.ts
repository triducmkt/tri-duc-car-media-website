import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve pages prerendered at build time straight from Workers static assets.
// Without an incremental cache every request re-rendered the page inside the
// Worker (x-nextjs-cache: MISS), which blew the free plan's CPU limit and
// returned Cloudflare error 1102 (see hq/lesson.md ERR-WEB-006).
// The site has no ISR: content changes ship with a new deploy, so a read-only
// cache is enough. `opennextjs-cloudflare deploy` copies the cache into assets.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
