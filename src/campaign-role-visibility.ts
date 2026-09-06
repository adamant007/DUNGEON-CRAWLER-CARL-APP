import { cloudListCampaigns, cloudUser } from './cloud';

const ACTIVE_KEY='cc-active-campaign-id';
const ROLE_ATTR='data-cc-campaign-role';
const STYLE_ID='cc-campaign-role-visibility-style';
let refreshQueued=false;

function activeCampaignId(){return localStorage.getItem(ACTIVE_KEY)||''}
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function currentRole(){return document.documentElement.getAttribute(ROLE_ATTR)||''}
function clean(v:string){return v.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');style.id=STYLE_ID;
 style.textContent=`html[${ROLE_ATTR}="player"] #cc-runtime-gm-tools,html[${ROLE_ATTR}="player"] #cc-gm-rewards,html[${ROLE_ATTR}="player"] #cc-loot-boxes,html[${ROLE_ATTR}="player"] #cc-smart-loot{display:none!important}[aria-label="Primary navigation"] [data-cc-role-guard="gm"]{visibility:visible}`;
 document.head.appendChild(style);
}
function setRole(role:string){const normalized=role.trim().toLowerCase();const previous=currentRole();if(normalized)document.documentElement.setAttribute(ROLE_ATTR,normalized);else document.documentElement.removeAttribute(ROLE_ATTR);if(previous!==normalized)window.dispatchEvent(new CustomEvent('cc:campaign-role-changed',{detail:{role:normalized}}))}

function openGm(){
 const nav=primaryNav();if(!nav)return;
 nav.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
 const gm=ensureGmButton(nav);gm.classList.add('active');gm.setAttribute('aria-current','page');
 document.body.dataset.ccPrimaryTab='gm-tools';
 window.dispatchEvent(new CustomEvent('cc:primary-tab-changed',{detail:{tab:'GM Tools'}}));
 ['cc-runtime-gm-tools','cc-gm-rewards','cc-loot-boxes','cc-smart-loot','cc-custom-spells'].forEach(id=>{const el=document.getElementById(id) as HTMLElement|null;if(el){el.hidden=false;el.style.display=''}});
}
function ensureGmButton(nav:HTMLElement){
 let gm=[...nav.querySelectorAll<HTMLButtonElement>('button')].find(b=>/^GM Tools$/i.test(clean(b.textContent||'')));
 if(!gm){gm=document.createElement('button');gm.type='button';gm.textContent='GM Tools';const template=nav.querySelector<HTMLButtonElement>('button');if(template)gm.className=template.className.replace(/\bactive\b/g,'').trim();const library=[...nav.querySelectorAll<HTMLButtonElement>('button')].find(b=>/^Library$/i.test(clean(b.textContent||'')));nav.insertBefore(gm,library||null)}
 gm.setAttribute('aria-label','GM Tools');gm.dataset.ccRoleGuard='gm';gm.onclick=openGm;return gm;
}
function applyVisibility(){
 ensureStyle();const nav=primaryNav();if(!nav)return;const gm=ensureGmButton(nav);const hide=currentRole()==='player';gm.hidden=hide;gm.style.setProperty('display',hide?'none':'inline-flex','important');gm.setAttribute('aria-hidden',String(hide));
 if(hide&&(gm.classList.contains('active')||gm.getAttribute('aria-current')==='page')){[...nav.querySelectorAll<HTMLButtonElement>('button')].find(b=>!b.hidden&&/^(Dashboard|Character)$/i.test(clean(b.textContent||'')))?.click()}
}
async function refreshRole(){
 const id=activeCampaignId();if(!id){setRole('');applyVisibility();return}
 try{const [campaigns,user]=await Promise.all([cloudListCampaigns() as Promise<any[]>,cloudUser()]);const active=campaigns.find(c=>c.id===id);setRole(active?(user?.id&&active.owner_id===user.id?'gm':String(active.role||'player')):'')}catch{setRole('')}
 applyVisibility();
}
function queueRefresh(){if(refreshQueued)return;refreshQueued=true;requestAnimationFrame(()=>{refreshQueued=false;void refreshRole()})}

ensureStyle();
window.addEventListener('cc:campaign-changed',queueRefresh);window.addEventListener('cc:campaign-role-changed',applyVisibility);window.addEventListener('cc:character-updated',applyVisibility);window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)queueRefresh()});
document.addEventListener('click',e=>{const b=(e.target as Element|null)?.closest('button');if(b&&/GM Tools/i.test(b.textContent||'')&&!b.closest('[aria-label="Primary navigation"]')&&currentRole()!=='player'){e.preventDefault();openGm()}},true);
let attempts=0;const timer=window.setInterval(()=>{attempts++;applyVisibility();if(attempts>=100)window.clearInterval(timer)},100);setTimeout(()=>void refreshRole(),400);
export { refreshRole as refreshCampaignRoleVisibility, applyVisibility as applyCampaignRoleVisibility };
