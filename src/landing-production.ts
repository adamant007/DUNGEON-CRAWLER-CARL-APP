/* Ginger Dragon Studios entrance — STEP 1 ONLY: tapestry lift. */

const CTA_TEXT = /(?:enter|open|launch|start)\s+(?:the\s+)?crawler\s+companion/i;
const ART_W = 1085;
const ART_H = 1450;
const ART_RATIO = ART_W / ART_H;

function getCandidates(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('button,a,[role="button"]'))
    .filter((el) => !el.classList.contains('studio-poster-cta'));
}
function findNativeCta(root: ParentNode): HTMLElement | null {
  const candidates = getCandidates(root);
  return candidates.find((el) => CTA_TEXT.test((el.textContent || '').trim())) || candidates[0] || null;
}
function setLandingLock(active: boolean) {
  document.documentElement.classList.toggle('studio-landing-active', active);
  document.body.classList.toggle('studio-landing-active', active);
}
function sizeStage(stage: HTMLElement) {
  const vv = window.visualViewport;
  const viewportWidth = vv?.width || window.innerWidth;
  const viewportHeight = vv?.height || window.innerHeight;
  const inset = viewportWidth < 520 ? 8 : 16;
  const availableWidth = Math.max(220, viewportWidth - inset * 2);
  const availableHeight = Math.max(280, viewportHeight - inset * 2);
  const width = Math.min(ART_W, availableWidth, availableHeight * ART_RATIO);
  stage.style.width = `${Math.floor(width)}px`;
  stage.style.height = `${Math.floor(width / ART_RATIO)}px`;
}
function installStyles() {
  if (document.getElementById('ginger-dragon-step-one-styles')) return;
  const style = document.createElement('style');
  style.id = 'ginger-dragon-step-one-styles';
  style.textContent = `
.studio-entrance-root{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:radial-gradient(ellipse at 50% 42%,#1b1518 0%,#0d090d 58%,#050405 100%)!important;isolation:isolate}
.studio-poster-stage{position:relative!important;z-index:2!important;transform-origin:50% 0%;will-change:transform,filter;filter:drop-shadow(0 18px 22px rgba(0,0,0,.48))}
.studio-poster-stage::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.08),transparent 18%,rgba(255,255,255,.025) 42%,transparent 64%,rgba(0,0,0,.1)),linear-gradient(180deg,transparent 0 72%,rgba(0,0,0,.08));mix-blend-mode:multiply}
.studio-poster-stage.studio-lifting{animation:studio-heavy-tapestry-lift 1.45s cubic-bezier(.58,.02,.25,1) forwards}
.studio-poster-stage.studio-lifting .studio-hero-art{animation:studio-fabric-drag 1.45s ease-in-out forwards}
.studio-poster-stage.studio-lifting .studio-poster-cta{pointer-events:none!important;opacity:0!important}
@keyframes studio-heavy-tapestry-lift{
  0%{transform:translate3d(0,0,0) rotate(0deg) scaleY(1)}
  12%{transform:translate3d(0,-1.2vh,0) rotate(-.08deg) scaleY(.999)}
  35%{transform:translate3d(-.35vw,-24vh,0) rotate(-.28deg) scaleY(.992)}
  67%{transform:translate3d(.25vw,-72vh,0) rotate(.18deg) scaleY(.982)}
  88%{transform:translate3d(-.08vw,-109vh,0) rotate(-.08deg) scaleY(.975)}
  100%{transform:translate3d(0,-124vh,0) rotate(0deg) scaleY(.978)}
}
@keyframes studio-fabric-drag{
  0%,100%{filter:brightness(1) saturate(1)}
  22%{filter:brightness(.985) saturate(.99)}
  48%{filter:brightness(.95) saturate(.98)}
  76%{filter:brightness(.975) saturate(.99)}
}
.studio-step-label{position:absolute;left:50%;bottom:max(24px,env(safe-area-inset-bottom));z-index:1;transform:translateX(-50%);color:rgba(220,199,163,.55);font:600 11px/1.2 system-ui;letter-spacing:.18em;text-transform:uppercase;opacity:0;transition:opacity .35s ease;white-space:nowrap}
.studio-entrance-root.studio-step-one-complete .studio-step-label{opacity:1}
@media(prefers-reduced-motion:reduce){.studio-poster-stage.studio-lifting{animation-duration:.25s}.studio-poster-stage.studio-lifting .studio-hero-art{animation:none}}
`;
  document.head.appendChild(style);
}
function installEntrance() {
  const image = document.querySelector<HTMLImageElement>('img.studio-hero-art');
  if (!image) { setLandingLock(false); return; }
  if (document.querySelector('.studio-entrance-root') || image.dataset.posterEnhanced === 'true') return;
  const card = image.closest<HTMLElement>('.landing-card-v2') || image.parentElement;
  if (!card) return;
  installStyles();
  image.dataset.posterEnhanced = 'true';
  setLandingLock(true);
  const root = document.createElement('div');
  root.className = 'studio-entrance-root';
  root.setAttribute('role','presentation');
  const stage = document.createElement('div');
  stage.className = 'studio-poster-stage';
  root.appendChild(stage);
  const poster = image.cloneNode(true) as HTMLImageElement;
  poster.removeAttribute('data-poster-enhanced');
  poster.className = 'studio-hero-art';
  poster.alt = 'Ginger Dragon Studios tapestry';
  stage.appendChild(poster);
  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'studio-poster-cta';
  cta.setAttribute('aria-label','Enter Crawler Companion');
  cta.innerHTML = '<span class="sr-only">Enter Crawler Companion</span>';
  cta.addEventListener('click', () => {
    if (cta.disabled) return;
    cta.disabled = true;
    stage.classList.add('studio-lifting');
    window.setTimeout(() => root.classList.add('studio-step-one-complete'), 1500);
  });
  stage.appendChild(cta);
  const label = document.createElement('div');
  label.className = 'studio-step-label';
  label.textContent = 'Step 1 · tapestry lift locked for review';
  root.appendChild(label);
  document.body.appendChild(root);
  sizeStage(stage);
  const resize = () => sizeStage(stage);
  addEventListener('resize',resize,{passive:true});
  addEventListener('orientationchange',resize,{passive:true});
  visualViewport?.addEventListener('resize',resize,{passive:true});
  void findNativeCta(card); // deliberately do not hand off during isolated step-one test
}
function bootEntrance(){
  installEntrance();
  const observer = new MutationObserver(() => installEntrance());
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bootEntrance,{once:true}); else bootEntrance();
