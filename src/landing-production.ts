/* Production landing-page behavior for the painted Ginger Dragon Studios poster. */

const CTA_TEXT = /enter\s+crawler\s+companion/i;

function findNativeCta(root: ParentNode): HTMLElement | null {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('button,a,[role="button"]'));
  return candidates.find((el) => CTA_TEXT.test((el.textContent || '').trim()) && !el.classList.contains('studio-poster-cta')) || null;
}

function installPosterCta() {
  const image = document.querySelector<HTMLImageElement>('img.studio-hero-art');
  if (!image || image.dataset.posterEnhanced === 'true') return;

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
  stage.appendChild(image);

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'studio-poster-cta';
  cta.setAttribute('aria-label', 'Enter Crawler Companion');
  cta.setAttribute('title', 'Enter Crawler Companion');
  cta.innerHTML = '<span class="sr-only">Enter Crawler Companion</span>';

  cta.addEventListener('click', () => {
    if (nativeCta && nativeCta !== cta && document.contains(nativeCta)) {
      nativeCta.click();
      return;
    }
    const fallback = findNativeCta(document);
    if (fallback && fallback !== cta) fallback.click();
  });

  stage.appendChild(cta);
}

function bootPosterEnhancement() {
  installPosterCta();
  const observer = new MutationObserver(() => installPosterCta());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPosterEnhancement, { once: true });
} else {
  bootPosterEnhancement();
}
