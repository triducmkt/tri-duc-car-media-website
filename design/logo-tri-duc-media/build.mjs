// Builds the "Đ kim đo" logo set for Trí Đức Media (vector SVG + PNG exports).
// Not part of the website build. Run:
//   NODE_PATH=<dir with opentype.js> node design/logo-tri-duc-media/build.mjs <fonts dir>
// Fonts: Be Vietnam Pro ExtraBold + SemiBold (OFL, github.com/google/fonts/ofl/bevietnampro).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const sharp = require(path.resolve("node_modules/sharp"));

const OUT = path.dirname(fileURLToPath(import.meta.url));
const FONTS = process.argv[2];
if (!FONTS) throw new Error("Usage: node build.mjs <fonts dir>");
const heavy = opentype.loadSync(path.join(FONTS, "BeVietnamPro-ExtraBold.ttf"));
const semi = opentype.loadSync(path.join(FONTS, "BeVietnamPro-SemiBold.ttf"));

// v3: red "redline" replaced by gold — climbing into gold = growth that becomes
// an owned asset, calm rather than overloaded (brief: vision v3 / brand promise).
// Gold matches the website accent (gold-400 #F0C069 / gold-500 #D9A441).
const C = {
  navy: "#0B1220",
  orange: "#F7891C",
  gold: "#DFA136", // arc top (light backgrounds)
  goldLight: "#F0C069", // MEDIA on dark backgrounds
  ember: "#E0701A", // MEDIA on light backgrounds (orange deepened for legibility)
  white: "#FFFFFF",
};

// ---------- Mark: 120×120 grid, ink spans x 22–100, y 18–102 ----------
// Stem + top/bottom bars = the D's spine; bowl = gauge arc (gold at the top since v3);
// the Đ crossbar = needle pivoting on the stem, rising toward the owner dot (v4).
// Stroke weight 14 for spine + gauge; gauge centre (58,60), centreline r=35.
const PIVOT = [29, 60];
// v4: the orange dot = the owner. Through v3 it sat on the stem as the needle's
// pivot (the owner holding the machine). In v4 it has stepped OUT of the Đ and
// sits above the gauge, top-right: the machine keeps running and its needle
// rises toward the owner, who is now in the owner's seat, not the worker's.
// Brief: vision v3 + "Vắng 30 ngày, cơ sở vẫn tăng trưởng."
const OWNER_ANGLE = 50; // degrees from the gauge centre (58,60)
const OWNER_R = 7.5;
const OWNER = [58 + 53 * Math.cos((OWNER_ANGLE * Math.PI) / 180), 60 - 53 * Math.sin((OWNER_ANGLE * Math.PI) / 180)];
const dir = (() => {
  const dx = OWNER[0] - PIVOT[0], dy = OWNER[1] - PIVOT[1], l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();
// Needle tip: where the pivot→owner line meets the inner edge zone of the gauge (r≈29).
const TIP = (() => {
  // |PIVOT + t·dir − C|² = 29², far root
  const ox = PIVOT[0] - 58, oy = PIVOT[1] - 60;
  const b = ox * dir[0] + oy * dir[1];
  const t = -b + Math.sqrt(b * b - (ox * ox + oy * oy - 29 * 29));
  return [+(PIVOT[0] + dir[0] * t).toFixed(2), +(PIVOT[1] + dir[1] * t).toFixed(2)];
})();
const TAIL = [PIVOT[0] - dir[0] * 10, PIVOT[1] - dir[1] * 10];
const f = (n) => +n.toFixed(2);

// Scale ticks sit below the needle: the needle has already passed the marked range.
const TICK_ANGLES = [15, -25, -65]; // evenly spaced 40° — a regular, standardised scale
function ticksPath() {
  return TICK_ANGLES.map((a) => {
    const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    return `M${f(58 + 18 * c)} ${f(60 - 18 * s)}L${f(58 + 23 * c)} ${f(60 - 23 * s)}`;
  }).join("");
}

function mark({ spine, needle, arc, hub, id, ticks = true }) {
  const arcStroke = arc === "gradient" ? `url(#${id}-g)` : arc;
  const defs =
    arc === "gradient"
      ? `<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="0" y1="18" x2="0" y2="102"><stop offset="0" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.orange}"/></linearGradient>`
      : "";
  const body = [
    `<path fill="${spine}" d="M22 18H58V32H36V88H58V102H22Z"/>`,
    `<path fill="none" stroke="${arcStroke}" stroke-width="14" d="M58 25A35 35 0 0 1 58 95"/>`,
    ticks ? `<path fill="none" stroke="${needle}" stroke-width="4" stroke-linecap="round" d="${ticksPath()}"/>` : "",
    `<path fill="none" stroke="${needle}" stroke-width="7.5" stroke-linecap="round" d="M${f(TAIL[0])} ${f(TAIL[1])}L${TIP[0]} ${TIP[1]}"/>`,
    // owner dot (v4): outside the Đ; mono versions use the ink colour
    `<circle cx="${f(OWNER[0])}" cy="${f(OWNER[1])}" r="${OWNER_R}" fill="${hub ?? needle}"/>`,
  ].join("");
  return { defs, body };
}

// ---------- Wordmark ----------
function textPath(font, text, x, y, size, tracking = 0) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let cx = x;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(cx, y, size).toPathData(2));
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking;
    cx += adv;
  });
  return parts.join("");
}
function inkBox(font, text, size, tracking = 0) {
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  let cx = 0, x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
  glyphs.forEach((g, i) => {
    const b = g.getPath(cx, 0, size).getBoundingBox();
    if (b.x1 !== b.x2) {
      x1 = Math.min(x1, b.x1); x2 = Math.max(x2, b.x2);
      y1 = Math.min(y1, b.y1); y2 = Math.max(y2, b.y2);
    }
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale + tracking;
    cx += adv;
  });
  return { x1, x2, y1, y2, w: x2 - x1 };
}
const capRatio = (font) => font.tables.os2.sCapHeight / font.unitsPerEm;

// Block: cap of line 1 to baseline of line 2 = 84 units (matches mark ink height).
const NAME = "TRÍ ĐỨC";
const SUB = "MEDIA";
const c1Share = 1 / (1 + 0.3 + 0.4); // cap1 : gap : cap2 = 1 : 0.30 : 0.40
const cap1 = 84 * c1Share;
const s1 = cap1 / capRatio(heavy);
const cap2 = cap1 * 0.4;
const s2 = cap2 / capRatio(semi);
const nameBox = inkBox(heavy, NAME, s1);
// MEDIA: open tracking (0.34em), aligned to the name's left edge.
const subTracking = s2 * 0.34;
const subBox = inkBox(semi, SUB, s2, subTracking);

function wordmark(x, capTop, { name, sub, align = "left" }) {
  const base1 = capTop + cap1;
  const base2 = base1 + cap1 * 0.3 + cap2;
  const left = align === "center" ? x - nameBox.w / 2 : x;
  const subLeft = align === "center" ? x - subBox.w / 2 : x;
  const n = textPath(heavy, NAME, left - nameBox.x1, base1, s1);
  const m = textPath(semi, SUB, subLeft - subBox.x1, base2, s2, subTracking);
  return {
    body: `<path fill="${name}" d="${n}"/><path fill="${sub}" d="${m}"/>`,
    top: base1 + nameBox.y1, // accents rise above the cap line
    bottom: base2,
    width: nameBox.w,
  };
}

// ---------- Compositions ----------
const PAD = 16;
function svg(w, h, inner, defs = "", bg = null, minX = 0, minY = 0) {
  const r = bg ? `<rect x="${f(minX)}" y="${f(minY)}" width="${f(w)}" height="${f(h)}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(w)} ${f(h)}" role="img" aria-label="Trí Đức Media">${defs ? `<defs>${defs}</defs>` : ""}${r}${inner}</svg>\n`;
}

const themes = {
  color: { spine: C.navy, needle: C.navy, arc: "gradient", hub: C.orange, name: C.navy, sub: C.ember, tag: "#4B5568" },
  reverse: { spine: C.white, needle: C.white, arc: "gradient", hub: C.orange, name: C.white, sub: C.goldLight, tag: "#C3CAD6" },
  "mono-black": { spine: C.navy, needle: C.navy, arc: C.navy, hub: null, name: C.navy, sub: C.navy, tag: C.navy },
  "mono-white": { spine: C.white, needle: C.white, arc: C.white, hub: null, name: C.white, sub: C.white, tag: C.white },
};

// v4: brand-promise line for signage, cards, slides, uniforms.
const TAGLINE = "Vắng 30 ngày, cơ sở vẫn tăng trưởng.";
function horizontal(t, id, withTagline = false) {
  const m = mark({ ...t, id });
  const gap = 28;
  const wm = wordmark(100 + gap, 18, t);
  const minY = Math.min(OWNER[1] - OWNER_R, wm.top) - PAD;
  let maxY = Math.max(102, wm.bottom) + PAD;
  const minX = 22 - PAD;
  let maxX = 100 + gap + wm.width + PAD;
  let tag = "";
  if (withTagline) {
    // one rule + the promise, spanning the full lockup width
    const full = 100 + gap + wm.width - 22;
    // natural letter spacing (0.02em); size chosen so the line spans ~92% of the lockup
    const size0 = 20;
    const w0 = inkBox(semi, TAGLINE, size0, size0 * 0.02).w;
    const size = Math.min(22, (size0 * full * 0.92) / w0);
    const tracking = size * 0.02;
    const box = inkBox(semi, TAGLINE, size, tracking);
    const ruleY = Math.max(102, wm.bottom) + 18;
    const base = ruleY + 14 + capRatio(semi) * size;
    tag =
      `<rect x="22" y="${f(ruleY)}" width="${f(full)}" height="1.2" fill="${t.tag}" opacity="0.35"/>` +
      `<path fill="${t.tag}" d="${textPath(semi, TAGLINE, 22 - box.x1, base, size, tracking)}"/>`;
    maxY = base + 6 + PAD;
    maxX = Math.max(maxX, 22 + full + PAD);
  }
  return svg(maxX - minX, maxY - minY, m.body + wm.body + tag, m.defs, null, minX, minY);
}
function vertical(t, id) {
  const m = mark({ ...t, id });
  const markCx = 61; // ink centre of the D (22..100)
  const k = 1.35; // mark is enlarged in the stacked lockup
  const top = 60 - 42 * k, bottom = 60 + 42 * k, leftInk = markCx - (markCx - TAIL[0]) * k;
  const g = `<g transform="translate(${markCx} 60) scale(${k}) translate(${-markCx} -60)">${m.body}</g>`;
  // place the wordmark so its accents clear the mark by 26 units
  const probe = wordmark(markCx, 0, { ...t, align: "center" });
  const wm2 = wordmark(markCx, bottom + 26 - probe.top, { ...t, align: "center" });
  const half = Math.max(wm2.width / 2, markCx - leftInk) + PAD;
  return svg(half * 2, wm2.bottom + PAD - (top - PAD), g + wm2.body, m.defs, null, markCx - half, top - PAD);
}
function markOnly(t, id) {
  const m = mark({ ...t, id });
  return svg(120, 120, m.body, m.defs, null, 0, 0);
}
function appIcon() {
  // navy rounded square, white spine/needle, mark at ~62% of the tile
  const m = mark({ ...themes.reverse, id: "app", ticks: false }); // ticks blur below 64px
  const s = 0.52 * (120 / 84); // 84-unit ink height ≈ 52% of the tile
  const inkCx = (TAIL[0] + 100) / 2; // centre including the needle tail
  const tx = 60 - inkCx * s, ty = 60 - 60 * s;
  return svg(
    120, 120,
    `<rect width="120" height="120" rx="26" fill="${C.navy}"/><g transform="translate(${f(tx)} ${f(ty)}) scale(${f(s)})">${m.body}</g>`,
    m.defs, null, 0, 0,
  );
}

const files = {};
for (const [k, t] of Object.entries(themes)) {
  files[`tri-duc-media-horizontal-${k}.svg`] = horizontal(t, `h-${k}`);
  files[`tri-duc-media-vertical-${k}.svg`] = vertical(t, `v-${k}`);
  files[`tri-duc-media-mark-${k}.svg`] = markOnly(t, `m-${k}`);
  files[`tri-duc-media-horizontal-tagline-${k}.svg`] = horizontal(t, `ht-${k}`, true);
}
files["tri-duc-media-app-icon.svg"] = appIcon();

const svgDir = path.join(OUT, "svg");
const pngDir = path.join(OUT, "png");
fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(svgDir, name), content);

// ---------- PNG exports ----------
async function png(svgName, outName, width, bg) {
  let img = sharp(Buffer.from(files[svgName]), { density: 600 }).resize({ width });
  if (bg) img = img.flatten({ background: bg });
  await img.png().toFile(path.join(pngDir, outName));
}
await png("tri-duc-media-horizontal-color.svg", "horizontal-color-2000.png", 2000);
await png("tri-duc-media-horizontal-reverse.svg", "horizontal-reverse-2000.png", 2000);
await png("tri-duc-media-vertical-color.svg", "vertical-color-1600.png", 1600);
await png("tri-duc-media-mark-color.svg", "mark-color-1024.png", 1024);
for (const s of [1024, 512, 192, 180, 32]) await png("tri-duc-media-app-icon.svg", `app-icon-${s}.png`, s);
await png("tri-duc-media-horizontal-color.svg", "horizontal-color-on-white-2000.png", 2000, "#FFFFFF");

console.log(Object.keys(files).length, "SVG files;", fs.readdirSync(pngDir).length, "PNG files");
console.log({ s1: f(s1), s2: f(s2), subTracking: f(subTracking), nameW: f(nameBox.w) });
