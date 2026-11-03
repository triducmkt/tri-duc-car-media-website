#!/usr/bin/env node
// Font audit — run `npm run fonts:check` before/after any UI work.
// 1. lib/fonts.ts: every Google loader has the `vietnamese` subset, a role
//    variable (--tdcm-font-body|display|serif), weights that exist, and a
//    matching FONT_ROLES row.
// 2. app/, components/, lib/: no next/font imports elsewhere, no hard-coded
//    family names, no legacy variables, no font-family outside the roles.
// Exits 1 on any violation. Rules: docs/font-system.md.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const fontData = require("next/dist/compiled/@next/font/dist/google/font-data.json");
const families = new Set(Object.keys(fontData));

const MASTER = path.join(root, "lib", "fonts.ts");
const ALLOWED_FILES = new Set([MASTER, path.join(root, "lib", "fontStack.ts")]);
const LEGACY_VARS = ["--font-inter", "--font-be-vietnam-pro", "--font-playfair", "--td-sans", "--td-serif"];
const ROLE_VAR = /^--tdcm-font-(body|display|serif)$/;
const errors = [];
const rel = (f) => path.relative(root, f).replaceAll("\\", "/");

// ── 1. Master file ────────────────────────────────────────────────────────
const master = fs.readFileSync(MASTER, "utf8");
const importMatch = master.match(/import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/);
const loaders = importMatch ? importMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
if (!loaders.length) errors.push("lib/fonts.ts: no next/font/google loaders found");

const rows = [];
// Every loader call (one family may serve several roles, e.g. body + display).
const calls = loaders.flatMap((loader) => {
  const found = [...master.matchAll(new RegExp(`\\b${loader}\\(\\{([\\s\\S]*?)\\}\\)`, "g"))];
  if (!found.length) errors.push(`lib/fonts.ts: ${loader} imported but never called`);
  return found.map((m) => ({ loader, body: m[1] }));
});
const seenRoles = new Set();
for (const { loader, body } of calls) {
  const family = loader.replaceAll("_", " ");
  const variable = body.match(/variable:\s*["']([^"']+)["']/)?.[1] ?? "";
  const subsets = [...(body.match(/subsets:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  const weights = [...(body.match(/weight:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  const data = fontData[family];
  if (!data) errors.push(`lib/fonts.ts: "${family}" is not a Google font known to next/font`);
  if (!subsets.includes("vietnamese")) errors.push(`lib/fonts.ts: ${family} must load the "vietnamese" subset`);
  if (data && !data.subsets.includes("vietnamese")) errors.push(`lib/fonts.ts: ${family} has no Vietnamese glyphs on Google Fonts`);
  if (!ROLE_VAR.test(variable)) errors.push(`lib/fonts.ts: ${family} variable "${variable}" must be --tdcm-font-body|display|serif`);
  for (const w of weights) if (data && !data.weights.includes(w)) errors.push(`lib/fonts.ts: ${family} has no weight ${w}`);
  const axes = [...(body.match(/axes:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
  if (axes.length && weights.length && !weights.includes("variable"))
    errors.push(`lib/fonts.ts: ${family} sets axes but also fixed weights — next/font only allows axes on variable fonts (drop \`weight\`)`);
  for (const a of axes) if (data && !(data.axes ?? []).some((x) => x.tag === a)) errors.push(`lib/fonts.ts: ${family} has no "${a}" axis`);
  if (!weights.length && data && !data.weights.includes("variable")) errors.push(`lib/fonts.ts: ${family} is not variable — list its weights`);
  const role = variable.replace("--tdcm-font-", "");
  if (seenRoles.has(role)) errors.push(`lib/fonts.ts: role "${role}" is loaded twice`);
  seenRoles.add(role);
  if (!new RegExp(`${role}:\\s*\\{[\\s\\S]*?family:\\s*["']${family}["']`).test(master))
    errors.push(`lib/fonts.ts: FONT_ROLES.${role}.family must be "${family}"`);
  rows.push({
    role,
    family,
    variable,
    weights: weights.length ? weights.join(" ") : "variable",
    axes: axes.join(" ") || "-",
    vietnamese: subsets.includes("vietnamese") ? "yes" : "NO",
  });
}

for (const role of ["body", "display", "serif"])
  if (!seenRoles.has(role)) errors.push(`lib/fonts.ts: no loader defines --tdcm-font-${role}`);

// ── 2. Codebase scan ──────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|mjs|js)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = ["app", "components", "lib"].flatMap((d) => walk(path.join(root, d)));
for (const file of files) {
  if (ALLOWED_FILES.has(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const at = `${rel(file)}:${i + 1}`;
    if (/from\s+["']next\/font/.test(line)) errors.push(`${at} imports next/font — add the font to lib/fonts.ts instead`);
    for (const v of LEGACY_VARS) if (line.includes(v)) errors.push(`${at} uses legacy variable ${v} — use var(--tdcm-font-*) or a font-* class`);
    for (const m of line.matchAll(/["']([A-Z][A-Za-z0-9 ]{2,40})["']/g))
      if (families.has(m[1]) && !["Georgia"].includes(m[1])) errors.push(`${at} hard-codes the family "${m[1]}" — use a font role`);
    const decl = line.match(/font-family:\s*([^;]+)/);
    if (decl && !/var\(--(tdcm-font-|font-|sans\b|serif\b)|^\s*inherit/.test(decl[1]))
      errors.push(`${at} font-family "${decl[1].trim()}" bypasses the font roles`);
  });
}

// ── Report ────────────────────────────────────────────────────────────────
console.log("\nTDCM master fonts (lib/fonts.ts)");
console.table(rows);
if (errors.length) {
  console.error(`\n✗ ${errors.length} font issue(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ Fonts OK — ${files.length} files scanned, every family comes from the master roles.\n`);
