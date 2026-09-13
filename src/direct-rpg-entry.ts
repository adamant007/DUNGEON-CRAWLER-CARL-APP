let entered=false;

function text(el:Element){return ((el.textContent||'')+' '+(el.getAttribute('aria-label')||'')).trim()}

function openCharacter(){
  const nav=document.querySelector('[aria-label="Primary navigation"]');
  const button=[...(nav?.querySelectorAll<HTMLButtonElement>('button')||[])].find(b=>(b.textContent||'').replace(/✦/g,'').trim().toLowerCase()==='character');
  button?.click();
}

function enterApp(){
  if(entered)return true;
  const direct=document.querySelector<HTMLElement>('.studio-poster-cta');
  const fallback=[...document.querySelectorAll<HTMLElement>('button,a,[role="button"]')].find(el=>/launch|enter\s+(?:crawler|rpg)|open\s+rpg/i.test(text(el)));
  const target=direct||fallback;
  if(!target)return false;
  entered=true;
  target.click();
  setTimeout(openCharacter,80);
  setTimeout(openCharacter,300);
  setTimeout(openCharacter,900);
  return true;
}

function boot(){
  if(enterApp())return;
  const observer=new MutationObserver(()=>{if(enterApp())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
