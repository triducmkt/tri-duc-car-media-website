#!/usr/bin/env node
// Lockup render audit — rules V1, V2, V8, V10 in docs/DESIGN-CORE-RULES.md,
// checked on the REAL rendered page (real web fonts, real computed sizes),
// at desktop 1280px and phone 390px. Companion of `npm run lockup:qc`, which
// works from the font files and writes lib/lockupMetrics.json.
//
//   V1  accent tallest stroke ÷ anchor cap height = 0.30 (pass 0.27–0.33).
//   V1b anchor on 2+ lines: ÷ the whole anchor block (cap + (n-1) × leading).
//       Measured by rasterising the accent (diacritics removed — marks, not
//       strokes) and the letter H in the anchor font, ink top above baseline.
//   V2  accent line not wider than the anchor's widest line.
//   V8  anchor on ONE line, nothing clipped; ≥ 90% of all lockup instances.
//   V10 accent font-size ≥ 12px on the phone.
//
// Usage (needs Chrome + a running site):
//   npm run lockup:check                         → http://localhost:3000
//   npm run lockup:check -- https://www.triduccar.media
// Optional: CHROME=<path to chrome.exe>
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const PAGES = [
  "/vi",
  "/en",
  "/vi/about",
  "/en/about",
  ...["he-thong-marketing-sales-cskh", "thuong-hieu-ca-nhan-chu-doanh-nghiep", "chuan-hoa-sop-dao-tao-doi-ngu", "setup-phong-marketing-in-house", "nen-tang-so-sme-os"].flatMap((s) => [`/vi/services/${s}`, `/en/services/${s}`]),
];
const WIDTHS = [1280, 390];
const RATIO = 0.3, TOL = 0.03, MIN_SCRIPT_PX = 12, SINGLE_SHARE = 0.9;

const chromePath =
  process.env.CHROME ||
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
if (!chromePath) throw new Error("Chrome not found — set CHROME=<path>");

const PORT = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "lockup-check-"));
const chrome = spawn(chromePath, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let list;
for (let i = 0; i < 40 && !list; i++) {
  await sleep(250);
  list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
}
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

// Runs in the page.
const MEASURE = `(async () => {
  await document.fonts.ready;
  const strip = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  // Ink height above the alphabetic baseline, px.
  const top = (text, cs) => {
    const size = parseFloat(cs.fontSize);
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    ctx.font = font;
    c.width = Math.ceil(ctx.measureText(text).width + size * 2);
    c.height = Math.ceil(size * 3);
    ctx.font = font;
    // Non-zero spacing turns canvas ligatures off, matching the page CSS
    // (font-variant-ligatures: none on the accent).
    ctx.letterSpacing = "0.01px";
    ctx.textBaseline = "alphabetic";
    const base = Math.round(size * 2);
    ctx.fillText(text, size, base);
    const px = ctx.getImageData(0, 0, c.width, base).data;
    for (let y = 0; y < base; y++)
      for (let x = 0; x < c.width; x++) if (px[(y * c.width + x) * 4 + 3] > 96) return base - y;
    return 0;
  };
  return [...document.querySelectorAll(".lockup")].map((l) => {
    const a = l.querySelector(".lockup-accent"), b = l.querySelector(".lockup-anchor");
    const acs = getComputedStyle(a), bcs = getComputedStyle(b);
    const tall = top(strip(a.textContent), acs);
    const cap = top("H", bcs);
    const lines = [...b.querySelectorAll(".lockup-line")];
    const box = l.parentElement.getBoundingClientRect().width;
    const widest = Math.max(...lines.map((s) => s.getBoundingClientRect().width));
    const lineH = parseFloat(bcs.fontSize) * 1.18;
    const wrapped = lines.some((s) => s.getBoundingClientRect().height > lineH * 1.5);
    const clipped = widest > box + 1;
    return {
      accent: a.textContent, anchor: lines.map((s) => s.textContent).join(" ⏎ "),
      // V1b: on 2+ anchor lines the reference is the whole block
      ratio: tall / (cap + (lines.length - 1) * lineH), lines: lines.length, wrapped, clipped,
      accentW: a.getBoundingClientRect().width, anchorW: widest,
      accentPx: parseFloat(acs.fontSize), anchorPx: parseFloat(bcs.fontSize),
    };
  });
})()`;

let fails = 0, instances = 0, single = 0;
const rows = [];
for (const W of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 600 });
  for (const p of PAGES) {
    await send("Page.navigate", { url: BASE + p });
    let res = null;
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      res = await evaluate(`document.readyState === "complete" && document.querySelector(".lockup") ? ${MEASURE} : null`);
      if (res) break;
    }
    if (!res) { rows.push({ page: p, w: W, lockup: "(không thấy lockup)", ok: "✗" }); fails++; continue; }
    for (const r of res) {
      instances++;
      const one = r.lines === 1 && !r.wrapped && !r.clipped;
      if (one) single++;
      const bad = [];
      if (Math.abs(r.ratio - RATIO) > TOL) bad.push(`V1 ${r.ratio.toFixed(2)}`);
      if (r.accentW > r.anchorW + 2) bad.push("V2 rộng");
      if (r.wrapped || r.clipped) bad.push(r.clipped ? "V8 tràn" : "V8 xuống dòng");
      if (W < 600 && r.accentPx < MIN_SCRIPT_PX) bad.push(`V10 ${r.accentPx.toFixed(1)}px`);
      if (bad.length) fails++;
      rows.push({
        page: p, w: W,
        lockup: `${r.accent} / ${r.anchor}`.slice(0, 48),
        "nét/cap": r.ratio.toFixed(3),
        "dòng": r.lines + (r.wrapped ? "+" : ""),
        "px chính/phụ": `${r.anchorPx.toFixed(0)}/${r.accentPx.toFixed(1)}`,
        ok: bad.length ? "✗ " + bad.join(", ") : "✓",
      });
    }
  }
}
ws.close();
chrome.kill();
console.log(`\nLockup render — V1 nét cao nhất thư pháp = ${RATIO}±${TOL} × chữ in hoa · V2 · V8 một dòng ≥ ${SINGLE_SHARE * 100}% · V10 ≥ ${MIN_SCRIPT_PX}px\n`);
console.table(rows);
const share = single / (instances || 1);
console.log(`Một dòng: ${single}/${instances} (${(share * 100).toFixed(0)}%)`);
if (share < SINGLE_SHARE) fails++;
if (fails) {
  console.error(`✗ ${fails} lỗi — viết lại câu, chạy npm run lockup:qc rồi kiểm lại (V9)`);
  process.exit(1);
}
console.log("✓ Mọi lockup đạt core rules khi hiển thị thật.");
