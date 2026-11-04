// Composes preview.png from the built SVGs. Run from the repo root: node design/logo-tri-duc-media/preview-sheet.cjs
const sharp = require(process.cwd() + "/node_modules/sharp");
const fs = require("fs");
const D = "design/logo-tri-duc-media/svg/";
const r = (n, w) => sharp(Buffer.from(fs.readFileSync(D + n)), { density: 600 }).resize({ width: w }).png().toBuffer();
(async () => {
  const W = 1800, H = 1500;
  const bg = { create: { width: W, height: H, channels: 4, background: "#F5F7FB" } };
  const navyPanel = await sharp({ create: { width: 860, height: 420, channels: 4, background: "#0B1220" } }).png().toBuffer();
  const whitePanel = await sharp({ create: { width: 860, height: 420, channels: 4, background: "#FFFFFF" } }).png().toBuffer();
  const whiteWide = await sharp({ create: { width: 1740, height: 480, channels: 4, background: "#FFFFFF" } }).png().toBuffer();
  const comps = [
    { input: whiteWide, left: 30, top: 30 },
    { input: await r("tri-duc-media-horizontal-color.svg", 1300), left: 250, top: 70 },
    { input: navyPanel, left: 30, top: 540 },
    { input: await r("tri-duc-media-horizontal-reverse.svg", 700), left: 110, top: 640 },
    { input: whitePanel, left: 910, top: 540 },
    { input: await r("tri-duc-media-vertical-color.svg", 330), left: 1175, top: 560 },
    { input: whitePanel, left: 30, top: 990 },
    { input: await r("tri-duc-media-horizontal-mono-black.svg", 700), left: 110, top: 1090 },
    { input: whitePanel, left: 910, top: 990 },
  ];
  let x = 960;
  for (const s of [256, 128, 64, 32, 16]) {
    comps.push({ input: await r("tri-duc-media-app-icon.svg", s), left: x, top: 1200 - s / 2 });
    x += s + 40;
  }
  await sharp(bg).composite(comps).png().toFile("design/logo-tri-duc-media/preview.png");
  console.log("ok");
})();
