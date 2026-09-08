/* Ginger Dragon Studios entrance — STEP 1 ONLY: physical tapestry roll. */

const ART_W = 1085;
const ART_H = 1450;
const ART_RATIO = ART_W / ART_H;

function setLandingLock(active:boolean){document.documentElement.classList.toggle('studio-landing-active',active);document.body.classList.toggle('studio-landing-active',active)}
function sizeStage(stage:HTMLElement){const vv=window.visualViewport;const vw=vv?.width||innerWidth;const vh=vv?.height||innerHeight;const inset=vw<520?8:16;const aw=Math.max(220,vw-inset*2);const ah=Math.max(280,vh-inset*2);const w=Math.min(ART_W,aw,ah*ART_RATIO);stage.style.width=`${Math.floor(w)}px`;stage.style.height=`${Math.floor(w/ART_RATIO)}px`}
function installStyles(){if(document.getElementById('ginger-dragon-step-one-styles'))return;const s=document.createElement('style');s.id='ginger-dragon-step-one-styles';s.textContent=`
.studio-entrance-root{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:radial-gradient(ellipse at 50% 42%,#1b1518 0%,#0d090d 58%,#050405 100%)!important}
.studio-poster-stage{position:relative!important;z-index:2!important;overflow:visible!important;filter:drop-shadow(0 18px 22px rgba(0,0,0,.48))}
.studio-tapestry-window{position:absolute;inset:0;overflow:hidden;clip-path:inset(0 0 0 0);will-change:clip-path;z-index:1}
.studio-tapestry-window .studio-hero-art{width:100%!important;height:100%!important;object-fit:contain!important;display:block!important}
.studio-roll{position:absolute;left:-1.5%;bottom:-2.2%;width:103%;height:8.5%;z-index:3;border-radius:50%/34%;background-repeat:no-repeat;background-size:100% auto;background-position:center bottom;box-shadow:0 8px 14px rgba(0,0,0,.5),inset 0 4px 8px rgba(255,255,255,.08),inset 0 -7px 9px rgba(0,0,0,.34);transform:translateY(0) rotateX(8deg);transform-origin:center;will-change:bottom,transform,height}
.studio-roll::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.12) 44%,rgba(0,0,0,.38) 100%);pointer-events:none}
.studio-poster-cta{z-index:5!important}
.studio-poster-stage.studio-rolling .studio-tapestry-window{animation:studio-cloth-disappear 1.65s cubic-bezier(.62,.03,.24,1) forwards}
.studio-poster-stage.studio-rolling .studio-roll{animation:studio-roll-climb 1.65s cubic-bezier(.62,.03,.24,1) forwards}
.studio-poster-stage.studio-rolling .studio-poster-cta{pointer-events:none!important;opacity:0!important}
@keyframes studio-cloth-disappear{
0%{clip-path:inset(0 0 0 0)}
12%{clip-path:inset(0 0 3% 0)}
38%{clip-path:inset(0 0 27% 0)}
68%{clip-path:inset(0 0 63% 0)}
88%{clip-path:inset(0 0 88% 0)}
100%{clip-path:inset(0 0 100% 0)}
}
@keyframes studio-roll-climb{
0%{bottom:-2.2%;height:8.5%;transform:translateX(0) rotateX(8deg) rotateZ(0deg)}
12%{bottom:1%;height:9%;transform:translateX(-.3%) rotateX(10deg) rotateZ(-.2deg)}
38%{bottom:25%;height:10%;transform:translateX(.35%) rotateX(12deg) rotateZ(.25deg)}
68%{bottom:61%;height:10.8%;transform:translateX(-.2%) rotateX(13deg) rotateZ(-.18deg)}
88%{bottom:86%;height:11.4%;transform:translateX(.15%) rotateX(11deg) rotateZ(.12deg)}
100%{bottom:101%;height:11.8%;transform:translateX(0) rotateX(8deg) rotateZ(0deg)}
}
.studio-step-label{position:absolute;left:50%;bottom:max(24px,env(safe-area-inset-bottom));z-index:1;transform:translateX(-50%);color:rgba(220,199,163,.5);font:600 11px/1.2 system-ui;letter-spacing:.18em;text-transform:uppercase;opacity:0;transition:opacity .3s ease;white-space:nowrap}
.studio-entrance-root.studio-step-one-complete .studio-step-label{opacity:1}
@media(prefers-reduced-motion:reduce){.studio-poster-stage.studio-rolling .studio-tapestry-window,.studio-poster-stage.studio-rolling .studio-roll{animation-duration:.3s}}
`;document.head.appendChild(s)}

function installEntrance(){
 const image=document.querySelector<HTMLImageElement>('img.studio-hero-art');if(!image){setLandingLock(false);return}
 if(document.querySelector('.studio-entrance-root')||image.dataset.posterEnhanced==='true')return;
 const card=image.closest<HTMLElement>('.landing-card-v2')||image.parentElement;if(!card)return;
 installStyles();image.dataset.posterEnhanced='true';setLandingLock(true);
 const root=document.createElement('div');root.className='studio-entrance-root';root.setAttribute('role','presentation');
 const stage=document.createElement('div');stage.className='studio-poster-stage';root.appendChild(stage);
 const windowEl=document.createElement('div');windowEl.className='studio-tapestry-window';stage.appendChild(windowEl);
 const poster=image.cloneNode(true) as HTMLImageElement;poster.removeAttribute('data-poster-enhanced');poster.className='studio-hero-art';poster.alt='Ginger Dragon Studios tapestry';windowEl.appendChild(poster);
 const roll=document.createElement('div');roll.className='studio-roll';const src=image.currentSrc||image.src;roll.style.backgroundImage=`url("${src}")`;stage.appendChild(roll);
 const cta=document.createElement('button');cta.type='button';cta.className='studio-poster-cta';cta.setAttribute('aria-label','Enter Crawler Companion');cta.innerHTML='<span class="sr-only">Enter Crawler Companion</span>';
 cta.addEventListener('click',()=>{if(cta.disabled)return;cta.disabled=true;stage.classList.add('studio-rolling');setTimeout(()=>root.classList.add('studio-step-one-complete'),1700)});stage.appendChild(cta);
 const label=document.createElement('div');label.className='studio-step-label';label.textContent='Step 1 · tapestry roll test';root.appendChild(label);
 document.body.appendChild(root);sizeStage(stage);
 const resize=()=>sizeStage(stage);addEventListener('resize',resize,{passive:true});addEventListener('orientationchange',resize,{passive:true});visualViewport?.addEventListener('resize',resize,{passive:true});
}
function bootEntrance(){installEntrance();const observer=new MutationObserver(()=>installEntrance());observer.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootEntrance,{once:true});else bootEntrance();
