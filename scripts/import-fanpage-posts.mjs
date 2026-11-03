/**
 * Imports fanpage posts (rewritten to the SEO standard) into Sanity as blogPost
 * documents, uploading their images. Re-runnable: each post has a stable _id
 * (blogPost-fb-<slug>), so running again updates instead of duplicating.
 *
 * Input: content/fanpage-posts/posts.json — array of
 *   { slug, publishedAt, sourceUrl, category, tags[], focusKeyword,
 *     title, seoTitle, seoDescription, excerpt,
 *     cover: { file | url, alt },
 *     body: string[]   // "## H2", "### H3", "- bullet", "![alt](file-or-url)", paragraph; **bold** inline
 *   }
 * Images: file paths are relative to content/fanpage-posts/images/.
 *
 * Every post must pass the SEO checks in docs/seo-content-standard.md first.
 *   node --env-file=.env.local scripts/import-fanpage-posts.mjs --dry-run   # checks only
 *   node --env-file=.env.local scripts/import-fanpage-posts.mjs             # checks + import
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "content", "fanpage-posts");
const DRY = process.argv.includes("--dry-run");

const CATEGORIES = ["he-thong", "van-hanh", "noi-dung", "thuong-hieu", "khach-hang"];

let keyCounter = 0;
const key = () => `k${++keyCounter}${Math.random().toString(36).slice(2, 8)}`;
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const plain = (s) => s.replace(/\*\*/g, "");
const fold = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

/** "text with **bold** and [links](/vi/dich-vu)" → Portable Text spans + link markDefs. */
function spans(text) {
  const markDefs = [];
  const children = text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
    .filter(Boolean)
    .map((part) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const _key = key();
        markDefs.push({ _type: "link", _key, href: link[2] });
        return { _type: "span", _key: key(), text: link[1], marks: [_key] };
      }
      const bold = part.startsWith("**") && part.endsWith("**");
      return { _type: "span", _key: key(), text: bold ? part.slice(2, -2) : part, marks: bold ? ["strong"] : [] };
    });
  return { markDefs, children };
}
const block = (text, style = "normal", listItem) => ({
  _type: "block",
  _key: key(),
  style,
  ...(listItem ? { listItem, level: 1 } : {}),
  ...spans(text),
});
const internalLinks = (p) => p.body.join(" ").match(/\]\(\/(vi|en)\/[^)]*\)/g)?.length ?? 0;

// ── SEO standard (docs/seo-content-standard.md) ──────────────────────────
function checkPost(p) {
  const errs = [];
  const kw = (p.focusKeyword || "").trim();
  const paragraphs = p.body.filter((l) => !/^(#|-|!\[)/.test(l));
  const text = p.body.map((l) => plain(l).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")).join(" ");
  if (internalLinks(p) < 2) errs.push(`need ≥ 2 internal links like [Dịch vụ](/vi/dich-vu) (has ${internalLinks(p)})`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errs.push("slug must be lowercase ASCII words joined by '-'");
  if (p.slug.split("-").length > 8) errs.push("slug longer than 8 words");
  if (!kw) errs.push("focusKeyword missing");
  const kwSlug = fold(kw).replace(/[^a-z0-9]+/g, "-");
  if (kw && !kwSlug.split("-").filter((w) => w.length > 2).every((w) => p.slug.includes(w)))
    errs.push(`slug should contain the focus keyword words (${kwSlug})`);
  if (!p.title || p.title.length > 90) errs.push("title (H1) missing or > 90 chars");
  if (!p.seoTitle || p.seoTitle.length > 60) errs.push(`seoTitle must be 1–60 chars (has ${p.seoTitle?.length ?? 0})`);
  if (kw && !fold(p.seoTitle || "").includes(fold(kw))) errs.push("seoTitle must contain the focus keyword");
  const d = p.seoDescription?.length ?? 0;
  if (d < 120 || d > 160) errs.push(`seoDescription must be 120–160 chars (has ${d})`);
  if (kw && !fold(p.seoDescription || "").includes(fold(kw))) errs.push("seoDescription must contain the focus keyword");
  if (!p.excerpt || p.excerpt.length < 80) errs.push("excerpt (sapo) must be ≥ 80 chars");
  if (kw && paragraphs[0] && !fold(paragraphs[0]).includes(fold(kw))) errs.push("first paragraph must contain the focus keyword");
  if (p.body.filter((l) => l.startsWith("## ")).length < 2) errs.push("need ≥ 2 H2 sections");
  if (words(text) < 300) errs.push(`body must be ≥ 300 words (has ${words(text)})`);
  if (paragraphs.some((l) => words(plain(l)) > 90)) errs.push("a paragraph is > 90 words — split it");
  if (!p.cover?.alt || p.cover.alt.length < 10) errs.push("cover.alt missing/too short");
  if (!p.cover?.file && !p.cover?.url) errs.push("cover image missing");
  for (const l of p.body) if (l.startsWith("![") && !/^!\[[^\]]{10,}\]\(.+\)$/.test(l)) errs.push(`inline image needs alt ≥ 10 chars: ${l.slice(0, 40)}`);
  if (!CATEGORIES.includes(p.category)) errs.push(`category must be one of ${CATEGORIES.join(", ")}`);
  if (!Array.isArray(p.tags) || p.tags.length < 2 || p.tags.length > 6) errs.push("tags: 2–6 required");
  if (!/^https:\/\/(www\.)?facebook\.com\//.test(p.sourceUrl || "")) errs.push("sourceUrl must be the fanpage post URL");
  if (Number.isNaN(Date.parse(p.publishedAt))) errs.push("publishedAt must be an ISO date");
  return errs;
}

async function loadImage(ref) {
  if (/^https?:\/\//.test(ref)) {
    const r = await fetch(ref);
    if (!r.ok) throw new Error(`download failed ${r.status}: ${ref}`);
    return { buffer: Buffer.from(await r.arrayBuffer()), filename: path.basename(new URL(ref).pathname) || "image.jpg" };
  }
  return { buffer: await readFile(path.join(ROOT, "images", ref)), filename: path.basename(ref) };
}

const posts = JSON.parse(await readFile(path.join(ROOT, "posts.json"), "utf8"));
let failed = 0;
for (const p of posts) {
  const errs = checkPost(p);
  if (errs.length) {
    failed++;
    console.error(`✗ ${p.slug}\n  - ${errs.join("\n  - ")}`);
  } else console.log(`✓ ${p.slug}  (${words(p.body.map(plain).join(" "))} words)`);
}
if (failed) {
  console.error(`\n${failed}/${posts.length} posts fail the SEO standard — nothing imported.`);
  process.exit(1);
}
if (DRY) {
  console.log(`\nDry run: all ${posts.length} posts pass the SEO standard.`);
  process.exit(0);
}

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN } = process.env;
if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local.");
  process.exit(1);
}
const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-06-01",
  token: SANITY_API_TOKEN,
  useCdn: false,
});

async function uploadImage(ref, alt) {
  const { buffer, filename } = await loadImage(ref);
  const asset = await client.assets.upload("image", buffer, { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: { vi: alt, en: alt } };
}

for (const p of posts) {
  const body = [];
  for (const line of p.body) {
    const img = line.match(/^!\[([^\]]+)\]\((.+)\)$/);
    if (img) body.push({ _key: key(), ...(await uploadImage(img[2], img[1])), caption: img[1] });
    else if (line.startsWith("### ")) body.push(block(line.slice(4), "h3"));
    else if (line.startsWith("## ")) body.push(block(line.slice(3), "h2"));
    else if (line.startsWith("- ")) body.push(block(line.slice(2), "normal", "bullet"));
    else body.push(block(line));
  }
  const doc = {
    _id: `blogPost-fb-${p.slug}`,
    _type: "blogPost",
    title: { vi: p.title, en: p.titleEn || p.title },
    slug: { _type: "slug", current: p.slug },
    excerpt: { vi: p.excerpt, en: p.excerptEn || p.excerpt },
    body: { vi: body },
    coverImage: await uploadImage(p.cover.file || p.cover.url, p.cover.alt),
    publishedAt: p.publishedAt,
    author: p.author || "Tăng Trí Đức",
    category: p.category,
    tags: p.tags,
    sourceUrl: p.sourceUrl,
    seoTitle: { vi: p.seoTitle },
    seoDescription: { vi: p.seoDescription },
    focusKeyword: p.focusKeyword,
  };
  const res = await client.createOrReplace(doc);
  console.log(`↑ ${res._id}`);
}
console.log(`\nImported ${posts.length} posts.`);
