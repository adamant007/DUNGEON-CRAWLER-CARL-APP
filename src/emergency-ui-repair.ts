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
function restoreTutorial(){document.querySelectorAll<HTMLElement>('[data-cc-tutorial-hidden="true"]').forEach(el=>{el.style.removeProperty('display');el.removeAttribute('data-cc-tutorial-hidden')});document.getElementById('cc-tutorial-panel')?.remove();nav()?.querySelectorAll<HTMLButtonElement>('[data-cc-tutorial-tab]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')})}
function routeFor(tab:string){for(const [id,tabs] of Object.entries(PANEL_TABS)){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;const show=tabs.includes(tab);el.hidden=!show;el.style.display=show?'':'none'}}
function normalizeActive(btn:HTMLButtonElement){const n=nav();if(!n)return;n.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function repairNav(){const n=nav();if(!n||n.dataset.ccEmergencyNav==='2')return;n.dataset.ccEmergencyNav='2';n.addEventListener('click',e=>{const btn=(e.target as Element|null)?.closest('button') as HTMLButtonElement|null;if(!btn)return;const tab=labelOf(btn);if(tab!=='Tutorial')restoreTutorial();setTimeout(()=>{if(tab!=='Tutorial'){normalizeActive(btn);routeFor(tab);window.scrollTo({top:0,behavior:'instant' as ScrollBehavior})}},25)},true)}
function hideBrokenPlaceholders(){document.querySelectorAll<HTMLImageElement>('.app img,main img').forEach(img=>{if(img.id==='cc-mobile-brand-image')return;const meta=`${img.alt} ${img.className}`;if(/portrait|character|crawler|avatar|photo|image/i.test(meta)){const src=img.getAttribute('src')||'';if(!src||src==='#'||/placeholder/i.test(src))img.style.display='none';else img.addEventListener('error',()=>{img.style.display='none'},{once:true})}})}
function enhanceHud(){const hud=document.getElementById('cc-mobile-resource-hud');if(!hud||hud.querySelector('[data-cc-hp-controls]'))return;const hp=hud.querySelector('.cc-hud-hp');if(!hp)return;const controls=document.createElement('div');controls.setAttribute('data-cc-hp-controls','true');controls.style.cssText='display:flex;gap:6px;margin-top:6px;justify-content:flex-end;flex-wrap:wrap';controls.innerHTML='<button type="button" data-dmg="1">−1 HP</button><button type="button" data-dmg="5">−5 HP</button>';controls.querySelectorAll<HTMLButtonElement>('[data-dmg]').forEach(b=>b.onclick=async()=>{const amount=Number(b.dataset.dmg||1);const fn=(window as any).ccApplyDamage;if(typeof fn==='function'){try{await fn(amount,'Unspecified');window.dispatchEvent(new CustomEvent('cc-resource-change'));window.dispatchEvent(new CustomEvent('cc:character-updated'))}catch(e){console.warn('HP deduction failed',e)}}});hp.appendChild(controls)}
function clearFalseTutorialActive(){const n=nav();if(!n)return;const active=[...n.querySelectorAll<HTMLButtonElement>('button')].filter(b=>b.classList.contains('active')||b.getAttribute('aria-current')==='page');if(active.length>1){const tutorial=active.find(b=>labelOf(b)==='Tutorial');if(tutorial&&!document.getElementById('cc-tutorial-panel')){tutorial.classList.remove('active');tutorial.removeAttribute('aria-current')}}}
let queued=false;function repair(){repairNav();hideBrokenPlaceholders();enhanceHud();clearFalseTutorialActive()}new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;repair()})}).observe(document.documentElement,{subtree:true,childList:true});setInterval(repair,500);setTimeout(repair,50);export { repair };
