import { cloudListCampaigns } from './cloud';

const ACTIVE_KEY='cc-active-campaign-id';
const ROLE_ATTR='data-cc-campaign-role';
const STYLE_ID='cc-campaign-role-visibility-style';
let applyQueued=false;
let refreshQueued=false;

function activeCampaignId(){return localStorage.getItem(ACTIVE_KEY)||''}
function isGmRole(role:string){return /^(gm|owner)$/i.test(role)}
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');
 style.id=STYLE_ID;
 style.textContent=`html[${ROLE_ATTR}="player"] #cc-runtime-gm-tools{display:none!important}`;
 document.head.appendChild(style);
}

function currentRole(){return document.documentElement.getAttribute(ROLE_ATTR)||''}

function setRole(role:string){
 const root=document.documentElement;
 const normalized=role.trim().toLowerCase();
 if(normalized)root.setAttribute(ROLE_ATTR,normalized);else root.removeAttribute(ROLE_ATTR);
 window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:normalized}}));
}

function applyVisibility(){
 ensureStyle();
 const role=currentRole();
 const hide=role==='player';
 const nav=primaryNav();
 nav?.querySelectorAll<HTMLButtonElement>('button').forEach(btn=>{
  if(!/^GM Tools$/i.test(btn.textContent?.trim()||''))return;
  btn.dataset.ccRoleGuard='gm';
  btn.hidden=hide;
  btn.style.display=hide?'none':'';
  btn.setAttribute('aria-hidden',String(hide));
 });
 if(hide){
  const active=nav?.querySelector('button.active,[aria-current="page"]') as HTMLButtonElement|null;
  if(active&&/^GM Tools$/i.test(active.textContent?.trim()||'')){
   const fallback=[...(nav?.querySelectorAll('button')||[])].find(b=>!b.hidden&&/^(Dashboard|Character)$/i.test(b.textContent?.trim()||'')) as HTMLButtonElement|undefined;
   fallback?.click();
  }
 }
}

async function refreshRole(){
 const id=activeCampaignId();
 if(!id){setRole('');applyVisibility();return;}
 try{
  const campaigns=await cloudListCampaigns() as any[];
  const active=campaigns.find(c=>c.id===id);
  const role=String(active?.role||'player');
  setRole(role);
  applyVisibility();
 }catch{
  setRole('player');
  applyVisibility();
 }
}

function queueApply(){
 if(applyQueued)return;
 applyQueued=true;
 requestAnimationFrame(()=>{applyQueued=false;applyVisibility()});
}
function queueRefresh(){
 if(refreshQueued)return;
 refreshQueued=true;
 requestAnimationFrame(()=>{refreshQueued=false;void refreshRole()});
}

ensureStyle();
new MutationObserver(queueApply).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('cc:campaign-changed',queueRefresh);
window.addEventListener('cc:campaign-role-changed',queueApply);
window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)queueRefresh()});
setTimeout(()=>void refreshRole(),500);

export { refreshRole as refreshCampaignRoleVisibility, applyVisibility as applyCampaignRoleVisibility };
