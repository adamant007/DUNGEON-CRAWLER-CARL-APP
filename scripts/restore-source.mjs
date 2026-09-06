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
  const marker = "import './core-hp-integration';";
  if (!source.includes(marker)) {
    source += `\n\n// Build-time core integration: all HP damage controls route through Damage Resist.\n${marker}\n`;
    fs.writeFileSync(file, source);
    console.log(`Integrated HP/Damage Resist into ${output}`);
  }
}

restore("main", "src/main.tsx");
restore("styles", "src/styles.css");
injectCoreIntegration("src/main.tsx");
