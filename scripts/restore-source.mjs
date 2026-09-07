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
  const finalParts = fs.readdirSync(payload).filter((name) => name.startsWith("ginger-dragon-final.") && name.endsWith(".b64part")).sort();
  const legacyParts = fs.readdirSync(payload).filter((name) => name.startsWith("ginger-dragon-master.") && name.endsWith(".b64part")).sort();
  const parts = finalParts.length ? finalParts : legacyParts;
  if (!parts.length) throw new Error("Missing Ginger Dragon hero payload");
  if (finalParts.length && finalParts.length !== 9) throw new Error(`Expected 9 final Ginger Dragon parts, found ${finalParts.length}`);
  const encoded = parts.map((name) => fs.readFileSync(path.join(payload, name), "utf8").trim()).join("");
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("Ginger Dragon hero payload is not a valid WebP container");
  const output = path.join(root, "public/brand/ginger-dragon-studios-hero.webp");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, bytes);
  console.log(`Restored Ginger Dragon Studios hero asset from ${parts.length} ${finalParts.length ? "final" : "legacy"} parts (${bytes.length} bytes)`);
}

function installCrawlerRook(landing) {
  const titleIndex = landing.indexOf("Crawler Companion");
  const subtitleIndex = landing.indexOf("Digital tabletop campaign companion");
  if (titleIndex === -1 || subtitleIndex === -1) throw new Error("Crawler Companion landing card text not found");
  const rook = '<img className="crawler-companion-thumb" src="/brand/crawler-companion-rook.webp" alt="Crawler Companion rook"/>';
  if (landing.includes('/brand/crawler-companion-rook.webp')) return landing;

  const beforeTitle = landing.slice(0, titleIndex);
  const imageStart = beforeTitle.lastIndexOf("<img");
  if (imageStart !== -1 && titleIndex - imageStart < 1500) {
    const imageEnd = landing.indexOf(">", imageStart);
    if (imageEnd !== -1) landing = landing.slice(0, imageStart) + rook + landing.slice(imageEnd + 1);
  } else {
    const nodeStart = beforeTitle.lastIndexOf("<");
    if (nodeStart === -1) throw new Error("Could not locate Crawler Companion title node");
    landing = landing.slice(0, nodeStart) + rook + landing.slice(nodeStart);
  }
  if (!landing.includes('/brand/crawler-companion-rook.webp')) throw new Error("Failed to install Crawler Companion rook thumbnail");
  return landing;
}

function cleanLandingSource(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
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
  for (const [from,to] of replacements) if (source.includes(from)) source = source.replace(from,to);

  const landingStart = source.indexOf('function Landing(');
  if (landingStart === -1) throw new Error('Landing function not found');
  const landingEnd = source.indexOf('\nfunction ', landingStart + 10);
  const end = landingEnd === -1 ? source.length : landingEnd;
  let landing = source.slice(landingStart, end);
  landing = landing.replace(/<img(?![^>]*className=["']studio-hero-art["'])[^>]*src=["'][^"']*(?:app-icon\.svg|icon-96\.webp|ginger-dragon-fire[^"']*|\/brand\/hero\.webp)[^"']*["'][^>]*\/?>(?:<\/img>)?/gi, '');
  landing = installCrawlerRook(landing);
  source = source.slice(0, landingStart) + landing + source.slice(end);

  const hero = '<img className="studio-hero-art" src="/brand/ginger-dragon-studios-hero.webp" alt="Ginger Dragon Studios dragon artwork"/>';
  if (!source.includes('className="studio-hero-art"')) {
    const marker = '<div className="landing-card landing-card-v2">';
    if (!source.includes(marker)) throw new Error('Landing card marker not found');
    source = source.replace(marker, marker + hero);
  }
  if (!source.includes('/brand/crawler-companion-rook.webp')) throw new Error('Generated source is missing Crawler Companion rook');
  fs.writeFileSync(file, source);
  console.log('Rebuilt Ginger Dragon Studios landing shell with final hero and Crawler Companion rook');
}

function makeCharacterPrimary(output){
  const file=path.join(root,output);let source=fs.readFileSync(file,"utf8");
  const start=source.indexOf('function Dashboard('), end=source.indexOf('\nfunction Combat(',start);
  if(start!==-1&&end!==-1){source=source.slice(0,start)+'function Dashboard({c,update}:{c:Character;update:(f:any)=>void;setTab:(t:Tab)=>void}){return <CharacterSheet c={c} update={update}/>}'+source.slice(end);}
  source=source.replace(/useState<Tab>\(['"]Dashboard['"]\)/g,"useState<Tab>('Character')");
  source=source.replace(/useState\(['"]Dashboard['"]\)/g,"useState('Character')");
  source=source.replace(/['"]Dashboard['"]\s*,\s*/g,'');
  source=source.replace(/,\s*['"]Dashboard['"]/g,'');
  source=source.replace(/(['"]Account['"]\s*,\s*)(['"]Tutorial['"])/g,'$2');
  fs.writeFileSync(file,source);console.log('Character is now the primary workspace; redundant Dashboard/Account navigation removed');
}

function injectLandingHeroStyles(output){
 const file=path.join(root,output);let source=fs.readFileSync(file,"utf8");
 const marker='/* ginger-dragon-studios-clean-hero */';if(!source.includes(marker))source+=`\n${marker}\n.studio-hero-art{display:block;width:min(360px,72vw);height:auto;object-fit:contain;object-position:center;margin:0 auto 28px;border:0;border-radius:0;background:transparent;box-shadow:none}\n@media(max-width:760px){.studio-hero-art{width:min(300px,74vw);margin-bottom:22px}}\n`;
 const v2='/* ginger-dragon-studios-landing-v2 */';if(!source.includes(v2))source+=`\n${v2}\n.landing-card-v2{max-width:980px}\n.landing-card-v2 .studio-hero-art{display:block!important;width:min(512px,90vw)!important;max-width:100%!important;height:auto!important;aspect-ratio:auto!important;object-fit:contain!important;object-position:center!important;margin:0 auto 26px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:0 26px 60px rgba(0,0,0,.30)!important;image-rendering:auto!important}\n.crawler-companion-thumb{display:block!important;width:58px!important;height:58px!important;min-width:58px!important;object-fit:cover!important;object-position:center!important;border-radius:12px!important}\n@media(max-width:760px){.landing-card-v2 .studio-hero-art{width:min(460px,90vw)!important;margin-bottom:20px!important}.crawler-companion-thumb{width:52px!important;height:52px!important;min-width:52px!important}}\n`;
 fs.writeFileSync(file,source);console.log('Integrated Ginger Dragon Studios landing v2 styles');
}

function injectCoreIntegration(output){const file=path.join(root,output);let source=fs.readFileSync(file,"utf8");const integrations=[["import './core-hp-integration';",'// Build-time core integration: all HP damage controls route through Damage Resist.'],["import './campaign-role-visibility';",'// Build-time campaign role guard: keep GM navigation available to local/GM users and hidden from confirmed players.']];let changed=false;for(const [marker,comment] of integrations)if(!source.includes(marker)){source+=`\n\n${comment}\n${marker}\n`;changed=true;}if(changed){fs.writeFileSync(file,source);console.log(`Integrated runtime guards into ${output}`);}}

restore("main","src/main.tsx");restore("styles","src/styles.css");restoreBrandAsset();cleanLandingSource("src/main.tsx");makeCharacterPrimary("src/main.tsx");injectLandingHeroStyles("src/styles.css");injectCoreIntegration("src/main.tsx");
