const HOST_ID='cc-runtime-panel-host';
const PANEL_IDS=new Set([
  'cc-spell-system','cc-custom-spells','cc-equipment-stats','cc-combat-damage',
  'cc-magic-items','cc-campaign-context','cc-runtime-gm-tools','cc-gm-rewards',
  'cc-loot-boxes','cc-smart-loot'
]);

function ensureHost(){
  let host=document.getElementById(HOST_ID) as HTMLElement|null;
  const main=document.querySelector('.app>main') as HTMLElement|null;
  if(!main)return null;
  if(!host){
    host=document.createElement('div');
    host.id=HOST_ID;
    host.setAttribute('data-cc-runtime-host','true');
    main.insertAdjacentElement('afterend',host);
  }
  return host;
}

function relocate(){
  const main=document.querySelector('.app>main') as HTMLElement|null;
  const host=ensureHost();
  if(!main||!host)return;
  for(const id of PANEL_IDS){
    const panel=document.getElementById(id) as HTMLElement|null;
    if(panel&&main.contains(panel)&&panel.parentElement!==host)host.appendChild(panel);
  }
}

let queued=false;
function queue(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;relocate()});
}

const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    if(mutation.type==='childList'&&mutation.addedNodes.length){queue();break;}
  }
});
observer.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(relocate,0);
setTimeout(relocate,250);
setTimeout(relocate,750);

export { relocate };
