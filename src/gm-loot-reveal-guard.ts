const REVEAL_ID='cc-loot-box-reveal';

function inGmContext(){
  const main=document.querySelector('.app>main') as HTMLElement|null;
  if(!main)return false;
  if(document.getElementById('cc-runtime-gm-tools'))return true;
  return /GM Command Center|GM Tools/i.test(main.innerText||'');
}

function suppressGmReveal(){
  if(!inGmContext())return;
  const reveal=document.getElementById(REVEAL_ID);
  if(reveal)reveal.remove();
}

let queued=false;
function queue(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;suppressGmReveal()});
}

new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',queue,true);
setTimeout(suppressGmReveal,900);

export { suppressGmReveal };
