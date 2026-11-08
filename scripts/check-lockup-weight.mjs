#!/usr/bin/env node
// Lockup visual-weight audit — rule V1 in docs/DESIGN-CORE-RULES.md.
// Every <Lockup> must read as anchor ≈ 75% / accent ≈ 25% of visual weight.
//
// Visual weight = INK AREA: the number of pixels the glyphs actually fill,
// rasterised in the page with the real web fonts, real computed font-size,
// weight, letter-spacing and case. Both lines share one colour, so ink area
// alone decides the balance. Line wrapping does not change ink area.
//
// Pass band: accent share 20–30 % of (accent + anchor) ink. Also checks the
// accent line is not wider than the anchor's widest line (rule V2).
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
const MIN = 0.2, MAX = 0.3;

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

// Runs in the page: rasterise each line's text with its computed style.
const MEASURE = `(async () => {
  await document.fonts.ready;
  const ink = (el, upper) => {
    const cs = getComputedStyle(el);
    const text = upper ? el.textContent.toUpperCase() : el.textContent;
    const size = parseFloat(cs.fontSize);
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    ctx.font = font;
    if (cs.letterSpacing !== "normal") ctx.letterSpacing = cs.letterSpacing;
    c.width = Math.ceil(ctx.measureText(text).width + size * 2);
    c.height = Math.ceil(size * 2.6);
    ctx.font = font;
    if (cs.letterSpacing !== "normal") ctx.letterSpacing = cs.letterSpacing;
    ctx.textBaseline = "middle";
    ctx.fillText(text, size, c.height / 2);
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < px.length; i += 4) n += px[i] / 255;
    return n;
  };
  return [...document.querySelectorAll(".lockup")].map((l) => {
    const a = l.querySelector(".lockup-accent"), b = l.querySelector(".lockup-anchor");
    const ia = ink(a, false), ib = ink(b, true);
    const aw = a.getBoundingClientRect().width;
    const bw = Math.max(...[...b.getClientRects()].map((r) => r.width));
    return { accent: a.textContent, anchor: b.textContent, share: ia / (ia + ib), accentW: Math.round(aw), anchorW: Math.round(bw) };
  });
})()`;

let fails = 0;
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
    if (!res) { rows.push({ page: p, w: W, lockup: "(none found)", share: "-", width: "-", ok: "✗" }); fails++; continue; }
    for (const r of res) {
      const shareOk = r.share >= MIN && r.share <= MAX;
      const widthOk = r.accentW <= r.anchorW * 1.0 + 2;
      if (!shareOk || !widthOk) fails++;
      rows.push({
        page: p,
        w: W,
        lockup: `${r.accent} / ${r.anchor}`.slice(0, 58),
        share: `${(r.share * 100).toFixed(1)}%`,
        width: `${r.accentW}/${r.anchorW}`,
        ok: shareOk && widthOk ? "✓" : shareOk ? "✗ width" : "✗ weight",
      });
    }
  }
}
ws.close();
chrome.kill();
console.log(`\nLockup visual weight — accent share target ${MIN * 100}–${MAX * 100}% (docs/DESIGN-CORE-RULES.md V1), accent width ≤ anchor (V2)\n`);
console.table(rows);
if (fails) {
  console.error(`✗ ${fails} lockup(s) outside the 75/25 rule`);
  process.exit(1);
}
console.log("✓ Every lockup reads 75 / 25.");
