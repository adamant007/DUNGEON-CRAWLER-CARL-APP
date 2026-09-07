const STYLE='cc-brand-text-fix';
const FOOTER_ID='cc-ginger-dragon-footer';
function ensureFooter(){
 let footer=document.getElementById(FOOTER_ID) as HTMLElement|null;
 if(!footer){
  footer=document.createElement('footer');
  footer.id=FOOTER_ID;
  footer.setAttribute('aria-label','Ginger Dragon Studios copyright');
  footer.textContent='© 2026 Ginger Dragon Studios';
  document.body.appendChild(footer);
 }
}
function fixBrand(){
 if(!document.getElementById(STYLE)){const s=document.createElement('style');s.id=STYLE;s.textContent=`#cc-mobile-brand-image{display:none!important}#${FOOTER_ID}{width:100%;padding:22px 16px 28px;text-align:center;font-size:12px;letter-spacing:.08em;opacity:.68;box-sizing:border-box}`;document.head.appendChild(s)}
 document.querySelectorAll<HTMLElement>('h1,h2,h3,p,span,small,footer,header').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(/Ginger Dragon Fire Studios/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire Studios/gi,'Ginger Dragon Studios');else if(/^Ginger Dragon Fire$/i.test(t))el.textContent='Ginger Dragon Studios'});
 document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{if(/Ginger Dragon Fire Studios/i.test(img.alt))img.alt='Ginger Dragon Studios'});
 ensureFooter();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(fixBrand,50),{once:true});else setTimeout(fixBrand,50);
window.addEventListener('cc:character-updated',fixBrand);window.addEventListener('cc:campaign-changed',fixBrand);
export { fixBrand };
