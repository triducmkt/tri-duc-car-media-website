// Saves the current design as history/<version>/ so later rounds can compare.
// Run from the repo root after build + preview: node design/logo-tri-duc-media/snapshot.cjs v3
const fs = require("fs");
const path = require("path");
const v = process.argv[2];
if (!/^v\d+$/.test(v || "")) throw new Error("Usage: node snapshot.cjs v3");
const base = path.join("design", "logo-tri-duc-media");
const out = path.join(base, "history", v);
if (fs.existsSync(out)) throw new Error(`${out} already exists — history is append-only`);
fs.mkdirSync(out, { recursive: true });
for (const f of ["preview.png", "svg/tri-duc-media-horizontal-color.svg", "svg/tri-duc-media-app-icon.svg"]) {
  fs.copyFileSync(path.join(base, f), path.join(out, path.basename(f)));
}
console.log("saved", out);
