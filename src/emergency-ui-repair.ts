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
function nav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function labelOf(btn:Element|null){return (btn?.textContent||'').replace(/✦/g,'').trim()}
function currentTab(){const n=nav();if(!n)return '';const b=n.querySelector('button.active,[aria-current="page"]') as HTMLButtonElement|null;return labelOf(b)}
function restoreTutorial(){document.querySelectorAll<HTMLElement>('[data-cc-tutorial-hidden="true"]').forEach(el=>{el.style.removeProperty('display');el.removeAttribute('data-cc-tutorial-hidden')});document.getElementById('cc-tutorial-panel')?.remove();nav()?.querySelectorAll<HTMLButtonElement>('[data-cc-tutorial-tab]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')})}
function routeFor(tab:string){if(!tab)return;for(const [id,tabs] of Object.entries(PANEL_TABS)){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;const show=tabs.includes(tab);el.hidden=!show;el.style.display=show?'':'none'}}
function normalizeActive(btn:HTMLButtonElement){const n=nav();if(!n)return;n.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function repairNav(){const n=nav();if(!n||n.dataset.ccEmergencyNav==='4')return;n.dataset.ccEmergencyNav='4';n.addEventListener('click',e=>{const btn=(e.target as Element|null)?.closest('button') as HTMLButtonElement|null;if(!btn)return;const tab=labelOf(btn);if(tab!=='Tutorial')restoreTutorial();setTimeout(()=>{if(tab!=='Tutorial'){normalizeActive(btn);routeFor(tab)}},25);setTimeout(()=>{if(tab!=='Tutorial')routeFor(tab)},160)},true)}
function repairBrandImages(){document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{const meta=`${img.alt} ${img.id} ${img.className}`;if(!/ginger dragon fire studios|ginger dragon studios|dragon logo|brand/i.test(meta))return;if(img.dataset.ccBrandFallback==='1')return;img.dataset.ccBrandFallback='1';const fallback=()=>{img.src='/brand/app-icon.svg';img.style.objectFit='contain';img.style.background='rgba(18,12,28,.35)'};if(!img.getAttribute('src')||img.complete&&img.naturalWidth===0)fallback();else img.addEventListener('error',fallback,{once:true})})}
function hideBrokenPlaceholders(){document.querySelectorAll<HTMLImageElement>('.app img,main img').forEach(img=>{if(img.id==='cc-mobile-brand-image')return;const meta=`${img.alt} ${img.className}`;if(/ginger dragon fire studios|ginger dragon studios|dragon logo|brand/i.test(meta))return;if(/portrait|character|crawler|avatar|photo|image/i.test(meta)){const src=img.getAttribute('src')||'';if(!src||src==='#'||/placeholder/i.test(src))img.style.display='none';else img.addEventListener('error',()=>{img.style.display='none'},{once:true})}})}
function enhanceHud(){const hud=document.getElementById('cc-mobile-resource-hud');if(!hud||hud.querySelector('[data-cc-hp-controls]'))return;const hp=hud.querySelector('.cc-hud-hp');if(!hp)return;const controls=document.createElement('div');controls.setAttribute('data-cc-hp-controls','true');controls.style.cssText='display:flex;gap:6px;margin-top:6px;justify-content:flex-end;flex-wrap:wrap';controls.innerHTML='<button type="button" data-dmg="1">−1 HP</button><button type="button" data-dmg="5">−5 HP</button>';controls.querySelectorAll<HTMLButtonElement>('[data-dmg]').forEach(b=>b.onclick=async()=>{const amount=Number(b.dataset.dmg||1);const fn=(window as any).ccApplyDamage;if(typeof fn==='function'){try{await fn(amount,'Unspecified');window.dispatchEvent(new CustomEvent('cc-resource-change'));window.dispatchEvent(new CustomEvent('cc:character-updated'))}catch(e){console.warn('HP deduction failed',e)}}});hp.appendChild(controls)}
function clearFalseTutorialActive(){const n=nav();if(!n)return;const active=[...n.querySelectorAll<HTMLButtonElement>('button')].filter(b=>b.classList.contains('active')||b.getAttribute('aria-current')==='page');if(active.length>1){const tutorial=active.find(b=>labelOf(b)==='Tutorial');if(tutorial&&!document.getElementById('cc-tutorial-panel')){tutorial.classList.remove('active');tutorial.removeAttribute('aria-current')}}}
function enforceCurrentRoute(){const tab=currentTab();if(tab&&tab!=='Tutorial')routeFor(tab)}
function repair(){repairNav();repairBrandImages();hideBrokenPlaceholders();enhanceHud();clearFalseTutorialActive();enforceCurrentRoute()}
function queueRepair(delay=0){window.setTimeout(repair,delay)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queueRepair(50),{once:true});else queueRepair(50);
window.addEventListener('cc-resource-change',()=>queueRepair(0));
window.addEventListener('cc:character-updated',()=>queueRepair(0));
window.addEventListener('cc:campaign-changed',()=>queueRepair(0));
window.addEventListener('storage',()=>queueRepair(0));
document.addEventListener('change',()=>queueRepair(20),true);
export { repair };
