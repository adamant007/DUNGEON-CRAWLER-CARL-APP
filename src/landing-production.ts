/* Clean Ginger Dragon Studios entrance behavior. */

const CTA_TEXT = /enter\s+crawler\s+companion/i;
const ART_W = 1085;
const ART_H = 1450;
const ART_RATIO = ART_W / ART_H;

function findNativeCta(root: ParentNode): HTMLElement | null {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('button,a,[role="button"]'));
  return candidates.find((el) => CTA_TEXT.test((el.textContent || '').trim()) && !el.classList.contains('studio-poster-cta')) || null;
}

function setLandingLock(active: boolean) {
  document.documentElement.classList.toggle('studio-landing-active', active);
  document.body.classList.toggle('studio-landing-active', active);
}

function sizeStage(stage: HTMLElement) {
  const vv = window.visualViewport;
  const viewportWidth = vv?.width || window.innerWidth;
  const viewportHeight = vv?.height || window.innerHeight;
  const inset = viewportWidth < 520 ? 10 : 18;
  const availableWidth = Math.max(240, viewportWidth - inset * 2);
  const availableHeight = Math.max(320, viewportHeight - inset * 2);
  const width = Math.min(ART_W, availableWidth, availableHeight * ART_RATIO);
  const height = width / ART_RATIO;
  stage.style.width = `${Math.floor(width)}px`;
  stage.style.height = `${Math.floor(height)}px`;
}

function installEntrance() {
  const image = document.querySelector<HTMLImageElement>('img.studio-hero-art');
  if (!image) {
    setLandingLock(false);
    return;
  }

  setLandingLock(true);
  if (image.dataset.posterEnhanced === 'true') {
    const stage = image.closest<HTMLElement>('.studio-poster-stage');
    if (stage) sizeStage(stage);
    return;
  }

  const card = image.closest<HTMLElement>('.landing-card-v2') || image.parentElement;
  if (!card) return;

  const nativeCta = findNativeCta(card) || findNativeCta(document);
  image.dataset.posterEnhanced = 'true';
  image.loading = 'eager';
  image.decoding = 'async';
  try { (image as any).fetchPriority = 'high'; } catch {}

  card.classList.add('studio-poster-shell');

  const stage = document.createElement('div');
  stage.className = 'studio-poster-stage';
  image.parentNode?.insertBefore(stage, image);

  const world = document.createElement('div');
  world.className = 'studio-secret-world';
  world.setAttribute('aria-hidden', 'true');
  stage.appendChild(world);
  stage.appendChild(image);

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'studio-poster-cta';
  cta.setAttribute('aria-label', 'Enter Crawler Companion');
  cta.setAttribute('title', 'Enter Crawler Companion');
  cta.innerHTML = '<span class="sr-only">Enter Crawler Companion</span>';

  let entering = false;
  cta.addEventListener('click', async () => {
    if (entering) return;
    entering = true;
    cta.disabled = true;
    stage.classList.add('is-entering');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) await new Promise((resolve) => window.setTimeout(resolve, 1450));

    setLandingLock(false);
    if (nativeCta && nativeCta !== cta && document.contains(nativeCta)) {
      nativeCta.click();
      return;
    }
    const fallback = findNativeCta(document);
    if (fallback && fallback !== cta) fallback.click();
  });

  stage.appendChild(cta);
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
