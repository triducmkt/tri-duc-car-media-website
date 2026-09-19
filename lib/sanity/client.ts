import { createClient } from "next-sanity";

// Fallback to the real project/dataset if the NEXT_PUBLIC_SANITY_* build-time
// env vars aren't set in the deploy environment. These aren't secrets — the
// project ID and dataset name are always inlined into the public client
// bundle anyway — so a hardcoded fallback here is safe and keeps the site
// working even if a GitHub Actions secret is missing.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0lzmbuzo";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-06-01";

export const isSanityConfigured = Boolean(projectId);

export const sanityClient = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
