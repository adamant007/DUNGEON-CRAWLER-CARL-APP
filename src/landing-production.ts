/* Ginger Dragon Studios entrance -> doorway -> library -> tome shell. */

const CTA_TEXT = /(?:enter|open|launch|start)\s+(?:the\s+)?crawler\s+companion/i;
const ART_W = 1085;
const ART_H = 1450;
const ART_RATIO = ART_W / ART_H;
const LIBRARY_ASSET = '/brand/ginger-dragon-library.webp';
const SEEN_KEY = 'gingerDragonEntranceSeenV1';

function getCandidates(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('button,a,[role="button"]'))
    .filter((el) => !el.classList.contains('studio-poster-cta') && !el.classList.contains('studio-skip-intro'));
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
  const height = width / ART_RATIO;
  stage.style.width = `${Math.floor(width)}px`;
  stage.style.height = `${Math.floor(height)}px`;
}

function markSeen() {
  try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch {}
}

function hasSeen() {
  try { return window.sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function activateNativeCta(nativeCta: HTMLElement | null, card: HTMLElement, overlay: HTMLElement) {
  const target = nativeCta && nativeCta !== overlay && document.contains(nativeCta)
    ? nativeCta
    : findNativeCta(card) || findNativeCta(document);

  setLandingLock(false);
  const root = overlay.closest<HTMLElement>('.studio-entrance-root');
  root?.remove();

  window.requestAnimationFrame(() => {
    if (target && target !== overlay) target.click();
  });
}

function installCinemaStyles() {
  if (document.getElementById('ginger-dragon-cinema-styles')) return;
  const style = document.createElement('style');
  style.id = 'ginger-dragon-cinema-styles';
  style.textContent = `
.studio-entrance-root{isolation:isolate;background:#160f20!important}
.studio-cinema{position:absolute;inset:0;z-index:1;overflow:hidden;background:radial-gradient(circle at 50% 48%,#39291f 0,#171116 48%,#0b080d 100%);opacity:0;transition:opacity .24s ease}
.studio-entrance-root.studio-entering .studio-cinema{opacity:1}
.studio-doorway{position:absolute;inset:0;display:grid;place-items:center;perspective:1100px;overflow:hidden;background:radial-gradient(ellipse at center,rgba(210,165,91,.16),transparent 44%),linear-gradient(90deg,#171313,#302820 18%,#1a1717 50%,#302820 82%,#171313)}
.studio-door-frame{position:absolute;width:min(80vw,720px);height:min(88vh,900px);max-height:92%;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 20px #312a25,0 0 0 28px #181514,0 30px 100px #000;border-radius:40% 40% 2% 2%/18% 18% 2% 2%;overflow:hidden;background:#151112}
.studio-door-half{position:absolute;top:0;bottom:0;width:50.2%;background:linear-gradient(90deg,#211b18,#514638 18%,#29221d 48%,#4c4034 80%,#1e1916);box-shadow:inset 0 0 45px #090707,0 0 24px rgba(0,0,0,.75);transition:transform .72s cubic-bezier(.65,.04,.28,1);will-change:transform}
.studio-door-half::before{content:"";position:absolute;inset:7%;border:1px solid rgba(214,171,92,.34);box-shadow:inset 0 0 0 8px rgba(35,28,23,.8),0 0 20px rgba(255,191,82,.08)}
.studio-door-left{left:0;transform-origin:left center}.studio-door-right{right:0;transform-origin:right center}
.studio-door-seam{position:absolute;left:50%;top:7%;bottom:7%;width:3px;transform:translateX(-50%);background:#f6d994;box-shadow:0 0 9px #ffe6a4,0 0 30px #f2b957,0 0 70px rgba(255,190,86,.65);opacity:0;transition:opacity .3s ease}
.studio-entrance-root.studio-door-lit .studio-door-seam{opacity:1}
.studio-entrance-root.studio-door-open .studio-door-left{transform:translateX(-101%) rotateY(-7deg)}
.studio-entrance-root.studio-door-open .studio-door-right{transform:translateX(101%) rotateY(7deg)}
.studio-library{position:absolute;inset:-2%;background-image:linear-gradient(rgba(6,4,8,.12),rgba(6,4,8,.18)),url('${LIBRARY_ASSET}');background-position:center;background-size:cover;background-repeat:no-repeat;opacity:0;transform:scale(1.03);filter:saturate(.95) contrast(1.03);transition:opacity .55s ease,transform 1.3s cubic-bezier(.2,.7,.2,1);will-change:transform,opacity}
.studio-library::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 52% 48%,rgba(255,211,120,.06),transparent 28%),radial-gradient(ellipse at center,transparent 48%,rgba(4,2,6,.5) 100%);pointer-events:none}
.studio-entrance-root.studio-library-visible .studio-library{opacity:1;transform:scale(1)}
.studio-entrance-root.studio-tome-focus .studio-library{transform:scale(1.16);background-position:50% 48%}
.studio-entrance-root.studio-tome-focus .studio-library::after{background:radial-gradient(circle at 52% 48%,rgba(255,218,137,.18),transparent 25%),radial-gradient(ellipse at center,transparent 42%,rgba(4,2,6,.58) 100%)}
.studio-poster-stage{z-index:5!important;transition:transform .82s cubic-bezier(.22,.72,.18,1),filter .82s ease;will-change:transform}
.studio-entrance-root.studio-entering .studio-poster-stage{transform:translate3d(0,-112vh,0) rotate(-.35deg);filter:drop-shadow(0 26px 28px rgba(0,0,0,.5))}
.studio-entrance-root.studio-entering .studio-poster-cta{pointer-events:none!important;opacity:0!important}
.studio-skip-intro{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(14px,env(safe-area-inset-top));z-index:12;border:1px solid rgba(221,190,133,.55);border-radius:999px;padding:8px 13px;background:rgba(18,13,18,.72);color:#ead9b7;font:600 12px/1.1 system-ui,-apple-system,sans-serif;letter-spacing:.04em;backdrop-filter:blur(6px);cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s ease}
.studio-entrance-root.studio-entering .studio-skip-intro{opacity:.9;pointer-events:auto}
.studio-skip-intro:focus-visible{outline:2px solid #f0d28d;outline-offset:2px}
@media(prefers-reduced-motion:reduce){.studio-poster-stage,.studio-door-half,.studio-library{transition:none!important}.studio-skip-intro{display:none!important}}
`;
  document.head.appendChild(style);
}

function buildCinema(root: HTMLElement) {
  const cinema = document.createElement('div');
  cinema.className = 'studio-cinema';
  cinema.setAttribute('aria-hidden', 'true');
  cinema.innerHTML = `
    <div class="studio-doorway">
      <div class="studio-library"></div>
      <div class="studio-door-frame">
        <div class="studio-door-half studio-door-left"></div>
        <div class="studio-door-half studio-door-right"></div>
        <div class="studio-door-seam"></div>
      </div>
    </div>`;
  root.prepend(cinema);
}

function runCinema(root: HTMLElement, cta: HTMLButtonElement, nativeCta: HTMLElement | null, card: HTMLElement) {
  let finished = false;
  const timers: number[] = [];
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach((id) => window.clearTimeout(id));
    markSeen();
    activateNativeCta(nativeCta, card, cta);
  };

  if (reducedMotion() || hasSeen()) {
    finish();
    return;
  }

  root.classList.add('studio-entering');
  const skip = root.querySelector<HTMLButtonElement>('.studio-skip-intro');
  skip?.addEventListener('click', finish, { once: true });

  timers.push(window.setTimeout(() => root.classList.add('studio-door-lit'), 430));
  timers.push(window.setTimeout(() => root.classList.add('studio-door-open'), 820));
  timers.push(window.setTimeout(() => root.classList.add('studio-library-visible'), 1180));
  timers.push(window.setTimeout(() => root.classList.add('studio-tome-focus'), 2200));
  timers.push(window.setTimeout(finish, 3050));
  timers.push(window.setTimeout(finish, 3900)); // hard fail-forward guard
}

function installEntrance() {
  const image = document.querySelector<HTMLImageElement>('img.studio-hero-art');
  if (!image) {
    setLandingLock(false);
    return;
  }

  if (document.querySelector('.studio-entrance-root')) return;
  if (image.dataset.posterEnhanced === 'true') return;

  const card = image.closest<HTMLElement>('.landing-card-v2') || image.parentElement;
  if (!card) return;

  installCinemaStyles();
  const nativeCta = findNativeCta(card) || findNativeCta(document);
  image.dataset.posterEnhanced = 'true';
  image.loading = 'eager';
  image.decoding = 'async';
  try { (image as any).fetchPriority = 'high'; } catch {}

  const libraryPreload = new Image();
  libraryPreload.src = LIBRARY_ASSET;

  setLandingLock(true);

  const root = document.createElement('div');
  root.className = 'studio-entrance-root';
  root.setAttribute('role', 'presentation');
  buildCinema(root);

  const stage = document.createElement('div');
  stage.className = 'studio-poster-stage';
  root.appendChild(stage);

  const poster = image.cloneNode(true) as HTMLImageElement;
  poster.removeAttribute('data-poster-enhanced');
  poster.className = 'studio-hero-art';
  poster.alt = 'Ginger Dragon Studios tapestry';
  poster.loading = 'eager';
  poster.decoding = 'async';
  stage.appendChild(poster);

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'studio-poster-cta';
  cta.setAttribute('aria-label', 'Enter Crawler Companion');
  cta.setAttribute('title', 'Enter Crawler Companion');
  cta.innerHTML = '<span class="sr-only">Enter Crawler Companion</span>';
  cta.addEventListener('click', () => {
    if (cta.disabled) return;
    cta.disabled = true;
    runCinema(root, cta, nativeCta, card);
  });
  stage.appendChild(cta);

  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'studio-skip-intro';
  skip.textContent = 'Skip Intro';
  skip.setAttribute('aria-label', 'Skip entrance animation');
  root.appendChild(skip);

  document.body.appendChild(root);
  sizeStage(stage);

  const resize = () => sizeStage(stage);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
}

function bootEntrance() {
  installEntrance();
  const observer = new MutationObserver(() => installEntrance());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootEntrance, { once: true });
} else {
  bootEntrance();
}
