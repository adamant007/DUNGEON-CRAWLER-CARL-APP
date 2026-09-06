const STYLE='cc-brand-text-fix';
function fixBrand(){
 if(!document.getElementById(STYLE)){const s=document.createElement('style');s.id=STYLE;s.textContent=`#cc-mobile-brand-image{display:none!important}`;document.head.appendChild(s)}
 document.querySelectorAll<HTMLElement>('h1,h2,h3,p,span,small,footer,header').forEach(el=>{if(el.children.length)return;const t=(el.textContent||'').trim();if(/Ginger Dragon Fire Studios/i.test(t))el.textContent=t.replace(/Ginger Dragon Fire Studios/gi,'Ginger Dragon Studios');else if(/^Ginger Dragon Fire$/i.test(t))el.textContent='Ginger Dragon Studios'});
 document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{if(/Ginger Dragon Fire Studios/i.test(img.alt))img.alt='Ginger Dragon Studios'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(fixBrand,50),{once:true});else setTimeout(fixBrand,50);
window.addEventListener('cc:character-updated',fixBrand);window.addEventListener('cc:campaign-changed',fixBrand);
export { fixBrand };
