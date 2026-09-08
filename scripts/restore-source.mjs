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

function cleanLandingSource(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  const replacements = [
    ['<img className="studio-hero-logo" src="/brand/hero.webp" alt="Ginger Dragon Fire Studios dragon logo"/>', ''],
    ['<div className="landing-kicker">GINGER DRAGON FIRE STUDIOS</div>', '<div className="landing-kicker">GINGER DRAGON STUDIOS</div>'],
    ['<h1 className="sr-only">Ginger Dragon Fire</h1>', '<h1 className="sr-only">Ginger Dragon Studios</h1>'],
    ['<span>New Ginger Dragon Fire projects will appear here.</span>', '<span>New Ginger Dragon projects will appear here.</span>'],
    ['<div className="landing-features"><span>⚔️ Games</span><span>🛠️ Software</span><span>🔥 Adventures</span><span>🐉 Original Worlds</span></div>', ''],
    ['<div className="landing-card">', '<div className="landing-card landing-card-v2">']
  ];
  for (const [from,to] of replacements) if (source.includes(from)) source = source.replace(from,to);

  const landingStart = source.indexOf('function Landing(');
  if (landingStart !== -1) {
    const landingEnd = source.indexOf('\nfunction ', landingStart + 10);
    const end = landingEnd === -1 ? source.length : landingEnd;
    let landing = source.slice(landingStart, end);
    landing = landing.replace(/<img(?![^>]*className=["']studio-hero-art["'])[^>]*src=["'][^"']*(?:app-icon\.svg|icon-96\.webp|ginger-dragon-fire[^"']*|\/brand\/hero\.webp)[^"']*["'][^>]*\/?>(?:<\/img>)?/gi, '');
    source = source.slice(0, landingStart) + landing + source.slice(end);
  }

  const hero = '<img className="studio-hero-art" src="/brand/ginger-dragon-studios-tapestry.png" alt="Ginger Dragon Studios tapestry"/>';
  if (source.includes('className="studio-hero-art"')) {
    source = source.replace(/<img className="studio-hero-art"[^>]*\/>/, hero);
  } else {
    const marker = '<div className="landing-card landing-card-v2">';
    if (!source.includes(marker)) throw new Error('Landing card marker not found');
    source = source.replace(marker, marker + hero);
  }

  const interaction = "import './landing-production';";
  if (!source.includes(interaction)) source += `\n\n// Clean Ginger Dragon entrance interaction.\n${interaction}\n`;
  fs.writeFileSync(file, source);
  console.log('Prepared clean Ginger Dragon entrance');
}

function makeCharacterPrimary(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  const start = source.indexOf('function Dashboard('), end = source.indexOf('\nfunction Combat(', start);
  if (start !== -1 && end !== -1) source = source.slice(0,start) + 'function Dashboard({c,update}:{c:Character;update:(f:any)=>void;setTab:(t:Tab)=>void}){return <CharacterSheet c={c} update={update}/>}' + source.slice(end);
  source = source.replace(/useState<Tab>\(['"]Dashboard['"]\)/g, "useState<Tab>('Character')");
  source = source.replace(/useState\(['"]Dashboard['"]\)/g, "useState('Character')");
  source = source.replace(/['"]Dashboard['"]\s*,\s*/g, '');
  source = source.replace(/,\s*['"]Dashboard['"]/g, '');
  source = source.replace(/(['"]Account['"]\s*,\s*)(['"]Tutorial['"])/g, '$2');
  fs.writeFileSync(file, source);
}

function injectLandingStyles(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  source += `
/* ginger-dragon-clean-entrance-v2 */
html.studio-landing-active,body.studio-landing-active{overflow:hidden!important;overscroll-behavior:none!important}
.studio-entrance-root{
  position:fixed!important;inset:0!important;z-index:2147483000!important;
  width:100vw!important;height:100vh!important;height:100dvh!important;
  display:grid!important;place-items:center!important;overflow:hidden!important;
  background:#160f20!important;padding:0!important;margin:0!important;
}
.studio-poster-stage{position:relative!important;display:block!important;overflow:hidden!important;line-height:0!important;flex:none!important}
.studio-poster-stage>img.studio-hero-art{
  position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;
  max-width:none!important;margin:0!important;object-fit:contain!important;object-position:center!important;
  border:0!important;border-radius:0!important;background:transparent!important;box-shadow:0 20px 60px rgba(0,0,0,.44)!important;
}
.studio-poster-cta{
  position:absolute!important;left:31%!important;top:77.2%!important;width:38%!important;height:7.8%!important;z-index:4!important;
  border:0!important;border-radius:12px!important;background:transparent!important;cursor:pointer!important;padding:0!important;margin:0!important;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation
}
.studio-poster-cta:hover,.studio-poster-cta:focus-visible{outline:2px solid rgba(255,214,123,.9)!important;outline-offset:-3px!important;box-shadow:0 0 22px rgba(255,165,61,.38)!important;background:rgba(255,187,83,.05)!important}
.studio-poster-cta:active{background:rgba(255,205,116,.10)!important}
`;
  fs.writeFileSync(file, source);
  console.log('Injected isolated responsive full-viewport entrance styles');
}

function injectCoreIntegration(output) {
  const file = path.join(root, output); let source = fs.readFileSync(file, "utf8");
  const integrations = [
    ["import './core-hp-integration';", '// Build-time core integration: all HP damage controls route through Damage Resist.'],
    ["import './campaign-role-visibility';", '// Build-time campaign role guard: keep GM navigation available to local/GM users and hidden from confirmed players.']
  ];
  let changed = false;
  for (const [marker,comment] of integrations) if (!source.includes(marker)) { source += `\n\n${comment}\n${marker}\n`; changed = true; }
  if (changed) fs.writeFileSync(file, source);
}

restore("main","src/main.tsx");
restore("styles","src/styles.css");
cleanLandingSource("src/main.tsx");
makeCharacterPrimary("src/main.tsx");
injectLandingStyles("src/styles.css");
injectCoreIntegration("src/main.tsx");
