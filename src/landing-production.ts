/* Ginger Dragon Studios entrance — STEP 1 ONLY: smooth heavy fabric lift. */

const ART_W=1085,ART_H=1450,ART_RATIO=ART_W/ART_H;
function setLandingLock(active:boolean){document.documentElement.classList.toggle('studio-landing-active',active);document.body.classList.toggle('studio-landing-active',active)}
function sizeStage(stage:HTMLElement){const vv=window.visualViewport;const vw=vv?.width||innerWidth;const vh=vv?.height||innerHeight;const inset=vw<520?8:16;const aw=Math.max(220,vw-inset*2);const ah=Math.max(280,vh-inset*2);const w=Math.min(ART_W,aw,ah*ART_RATIO);stage.style.width=`${Math.floor(w)}px`;stage.style.height=`${Math.floor(w/ART_RATIO)}px`}
function installStyles(){if(document.getElementById('ginger-dragon-step-one-styles'))return;const s=document.createElement('style');s.id='ginger-dragon-step-one-styles';s.textContent=`
.studio-entrance-root{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:radial-gradient(ellipse at 50% 42%,#1b1518 0%,#0d090d 58%,#050405 100%)!important;perspective:1200px}
.studio-poster-stage{position:relative!important;z-index:2!important;transform-origin:50% 0%;will-change:transform;backface-visibility:hidden;transform:translate3d(0,0,0);filter:drop-shadow(0 18px 24px rgba(0,0,0,.5))}
.studio-poster-stage .studio-hero-art{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;will-change:transform,filter;transform-origin:50% 0%;backface-visibility:hidden}
.studio-poster-stage::after{content:"";position:absolute;left:1.5%;right:1.5%;bottom:-1.1%;height:4.8%;z-index:4;border-radius:50%;pointer-events:none;opacity:.68;background:linear-gradient(180deg,rgba(70,43,31,.12),rgba(20,11,10,.48));box-shadow:0 8px 14px rgba(0,0,0,.32);transform-origin:50% 20%;will-change:transform,opacity}
.studio-poster-stage.studio-lifting{animation:studio-lift 1.34s cubic-bezier(.55,.02,.28,.98) forwards}
.studio-poster-stage.studio-lifting .studio-hero-art{animation:studio-cloth-response 1.34s cubic-bezier(.55,.02,.28,.98) forwards}
.studio-poster-stage.studio-lifting::after{animation:studio-bottom-curl 1.34s cubic-bezier(.55,.02,.28,.98) forwards}
.studio-poster-stage.studio-lifting .studio-poster-cta{pointer-events:none!important;opacity:0!important}
@keyframes studio-lift{
0%{transform:translate3d(0,0,0) rotateZ(0deg)}
9%{transform:translate3d(-.10vw,-.8vh,0) rotateZ(-.05deg)}
24%{transform:translate3d(.12vw,-10vh,0) rotateZ(.10deg)}
48%{transform:translate3d(-.18vw,-43vh,0) rotateZ(-.16deg)}
72%{transform:translate3d(.10vw,-82vh,0) rotateZ(.10deg)}
91%{transform:translate3d(-.04vw,-113vh,0) rotateZ(-.04deg)}
100%{transform:translate3d(0,-127vh,0) rotateZ(0deg)}
}
@keyframes studio-cloth-response{
0%{transform:skewX(0deg) scaleY(1);filter:brightness(1)}
12%{transform:skewX(-.12deg) scaleY(1.003);filter:brightness(.99)}
31%{transform:skewX(.18deg) scaleY(.998);filter:brightness(.975)}
57%{transform:skewX(-.14deg) scaleY(.994);filter:brightness(.965)}
78%{transform:skewX(.08deg) scaleY(.991);filter:brightness(.98)}
100%{transform:skewX(0deg) scaleY(.988);filter:brightness(1)}
}
@keyframes studio-bottom-curl{
0%{transform:translate3d(0,0,0) scaleY(.7);opacity:.35}
16%{transform:translate3d(-.15%,1px,10px) scaleY(1.12) rotateX(8deg);opacity:.7}
42%{transform:translate3d(.2%,5px,18px) scaleY(1.35) rotateX(16deg);opacity:.82}
68%{transform:translate3d(-.12%,2px,12px) scaleY(1.08) rotateX(10deg);opacity:.68}
100%{transform:translate3d(0,0,0) scaleY(.8);opacity:.3}
}
.studio-step-label{position:absolute;left:50%;bottom:max(24px,env(safe-area-inset-bottom));z-index:1;transform:translateX(-50%);color:rgba(220,199,163,.5);font:600 11px/1.2 system-ui;letter-spacing:.18em;text-transform:uppercase;opacity:0;transition:opacity .3s ease;white-space:nowrap}
.studio-entrance-root.studio-step-one-complete .studio-step-label{opacity:1}
@media(prefers-reduced-motion:reduce){.studio-poster-stage.studio-lifting,.studio-poster-stage.studio-lifting .studio-hero-art,.studio-poster-stage.studio-lifting::after{animation-duration:.25s}}
`;document.head.appendChild(s)}
function installEntrance(){const image=document.querySelector<HTMLImageElement>('img.studio-hero-art');if(!image){setLandingLock(false);return}if(document.querySelector('.studio-entrance-root')||image.dataset.posterEnhanced==='true')return;const card=image.closest<HTMLElement>('.landing-card-v2')||image.parentElement;if(!card)return;installStyles();image.dataset.posterEnhanced='true';setLandingLock(true);const root=document.createElement('div');root.className='studio-entrance-root';root.setAttribute('role','presentation');const stage=document.createElement('div');stage.className='studio-poster-stage';root.appendChild(stage);const poster=image.cloneNode(true) as HTMLImageElement;poster.removeAttribute('data-poster-enhanced');poster.className='studio-hero-art';poster.alt='Ginger Dragon Studios tapestry';stage.appendChild(poster);const cta=document.createElement('button');cta.type='button';cta.className='studio-poster-cta';cta.setAttribute('aria-label','Enter Crawler Companion');cta.innerHTML='<span class="sr-only">Enter Crawler Companion</span>';cta.addEventListener('click',()=>{if(cta.disabled)return;cta.disabled=true;requestAnimationFrame(()=>stage.classList.add('studio-lifting'));setTimeout(()=>root.classList.add('studio-step-one-complete'),1400)});stage.appendChild(cta);const label=document.createElement('div');label.className='studio-step-label';label.textContent='Step 1 · smooth fabric lift test';root.appendChild(label);document.body.appendChild(root);sizeStage(stage);const resize=()=>sizeStage(stage);addEventListener('resize',resize,{passive:true});addEventListener('orientationchange',resize,{passive:true});visualViewport?.addEventListener('resize',resize,{passive:true})}
function bootEntrance(){installEntrance();const observer=new MutationObserver(()=>installEntrance());observer.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootEntrance,{once:true});else bootEntrance();
