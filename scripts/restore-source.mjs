import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const payload = path.join(root, "payload");

function restore(prefix, output) {
  const parts = fs.readdirSync(payload)
    .filter((name) => name.startsWith(prefix + ".") && name.endsWith(".part"))
    .sort();
  if (!parts.length) throw new Error(`Missing payload for ${prefix}`);
  const base64 = parts.map((name) => fs.readFileSync(path.join(payload, name), "utf8").trim()).join("");
  const source = zlib.gunzipSync(Buffer.from(base64, "base64"));
  fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true });
  fs.writeFileSync(path.join(root, output), source);
  console.log(`Restored ${output}`);
}

function injectCoreIntegration(output) {
  const file = path.join(root, output);
  let source = fs.readFileSync(file, "utf8");
  const integrations = [
    ["import './core-hp-integration';", '// Build-time core integration: all HP damage controls route through Damage Resist.'],
    ["import './campaign-role-visibility';", '// Build-time campaign role guard: keep GM navigation available to local/GM users and hidden from confirmed players.']
  ];
  let changed = false;
  for (const [marker, comment] of integrations) {
    if (!source.includes(marker)) {
      source += `\n\n${comment}\n${marker}\n`;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, source);
    console.log(`Integrated runtime guards into ${output}`);
  }
}

function logLandingSource(output) {
  const source = fs.readFileSync(path.join(root, output), "utf8");
  const needles = [
    "ginger-dragon-fire-full.webp",
    "Ginger Dragon Fire",
    "Games • Software • Adventures",
    "Crawlers are entering the dungeon",
    "A home for the tools, games, and adventures we forge"
  ];
  for (const needle of needles) {
    const index = source.indexOf(needle);
    if (index < 0) continue;
    const start = Math.max(0, index - 900);
    const end = Math.min(source.length, index + needle.length + 1400);
    console.log(`LANDING_SOURCE_START ${needle}`);
    console.log(source.slice(start, end));
    console.log(`LANDING_SOURCE_END ${needle}`);
  }
}

restore("main", "src/main.tsx");
restore("styles", "src/styles.css");
injectCoreIntegration("src/main.tsx");
logLandingSource("src/main.tsx");
