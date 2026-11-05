#!/usr/bin/env node
// Color audit — run `npm run colors:check` before committing UI work.
// Rules: docs/color-system.md (blue #4285F4 30% · black 30% · white 25% ·
// green #17A85A 10% · other 5%). Fails on:
//  1. a hex / 0x / rgb() color in app/, components/, lib/ that is not in PALETTE;
//  2. Tailwind default palette classes (amber, emerald, sky…) — red-* allowed for errors.
// Prints the blue vs green class balance as information.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// r,g,b of every allowed color.
const PALETTE = {
  blue: ["#4285f4", "#2f6fe0", "#2557b3", "#6ea6f7", "#8fb6f9", "#d3e3fd", "#eaf1fe", "#bfd2ff", "#8aa6dc", "#5b7fc4"],
  black: ["#0b1220", "#131d33", "#4b5568", "#0b0f19", "#000000", "#18233d", "#1b2747", "#1b3c7a", "#070c16"],
  white: ["#ffffff", "#f5f7fb", "#eef2f7", "#9ba4b2", "#c3cad6"],
  green: ["#17a85a", "#45d17f", "#11864a"],
  red: ["#c7452f", "#ff6b59", "#ff4d4d", "#ff9b8e", "#e07864"],
};
const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
const allowed = new Set(Object.values(PALETTE).flat().map(toRgb));

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name)) files.push(p);
  }
};
["app", "components", "lib"].forEach((d) => walk(path.join(root, d)));

const errors = [];
let blue = 0;
let green = 0;
const rel = (f) => path.relative(root, f).replaceAll("\\", "/");
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const at = `${rel(f)}:${i + 1}`;
    for (const m of line.matchAll(/(?:#|0x)([0-9a-fA-F]{6})\b/g)) {
      if (!allowed.has(toRgb(`#${m[1].toLowerCase()}`))) errors.push(`${at}  off-palette ${m[0]}`);
    }
    for (const m of line.matchAll(/rgba?\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/g)) {
      const key = `${m[1]},${m[2]},${m[3]}`;
      if (!allowed.has(key) && key !== "255,255,255" && key !== "0,0,0" && key !== "11,15,25")
        errors.push(`${at}  off-palette rgb(${key})`);
    }
    for (const m of line.matchAll(/\b(?:text|bg|ring|border|from|to|via|fill|stroke|shadow|outline|decoration)-(amber|orange|yellow|lime|emerald|green|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/g))
      errors.push(`${at}  Tailwind palette class ${m[0]} (use brand-* / leaf-*)`);
    blue += (line.match(/-brand-\d{2,3}/g) || []).length;
    green += (line.match(/-leaf-\d{2,3}/g) || []).length;
  });
}

const share = blue + green ? Math.round((green / (blue + green)) * 100) : 0;
// Class counts, not screen area: big green areas (3D growth bars, price plane) count once.
console.log(`Accent classes: blue ${blue} · green ${green} (green ${share}% of accent classes — keep green for positive meaning only)`);
if (errors.length) {
  console.error(`✗ ${errors.length} color violation(s) — see docs/color-system.md`);
  errors.slice(0, 60).forEach((e) => console.error("  " + e));
  process.exit(1);
}
console.log("✓ Colors OK — every color comes from the Trí Đức Media palette.");
