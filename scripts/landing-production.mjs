import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const payloadDir = path.join(root, 'payload');

function restoreLiveHero() {
  const final = path.join(payloadDir, 'final-tapestry.b64');
  if (!fs.existsSync(final)) throw new Error('Missing final Ginger Dragon tapestry payload');
  const encoded = fs.readFileSync(final, 'utf8').trim();
  const output = path.join(root, 'public/brand/ginger-dragon-studios-hero.webp');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, Buffer.from(encoded, 'base64'));
  console.log('Restored production Ginger Dragon poster from final tapestry payload');
}

function patchMain() {
  const file = path.join(root, 'src/main.tsx');
  let source = fs.readFileSync(file, 'utf8');
  const marker = "import './landing-production';";
  if (!source.includes(marker)) {
    source += `\n\n// Production Ginger Dragon landing interaction.\n${marker}\n`;
    fs.writeFileSync(file, source);
    console.log('Integrated production landing interaction');
  }
}

function patchStyles() {
  const file = path.join(root, 'src/styles.css');
  let source = fs.readFileSync(file, 'utf8');
  const marker = '/* ginger-dragon-production-poster */';
  if (source.includes(marker)) return;

  source += `
${marker}
.landing-card-v2.studio-poster-shell{
  width:min(1084px,100%);max-width:1084px!important;padding:0!important;margin:0 auto!important;
  background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;
}
.studio-poster-shell > :not(.studio-poster-stage){display:none!important}
.studio-poster-stage{position:relative;width:100%;margin:0 auto;line-height:0;isolation:isolate}
.landing-card-v2 .studio-poster-stage .studio-hero-art{
  display:block!important;width:100%!important;max-width:none!important;height:auto!important;margin:0!important;
  object-fit:contain!important;border:0!important;border-radius:0!important;background:transparent!important;
  box-shadow:0 24px 70px rgba(0,0,0,.48),0 6px 22px rgba(0,0,0,.34)!important;image-rendering:auto!important;
}
.studio-poster-cta{
  position:absolute;left:39.6%;top:78.9%;width:37.1%;height:3.5%;z-index:4;
  border:0;border-radius:14px;background:transparent;cursor:pointer;padding:0;margin:0;
  box-shadow:0 0 0 rgba(255,177,55,0);transition:filter .16s ease,box-shadow .16s ease,transform .08s ease;
  -webkit-tap-highlight-color:transparent;
}
.studio-poster-cta:hover,.studio-poster-cta:focus-visible{
  outline:none;filter:brightness(1.12);
  box-shadow:0 0 12px 3px rgba(255,196,87,.52),0 0 30px 8px rgba(255,133,36,.28),inset 0 0 18px rgba(255,219,130,.18);
}
.studio-poster-cta:active{transform:scale(.985);filter:brightness(1.18);box-shadow:0 0 18px 5px rgba(255,188,70,.62)}
@media (max-width:760px){
  .landing-card-v2.studio-poster-shell{width:100%!important}
  .studio-poster-cta{border-radius:9px;min-height:0}
}
@media (prefers-reduced-motion:reduce){.studio-poster-cta{transition:none}}
`;

  fs.writeFileSync(file, source);
  console.log('Integrated responsive painted-poster layout and CTA styling');
}

restoreLiveHero();
patchMain();
patchStyles();
