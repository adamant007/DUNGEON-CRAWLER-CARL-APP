const STYLE='cc-brand-text-fix';
const DEAD_LABELS=new Set(['games','software','adventures','original worlds']);
function leafText(el:Element){return (el.textContent||'').replace(/\s+/g,' ').trim()}
function removeInjectedFooter(){
 const injected=document.getElementById('cc-ginger-dragon-footer');
 if(injected)injected.remove();
}
function removeDeadLandingButtons(){
 document.querySelectorAll<HTMLElement>('button,a,[role="button"]').forEach(el=>{
  if(DEAD_LABELS.has(leafText(el).toLowerCase()))el.remove();
 });
}
function removeLegacyLandingHero(){
 document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{
  const src=(img.getAttribute('src')||'').toLowerCase();
  const alt=(img.alt||'').toLowerCase();
  const rect=img.getBoundingClientRect();
  const isLegacyBrand=src.includes('ginger-dragon-fire-full')||src.includes('ginger-dragon-fire')||alt.includes('ginger dragon fire');
  if(!isLegacyBrand||rect.width<220)return;
  const parent=img.parentElement;
  img.remove();
  if(parent&&parent.children.length===0&&!leafText(parent))parent.remove();
 });
}
function installCrawlerCompanionRook(){
 if(!document.querySelector('.landing-card-v2,.studio-hero-art'))return;
 const candidates=document.querySelectorAll<HTMLElement>('a,button,.project-card,.landing-project,.landing-tile,.card,div');
 for(const card of candidates){
  const text=leafText(card).toLowerCase();
  if(!text.includes('crawler companion')||!text.includes('digital tabletop campaign companion'))continue;
  const img=card.querySelector<HTMLImageElement>('img:not(.studio-hero-art)');
  if(img){img.src='/brand/crawler-companion-rook.webp';img.alt='Crawler Companion rook';img.classList.add('cc-crawler-rook');return;}
 }
}
function removeObsoleteLandingIcon(){
  if(!document.querySelector('.landing-card-v2,.studio-hero-art'))return;
  document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{
    const src=(img.getAttribute('src')||'').toLowerCase();
    const alt=(img.alt||'').toLowerCase();
    const obsolete=src.includes('/brand/app-icon.svg')||src.includes('app-icon.svg')||alt.includes('app icon');
    if(!obsolete)return;
    const holder=img.closest<HTMLElement>('a,button,.project-card,.landing-project,.landing-tile,.card');
    if(holder && !holder.querySelector('.studio-hero-art')) holder.remove();
    else img.remove();
  });
}
function fixBrand(){
 if(!document.getElementById(STYLE)){const s=document.createElement('style');s.id=STYLE;s.textContent=`#cc-mobile-brand-image{display:none!important}.landing-card-v2 img[src*="app-icon.svg"]{display:none!important}.cc-crawler-rook{display:block!important;object-fit:cover!important;object-position:center!important}`;document.head.appendChild(s)}
 document.querySelectorAll<HTMLElement>('h1,h2,h3,p,span,small,footer,header,div').forEach(el=>{if(el.children.length)return;const t=leafText(el);if(/Ginger Dragon Fire Studios/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire Studios/gi,'Ginger Dragon Studios');else if(/Ginger Dragon Fire/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire/gi,'Ginger Dragon')});
 document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{if(/Ginger Dragon Fire Studios/i.test(img.alt))img.alt='Ginger Dragon Studios';else if(/Ginger Dragon Fire/i.test(img.alt))img.alt=img.alt.replace(/Ginger Dragon Fire/gi,'Ginger Dragon')});
 removeLegacyLandingHero();
 installCrawlerCompanionRook();
 removeObsoleteLandingIcon();
 removeDeadLandingButtons();
 removeInjectedFooter();
}
function scheduleFixes(){fixBrand();setTimeout(fixBrand,150);setTimeout(fixBrand,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleFixes,{once:true});else scheduleFixes();
window.addEventListener('cc:character-updated',scheduleFixes);window.addEventListener('cc:campaign-changed',scheduleFixes);
export { fixBrand };
