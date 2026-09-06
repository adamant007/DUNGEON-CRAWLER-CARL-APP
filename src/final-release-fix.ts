import { mountCharacterSheetSpells } from './character-sheet-spells';

const STYLE='cc-final-release-fix-style';
const ROLE_ATTR='data-cc-campaign-role';
const GM_PANEL_IDS=['cc-custom-spells','cc-runtime-gm-tools','cc-gm-rewards','cc-loot-boxes','cc-smart-loot'];

function clean(s:string){return s.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}
function slug(tab:string){return clean(tab).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function nav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function role(){return (document.documentElement.getAttribute(ROLE_ATTR)||'').trim().toLowerCase()}
function activeTab(){const n=nav();const b=n?.querySelector('button.active,[aria-current="page"]') as HTMLElement|null;return clean(b?.textContent||'')}
function gmButton(){return [...(nav()?.querySelectorAll<HTMLButtonElement>('button')||[])].find(b=>clean(b.textContent||'').toLowerCase()==='gm tools')||null}

function installStyle(){
 if(document.getElementById(STYLE))return;
 const s=document.createElement('style');s.id=STYLE;s.textContent=`
 html:not([${ROLE_ATTR}="player"]) [aria-label="Primary navigation"] button[data-cc-final-gm="1"]{display:inline-flex!important;visibility:visible!important;opacity:1!important}
 body:not([data-cc-primary-tab="gm-tools"]) #cc-custom-spells,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-runtime-gm-tools,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-gm-rewards,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-loot-boxes,
 body:not([data-cc-primary-tab="gm-tools"]) #cc-smart-loot{display:none!important}
 #cc-character-dashboard-v2 .cc2-banner{min-height:180px!important;overflow:hidden!important;position:relative!important}
 #cc-character-dashboard-v2 .cc2-banner::after{display:none!important}
 #cc-character-dashboard-v2 .cc2-banner .cc-final-banner-image{position:absolute;right:0;top:0;width:48%;height:100%;object-fit:cover;object-position:center 34%;display:block;z-index:1;filter:saturate(1.08) contrast(1.04);}
 #cc-character-dashboard-v2 .cc2-banner::before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(13,8,6,.98) 0%,rgba(13,8,6,.9) 42%,rgba(13,8,6,.28) 67%,rgba(13,8,6,.04) 100%)}
 #cc-character-dashboard-v2 .cc2-banner .cc2-brand{position:relative!important;z-index:3!important}
 #cc-character-sheet-spells{display:block!important;visibility:visible!important;opacity:1!important}
 @media(max-width:760px){#cc-character-dashboard-v2 .cc2-banner{min-height:150px!important}#cc-character-dashboard-v2 .cc2-banner .cc-final-banner-image{width:58%;object-position:center 30%}#cc-character-dashboard-v2 .cc2-banner::before{background:linear-gradient(90deg,rgba(13,8,6,.98) 0%,rgba(13,8,6,.82) 50%,rgba(13,8,6,.12) 100%)}}
 `;document.head.appendChild(s);
}

function ensureGmButton(){
 const n=nav();if(!n)return null;
 let b=gmButton();
 if(!b){
  b=document.createElement('button');b.type='button';b.textContent='GM Tools';b.dataset.ccFinalGm='1';
  const before=[...n.querySelectorAll<HTMLButtonElement>('button')].find(x=>/^(Library|Campaign)$/i.test(clean(x.textContent||'')));
  if(before)n.insertBefore(b,before);else n.appendChild(b);
 }
 b.dataset.ccFinalGm='1';
 const hide=role()==='player';b.hidden=hide;b.style.display=hide?'none':'';b.setAttribute('aria-hidden',String(hide));
 return b;
}

function hideGmPanels(){
 GM_PANEL_IDS.forEach(id=>{const el=document.getElementById(id) as HTMLElement|null;if(el){el.hidden=true;el.style.display='none'}});
}

function showGmPanels(){
 document.body.dataset.ccPrimaryTab='gm-tools';
 GM_PANEL_IDS.forEach(id=>{const el=document.getElementById(id) as HTMLElement|null;if(el){el.hidden=false;el.style.display=''}});
 ['cc-combat-damage','cc-magic-items','cc-equipment-stats','cc-campaign-context'].forEach(id=>{const el=document.getElementById(id) as HTMLElement|null;if(el){el.hidden=true;el.style.display='none'}});
}

function routeAwayFromGm(tab:string){
 const route=slug(tab);
 if(!route||route==='gm-tools')return;
 document.body.dataset.ccPrimaryTab=route;
 hideGmPanels();
}

function embeddedApprovedBanner(){
 const style=document.getElementById('cc-final-beta-stabilizer-style');
 const m=(style?.textContent||'').match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/);
 return m?.[0]||'';
}

function ensureBannerImage(){
 const banner=document.querySelector('#cc-character-dashboard-v2 .cc2-banner') as HTMLElement|null;if(!banner)return;
 let img=banner.querySelector('.cc-final-banner-image') as HTMLImageElement|null;
 if(!img){img=document.createElement('img');img.className='cc-final-banner-image';img.alt='Ginger Dragon Studios dragon with long flowing mane';img.setAttribute('aria-label','Ginger Dragon Studios dragon banner');banner.appendChild(img)}
 const approved=embeddedApprovedBanner();
 if(approved&&img.src!==approved)img.src=approved;
}

function ensureCharacterSpells(){
 if(!/^Character$/i.test(activeTab()))return;
 mountCharacterSheetSpells();
 const box=document.getElementById('cc-character-sheet-spells') as HTMLElement|null;if(box){box.hidden=false;box.style.display='block'}
}

function apply(){installStyle();ensureGmButton();ensureBannerImage();ensureCharacterSpells();const tab=activeTab();if(tab&&!/^GM Tools$/i.test(tab))routeAwayFromGm(tab)}

document.addEventListener('click',e=>{
 const b=(e.target as Element|null)?.closest('[aria-label="Primary navigation"] button') as HTMLButtonElement|null;
 if(!b)return;
 const tab=clean(b.textContent||'');
 if(/^GM Tools$/i.test(tab)&&role()!=='player'){
  setTimeout(showGmPanels,0);setTimeout(showGmPanels,80);
 }else{
  routeAwayFromGm(tab);
  setTimeout(()=>routeAwayFromGm(tab),0);
  setTimeout(()=>routeAwayFromGm(tab),80);
 }
 if(/^Character$/i.test(tab)){setTimeout(()=>{ensureBannerImage();ensureCharacterSpells()},80);setTimeout(()=>{ensureBannerImage();ensureCharacterSpells()},300)}
},false);
window.addEventListener('cc:primary-tab-changed',(e:any)=>{const tab=clean(String(e?.detail?.tab||''));if(tab&&!/^GM Tools$/i.test(tab))routeAwayFromGm(tab)});
window.addEventListener('cc:campaign-role-changed',()=>setTimeout(apply,0));
window.addEventListener('cc:character-updated',()=>setTimeout(apply,30));
window.addEventListener('cc-resource-change',()=>setTimeout(ensureCharacterSpells,20));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,750),{once:true});else setTimeout(apply,750);
let tries=0;const timer=window.setInterval(()=>{tries++;apply();if((nav()&&document.getElementById('cc-character-dashboard-v2')&&embeddedApprovedBanner())||tries>=35)window.clearInterval(timer)},120);

export { apply as applyFinalReleaseFix };
