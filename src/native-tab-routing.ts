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
function routePanels(){const tab=activeTab();if(!tab)return;for(const [id,tabs] of Object.entries(PANEL_TABS)){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;const show=tabs.includes(tab);el.hidden=!show;el.style.display=show?'':'none'}document.getElementById('cc-workspace-dice')?.remove();document.getElementById('cc-workspace-tabs')?.remove()}
let installedNav:HTMLElement|null=null;
function install(){const nav=primaryNav();if(!nav)return;if(installedNav!==nav){installedNav=nav;nav.addEventListener('click',()=>setTimeout(routePanels,0),true)}routePanels()}
// Only wait for the primary nav to mount. Do not observe the whole app: helper-panel
// mutations otherwise feed back into routing while React is changing tabs.
let attempts=0;
const timer=window.setInterval(()=>{attempts++;install();if(primaryNav()||attempts>=40)window.clearInterval(timer)},100);
window.addEventListener('cc:campaign-role-changed',()=>setTimeout(routePanels,0));
setTimeout(install,0);
export { routePanels };
