import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// Deployed standalone via `npx sanity deploy` (not embedded in the Next.js
// app) — Cloudflare Workers' 3 MiB free-tier size limit can't fit Sanity
// Studio's UI bundle alongside the site itself.
export default defineConfig({
  name: "tri-duc-car-media",
  title: "Trí Đức Car Media",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
