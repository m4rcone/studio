#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let config;
try {
  const raw = readFileSync(join(root, "content/site.config.json"), "utf-8");
  config = JSON.parse(raw);
} catch (err) {
  console.error("✗ Failed to read content/site.config.json:", err.message);
  process.exit(1);
}

if (
  !config.theme?.colors ||
  !config.theme?.fonts ||
  !config.theme?.borderRadius
) {
  console.error(
    '✗ site.config.json is missing required fields under "theme" (colors, fonts, borderRadius).',
  );
  process.exit(1);
}

const { colors, fonts, borderRadius } = config.theme;

const vars = [
  ...Object.entries(colors).map(([k, v]) => `  --color-${k}: ${v};`),
  `  --font-heading: ${fonts.heading}, sans-serif;`,
  `  --font-body: ${fonts.body}, sans-serif;`,
  `  --radius: ${borderRadius};`,
].join("\n");

const css = `/* AUTO-GENERATED — do not edit manually. Edit content/site.config.json instead. */
@theme {
${vars}
}
`;

try {
  const out = join(root, "src/app/theme.generated.css");
  writeFileSync(out, css, "utf-8");
  console.log("✓ theme.generated.css updated");
} catch (err) {
  console.error("✗ Failed to write theme.generated.css:", err.message);
  process.exit(1);
}
