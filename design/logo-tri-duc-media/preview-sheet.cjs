// Composes preview.png from the built SVGs. Run from the repo root:
//   node design/logo-tri-duc-media/preview-sheet.cjs
// Since v4 the sheet includes real-use mockups: a storefront sign (tagline
// lockup on navy) and round social/Zalo avatars.
const sharp = require(process.cwd() + "/node_modules/sharp");
const fs = require("fs");
const D = "design/logo-tri-duc-media/svg/";
const r = (n, w) => sharp(Buffer.from(fs.readFileSync(D + n)), { density: 600 }).resize({ width: w }).png().toBuffer();
const panel = (w, h, bg) => sharp({ create: { width: w, height: h, channels: 4, background: bg } }).png().toBuffer();
const circle = async (size, bg) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bg}"/></svg>`)).png().toBuffer();

(async () => {
  const W = 1800, H = 2720;
  const comps = [
    // 1. Main lockup with brand promise
    { input: await panel(1740, 600, "#FFFFFF"), left: 30, top: 30 },
    { input: await r("tri-duc-media-horizontal-tagline-color.svg", 1060), left: 370, top: 80 },
    // 2. Storefront sign mockup (navy board, wall behind)
    { input: await panel(860, 440, "#D9D4CB"), left: 30, top: 660 },
    { input: await panel(760, 320, "#0B1220"), left: 80, top: 720 },
    { input: await r("tri-duc-media-horizontal-tagline-reverse.svg", 600), left: 160, top: 745 },
    // 3. Vertical lockup
    { input: await panel(860, 440, "#FFFFFF"), left: 910, top: 660 },
    { input: await r("tri-duc-media-vertical-color.svg", 300), left: 1190, top: 690 },
    // 4. Mono (stamp / embroidery)
    { input: await panel(860, 480, "#FFFFFF"), left: 30, top: 1130 },
    { input: await r("tri-duc-media-horizontal-mono-black.svg", 640), left: 140, top: 1250 },
    // 5. App icons + round avatars (Zalo / Facebook crop the icon to a circle)
    { input: await panel(860, 480, "#FFFFFF"), left: 910, top: 1130 },
  ];
  let x = 950;
  for (const s of [200, 96, 48, 32]) {
    comps.push({ input: await r("tri-duc-media-app-icon.svg", s), left: x, top: 1260 - s / 2 });
    x += s + 36;
  }
  // circular avatar: mask the icon to a circle
  for (const [s, left] of [[180, 1010], [72, 1240]]) {
    const icon = await r("tri-duc-media-app-icon.svg", s);
    const masked = await sharp(icon).composite([{ input: await circle(s, "#000"), blend: "dest-in" }]).png().toBuffer();
    comps.push({ input: masked, left, top: 1490 - s / 2 });
  }
  // 6. Uniform mockup (v6): navy tee, white/green mark on the left chest
  const tee = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="420" viewBox="0 0 440 420"><path d="M140 30 L185 14 Q220 52 255 14 L300 30 L420 96 L378 172 L330 146 L330 404 L110 404 L110 146 L62 172 L20 96 Z" fill="#0B1220"/><path d="M185 14 Q220 52 255 14" fill="none" stroke="#1C2740" stroke-width="10"/></svg>`;
  comps.push({ input: await panel(860, 500, "#E9EEF3"), left: 30, top: 1640 });
  comps.push({ input: await sharp(Buffer.from(tee)).png().toBuffer(), left: 240, top: 1680 });
  comps.push({ input: await r("tri-duc-media-mark-reverse.svg", 70), left: 470, top: 1790 });
  // 7. Business cards (v6): front white with the colour lockup, back navy with the promise
  comps.push({ input: await panel(860, 500, "#E9EEF3"), left: 910, top: 1640 });
  const card = (bg) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="380" height="220"><rect width="380" height="220" rx="12" fill="${bg}"/></svg>`)).png().toBuffer();
  comps.push({ input: await card("#FFFFFF"), left: 950, top: 1700 });
  comps.push({ input: await r("tri-duc-media-horizontal-color.svg", 280), left: 1000, top: 1755 });
  comps.push({ input: await card("#0B1220"), left: 1350, top: 1880 });
  comps.push({ input: await r("tri-duc-media-horizontal-tagline-reverse.svg", 300), left: 1390, top: 1915 });
  // 8. Vehicle mockup (v7): white service van, tagline lockup on the side panel
  const van = `<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="440" viewBox="0 0 1300 440">
    <path d="M60 330 V110 Q60 60 110 60 H880 Q930 60 965 95 L1110 200 Q1150 215 1170 240 V330 Q1170 350 1150 350 H80 Q60 350 60 330 Z" fill="#FFFFFF" stroke="#C9D2DC" stroke-width="4"/>
    <path d="M905 95 H955 L1080 195 H905 Z" fill="#1B2638"/>
    <rect x="60" y="300" width="1110" height="22" fill="#0B1220"/>
    <circle cx="260" cy="350" r="62" fill="#1B2638"/><circle cx="260" cy="350" r="28" fill="#8792A2"/>
    <circle cx="990" cy="350" r="62" fill="#1B2638"/><circle cx="990" cy="350" r="28" fill="#8792A2"/>
  </svg>`;
  comps.push({ input: await panel(1740, 500, "#E9EEF3"), left: 30, top: 2180 });
  comps.push({ input: await sharp(Buffer.from(van)).png().toBuffer(), left: 250, top: 2220 });
  comps.push({ input: await r("tri-duc-media-horizontal-tagline-color.svg", 500), left: 420, top: 2275 });
  await sharp({ create: { width: W, height: H, channels: 4, background: "#F5F7FB" } })
    .composite(comps)
    .png()
    .toFile("design/logo-tri-duc-media/preview.png");
  console.log("ok");
})();
