const ID='cc-mobile-brand-image';
const STYLE='cc-mobile-brand-style';
function addStyle(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
 #${ID}{display:none;width:72px;height:72px;object-fit:cover;border-radius:16px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45));flex:0 0 72px}
 @media(max-width:720px){#${ID}{display:block}.app>header>div:first-child h1::before{display:none!important}.app>header>div:first-child{display:flex!important;align-items:center!important;gap:12px!important}.app .dragon-mark{display:none!important}}
 `;document.head.appendChild(s)}
function inject(){addStyle();const header=document.querySelector('.app>header>div:first-child') as HTMLElement|null;if(!header)return;if(document.getElementById(ID))return;const img=document.createElement('img');img.id=ID;img.src='/brand/ginger-dragon-fire-full.webp';img.alt='Ginger Dragon Fire Studios';img.width=72;img.height=72;img.loading='eager';img.decoding='async';img.onerror=()=>{img.src='/brand/app-icon.svg'};header.prepend(img)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,100),{once:true});else setTimeout(inject,100);
