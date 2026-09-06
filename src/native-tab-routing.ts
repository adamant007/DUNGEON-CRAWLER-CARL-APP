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

const STYLE_ID='cc-primary-route-lock';
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function clean(s:string){return s.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}
function activeTab(){const nav=primaryNav();if(!nav)return '';const active=nav.querySelector('button.active,[aria-current="page"]') as HTMLElement|null;return clean(active?.textContent||'')}
function slug(tab:string){return clean(tab).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function addRouteCss(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 /* Runtime panels must never bleed into unrelated primary tabs. */
 body:not([data-cc-primary-tab="progression"]) #cc-spell-system{display:none!important}
 body:not([data-cc-primary-tab="gm-tools"]) #cc-custom-spells,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-runtime-gm-tools,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-gm-rewards,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-loot-boxes,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-smart-loot{display:none!important}
 body:not([data-cc-primary-tab="equipment"]) #cc-equipment-stats{display:none!important}
 body:not([data-cc-primary-tab="combat"]) #cc-combat-damage{display:none!important}
 body:not([data-cc-primary-tab="inventory"]) #cc-magic-items{display:none!important}
 body:not([data-cc-primary-tab="campaign"]) #cc-campaign-context{display:none!important}
 `;document.head.appendChild(s)}
function setRoute(tab:string){if(!tab)return;addRouteCss();document.body.dataset.ccPrimaryTab=slug(tab)}
function routePanels(tabArg?:string){const tab=clean(tabArg||activeTab());if(!tab)return;setRoute(tab);for(const [id,tabs] of Object.entries(PANEL_TABS)){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;const show=tabs.includes(tab);el.hidden=!show;el.style.display=show?'':'none'}document.getElementById('cc-workspace-dice')?.remove();document.getElementById('cc-workspace-tabs')?.remove()}
let installedNav:HTMLElement|null=null;
function install(){const nav=primaryNav();if(!nav)return;if(installedNav!==nav){installedNav=nav;nav.addEventListener('click',e=>{const btn=(e.target as Element|null)?.closest('button') as HTMLButtonElement|null;if(!btn)return;const tab=clean(btn.textContent||'');setRoute(tab);setTimeout(()=>routePanels(tab),0);setTimeout(()=>routePanels(tab),80)},true)}routePanels()}
let attempts=0;
const timer=window.setInterval(()=>{attempts++;install();if(primaryNav()||attempts>=40)window.clearInterval(timer)},100);
window.addEventListener('cc:campaign-role-changed',()=>setTimeout(()=>routePanels(),0));
window.addEventListener('cc:character-updated',()=>setTimeout(()=>routePanels(),0));
setTimeout(install,0);
export { routePanels };
