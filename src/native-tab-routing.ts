const PANEL_TABS: Record<string,string[]> = {
  'cc-spell-system':['Progression'],
  'cc-custom-spells':['GM Tools'],
  'cc-equipment-stats':['Equipment'],
  'cc-combat-damage':['Combat'],
  'cc-magic-items':['Inventory'],
  'cc-campaign-context':['Campaign'],
  'cc-runtime-gm-tools':['GM Tools'],
  'cc-gm-rewards':['GM Tools'],
  'cc-loot-boxes':['GM Tools'],
  'cc-smart-loot':['GM Tools']
};

function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function activeTab(){const nav=primaryNav();if(!nav)return '';const active=nav.querySelector('button.active,[aria-current="page"]') as HTMLElement|null;return active?.textContent?.trim()||''}
function routePanels(){const tab=activeTab();if(!tab)return;for(const [id,tabs] of Object.entries(PANEL_TABS)){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;el.hidden=!tabs.includes(tab);el.style.display=tabs.includes(tab)?'':'none'}const dice=document.getElementById('cc-workspace-dice');if(dice)dice.remove();const workspace=document.getElementById('cc-workspace-tabs');if(workspace)workspace.remove()}
function install(){const nav=primaryNav();if(!nav)return;nav.addEventListener('click',()=>setTimeout(routePanels,0),true);routePanels()}
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install();routePanels()})}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(()=>{install();routePanels()},400);
export { routePanels };
