#!/usr/bin/env node
// Lockup QC loop — rules V1–V10 in docs/DESIGN-CORE-RULES.md.
// Reads every lockup's copy (messages/*.json + lib/servicesCatalog.ts), measures
// it with the real font files (scripts/fonts, same fonts the site loads) and:
//   1. computes accentScale so the accent's TALLEST stroke = 0.30 × anchor cap
//      height (V1; diacritics excluded — they are marks, not strokes),
//   2. computes the anchor's width in em, so the site fits it on ONE line
//      (V8) at the largest size the container allows,
//   3. writes both to lib/lockupMetrics.json (read by components/Lockup.tsx),
//   4. fails when a rule cannot be met → REWRITE THE COPY (V9 QC loop), run again.
// Usage: npm run lockup:qc
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const opentype = require("opentype.js");

// ── rule constants (keep in sync with docs/DESIGN-CORE-RULES.md + Lockup.tsx) ──
export const TALLEST_RATIO = 0.3; // V1: accent tallest stroke ÷ anchor cap height
const TRACKING = 0.03; // anchor letter-spacing, em
const LINE_HEIGHT = 1.18; // anchor line-height (V4)
const FIT_SAFETY = 0.97; // CSS uses the same factor (rounding, kerning drift)
const MIN_SCRIPT_PX = 12; // V10: smallest accent font-size allowed (phone)
const SINGLE_LINE_SHARE = 0.9; // V8
// Size classes: max anchor px, and the text column each lockup sits in.
const SIZES = { hero: 96, page: 72, title: 64, section: 64 };
const COLUMN = {
  hero: { desktop: 576, phone: 358 },
  section: { desktop: 672, phone: 342 },
  page: { desktop: 600, phone: 342 },
  title: { desktop: 640, phone: 342 },
};

const anchorFont = opentype.loadSync(path.join(root, "scripts/fonts/PlayfairDisplay-Black.ttf"));
const accentFont = opentype.loadSync(path.join(root, "scripts/fonts/GreatVibes-Regular.ttf"));
const CAP = anchorFont.tables.os2.sCapHeight / anchorFont.unitsPerEm;

const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
function widthEm(font, text, tracking = 0) {
  const glyphs = font.stringToGlyphs(text);
  let w = 0;
  glyphs.forEach((g, i) => {
    w += g.advanceWidth;
    if (i < glyphs.length - 1) w += font.getKerningValue(g, glyphs[i + 1]) + tracking * font.unitsPerEm;
  });
  return w / font.unitsPerEm;
}
function tallestEm(font, text) {
  let top = 0;
  for (const ch of strip(text)) {
    if (/\s/.test(ch)) continue;
    const bb = font.charToGlyph(ch).getBoundingBox();
    top = Math.max(top, bb.y2);
  }
  return top / font.unitsPerEm;
}

// ── collect copy ──────────────────────────────────────────────────────────
const msg = { vi: JSON.parse(fs.readFileSync(path.join(root, "messages/vi.json"), "utf8")), en: JSON.parse(fs.readFileSync(path.join(root, "messages/en.json"), "utf8")) };
const catalog = fs.readFileSync(path.join(root, "lib/servicesCatalog.ts"), "utf8");
const pick = (re) => [...catalog.matchAll(re)].map((m) => ({ vi: m[1], en: m[2] }));
const svcAccent = pick(/\baccent: \{ vi: "([^"]*)", en: "([^"]*)" \}/g);
const svcAnchor = pick(/\blockupAnchor: \{ vi: "([^"]*)", en: "([^"]*)" \}/g);

const items = [];
for (const l of ["vi", "en"]) {
  const h = msg[l].home, o = msg[l].systemHero.open, a = msg[l].about;
  items.push({ where: `${l} hero`, size: "hero", accent: o.accent, anchor: o.lockupAnchor ?? o.title });
  items.push({ where: `${l} home 5 trụ cột`, size: "section", accent: h.servicesAccent, anchor: h.servicesAnchor });
  items.push({ where: `${l} home người đồng hành`, size: "section", accent: h.founderAccent, anchor: h.founderAnchor });
  items.push({ where: `${l} home CTA`, size: "section", accent: h.ctaBannerAccent, anchor: h.ctaBannerAnchor });
  items.push({ where: `${l} về founder`, size: "page", accent: a.nameAccent, anchor: a.name });
  svcAnchor.forEach((an, i) => items.push({ where: `${l} dịch vụ ${i + 1}`, size: "title", accent: svcAccent[i][l], anchor: an[l] }));
}

// ── measure ───────────────────────────────────────────────────────────────
const metrics = { tallestRatio: TALLEST_RATIO, fitSafety: FIT_SAFETY, anchors: {}, accents: {} };
const rows = [];
let fails = 0, instances = 0, single = 0;
for (const it of items) {
  const lines = it.anchor.toUpperCase().split("\n");
  const anchorEm = Math.max(...lines.map((ln) => widthEm(anchorFont, ln, TRACKING)));
  const tall = tallestEm(accentFont, it.accent);
  // V1: 0.30 × cap height. V1b: anchor on 2+ lines → 0.30 × the whole anchor
  // block (cap of line 1 to baseline of the last line = cap + (n-1) × leading).
  const block = CAP + (lines.length - 1) * LINE_HEIGHT;
  const scale = (TALLEST_RATIO * block) / tall;
  const accentEm = widthEm(accentFont, it.accent) * scale;
  metrics.anchors[it.anchor.toUpperCase()] = +anchorEm.toFixed(4);
  metrics.accents[`${it.accent}||${it.anchor.toUpperCase()}`] = { scale: +scale.toFixed(4), em: +accentEm.toFixed(4) };
  const problems = [];
  const px = {};
  for (const dev of ["desktop", "phone"]) {
    const S = Math.min(SIZES[it.size], (COLUMN[it.size][dev] / anchorEm) * FIT_SAFETY);
    px[dev] = S;
    instances++;
    if (lines.length === 1) single++;
    if (dev === "phone" && S * scale < MIN_SCRIPT_PX) problems.push(`V10 thư pháp ${(S * scale).toFixed(1)}px < ${MIN_SCRIPT_PX}px`);
  }
  if (accentEm > anchorEm) problems.push("V2 thư pháp rộng hơn dòng chính");
  if (it.accent.trim().split(/\s+/).length > 5) problems.push("V4 thư pháp > 5 chữ");
  if (problems.length) fails++;
  rows.push({
    where: it.where,
    lockup: `${it.accent} / ${it.anchor.replace("\n", " ⏎ ")}`.slice(0, 54),
    lines: lines.length,
    "anchor px (máy tính/đt)": `${px.desktop.toFixed(0)}/${px.phone.toFixed(0)}`,
    "thư pháp px đt": (px.phone * scale).toFixed(1),
    scale: scale.toFixed(3),
    ok: problems.length ? "✗ " + problems.join("; ") : "✓",
  });
}
const share = single / instances;
fs.writeFileSync(path.join(root, "lib/lockupMetrics.json"), JSON.stringify(metrics, null, 2) + "\n");
console.log(`\nLockup QC — V1 nét cao nhất thư pháp = ${TALLEST_RATIO} × chữ in hoa (cap ${CAP.toFixed(3)}em) · V8 một dòng ≥ ${SINGLE_LINE_SHARE * 100}% · V10 thư pháp ≥ ${MIN_SCRIPT_PX}px trên điện thoại\n`);
console.table(rows);
console.log(`Một dòng: ${single}/${instances} (${(share * 100).toFixed(0)}%) — cần ≥ ${SINGLE_LINE_SHARE * 100}%`);
if (share < SINGLE_LINE_SHARE) fails++;
console.log("Đã ghi lib/lockupMetrics.json");
if (fails) {
  console.error(`✗ Chưa đạt — viết lại câu (cả 2 giọng) rồi chạy lại (V9).`);
  process.exit(1);
}
console.log("✓ Mọi lockup đạt core rules.");
