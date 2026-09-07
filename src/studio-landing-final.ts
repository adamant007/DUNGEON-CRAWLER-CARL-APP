const STYLE_ID='gds-final-landing-style';

function installFinalLanding(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .landing-card-v2{position:relative!important;max-width:1100px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}
    .landing-card-v2 .studio-hero-art{display:block!important;width:100%!important;max-width:1100px!important;height:auto!important;margin:0 auto!important;object-fit:contain!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:0 28px 70px rgba(0,0,0,.48)!important}
    .gds-enter-hotspot{position:absolute!important;left:40.4%!important;top:76.0%!important;width:40.8%!important;height:4.4%!important;z-index:20!important;display:block!important;border:0!important;border-radius:12px!important;background:rgba(255,170,55,.01)!important;color:transparent!important;font-size:0!important;cursor:pointer!important;text-decoration:none!important;outline:none!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
    .gds-enter-hotspot::after{content:"";position:absolute;inset:-4px;border-radius:14px;opacity:0;box-shadow:0 0 16px 4px rgba(255,166,65,.7),inset 0 0 10px rgba(255,220,140,.35);transition:opacity .16s ease}
    .gds-enter-hotspot:hover::after,.gds-enter-hotspot:focus-visible::after{opacity:1}
    .gds-enter-hotspot:active::after{opacity:.75}
    .gds-enter-hotspot:focus-visible{outline:3px solid #ffd38a!important;outline-offset:4px!important}
    @media(max-width:760px){.landing-card-v2{width:100%!important}.landing-card-v2 .studio-hero-art{width:100%!important;max-width:none!important}.gds-enter-hotspot{min-height:44px}}
    @media(prefers-reduced-motion:reduce){.gds-enter-hotspot::after{transition:none}}
  `;
  document.head.appendChild(style);

  const attach=()=>{
    const card=document.querySelector('.landing-card-v2');
    const art=card?.querySelector('.studio-hero-art');
    if(!(card instanceof HTMLElement)||!(art instanceof HTMLImageElement)) return false;
    if(card.querySelector('.gds-enter-hotspot')) return true;
    const enter=Array.from(card.querySelectorAll('button,a')).find((el)=>/enter crawler companion/i.test(el.textContent||''));
    const target=enter instanceof HTMLAnchorElement?enter.getAttribute('href'):null;
    const hotspot=document.createElement('a');
    hotspot.className='gds-enter-hotspot';
    hotspot.href=target||'#crawler-companion';
    hotspot.setAttribute('aria-label','Enter Crawler Companion');
    hotspot.textContent='Enter Crawler Companion';
    hotspot.addEventListener('click',(event)=>{
      if(enter instanceof HTMLElement){event.preventDefault();enter.click();}
      else if(!target){event.preventDefault();window.dispatchEvent(new CustomEvent('gds-enter-crawler-companion'));}
    });
    card.appendChild(hotspot);
    if(enter instanceof HTMLElement){enter.style.position='absolute';enter.style.width='1px';enter.style.height='1px';enter.style.overflow='hidden';enter.style.clip='rect(0 0 0 0)';enter.style.whiteSpace='nowrap';}
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
