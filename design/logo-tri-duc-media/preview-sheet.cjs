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
  const W = 1800, H = 1640;
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
  await sharp({ create: { width: W, height: H, channels: 4, background: "#F5F7FB" } })
    .composite(comps)
    .png()
    .toFile("design/logo-tri-duc-media/preview.png");
  console.log("ok");
})();
