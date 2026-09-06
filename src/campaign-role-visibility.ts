import { cloudListCampaigns } from './cloud';

const ACTIVE_KEY='cc-active-campaign-id';
const ROLE_ATTR='data-cc-campaign-role';
const GM_PANEL_IDS=['cc-runtime-gm-tools','cc-gm-rewards','cc-loot-boxes','cc-smart-loot','cc-custom-spells'];
let queued=false;

function activeCampaignId(){return localStorage.getItem(ACTIVE_KEY)||''}
function isGmRole(role:string){return /^(gm|owner)$/i.test(role)}
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}

function setRole(role:string){
 const root=document.documentElement;
 if(role)root.setAttribute(ROLE_ATTR,role);else root.removeAttribute(ROLE_ATTR);
 window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role}}));
}

function hideGmUi(hide:boolean){
 for(const id of GM_PANEL_IDS){const el=document.getElementById(id) as HTMLElement|null;if(!el)continue;el.hidden=hide;el.style.display=hide?'none':'';el.setAttribute('aria-hidden',String(hide));}
 const nav=primaryNav();
 nav?.querySelectorAll<HTMLButtonElement>('button').forEach(btn=>{
  const gm=/^GM Tools$/i.test(btn.textContent?.trim()||'');
  if(!gm)return;
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
 if(!id){setRole('');hideGmUi(false);return;}
 try{
  const campaigns=await cloudListCampaigns() as any[];
  const active=campaigns.find(c=>c.id===id);
  const role=String(active?.role||'');
  setRole(role||'player');
  hideGmUi(!isGmRole(role));
 }catch{
  setRole('player');
  hideGmUi(true);
 }
}

function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;void refreshRole()})}
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('cc:campaign-changed',queue);
window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)queue()});
setTimeout(()=>void refreshRole(),500);

export { refreshRole as refreshCampaignRoleVisibility };
