/* Clean Ginger Dragon Studios entrance behavior. */

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
  const height = width / ART_RATIO;
  stage.style.width = `${Math.floor(width)}px`;
  stage.style.height = `${Math.floor(height)}px`;
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

  const nativeCta = findNativeCta(card) || findNativeCta(document);
  image.dataset.posterEnhanced = 'true';
  image.loading = 'eager';
  image.decoding = 'async';
  try { (image as any).fetchPriority = 'high'; } catch {}

  setLandingLock(true);

  const root = document.createElement('div');
  root.className = 'studio-entrance-root';
  root.setAttribute('role', 'presentation');

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
    activateNativeCta(nativeCta, card, cta);
  });
  stage.appendChild(cta);

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
