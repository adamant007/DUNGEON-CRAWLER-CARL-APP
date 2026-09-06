import { cloudListCampaigns } from './cloud';

const ACTIVE_KEY='cc-active-campaign-id';
const ROLE_ATTR='data-cc-campaign-role';
const STYLE_ID='cc-campaign-role-visibility-style';
let refreshQueued=false;

function activeCampaignId(){return localStorage.getItem(ACTIVE_KEY)||''}
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function currentRole(){return document.documentElement.getAttribute(ROLE_ATTR)||''}

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');
 style.id=STYLE_ID;
 style.textContent=`html[${ROLE_ATTR}="player"] #cc-runtime-gm-tools,html[${ROLE_ATTR}="player"] #cc-gm-rewards,html[${ROLE_ATTR}="player"] #cc-loot-boxes,html[${ROLE_ATTR}="player"] #cc-smart-loot{display:none!important}`;
 document.head.appendChild(style);
}

function setRole(role:string){
 const root=document.documentElement;
 const normalized=role.trim().toLowerCase();
 const previous=currentRole();
 if(normalized)root.setAttribute(ROLE_ATTR,normalized);else root.removeAttribute(ROLE_ATTR);
 if(previous!==normalized)window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:normalized}}));
}

function ensureGmButton(nav:HTMLElement){
 let gm=[...nav.querySelectorAll<HTMLButtonElement>('button')].find(btn=>/^GM Tools$/i.test(btn.textContent?.trim()||''));
 if(gm)return gm;
 gm=document.createElement('button');
 gm.type='button';
 gm.textContent='GM Tools';
 gm.dataset.ccSyntheticGm='true';
 gm.dataset.ccRoleGuard='gm';
 const template=nav.querySelector<HTMLButtonElement>('button');
 if(template)gm.className=template.className.replace(/\bactive\b/g,'').trim();
 gm.addEventListener('click',()=>{
  nav.querySelectorAll<HTMLButtonElement>('button').forEach(btn=>{
   if(btn!==gm){btn.classList.remove('active');btn.removeAttribute('aria-current')}
  });
  gm!.classList.add('active');
  gm!.setAttribute('aria-current','page');
 });
 nav.appendChild(gm);
 return gm;
}

function applyVisibility(){
 ensureStyle();
 const hide=currentRole()==='player';
 const nav=primaryNav();
 const gm=nav?ensureGmButton(nav):null;
 if(gm){
  gm.dataset.ccRoleGuard='gm';
  gm.hidden=hide;
  gm.style.display=hide?'none':'';
  gm.setAttribute('aria-hidden',String(hide));
 }
 if(hide&&gm&&(gm.classList.contains('active')||gm.getAttribute('aria-current')==='page')){
  const fallback=[...(nav?.querySelectorAll<HTMLButtonElement>('button')||[])].find(b=>!b.hidden&&/^(Dashboard|Character)$/i.test(b.textContent?.trim()||''));
  fallback?.click();
 }
}

async function refreshRole(){
 const id=activeCampaignId();
 if(!id){setRole('');applyVisibility();return;}
 try{
  const campaigns=await cloudListCampaigns() as any[];
  const active=campaigns.find(c=>c.id===id);
  // Only hide GM Tools when the cloud actually confirms this user is a player.
  // A missing/stale campaign or unavailable beta cloud must not silently demote a local tester.
  setRole(active?String(active.role||'player'):'');
 }catch{
  setRole('');
 }
 applyVisibility();
}

function queueRefresh(){
 if(refreshQueued)return;
 refreshQueued=true;
 requestAnimationFrame(()=>{refreshQueued=false;void refreshRole()});
}

ensureStyle();
window.addEventListener('cc:campaign-changed',queueRefresh);
window.addEventListener('cc:campaign-role-changed',applyVisibility);
window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)queueRefresh()});
// The restored React shell can replace the nav subtree a few times while mounting.
// Keep this bounded and nav-specific: recreate/guard the GM tab for two seconds, then stop.
let attempts=0;
const mountTimer=window.setInterval(()=>{attempts++;applyVisibility();if(attempts>=20)window.clearInterval(mountTimer)},100);
setTimeout(()=>void refreshRole(),500);

export { refreshRole as refreshCampaignRoleVisibility, applyVisibility as applyCampaignRoleVisibility };
