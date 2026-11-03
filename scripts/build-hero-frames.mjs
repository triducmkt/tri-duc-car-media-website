// Builds the scroll-scrub hero frames (components/home/FootageHero.tsx) from
// the real 12/09/2025 field footage (AP Car Care visit + AP Education work
// session). Each segment is trimmed, cropped to a focal point, colour graded
// to the site's premium ink/gold tone and written as numbered WebP frames:
//   public/hero/d/NNN.webp  desktop media card, 3:4 (720×960)
//   public/hero/m/NNN.webp  mobile full-bleed, 9:16 (540×960)
// plus lib/heroFrames.ts (frame count + where each of the 5 steps starts).
//
//   node scripts/build-hero-frames.mjs            full build
//   node scripts/build-hero-frames.mjs --preview  graded contact sheet only
//
// Needs ffmpeg/ffprobe on PATH and the source clips in FOOTAGE_DIR.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const FOOTAGE_DIR =
  "D:/My Documents/KINH DOANH/All-in-one Business Plan/Cac kinh doanh TDC Media tu van/TRI DUC CAR MEDIA/Tu lieu hinh anh";

// step: which of the 5 reel steps (messages → reel.steps) the segment illustrates.
// fx/fy: focal point (0–1) the crop is centred on. Office clips are tripod
// shots, so they are sampled sparsely across a longer span (time-lapse).
const SEGMENTS = [
  { file: "20250912_152431.mp4", from: 0.0, to: 13.0, frames: 30, step: 0, fx: 0.5, fy: 0.5 },
  { file: "20250912_152244.mp4", from: 9.0, to: 19.5, frames: 20, step: 1, fx: 0.5, fy: 0.52 },
  { file: "20250912_152151.mp4", from: 2.5, to: 12.5, frames: 18, step: 1, fx: 0.5, fy: 0.45 },
  { file: "20250912_141814.mp4", from: 200, to: 320, frames: 16, step: 2, fx: 0.7, fy: 0.5 },
  { file: "20250912_144307.mp4", from: 330, to: 440, frames: 14, step: 3, fx: 0.45, fy: 0.5 },
  { file: "20250912_145127.mp4", from: 120, to: 260, frames: 16, step: 4, fx: 0.66, fy: 0.5 },
];

const OUTPUTS = [
  { key: "d", w: 720, h: 960, q: 60 },
  { key: "m", w: 540, h: 960, q: 56 },
];

// Premium / business grade: calmer saturation, deeper contrast, shadows
// pushed toward the site's ink navy, highlights warmed toward gold, soft
// vignette. Same grade on every clip so street and office footage match.
const GRADE = [
  "huesaturation=saturation=-0.45:colors=g+c",
  "eq=contrast=1.12:brightness=-0.04:saturation=0.7:gamma=0.97",
  "colorbalance=rs=-0.07:gs=-0.02:bs=0.08:rm=0.0:gm=-0.03:bm=0.01:rh=0.07:gh=0.03:bh=-0.05",
  "curves=master='0/0.035 0.22/0.17 0.7/0.72 1/0.94'",
  "vignette=angle=PI/4.5",
].join(",");

const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

// Crop the largest w:h window around (fx, fy), then scale.
function cropScale(w, h, fx, fy) {
  const r = `${w}/${h}`;
  const cw = `if(gt(iw/ih\\,${r})\\,ih*${r}\\,iw)`;
  const ch = `if(gt(iw/ih\\,${r})\\,ih\\,iw/(${r}))`;
  const x = `max(0\\,min(iw-ow\\,iw*${fx}-ow/2))`;
  const y = `max(0\\,min(ih-oh\\,ih*${fy}-oh/2))`;
  return `crop=w=${cw}:h=${ch}:x=${x}:y=${y},scale=${w}:${h}:flags=lanczos`;
}

function segmentFilter(seg, out) {
  const fps = seg.frames / (seg.to - seg.from);
  return `fps=${fps.toFixed(5)},${cropScale(out.w, out.h, seg.fx, seg.fy)},${GRADE}`;
}

const preview = process.argv.includes("--preview");

if (preview) {
  const dir = join(tmpdir(), "hero-preview");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  SEGMENTS.forEach((seg, i) => {
    const mid = (seg.from + seg.to) / 2;
    const src = join(FOOTAGE_DIR, seg.file);
    const crop = cropScale(360, 480, seg.fx, seg.fy);
    run(["-ss", String(mid), "-i", src, "-frames:v", "1", "-vf", crop, join(dir, `a${i}.png`)]);
    run(["-ss", String(mid), "-i", src, "-frames:v", "1", "-vf", `${crop},${GRADE}`, join(dir, `b${i}.png`)]);
  });
  const n = SEGMENTS.length;
  const inputs = [];
  for (let i = 0; i < n; i++) inputs.push("-i", join(dir, `a${i}.png`));
  for (let i = 0; i < n; i++) inputs.push("-i", join(dir, `b${i}.png`));
  const top = [...Array(n).keys()].map((i) => `[${i}:v]`).join("");
  const bot = [...Array(n).keys()].map((i) => `[${i + n}:v]`).join("");
  const out = join(dir, "compare.jpg");
  run([...inputs, "-filter_complex", `${top}hstack=${n}[t];${bot}hstack=${n}[b];[t][b]vstack`, out]);
  console.log("Before (top) / after (bottom):", out);
  process.exit(0);
}

const starts = [];
let total = 0;
for (const out of OUTPUTS) {
  const dir = join("public", "hero", out.key);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  let index = 0;
  starts.length = 0;
  SEGMENTS.forEach((seg, s) => {
    if (starts[seg.step] === undefined) starts[seg.step] = index;
    const tmp = join(tmpdir(), `hero-${out.key}-${s}`);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    run([
      "-ss", String(seg.from), "-t", String(seg.to - seg.from),
      "-i", join(FOOTAGE_DIR, seg.file),
      "-vf", segmentFilter(seg, out),
      "-frames:v", String(seg.frames),
      "-c:v", "libwebp", "-quality", String(out.q), "-compression_level", "6",
      join(tmp, "%03d.webp"),
    ]);
    for (const f of readdirSync(tmp).sort()) {
      index++;
      execFileSync(process.platform === "win32" ? "cmd" : "cp",
        process.platform === "win32"
          ? ["/c", "copy", "/y", join(tmp, f), join(dir, `${String(index).padStart(3, "0")}.webp`)]
          : [join(tmp, f), join(dir, `${String(index).padStart(3, "0")}.webp`)],
        { stdio: "ignore" });
    }
    rmSync(tmp, { recursive: true, force: true });
  });
  total = index;
  const bytes = readdirSync(dir).reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
  console.log(`${out.key}: ${index} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
}

writeFileSync(
  join("lib", "heroFrames.ts"),
  `// Generated by scripts/build-hero-frames.mjs — do not edit by hand.\n` +
    `export const HERO_FRAME_COUNT = ${total};\n` +
    `/** First frame index (0-based) of each of the 5 reel steps. */\n` +
    `export const HERO_STEP_STARTS = ${JSON.stringify(starts)};\n`,
);
console.log("Step starts:", starts);
