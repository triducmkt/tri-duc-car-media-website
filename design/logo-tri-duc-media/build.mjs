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

// v5 (2026-11-04): new palette from the founder's element — Mộc (Đại Lâm Mộc).
// Compatible: sea blue (Thủy nourishes Mộc), green (Mộc), black/navy, white.
// Orange/gold of v1–v4 retired. Gradient runs blue at the root → green at the
// tip: "Thủy sinh Mộc" — water at the roots feeds the leaf.
const C = {
  navy: "#0B1220",
  white: "#FFFFFF",
  sea: "#0A6FB8", // root of the leaf, MEDIA on light
  leaf: "#17A85A", // tip of the leaf, midrib + veins on light
  seaLight: "#3AA3EC", // reverse (on navy)
  leafLight: "#45D17F", // reverse (on navy), MEDIA on dark
};

// ---------- Mark v5 "Đ lá mầm" (sprouting Đ), 120×120 grid ----------
// Trunk  = the Đ's stem (navy): roots, the system, what stays put.
// Leaf   = the Đ's bowl, whose top-right corner lifts into a pointed leaf tip
//          rising ABOVE the trunk — the business outgrowing its old height.
// Midrib = the Đ crossbar: starts left of the trunk like a normal Đ bar, then
//          runs up through the leaf to its tip — growth driven from inside.
// Story: Đại Lâm Mộc — a big tree keeps growing while the gardener is away:
// "Vắng 30 ngày, cơ sở vẫn tăng trưởng."
const MARK_TOP = 4; // leaf tip
const PIVOT = [29, 60];
const LEAF_TIP = [97, 4];
const dir = (() => {
  const dx = LEAF_TIP[0] - PIVOT[0], dy = LEAF_TIP[1] - PIVOT[1], l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
})();
const f = (n) => +n.toFixed(2);
const along = (t) => [PIVOT[0] + dir[0] * t, PIVOT[1] + dir[1] * t];
const TAIL = along(-21);
// v7: trunk and leaf are ONE continuous silhouette (no seam at x=36). The colour
// flows from the root (bottom-left) to the leaf tip: navy → sea blue → green —
// black/blue water (Thủy) feeding green wood (Mộc), in one gesture.
const LEAF_OUTER = "M22 18H60C74 18 86 13 97 4C101.5 20 103.5 38 103 58C102.3 84 83 102 58 102H22Z";
// Counter of the Đ; w = stroke weight (14 standalone, heavier when the mark
// stands in for the letter Đ inside the ExtraBold name — v8).
const leafInner = (w = 14) => {
  const t = 18 + w, b = 102 - w, r = 103 - w, l = 22 + w;
  return `M${l} ${t}H60C${r - 11} ${t} ${r} ${t + 12} ${r} 60C${r} ${b - 12} ${r - 12} ${b} 60 ${b}H${l}Z`;
};
const LEAF_INNER = leafInner(14);
// Midrib drawn as a tapered shoot: full width at the Đ bar, thinning as it
// rises into the leaf — reads as a living vein, not a stick.
const ribPath = (hw = 4.6) => {
  const n = [-dir[1], dir[0]];
  const pt = (t, w) => [along(t)[0] + n[0] * w, along(t)[1] + n[1] * w];
  const a = pt(-16, hw), b = pt(54, 1.2), c = pt(54, -1.2), d = pt(-16, -hw);
  const tail = along(-8);
  // rounded tail cap (arc through the tail end) + straight tapered sides
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}L${f(d[0])} ${f(d[1])}A${hw} ${hw} 0 0 0 ${f(a[0])} ${f(a[1])}Z`;
};
const RIB = ribPath();

function mark({ spine, needle, arc, id, ticks = true, w = 14 }) {
  const leafFill = arc === "gradient" ? `url(#${id}-g)` : arc;
  const light = spine !== C.white;
  const defs =
    arc === "gradient"
      ? `<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="22" y1="102" x2="97" y2="4"><stop offset="0.12" stop-color="${light ? C.navy : C.white}"/><stop offset="0.5" stop-color="${light ? C.sea : C.seaLight}"/><stop offset="0.95" stop-color="${light ? C.leaf : C.leafLight}"/></linearGradient>`
      : "";
  const body = [
    `<path fill="${leafFill}" fill-rule="evenodd" d="${LEAF_OUTER}${leafInner(w)}"/>`,
    `<path fill="${needle}" d="${w === 14 ? RIB : ribPath(4.6 * (w / 14))}"/>`,
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

// v6: the two acute accents (Í, Ứ) are redrawn as young leaves in the leaf colour.
// Vietnamese diacritics become the brand's signature detail: the name itself sprouts.
// Name is set without the acutes ("TRI ĐƯC" — same advances), then each acute's
// bounding box (taken from the real accented glyph) is filled with a leaf.
const NAME_PLAIN = "TRI ĐƯC";
function accentBoxes(x, y, size) {
  const glyphs = heavy.stringToGlyphs(NAME);
  const scale = size / heavy.unitsPerEm;
  const capTopY = y - capRatio(heavy) * size;
  let cx = x;
  const boxes = [];
  glyphs.forEach((g, i) => {
    if (i === 2 || i === 5) {
      const pts = [];
      for (const c of g.getPath(cx, y, size).commands) {
        for (const [px, py] of [[c.x, c.y], [c.x1, c.y1], [c.x2, c.y2]]) {
          if (px !== undefined && py < capTopY - 1.5) pts.push([px, py]);
        }
      }
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      boxes.push({ x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) });
    }
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += heavy.getKerningValue(g, glyphs[i + 1]) * scale;
    cx += adv;
  });
  // Ứ: the horn of Ư also rises above the cap line, so its raw box is too wide.
  // The acute is the same mark in both letters: reuse Í's accent size, anchored
  // at the left/top-most accent point of Ứ (the horn sits to the right).
  const [a, b] = boxes;
  const w = a.x2 - a.x1, h = a.y2 - a.y1;
  boxes[1] = { x1: b.x1, x2: b.x1 + w, y1: b.y1, y2: b.y1 + h };
  return boxes;
}
// Almond leaf along the acute's diagonal (bottom-left → top-right).
function leafAccent(b) {
  const p0 = [b.x1 + 0.4, b.y2], p1 = [b.x2, b.y1 - 0.6];
  const d = [p1[0] - p0[0], p1[1] - p0[1]], L = Math.hypot(...d);
  const n = [-d[1] / L, d[0] / L], w = L * 0.3;
  const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  const c1 = [m[0] + n[0] * w, m[1] + n[1] * w], c2 = [m[0] - n[0] * w, m[1] - n[1] * w];
  return `M${f(p0[0])} ${f(p0[1])}Q${f(c1[0])} ${f(c1[1])} ${f(p1[0])} ${f(p1[1])}Q${f(c2[0])} ${f(c2[1])} ${f(p0[0])} ${f(p0[1])}Z`;
}

function wordmark(x, capTop, { name, sub, accent, align = "left" }) {
  const base1 = capTop + cap1;
  const base2 = base1 + cap1 * 0.3 + cap2;
  const left = align === "center" ? x - nameBox.w / 2 : x;
  const subLeft = align === "center" ? x - subBox.w / 2 : x;
  const n = textPath(heavy, NAME_PLAIN, left - nameBox.x1, base1, s1);
  const leaves = accentBoxes(left - nameBox.x1, base1, s1).map(leafAccent).join("");
  const m = textPath(semi, SUB, subLeft - subBox.x1, base2, s2, subTracking);
  return {
    body: `<path fill="${name}" d="${n}"/><path fill="${accent ?? name}" d="${leaves}"/><path fill="${sub}" d="${m}"/>`,
    top: base1 + nameBox.y1, // accents rise above the cap line
    bottom: base2,
    width: nameBox.w,
  };
}


// v8: the leaf mark IS the letter Đ inside the name ("TRÍ [Đ]ỨC") — the symbol
// is read as part of the word, like VieON's "O". The leaf tip rises above the cap
// line like a third accent, next to the two young-leaf acutes.
function accentAt(ch, penX, base) {
  const g = heavy.charToGlyph(ch);
  const capTopY = base - capRatio(heavy) * s1;
  const pts = [];
  for (const c of g.getPath(penX, base, s1).commands)
    for (const [px, py] of [[c.x, c.y], [c.x1, c.y1], [c.x2, c.y2]])
      if (px !== undefined && py < capTopY - 1.5) pts.push([px, py]);
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  return { x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) };
}
function leafName(x0, capTop, t, id) {
  const base = capTop + cap1;
  const scale = s1 / heavy.unitsPerEm;
  let pen = x0, d = "", x1 = Infinity, x2 = -Infinity;
  const put = (str) => {
    const gl = heavy.stringToGlyphs(str);
    gl.forEach((g, i) => {
      const gp = g.getPath(pen, base, s1);
      const b = gp.getBoundingBox();
      if (b.x1 !== b.x2) { x1 = Math.min(x1, b.x1); x2 = Math.max(x2, b.x2); }
      d += gp.toPathData(2);
      pen += g.advanceWidth * scale + (i < gl.length - 1 ? heavy.getKerningValue(g, gl[i + 1]) * scale : 0);
    });
  };
  put("TR");
  const accI = accentAt("Í", pen, base);
  put("I ");
  // the mark, scaled so its stem (84 units) equals the cap height
  const k = cap1 / 84;
  const stemX = pen + 0.02 * s1;
  const m = mark({ ...t, id, w: 20 }); // stroke ≈ ExtraBold stem at this scale
  const g = `<g transform="translate(${f(stemX - 22 * k)} ${f(capTop - 18 * k)}) scale(${f(k)})">${m.body}</g>`;
  pen = stemX + (103 - 22) * k + 0.07 * s1;
  const rawU = accentAt("Ứ", pen, base);
  const accU = { x1: rawU.x1, x2: rawU.x1 + (accI.x2 - accI.x1), y1: rawU.y1, y2: rawU.y1 + (accI.y2 - accI.y1) };
  put("ƯC");
  const leaves = [accI, accU].map(leafAccent).join("");
  const top = Math.min(accI.y1, capTop + (MARK_TOP - 18) * k);
  return {
    body: `<path fill="${t.name}" d="${d}"/>${g}<path fill="${t.accent ?? t.name}" d="${leaves}"/>`,
    defs: m.defs, x1, x2, top, base,
  };
}

// ---------- Compositions ----------
const PAD = 16;
function svg(w, h, inner, defs = "", bg = null, minX = 0, minY = 0) {
  const r = bg ? `<rect x="${f(minX)}" y="${f(minY)}" width="${f(w)}" height="${f(h)}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(w)} ${f(h)}" role="img" aria-label="Trí Đức Media">${defs ? `<defs>${defs}</defs>` : ""}${r}${inner}</svg>\n`;
}

const themes = {
  color: { spine: C.navy, needle: C.leaf, arc: "gradient", accent: C.leaf, name: C.navy, sub: C.sea, tag: "#4B5568" },
  reverse: { spine: C.white, needle: C.leafLight, arc: "gradient", accent: C.leafLight, name: C.white, sub: C.leafLight, tag: "#C3CAD6" },
  "mono-black": { spine: C.navy, needle: C.navy, arc: C.navy, name: C.navy, sub: C.navy, tag: C.navy },
  "mono-white": { spine: C.white, needle: C.white, arc: C.white, name: C.white, sub: C.white, tag: C.white },
};

// v4: brand-promise line. v8: shortened to a 4-syllable slogan with V–V alliteration,
// distilled from the promise "Vắng 30 ngày, cơ sở vẫn tăng trưởng." (kept in the brief).
const TAGLINE = "Vắng chủ, vẫn tăng.";
function horizontal(t, id, withTagline = false) {
  const nm = leafName(0, 18, t, id);
  const base2 = nm.base + cap1 * 0.3 + cap2;
  const left = nm.x1;
  const media = textPath(semi, SUB, left - subBox.x1, base2, s2, subTracking);
  const width = nm.x2 - nm.x1;
  let body = nm.body + `<path fill="${t.sub}" d="${media}"/>`;
  const minY = nm.top - PAD;
  let maxY = base2 + PAD;
  const minX = left - PAD;
  let maxX = nm.x2 + PAD;
  if (withTagline) {
    // rule across the name width + the short slogan at MEDIA's scale
    const size = s2 * 0.8;
    const tracking = size * 0.02;
    const box = inkBox(semi, TAGLINE, size, tracking);
    const ruleY = base2 + 16;
    const base = ruleY + 12 + capRatio(semi) * size;
    body +=
      `<rect x="${f(left)}" y="${f(ruleY)}" width="${f(width)}" height="1.2" fill="${t.tag}" opacity="0.35"/>` +
      `<path fill="${t.tag}" d="${textPath(semi, TAGLINE, left - box.x1, base, size, tracking)}"/>`;
    maxY = base + 6 + PAD;
  }
  return svg(maxX - minX, maxY - minY, body, nm.defs, null, minX, minY);
}
function vertical(t, id) {
  const m = mark({ ...t, id });
  const markCx = 61; // ink centre of the D (22..100)
  const k = 1.35; // mark is enlarged in the stacked lockup
  const top = 60 - (60 - MARK_TOP) * k, bottom = 60 + 42 * k, leftInk = markCx - (markCx - TAIL[0]) * k;
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
  const s = 0.6 * (120 / (102 - MARK_TOP)); // full ink height (leaf tip → base) ≈ 60% of the tile
  const inkCx = (TAIL[0] + 103) / 2; // centre including the midrib tail
  const tx = 60 - inkCx * s, ty = 60 - ((MARK_TOP + 102) / 2) * s;
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
console.log({ s1: f(s1), s2: f(s2), tagline: TAGLINE });
