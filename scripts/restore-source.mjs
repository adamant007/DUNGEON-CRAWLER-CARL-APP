import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const payload = path.join(root, "payload");

function restore(prefix, output) {
  const parts = fs.readdirSync(payload).filter((name) => name.startsWith(prefix + ".") && name.endsWith(".part")).sort();
  if (!parts.length) throw new Error(`Missing payload for ${prefix}`);
  const base64 = parts.map((name) => fs.readFileSync(path.join(payload, name), "utf8").trim()).join("");
  const source = zlib.gunzipSync(Buffer.from(base64, "base64"));
  fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true });
  fs.writeFileSync(path.join(root, output), source);
  console.log(`Restored ${output}`);
}

function restoreBrandAsset() {
  const parts = fs.readdirSync(payload).filter((name) => name.startsWith("ginger-dragon-master.") && name.endsWith(".b64part")).sort();
  if (!parts.length) throw new Error("Missing Ginger Dragon master hero payload");
  const encoded = parts.map((name) => fs.readFileSync(path.join(payload, name), "utf8").trim()).join("");
  const output = path.join(root, "public/brand/ginger-dragon-studios-hero.webp");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, Buffer.from(encoded, "base64"));
  console.log(`Restored Ginger Dragon Studios hero asset from ${parts.length} parts`);
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
    ['<div className="landing-note">Independent studio • Built by Ginger Dragon Fire Studios</div>', '<div className="landing-note">© 2026 Ginger Dragon Studios</div>'],
    ['<div className="landing-note">Independent studio • Built by Ginger Dragon Studios</div>', '<div className="landing-note">© 2026 Ginger Dragon Studios</div>'],
    ['<div className="landing-note">Independent studio • Built by Ginger Dragon Studios • © 2026 Ginger Dragon Studios</div>', '<div className="landing-note">© 2026 Ginger Dragon Studios</div>'],
    ['<div className="landing-card">', '<div className="landing-card landing-card-v2">']
  ];
  let changed = false;
  for (const [from, to] of replacements) if (source.includes(from)) { source = source.replace(from, to); changed = true; }
  const hero = '<img className="studio-hero-art" src="/brand/ginger-dragon-studios-hero.webp" alt="Ginger Dragon Studios dragon artwork"/>';
  if (!source.includes('className="studio-hero-art"')) {
    const marker = '<div className="landing-card landing-card-v2">';
    if (!source.includes(marker)) throw new Error('Landing card marker not found');
    source = source.replace(marker, marker + hero); changed = true;
  }
  if (changed) { fs.writeFileSync(file, source); console.log('Rebuilt Ginger Dragon Studios landing shell'); }
}

function traceDashboard(output) {
  const source = fs.readFileSync(path.join(root, output), "utf8");
  const chunks = [];
  for (const needle of ['CURRENT CRAWLER','Current Crawler','Dice','Rulebook','Character Wizard']) {
    let from = 0;
    while (true) {
      const i = source.indexOf(needle, from);
      if (i === -1) break;
      chunks.push(`===== ${needle} @ ${i} =====\n${source.slice(Math.max(0,i-3000), i+6500)}\n`);
      from = i + needle.length;
    }
  }
  const traceFile = path.join(root, 'public/dashboard-source-trace.txt');
  fs.writeFileSync(traceFile, chunks.join('\n'));
  console.log(`Wrote dashboard source trace (${chunks.length} matches)`);
}

function simplifyDashboard(output) {
  const file = path.join(root, output);
  let source = fs.readFileSync(file, "utf8");
  const start = source.indexOf('<section className="quick-grid">');
  if (start !== -1) {
    const end = source.indexOf('</section>', start);
    if (end !== -1) {
      source = source.slice(0, start) + source.slice(end + 10);
      console.log('Removed redundant dashboard shortcut grid');
    }
  }
  const current = source.indexOf('<section className="card"><h2>Current Crawler</h2>');
  if (current !== -1) {
    const end = source.indexOf('</section>', current);
    if (end !== -1) {
      const old = source.slice(current, end + 10);
      const replacement = `<section className="card dashboard-sheet-card"><h2>Current Crawler</h2><div className="dashboard-sheet-intro">Your active character sheet is your dashboard. Open Character to edit it.</div><button className="dashboard-sheet-open" onClick={()=>setTab('Character')}>Open Character Sheet</button></section>`;
      source = source.replace(old, replacement);
      console.log('Simplified Current Crawler dashboard card');
    }
  }
  fs.writeFileSync(file, source);
}

function injectLandingHeroStyles(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  const marker = '/* ginger-dragon-studios-clean-hero */';
  if (!source.includes(marker)) source += `\n${marker}\n.studio-hero-art{display:block;width:min(360px,72vw);height:auto;object-fit:contain;object-position:center;margin:0 auto 28px;border:0;border-radius:0;background:transparent;box-shadow:none}\n@media(max-width:760px){.studio-hero-art{width:min(300px,74vw);margin-bottom:22px}}\n`;
  const v2 = '/* ginger-dragon-studios-landing-v2 */';
  if (!source.includes(v2)) source += `\n${v2}\n.landing-card-v2{max-width:980px}\n.landing-card-v2 .studio-hero-art{display:block!important;width:min(512px,90vw)!important;max-width:100%!important;height:auto!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important;margin:0 auto 26px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:0 26px 60px rgba(0,0,0,.30)!important;image-rendering:auto!important}\n@media(max-width:760px){.landing-card-v2 .studio-hero-art{width:min(460px,90vw)!important;margin-bottom:20px!important}}\n`;
  const dash = '/* dashboard-character-sheet-first */';
  if (!source.includes(dash)) source += `\n${dash}\n.dashboard-sheet-card{text-align:center}.dashboard-sheet-intro{color:#b9b5c7;margin:8px auto 14px;max-width:560px}.dashboard-sheet-open{min-height:48px;padding:0 22px;border-radius:10px;border:1px solid rgba(212,167,65,.55);background:linear-gradient(180deg,#322710,#171207);color:#f2d47d;font-weight:800;cursor:pointer}\n`;
  fs.writeFileSync(file, source); console.log('Integrated Ginger Dragon Studios landing v2 styles');
}

function injectCoreIntegration(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  const integrations = [["import './core-hp-integration';", '// Build-time core integration: all HP damage controls route through Damage Resist.'], ["import './campaign-role-visibility';", '// Build-time campaign role guard: keep GM navigation available to local/GM users and hidden from confirmed players.']];
  let changed = false;
  for (const [marker, comment] of integrations) if (!source.includes(marker)) { source += `\n\n${comment}\n${marker}\n`; changed = true; }
  if (changed) { fs.writeFileSync(file, source); console.log(`Integrated runtime guards into ${output}`); }
}

restore("main", "src/main.tsx");
restore("styles", "src/styles.css");
restoreBrandAsset();
cleanLandingSource("src/main.tsx");
traceDashboard("src/main.tsx");
simplifyDashboard("src/main.tsx");
injectLandingHeroStyles("src/styles.css");
injectCoreIntegration("src/main.tsx");
