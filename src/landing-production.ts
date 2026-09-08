/* Ginger Dragon Studios — tapestry -> library -> character sheet. */
const ROOT='gd-fresh-landing';
const STYLE='gd-fresh-landing-style';
const ART='/brand/ginger-dragon-studios-tapestry.png';
const LIBRARY='/brand/ginger-dragon-library.webp';
function styles(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
html.gd-fresh-open,html.gd-fresh-open body{margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#08050b!important}
html.gd-fresh-open body>*:not(#${ROOT}){visibility:hidden!important}
#${ROOT}{position:fixed;inset:0;z-index:2147483640;display:grid;place-items:center;background:#08050b;overflow:hidden}
#${ROOT} .gd-art-wrap{position:relative;display:block;width:max-content;height:max-content;max-width:100vw;max-height:100svh}
#${ROOT} .gd-tapestry{display:block;width:auto;height:auto;max-width:100vw;max-height:100svh;object-fit:contain;user-select:none;-webkit-user-drag:none}
#${ROOT} .gd-enter{position:absolute;left:48%;top:77.4%;width:38%;height:5.4%;border:0;background:transparent;cursor:pointer;padding:0;margin:0;outline:none;-webkit-tap-highlight-color:transparent}
#${ROOT} .gd-enter:focus-visible{outline:3px solid #ffd36d;outline-offset:2px;border-radius:8px}
#${ROOT} .gd-library{position:absolute;inset:0;display:none;place-items:center;background:#080604;overflow:hidden}
#${ROOT}[data-stage="library"] .gd-art-wrap{display:none}
#${ROOT}[data-stage="library"] .gd-library{display:grid}
#${ROOT} .gd-library-frame{position:relative;width:min(100vw,calc(100svh * 1.19338));aspect-ratio:1370/1148;max-height:100svh;overflow:hidden;background:#120b07}
#${ROOT} .gd-library-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
#${ROOT} .gd-book-sheet{position:absolute;left:37.5%;top:58%;width:25%;height:18%;border:1px solid rgba(86,49,20,.75);border-radius:44% 44% 14% 14%/16% 16% 10% 10%;background:linear-gradient(90deg,#d8bd84 0 48.5%,#8b6537 49.5% 50.5%,#e1c994 51.5% 100%);box-shadow:0 10px 28px rgba(0,0,0,.55);transform:rotate(-2deg);overflow:hidden;pointer-events:none}
#${ROOT} .gd-book-sheet:before,#${ROOT} .gd-book-sheet:after{content:"CHARACTER SHEET";position:absolute;top:14%;width:43%;font:700 clamp(6px,1vw,14px) Georgia,serif;color:#4c2e18;text-align:center;letter-spacing:.06em;border-bottom:1px solid rgba(76,46,24,.45);padding-bottom:3%}
#${ROOT} .gd-book-sheet:before{left:4%}#${ROOT} .gd-book-sheet:after{right:4%}
#${ROOT} .gd-library-frame.zoom{transform:scale(2.5);transform-origin:50% 67%;transition:transform .42s ease-in}
@media(max-width:760px){#${ROOT}{place-items:start center}#${ROOT} .gd-art-wrap{margin:0 auto}#${ROOT} .gd-tapestry{max-width:100vw;max-height:100svh}#${ROOT} .gd-library-frame{width:100vw;height:auto;max-height:none;margin-top:18vh}#${ROOT} .gd-library-frame.zoom{transform:scale(3.2);transform-origin:50% 66%}}
`;document.head.appendChild(s)}
function nativeLaunch(){const els=[...document.querySelectorAll<HTMLElement>('button,a,[role="button"]')];return els.find(el=>!el.closest('#'+ROOT)&&/^(launch|enter crawler companion)|crawler companion.*launch/i.test(((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')).trim()))||els.find(el=>!el.closest('#'+ROOT)&&/launch|enter crawler companion/i.test((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')))}
function clickCharacter(){const nav=document.querySelector('[aria-label="Primary navigation"]');const b=[...(nav?.querySelectorAll<HTMLButtonElement>('button')||[])].find(x=>(x.textContent||'').replace(/✦/g,'').trim().toLowerCase()==='character');b?.click()}
function closeLanding(){document.documentElement.classList.remove('gd-fresh-open');document.getElementById(ROOT)?.remove()}
function enter(){const root=document.getElementById(ROOT) as HTMLElement|null;if(!root||root.dataset.busy==='1')return;root.dataset.busy='1';nativeLaunch()?.click();root.dataset.stage='library';setTimeout(()=>root.querySelector('.gd-library-frame')?.classList.add('zoom'),260);setTimeout(()=>{clickCharacter();closeLanding();setTimeout(clickCharacter,80)},820)}
function install(){if(document.getElementById(ROOT))return;styles();document.documentElement.classList.add('gd-fresh-open');const root=document.createElement('main');root.id=ROOT;root.dataset.stage='tapestry';root.setAttribute('aria-label','Ginger Dragon Studios');root.innerHTML=`<div class="gd-art-wrap"><img class="gd-tapestry" src="${ART}" alt="Ginger Dragon Studios tapestry"><button class="gd-enter" type="button" aria-label="Enter Crawler Companion"></button></div><section class="gd-library" aria-label="Ginger Dragon Library"><div class="gd-library-frame"><img class="gd-library-img" src="${LIBRARY}" alt="Ginger Dragon library"><div class="gd-book-sheet" aria-hidden="true"></div></div></section>`;document.body.appendChild(root);(root.querySelector('.gd-enter') as HTMLButtonElement).addEventListener('click',enter)}
function boot(){install()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();