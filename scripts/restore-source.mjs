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

function cleanLandingSource(output) {
  const file = path.join(root, output);
  let source = fs.readFileSync(file, "utf8");
  const replacements = [
    ['<img className="studio-hero-logo" src="/brand/hero.webp" alt="Ginger Dragon Fire Studios dragon logo"/>', ''],
    ['<div className="landing-kicker">GINGER DRAGON FIRE STUDIOS</div>', '<div className="landing-kicker">GINGER DRAGON STUDIOS</div>'],
    ['<h1 className="sr-only">Ginger Dragon Fire</h1>', '<h1 className="sr-only">Ginger Dragon Studios</h1>'],
    ['<span>New Ginger Dragon Fire projects will appear here.</span>', '<span>New Ginger Dragon projects will appear here.</span>'],
    ['<div className="landing-features"><span>⚔️ Games</span><span>🛠️ Software</span><span>🔥 Adventures</span><span>🐉 Original Worlds</span></div>', ''],
    ['<div className="landing-note">Independent studio • Built by Ginger Dragon Fire Studios</div>', '<div className="landing-note">Independent studio • Built by Ginger Dragon Studios • © 2026 Ginger Dragon Studios</div>'],
    ['<div className="landing-note">Independent studio • Built by Ginger Dragon Studios</div>', '<div className="landing-note">Independent studio • Built by Ginger Dragon Studios • © 2026 Ginger Dragon Studios</div>']
  ];
  let changed = false;
  for (const [from, to] of replacements) {
    if (source.includes(from)) {
      source = source.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, source);
    console.log('Cleaned canonical landing source');
  }
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

restore("main", "src/main.tsx");
restore("styles", "src/styles.css");
cleanLandingSource("src/main.tsx");
injectCoreIntegration("src/main.tsx");
