// Builds the single compact icon bundle the web app loads directly.
// Reads the human-readable source (icon-data.json), validates it, and emits
// a minified bundle next to it. Run: npm run build:icons --workspace @reicon/web
// (or root `npm run build:icons`). Only needed when icon-data.json changes;
// `npm run build` assumes the bundle already exists.
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "apps", "web", "src", "data");
const srcFile = join(dataDir, "icon-data.json");
const outFile = join(dataDir, "icon-data.bundle.json");

const raw = readFileSync(srcFile, "utf8");
const data = JSON.parse(raw); // throws on invalid JSON — fail the build loudly

// --- SVG path optimization (2-decimal precision is invisible at render
// scale: 0.01 units on a 24-grid ≈ 0.04px at 96px) ---
function roundNum(m) {
  const n = Number(Number(m).toFixed(2));
  return Object.is(n, -0) ? "0" : String(n);
}

function optimizeD(d) {
  return d
    .replace(/-?\d*\.\d+(?:e-?\d+)?/gi, roundNum) // 12.3704 -> 12.37, 8.00 -> 8
    .replace(/(?<![\d.])0\./g, ".") // 0.5 -> .5 where unambiguous
    .replace(/([MLHVCSQTAZmlhvcsqtaz])\s+/g, "$1") // M 12 -> M12
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/ -/g, "-"); // 9.2 -4.1 -> 9.2-4.1
}

const cmdRe = /[MLHVCSQTAZmlhvcsqtaz]/g;
const numRe = /-?\d*\.?\d+(?:e-?\d+)?/gi;
function commandsOf(d) {
  return (d.match(cmdRe) || []).join("");
}
function numbersOf(d) {
  return (d.match(numRe) || []).length;
}

const categories = data.categories ?? {};
const catNames = Object.keys(categories);
let total = 0;
let codeBytesBefore = 0;
let codeBytesAfter = 0;
const seen = new Map();
const dups = [];
for (const [cat, icons] of Object.entries(categories)) {
  for (const [kebab, iconObj] of Object.entries(icons)) {
    total++;
    if (typeof iconObj.code === "string" && iconObj.code.length > 0) {
      codeBytesBefore += iconObj.code.length;
      // Optimize only inside d="..." — attribute structure stays untouched.
      iconObj.code = iconObj.code.replace(/d="([^"]*)"/g, (m, d) => {
        const before = String(d);
        const after = optimizeD(before);
        // Structural validation: identical command sequence + number count.
        if (commandsOf(before) !== commandsOf(after) || numbersOf(before) !== numbersOf(after)) {
          throw new Error(`[build:icons] path validation failed for "${kebab}" (${cat})`);
        }
        return `d="${after}"`;
      });
      codeBytesAfter += iconObj.code.length;
    }
    if (seen.has(kebab)) dups.push(`${kebab} (${seen.get(kebab)} + ${cat})`);
    else seen.set(kebab, cat);
  }
}

const minified = JSON.stringify(data);
writeFileSync(outFile, minified);

const { gzipSync } = await import("node:zlib");
const before = statSync(srcFile).size;
const after = statSync(outFile).size;
const gzipBefore = gzipSync(Buffer.from(raw)).length;
const gzipAfter = gzipSync(Buffer.from(minified)).length;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
console.log(`[build:icons] categories: ${catNames.length}, icons: ${total}, unique: ${seen.size}`);
console.log(
  `[build:icons] path code: ${mb(codeBytesBefore)} -> ${mb(codeBytesAfter)} (saved ${mb(codeBytesBefore - codeBytesAfter)})`,
);
console.log(`[build:icons] categories: ${catNames.length}, icons: ${total}, unique: ${seen.size}`);
if (dups.length > 0) {
  console.log(`[build:icons] note: ${dups.length} kebab names repeat across categories (rendered per-category, no action needed):`);
  for (const d of dups.slice(0, 10)) console.log(`  - ${d}`);
  if (dups.length > 10) console.log(`  …and ${dups.length - 10} more`);
}
console.log(
  `[build:icons] bundle: ${mb(before)} -> ${mb(after)} | gzip: ${mb(gzipBefore)} -> ${mb(gzipAfter)} written to ${outFile}`,
);
