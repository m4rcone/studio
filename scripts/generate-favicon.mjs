/**
 * Generates src/app/favicon.ico from the brand colors defined in site.config.json.
 * Uses sharp (already a Next.js dependency) to render SVG → PNG, then wraps in ICO format.
 * Run with: node scripts/generate-favicon.mjs
 */

import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Read brand colors from site.config.json
const config = JSON.parse(
  readFileSync(path.join(root, "content/site.config.json"), "utf-8"),
);
const primary = config.theme.colors.primary;
const secondary = config.theme.colors.secondary;

/**
 * Builds an SVG for the favicon: square background with a geometric "A" mark.
 * Uses paths (no text) so rendering is font-independent.
 */
function buildSvg(size) {
  const s = size;
  const pad = s * 0.2;
  // const w = s - pad * 2;

  // Triangle "A" — two legs and a crossbar
  const tipX = s / 2;
  const tipY = pad;
  const leftX = pad;
  const rightX = s - pad;
  const baseY = s - pad;

  // Stroke width proportional to size
  const sw = Math.max(1.5, s * 0.075);

  // Crossbar at ~55% height
  const crossT = 0.55;
  const crossY = tipY + (baseY - tipY) * crossT;
  const crossLeft = tipX + (leftX - tipX) * crossT;
  const crossRight = tipX + (rightX - tipX) * crossT;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
  <rect width="${s}" height="${s}" fill="${primary}"/>
  <line x1="${tipX}" y1="${tipY}" x2="${leftX}" y2="${baseY}"
        stroke="${secondary}" stroke-width="${sw}" stroke-linecap="square"/>
  <line x1="${tipX}" y1="${tipY}" x2="${rightX}" y2="${baseY}"
        stroke="${secondary}" stroke-width="${sw}" stroke-linecap="square"/>
  <line x1="${crossLeft}" y1="${crossY}" x2="${crossRight}" y2="${crossY}"
        stroke="${secondary}" stroke-width="${sw}" stroke-linecap="square"/>
</svg>`;
}

/**
 * Assembles multiple PNG buffers into a valid ICO binary.
 * ICO format supports embedded PNG images (supported since Windows Vista).
 */
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const imageOffset = headerSize + dirEntrySize * count;

  // ICONDIR header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4);

  // ICONDIRENTRY for each image
  const dirEntries = [];
  let currentOffset = imageOffset;
  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const dim = sizes[i] >= 256 ? 0 : sizes[i]; // 0 means 256 in ICO spec
    entry.writeUInt8(dim, 0); // Width
    entry.writeUInt8(dim, 1); // Height
    entry.writeUInt8(0, 2); // ColorCount (0 = no palette)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Planes
    entry.writeUInt16LE(32, 6); // BitCount
    entry.writeUInt32LE(pngBuffers[i].length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset from start of file
    dirEntries.push(entry);
    currentOffset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

// Generate PNG at 16×16 and 32×32
const sizes = [16, 32];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(buildSvg(size)))
      .resize(size, size)
      .png()
      .toBuffer(),
  ),
);

const ico = buildIco(pngBuffers, sizes);
const outPath = path.join(root, "src/app/favicon.ico");
writeFileSync(outPath, ico);

console.log(
  `✓ favicon.ico generated (${sizes.join("×, ")}×px) → src/app/favicon.ico`,
);
