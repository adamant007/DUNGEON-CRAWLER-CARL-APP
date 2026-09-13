const STYLE_ID='gds-final-landing-style';
const CRAWLER_URL='https://crawl-companion-quest.base44.app';

function installFinalLanding(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .landing-card-v2{position:relative!important;max-width:1024px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;margin:0 auto!important}
    .landing-card-v2 .studio-hero-art{display:block!important;width:100%!important;max-width:1024px!important;height:auto!important;margin:0 auto!important;object-fit:contain!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
    .gds-enter-hotspot{position:absolute!important;left:40.2%!important;top:74.7%!important;width:37.8%!important;height:3.0%!important;z-index:40!important;display:block!important;border:0!important;border-radius:8px!important;background:rgba(255,170,55,.01)!important;color:transparent!important;font-size:0!important;cursor:pointer!important;text-decoration:none!important;outline:none!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
    .gds-enter-hotspot::after{content:"";position:absolute;inset:-3px;border-radius:10px;opacity:0;box-shadow:0 0 16px 4px rgba(255,166,65,.7),inset 0 0 10px rgba(255,220,140,.35);transition:opacity .16s ease}
    .gds-enter-hotspot:hover::after,.gds-enter-hotspot:focus-visible::after{opacity:1}
    .gds-enter-hotspot:active::after{opacity:.75}
    .gds-enter-hotspot:focus-visible{outline:3px solid #ffd38a!important;outline-offset:3px!important}
    @media(max-width:760px){.landing-card-v2{width:100%!important}.landing-card-v2 .studio-hero-art{width:100%!important;max-width:none!important}.gds-enter-hotspot{min-height:34px}}
    @media(prefers-reduced-motion:reduce){.gds-enter-hotspot::after{transition:none}}
  `;
  document.head.appendChild(style);

  const attach=()=>{
    const card=document.querySelector('.landing-card-v2');
    const art=card?.querySelector('.studio-hero-art');
    if(!(card instanceof HTMLElement)||!(art instanceof HTMLImageElement)) return false;
    let hotspot=card.querySelector('.gds-enter-hotspot') as HTMLAnchorElement|null;
    if(!hotspot){
      hotspot=document.createElement('a');
      hotspot.className='gds-enter-hotspot';
      hotspot.setAttribute('aria-label','Enter Crawler Companion');
      hotspot.textContent='Enter Crawler Companion';
      card.appendChild(hotspot);
    }
    hotspot.href=CRAWLER_URL;
    hotspot.target='_self';
    hotspot.rel='noopener';
    const oldEnter=Array.from(card.querySelectorAll('button,a')).find((el)=>el!==hotspot&&/enter (?:crawler|rpg) companion/i.test((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')));
    if(oldEnter instanceof HTMLElement){oldEnter.style.position='absolute';oldEnter.style.width='1px';oldEnter.style.height='1px';oldEnter.style.overflow='hidden';oldEnter.style.clip='rect(0 0 0 0)';oldEnter.style.whiteSpace='nowrap';}
    return true;
  };
  if(!attach()){
    const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFinalLanding,{once:true});else installFinalLanding();
export {installFinalLanding};
