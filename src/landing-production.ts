/* Ginger Dragon Studios — one-image landing. Old website landing is hidden completely. */
const ROOT='gd-fresh-landing';
const STYLE='gd-fresh-landing-style';
const ART='/brand/ginger-dragon-studios-tapestry.png';
function styles(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
html.gd-fresh-open,html.gd-fresh-open body{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#10051c!important}
html.gd-fresh-open body>*:not(#${ROOT}){visibility:hidden!important}
#${ROOT}{position:fixed;inset:0;z-index:2147483640;display:grid;place-items:center;background:#10051c;overflow:hidden}
#${ROOT} .gd-art-wrap{position:relative;display:block;width:max-content;height:max-content;max-width:100vw;max-height:100svh}
#${ROOT} img{display:block;width:auto;height:auto;max-width:100vw;max-height:100svh;object-fit:contain;user-select:none;-webkit-user-drag:none}
#${ROOT} .gd-enter{position:absolute;left:48%;top:77.4%;width:38%;height:5.4%;border:0;background:transparent;cursor:pointer;padding:0;margin:0;outline:none}
#${ROOT} .gd-enter:focus-visible{outline:3px solid #ffd36d;outline-offset:2px;border-radius:8px}
@media(max-width:760px){#${ROOT}{place-items:start center}#${ROOT} .gd-art-wrap{margin:0 auto}#${ROOT} img{max-width:100vw;max-height:100svh}}
`;document.head.appendChild(s)}
function nativeLaunch(){const els=[...document.querySelectorAll<HTMLElement>('button,a,[role="button"]')];return els.find(el=>!el.closest('#'+ROOT)&&/^(launch|enter crawler companion)|crawler companion.*launch/i.test(((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')).trim()))||els.find(el=>!el.closest('#'+ROOT)&&/launch|enter crawler companion/i.test((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')))}
function closeLanding(){document.documentElement.classList.remove('gd-fresh-open');document.getElementById(ROOT)?.remove()}
function enter(){const target=nativeLaunch();if(target){target.click();setTimeout(closeLanding,40);return}closeLanding();setTimeout(()=>nativeLaunch()?.click(),50)}
function install(){if(document.getElementById(ROOT))return;styles();document.documentElement.classList.add('gd-fresh-open');const root=document.createElement('main');root.id=ROOT;root.setAttribute('aria-label','Ginger Dragon Studios');root.innerHTML=`<div class="gd-art-wrap"><img src="${ART}" alt="Ginger Dragon Studios tapestry"><button class="gd-enter" type="button" aria-label="Enter Crawler Companion"></button></div>`;document.body.appendChild(root);(root.querySelector('.gd-enter') as HTMLButtonElement).addEventListener('click',enter)}
function boot(){install()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();