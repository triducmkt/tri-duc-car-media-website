// Copies the current logo design into the website (public/brand + app icons).
// Run from the repo root AFTER build.mjs: node design/logo-tri-duc-media/export-web.cjs
// Only run when anh Đức has asked to publish the logo (see AGENTS.md / HISTORY.md).
const fs = require("fs");
const path = require("path");
const sharp = require(path.resolve("node_modules/sharp"));

const D = "design/logo-tri-duc-media";
const PUB = "public/brand";
fs.mkdirSync(path.join(PUB, "motion"), { recursive: true });
const cp = (from, to) => fs.copyFileSync(path.join(D, from), to);

// Header / footer / blog fallback: animated (SMIL, plays once on load)
cp("svg/tri-duc-media-animated-notag-color.svg", `${PUB}/logo.svg`);
cp("svg/tri-duc-media-animated-notag-reverse.svg", `${PUB}/logo-light.svg`);
// With the slogan "Chủ vắng, khách vẫn đông."
cp("svg/tri-duc-media-animated-color.svg", `${PUB}/logo-slogan.svg`);
cp("svg/tri-duc-media-animated-reverse.svg", `${PUB}/logo-slogan-light.svg`);
// Static versions (print, reduced motion, third parties)
cp("svg/tri-duc-media-horizontal-color.svg", `${PUB}/logo-static.svg`);
cp("svg/tri-duc-media-horizontal-reverse.svg", `${PUB}/logo-static-light.svg`);
cp("svg/tri-duc-media-mark-color.svg", `${PUB}/mark.svg`);
cp("svg/tri-duc-media-mark-reverse.svg", `${PUB}/mark-light.svg`);
// Motion
cp("motion/intro-16x9-white.mp4", `${PUB}/motion/logo-motion-16x9.mp4`);
cp("motion/intro-16x9-white-poster.png", `${PUB}/motion/logo-motion-16x9-poster.png`);
cp("motion/intro-9x16-navy.mp4", `${PUB}/motion/logo-motion-9x16.mp4`);
cp("motion/intro-9x16-navy.gif", `${PUB}/motion/logo-motion-9x16.gif`);
cp("motion/intro-16x9-white.gif", `${PUB}/motion/logo-motion-16x9.gif`);

(async () => {
  const svgBuf = (n) => fs.readFileSync(path.join(D, "svg", n));
  // Raster logos used by JSON-LD / old references
  await sharp(svgBuf("tri-duc-media-horizontal-color.svg"), { density: 600 }).resize({ width: 1600 }).png().toFile(`${PUB}/logo-mark.png`);
  await sharp(svgBuf("tri-duc-media-horizontal-color.svg"), { density: 600 }).resize({ width: 1600 }).flatten({ background: "#FFFFFF" }).png().toFile(`${PUB}/logo.png`);
  await sharp(svgBuf("tri-duc-media-horizontal-color.svg"), { density: 600 }).resize({ width: 500 }).flatten({ background: "#FFFFFF" }).jpeg({ quality: 92 }).toFile(`${PUB}/logo-white.jpg`);
  // App icons (Next.js file conventions)
  const icon = svgBuf("tri-duc-media-app-icon.svg");
  await sharp(icon, { density: 600 }).resize(512, 512).png().toFile("app/icon.png");
  await sharp(icon, { density: 600 }).resize(180, 180).png().toFile("app/apple-icon.png");
  // favicon.ico with 16/32/48 PNG entries
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((s) => sharp(icon, { density: 600 }).resize(s, s).png().toBuffer()));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  const dir = Buffer.alloc(16 * sizes.length);
  let offset = 6 + dir.length;
  sizes.forEach((s, i) => {
    const e = i * 16;
    dir.writeUInt8(s, e); dir.writeUInt8(s, e + 1); dir.writeUInt8(0, e + 2); dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4); dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(pngs[i].length, e + 8); dir.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync("app/favicon.ico", Buffer.concat([header, dir, ...pngs]));
  console.log("exported logo v10 to public/brand + app icons");
})();
