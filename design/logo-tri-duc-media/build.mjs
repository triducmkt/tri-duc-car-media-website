// Builds the "Đ kim đo" logo set for Trí Đức Media (vector SVG + PNG exports).
// Not part of the website build. Run:
//   NODE_PATH=<dir with opentype.js> node design/logo-tri-duc-media/build.mjs <fonts dir>
// Fonts (v12, anh Đức chọn bản C 2026-11-08): name "TRÍ ĐỨC" in Playfair Display
// Black (= lockup C anchor, docs/DESIGN-CORE-RULES.md), MEDIA + slogan in Be Vietnam
// Pro SemiBold. The fonts dir must hold PlayfairDisplay-Black.ttf and
// BeVietnamPro-SemiBold.ttf (OFL; google/fonts ofl/playfairdisplay, ofl/bevietnampro).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const sharp = require(path.resolve("node_modules/sharp"));

const OUT = path.dirname(fileURLToPath(import.meta.url));
const FONTS = process.argv[2];
if (!FONTS) throw new Error("Usage: node build.mjs <fonts dir>");
const heavy = opentype.loadSync(path.join(FONTS, "PlayfairDisplay-Black.ttf"));
// Name tracking +3% (lockup C anchor, rule V4).
const NAME_TRACK = 0.03;
const semi = opentype.loadSync(path.join(FONTS, "BeVietnamPro-SemiBold.ttf"));

// v5 (2026-11-04): new palette from the founder's element — Mộc (Đại Lâm Mộc).
// Compatible: sea blue (Thủy nourishes Mộc), green (Mộc), black/navy, white.
// Orange/gold of v1–v4 retired. Gradient runs blue at the root → green at the
// tip: "Thủy sinh Mộc" — water at the roots feeds the leaf.
const C = {
  navy: "#0B1220",
  white: "#FFFFFF",
  sea: "#4285F4", // v11: project blue (brand-500) — root of the leaf, MEDIA on light
  leaf: "#17A85A", // tip of the leaf, midrib + veins on light
  seaLight: "#4285F4", // v11: same project blue on navy (reverse)
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

// v12: serif Đ-leaf for the name set in Playfair Display Black. Measured on the
// font (1 mark unit = cap/84): stem 0.203em ≈ 24 units, bowl at its thickest
// 0.21em ≈ 25 units, hairlines thin; left serifs overhang 0.071em ≈ 8.4 units.
// Hairlines are kept at 6 units (not Playfair's ~3) so the leaf survives small
// sizes and embroidery. The counter is offset like a Playfair D: thin top/bottom,
// heavy right side.
const SERIF = { stem: 24, bowl: 25, hair: 6, over: 8.4, foot: 5.5 };
const leafInnerSerif = () => {
  const t = 18 + SERIF.hair, b = 102 - SERIF.hair, r = 103 - SERIF.bowl, l = 22 + SERIF.stem;
  return `M${l} ${t}H60C${r - 9} ${t} ${r} ${t + 14} ${r} 60C${r} ${b - 14} ${r - 10} ${b} 60 ${b}H${l}Z`;
};
// Bracketed left serifs (top + bottom), like Playfair's D / I.
const serifFeet = () => {
  // feet run 3 units INTO the stem so the two shapes overlap (no anti-alias seam)
  const x0 = 22 - SERIF.over, h = SERIF.foot, xi = 25;
  const top = `M${f(x0)} 18H${xi}V${f(18 + h + 6)}H22C22 ${f(18 + h + 1)} ${f(22 - 2.5)} ${f(18 + h)} ${f(x0 + 1.5)} ${f(18 + h)}H${f(x0)}Z`;
  const bot = `M${f(x0)} 102H${xi}V${f(102 - h - 6)}H22C22 ${f(102 - h - 1)} ${f(22 - 2.5)} ${f(102 - h)} ${f(x0 + 1.5)} ${f(102 - h)}H${f(x0)}Z`;
  return top + bot;
};

function mark({ spine, needle, arc, id, ticks = true, w = 14, serif = false }) {
  const leafFill = arc === "gradient" ? `url(#${id}-g)` : arc;
  const light = spine !== C.white;
  const defs =
    arc === "gradient"
      ? `<linearGradient id="${id}-g" gradientUnits="userSpaceOnUse" x1="22" y1="102" x2="97" y2="4"><stop offset="0.12" stop-color="${light ? C.navy : C.white}"/><stop offset="0.5" stop-color="${light ? C.sea : C.seaLight}"/><stop offset="0.95" stop-color="${light ? C.leaf : C.leafLight}"/></linearGradient>`
      : "";
  const body = serif
    ? [
        `<path fill="${leafFill}" fill-rule="evenodd" d="${LEAF_OUTER}${leafInnerSerif()}"/>`,
        `<path fill="${leafFill}" d="${serifFeet()}"/>`,
        `<path fill="${needle}" d="${ribPath(4.6 * (20 / 14))}"/>`,
      ].join("")
    : [
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
// v12: MEDIA cap = 0.30 × name cap (rule V1: the second voice's tallest stroke
// is 0.30 of the first voice's capitals). Was 0.40 up to v11.
const MEDIA_RATIO = 0.3;
const c1Share = 1 / (1 + 0.3 + MEDIA_RATIO); // cap1 : gap : cap2
const cap1 = 84 * c1Share;
const s1 = cap1 / capRatio(heavy);
const cap2 = cap1 * MEDIA_RATIO;
const s2 = cap2 / capRatio(semi);
const nameBox = inkBox(heavy, NAME, s1, s1 * NAME_TRACK);
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
    if (i < glyphs.length - 1) adv += heavy.getKerningValue(g, glyphs[i + 1]) * scale + size * NAME_TRACK;
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
  const n = textPath(heavy, NAME_PLAIN, left - nameBox.x1, base1, s1, s1 * NAME_TRACK);
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
      pen += g.advanceWidth * scale + (i < gl.length - 1 ? heavy.getKerningValue(g, gl[i + 1]) * scale : 0) + s1 * NAME_TRACK;
    });
  };
  put("TR");
  const accI = accentAt("Í", pen, base);
  put("I ");
  // the mark, scaled so its stem (84 units) equals the cap height
  const k = cap1 / 84;
  // v12: serif Đ-leaf; leave room for its left serifs (+ Playfair side bearing)
  const stemX = pen + SERIF.over * k + 0.02 * s1;
  const m = mark({ ...t, id, serif: true });
  const g = `<g transform="translate(${f(stemX - 22 * k)} ${f(capTop - 18 * k)}) scale(${f(k)})">${m.body}</g>`;
  pen = stemX + (103 - 22) * k + 0.05 * s1 + s1 * NAME_TRACK;
  const rawU = accentAt("Ứ", pen, base);
  const accU = { x1: rawU.x1, x2: rawU.x1 + (accI.x2 - accI.x1), y1: rawU.y1, y2: rawU.y1 + (accI.y2 - accI.y1) };
  put("ƯC");
  const leaves = [accI, accU].map(leafAccent).join("");
  const top = Math.min(accI.y1, capTop + (MARK_TOP - 18) * k);
  return {
    body: `<path fill="${t.name}" d="${d}"/>${g}<path fill="${t.accent ?? t.name}" d="${leaves}"/>`,
    defs: m.defs, x1, x2, top, base,
    // v9: pieces for the animated logo
    parts: { textD: d, markT: `translate(${f(stemX - 22 * k)} ${f(capTop - 18 * k)}) scale(${f(k)})`, acc: [accI, accU] },
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
// v10: clearer slogan — "vắng" (owner away) ↔ "đông" (customers crowd in).
const TAGLINE = "Chủ vắng, khách vẫn đông.";
// v10: lower block. MEDIA is centred under the name between two hairlines that
// run out to the name's edges (no more empty space right of MEDIA); the slogan
// is centred below. "TRÍ ĐỨC" itself is unchanged since v8.
function lowerBlock(nm, withTag) {
  const base2 = nm.base + cap1 * 0.34 + cap2;
  const center = (nm.x1 + nm.x2) / 2;
  const mLeft = center - subBox.w / 2;
  const media = textPath(semi, SUB, mLeft - subBox.x1, base2, s2, subTracking);
  const gap = s2 * 0.6, ry = base2 - cap2 / 2 - 0.7;
  const rules = [
    { x: nm.x1, y: ry, w: mLeft - gap - nm.x1, anchor: mLeft - gap },
    { x: mLeft + subBox.w + gap, y: ry, w: nm.x2 - (mLeft + subBox.w + gap), anchor: mLeft + subBox.w + gap },
  ];
  let tag = "", bottom = base2;
  if (withTag) {
    const width = nm.x2 - nm.x1;
    // v12: third voice (rule V7) stays visibly below MEDIA (was 0.92 × MEDIA size)
    let size = s2 * 0.78;
    const w0 = inkBox(semi, TAGLINE, size, size * 0.01).w;
    if (w0 > width * 0.96) size *= (width * 0.96) / w0;
    const tracking = size * 0.01;
    const box = inkBox(semi, TAGLINE, size, tracking);
    const tbase = base2 + 20 + capRatio(semi) * size;
    tag = textPath(semi, TAGLINE, center - box.w / 2 - box.x1, tbase, size, tracking);
    bottom = tbase + 0.25 * size; // descenders (g, y)
  }
  return { media, rules, tag, bottom };
}
const ruleRect = (r, fill) => `<rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="1.4" fill="${fill}" opacity="0.6"/>`;

function horizontal(t, id, withTagline = false) {
  const nm = leafName(0, 18, t, id);
  const L = lowerBlock(nm, withTagline);
  let body = nm.body + `<path fill="${t.sub}" d="${L.media}"/>` + L.rules.map((r) => ruleRect(r, t.sub)).join("");
  if (withTagline) body += `<path fill="${t.tag}" d="${L.tag}"/>`;
  const minX = nm.x1 - PAD, minY = nm.top - PAD;
  return svg(nm.x2 - nm.x1 + 2 * PAD, L.bottom + PAD - minY, body, nm.defs, null, minX, minY);
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

// ---------- v9: animated logo "cây mọc" (the Đ-leaf grows from its root) ----------
// One timeline drives both the SMIL animated SVG (web/email header) and the
// frame-rendered MP4/GIF (YouTube Shorts / Reels / Facebook intro-outro).
const TL = {
  leaf: [0.0, 0.85], // leaf+trunk revealed from the root (bottom) up to the tip
  rib: [0.55, 1.1], // midrib (Đ crossbar) grows from its tail toward the tip
  text: [0.15, 0.85], // "TRÍ ĐỨC" rises in
  accI: [1.0, 1.4], // young leaf on Í pops
  accU: [1.15, 1.55], // young leaf on Ứ pops
  media: [1.35, 1.85],
  tag: [1.65, 2.15],
  end: 3.2,
};
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const prog = ([a, b], sec) => Math.min(1, Math.max(0, (sec - a) / (b - a)));
const RIB_HW = 4.6 * (20 / 14);
const RIB_TAIL = along(-16 - RIB_HW);
const RIB_DEG = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;

function animatedPieces(t, id, withTag = true) {
  const nm = leafName(0, 18, t, id);
  const L = lowerBlock(nm, withTag);
  const view = { minX: nm.x1 - PAD, minY: nm.top - PAD, w: nm.x2 - nm.x1 + 2 * PAD, h: L.bottom + PAD - (nm.top - PAD) };
  const gradId = `${id}-g`;
  const dark = t.spine === C.white;
  const defs = `<linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="22" y1="102" x2="97" y2="4"><stop offset="0.12" stop-color="${dark ? C.white : C.navy}"/><stop offset="0.5" stop-color="${dark ? C.seaLight : C.sea}"/><stop offset="0.95" stop-color="${dark ? C.leafLight : C.leaf}"/></linearGradient>`;
  return { nm, L, view, defs, gradId };
}

// Static frame at time sec (for MP4/GIF).
function animFrame(t, id, sec) {
  const P = animatedPieces(t, id);
  const { nm } = P;
  const e = (k) => easeOut(prog(TL[k], sec));
  const clipTop = 104 - (104 - (MARK_TOP - 2)) * e("leaf");
  const rib = Math.max(e("rib"), 0.0001);
  const ty = (1 - e("text")) * 10;
  const pop = (k, b) => {
    const s = prog(TL[k], sec) > 0 ? Math.max(0.0001, easeBack(prog(TL[k], sec))) : 0.0001;
    const p0 = [b.x1 + 0.4, b.y2];
    return `<g transform="translate(${f(p0[0])} ${f(p0[1])}) scale(${f(s)}) translate(${f(-p0[0])} ${f(-p0[1])})"><path fill="${t.accent}" d="${leafAccent(b)}"/></g>`;
  };
  const body =
    `<g opacity="${f(e("text"))}" transform="translate(0 ${f(ty)})"><path fill="${t.name}" d="${nm.parts.textD}"/></g>` +
    `<g transform="${nm.parts.markT}"><clipPath id="${id}-c"><rect x="-10" y="${f(clipTop)}" width="140" height="${f(110 - clipTop)}"/></clipPath>` +
    `<path clip-path="url(#${id}-c)" fill="url(#${P.gradId})" fill-rule="evenodd" d="${LEAF_OUTER}${leafInnerSerif()}"/><path clip-path="url(#${id}-c)" fill="url(#${P.gradId})" d="${serifFeet()}"/>` +
    `<g transform="translate(${f(RIB_TAIL[0])} ${f(RIB_TAIL[1])}) rotate(${f(RIB_DEG)}) scale(${f(rib)} 1) rotate(${f(-RIB_DEG)}) translate(${f(-RIB_TAIL[0])} ${f(-RIB_TAIL[1])})"><path fill="${t.needle}" d="${ribPath(RIB_HW)}"/></g></g>` +
    pop("accI", nm.parts.acc[0]) + pop("accU", nm.parts.acc[1]) +
    `<path opacity="${f(e("media"))}" fill="${t.sub}" d="${P.L.media}"/>` +
    P.L.rules.map((r) => `<g transform="translate(${f(r.anchor)} 0) scale(${f(Math.max(e("media"), 0.0001))} 1) translate(${f(-r.anchor)} 0)">${ruleRect(r, t.sub)}</g>`).join("") +
    `<path opacity="${f(e("tag"))}" fill="${t.tag}" d="${P.L.tag}"/>`;
  return svg(P.view.w, P.view.h, body, P.defs, null, P.view.minX, P.view.minY);
}

// SMIL animated SVG (plays once, holds the final frame; also works inside <img>).
function animatedSVG(t, id, withTag = true) {
  const P = animatedPieces(t, id, withTag);
  const { nm } = P;
  const spl = 'calcMode="spline" keyTimes="0;1" keySplines="0.22 1 0.36 1" fill="freeze"';
  const dur = (k) => `begin="${TL[k][0]}s" dur="${f(TL[k][1] - TL[k][0])}s"`;
  const pop = (k, b) => {
    const p0 = [b.x1 + 0.4, b.y2];
    return `<g transform="translate(${f(p0[0])} ${f(p0[1])})"><g transform="scale(0)"><animateTransform attributeName="transform" type="scale" ${dur(k)} values="0;1.15;1" keyTimes="0;0.7;1" fill="freeze"/><g transform="translate(${f(-p0[0])} ${f(-p0[1])})"><path fill="${t.accent}" d="${leafAccent(b)}"/></g></g></g>`;
  };
  const body =
    `<g opacity="0"><animate attributeName="opacity" from="0" to="1" ${dur("text")} ${spl}/><animateTransform attributeName="transform" type="translate" from="0 10" to="0 0" ${dur("text")} ${spl}/><path fill="${t.name}" d="${nm.parts.textD}"/></g>` +
    `<g transform="${nm.parts.markT}"><clipPath id="${id}-c"><rect x="-10" y="104" width="140" height="6"><animate attributeName="y" from="104" to="${MARK_TOP - 2}" ${dur("leaf")} ${spl}/><animate attributeName="height" from="6" to="${110 - (MARK_TOP - 2)}" ${dur("leaf")} ${spl}/></rect></clipPath>` +
    `<path clip-path="url(#${id}-c)" fill="url(#${P.gradId})" fill-rule="evenodd" d="${LEAF_OUTER}${leafInnerSerif()}"/><path clip-path="url(#${id}-c)" fill="url(#${P.gradId})" d="${serifFeet()}"/>` +
    `<g transform="translate(${f(RIB_TAIL[0])} ${f(RIB_TAIL[1])}) rotate(${f(RIB_DEG)})"><g transform="scale(0 1)"><animateTransform attributeName="transform" type="scale" from="0 1" to="1 1" ${dur("rib")} ${spl}/><g transform="rotate(${f(-RIB_DEG)}) translate(${f(-RIB_TAIL[0])} ${f(-RIB_TAIL[1])})"><path fill="${t.needle}" d="${ribPath(RIB_HW)}"/></g></g></g></g>` +
    pop("accI", nm.parts.acc[0]) + pop("accU", nm.parts.acc[1]) +
    `<path opacity="0" fill="${t.sub}" d="${P.L.media}"><animate attributeName="opacity" from="0" to="1" ${dur("media")} ${spl}/></path>` +
    P.L.rules.map((r) => `<g transform="translate(${f(r.anchor)} 0)"><g transform="scale(0 1)"><animateTransform attributeName="transform" type="scale" from="0 1" to="1 1" ${dur("media")} ${spl}/><g transform="translate(${f(-r.anchor)} 0)">${ruleRect(r, t.sub)}</g></g></g>`).join("") +
    `<path opacity="0" fill="${t.tag}" d="${P.L.tag}"><animate attributeName="opacity" from="0" to="1" ${dur("tag")} ${spl}/></path>`;
  return svg(P.view.w, P.view.h, body, P.defs, null, P.view.minX, P.view.minY);
}
files["tri-duc-media-animated-color.svg"] = animatedSVG(themes.color, "an-c");
files["tri-duc-media-animated-reverse.svg"] = animatedSVG(themes.reverse, "an-r");
// web header/footer: same animation, name + MEDIA only
files["tri-duc-media-animated-notag-color.svg"] = animatedSVG(themes.color, "an-nc", false);
files["tri-duc-media-animated-notag-reverse.svg"] = animatedSVG(themes.reverse, "an-nr", false);


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

// ---------- v9: intro videos (frames → ffmpeg) ----------
const motionDir = path.join(OUT, "motion");
const frameDir = path.join(motionDir, "_frames");
fs.mkdirSync(frameDir, { recursive: true });
async function renderVideo(t, id, W, H, bg, logoW, name) {
  const fps = 30, n = Math.round(TL.end * fps);
  for (const old of fs.readdirSync(frameDir)) fs.unlinkSync(path.join(frameDir, old));
  for (let i = 0; i < n; i++) {
    const logo = await sharp(Buffer.from(animFrame(t, id, i / fps)), { density: 300 }).resize({ width: logoW }).png().toBuffer();
    const meta = await sharp(logo).metadata();
    await sharp({ create: { width: W, height: H, channels: 4, background: bg } })
      .composite([{ input: logo, left: Math.round((W - meta.width) / 2), top: Math.round((H - meta.height) / 2) }])
      .png().toFile(path.join(frameDir, "f" + String(i).padStart(4, "0") + ".png"));
  }
  const inp = path.join(frameDir, "f%04d.png");
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", inp, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(motionDir, name + ".mp4")], { stdio: "inherit" });
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", inp, "-vf", "fps=20,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse", path.join(motionDir, name + ".gif")], { stdio: "inherit" });
  fs.copyFileSync(path.join(frameDir, "f" + String(Math.round(n * 0.25)).padStart(4, "0") + ".png"), path.join(motionDir, name + "-frame-mid.png"));
  fs.copyFileSync(path.join(frameDir, "f" + String(n - 1).padStart(4, "0") + ".png"), path.join(motionDir, name + "-poster.png"));
}
await renderVideo(themes.reverse, "vr", 1080, 1920, C.navy, 960, "intro-9x16-navy"); // Shorts / Reels / TikTok
await renderVideo(themes.color, "vc", 1920, 1080, "#FFFFFF", 1100, "intro-16x9-white"); // YouTube / slides
fs.rmSync(frameDir, { recursive: true, force: true });

console.log(Object.keys(files).length, "SVG files;", fs.readdirSync(pngDir).length, "PNG files");
console.log({ s1: f(s1), s2: f(s2), tagline: TAGLINE });
