const REVEAL_ID='cc-loot-box-reveal';

function inGmContext(){
  const role=document.documentElement.getAttribute('data-cc-campaign-role')||'';
  return /^(gm|owner)$/i.test(role);
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

new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-cc-campaign-role']});
document.addEventListener('click',queue,true);
window.addEventListener('cc:campaign-role-changed',queue);
setTimeout(suppressGmReveal,900);

export { suppressGmReveal };
