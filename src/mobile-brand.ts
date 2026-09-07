const STYLE='cc-brand-text-fix';
const FOOTER_ID='cc-ginger-dragon-footer';
const DEAD_LABELS=new Set(['games','software','adventures','original worlds']);
function leafText(el:Element){return (el.textContent||'').replace(/\s+/g,' ').trim()}
function ensureFooter(){
 const matches=[...document.querySelectorAll<HTMLElement>('footer,p,small,div,span')].filter(el=>leafText(el)==='© 2026 Ginger Dragon Studios');
 let footer=document.getElementById(FOOTER_ID) as HTMLElement|null;
 if(!footer&&matches.length){footer=matches[0];footer.id=FOOTER_ID;footer.setAttribute('aria-label','Ginger Dragon Studios copyright')}
 if(!footer){footer=document.createElement('footer');footer.id=FOOTER_ID;footer.setAttribute('aria-label','Ginger Dragon Studios copyright');footer.textContent='© 2026 Ginger Dragon Studios';document.body.appendChild(footer)}
 matches.forEach(el=>{if(el!==footer)el.remove()});
 footer.textContent='© 2026 Ginger Dragon Studios';
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
function fixBrand(){
 if(!document.getElementById(STYLE)){const s=document.createElement('style');s.id=STYLE;s.textContent=`#cc-mobile-brand-image{display:none!important}#${FOOTER_ID}{width:100%;padding:22px 16px 28px;text-align:center;font-size:12px;letter-spacing:.08em;opacity:.68;box-sizing:border-box}`;document.head.appendChild(s)}
 document.querySelectorAll<HTMLElement>('h1,h2,h3,p,span,small,footer,header,div').forEach(el=>{if(el.children.length)return;const t=leafText(el);if(/Ginger Dragon Fire Studios/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire Studios/gi,'Ginger Dragon Studios');else if(/Ginger Dragon Fire/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire/gi,'Ginger Dragon')});
 document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{if(/Ginger Dragon Fire Studios/i.test(img.alt))img.alt='Ginger Dragon Studios';else if(/Ginger Dragon Fire/i.test(img.alt))img.alt=img.alt.replace(/Ginger Dragon Fire/gi,'Ginger Dragon')});
 removeLegacyLandingHero();
 removeDeadLandingButtons();
 ensureFooter();
}
function scheduleFixes(){fixBrand();setTimeout(fixBrand,150);setTimeout(fixBrand,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleFixes,{once:true});else scheduleFixes();
window.addEventListener('cc:character-updated',scheduleFixes);window.addEventListener('cc:campaign-changed',scheduleFixes);
export { fixBrand };
