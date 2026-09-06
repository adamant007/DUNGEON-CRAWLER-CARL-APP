const STYLE='cc-final-ui-stability-fix-style';
const HP_KEY='cc2-hp:';

function clean(s:string){return s.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}
function primaryNav(){return document.querySelector('[aria-label="Primary navigation"]') as HTMLElement|null}
function activeName(){return document.querySelector('#cc-character-dashboard-v2 .cc2-name')?.textContent?.trim()||document.querySelector('.character-bar select option:checked')?.textContent?.trim()||'Crawler'}
function key(p:string){return p+encodeURIComponent(activeName())}
function spellState(){try{return JSON.parse(localStorage.getItem(`cc-spell-state:${activeName()}`)||'{}')}catch{return {}}}
function healthValue(){const n=Number(localStorage.getItem(key(HP_KEY)));return Number.isFinite(n)?Math.max(0,Math.min(10,n)):7}
function saveHealth(n:number){const v=Math.max(0,Math.min(10,Math.round(n)));localStorage.setItem(key(HP_KEY),String(v));window.dispatchEvent(new CustomEvent('cc-resource-change',{detail:{kind:'health',current:v,max:10,character:activeName()}}))}
function ensureTen(row:HTMLElement,cls:string){const track=row.querySelector('.cc2-track') as HTMLElement|null;if(!track)return;let segs=[...track.querySelectorAll<HTMLElement>('.cc2-seg')];if(segs.length!==10){track.innerHTML=Array.from({length:10},()=>`<i class="cc2-seg ${cls}"></i>`).join('')}}
function paintHealth(){const root=document.getElementById('cc-character-dashboard-v2');if(!root)return;const row=root.querySelectorAll<HTMLElement>('.cc2-resrow')[0];if(!row)return;ensureTen(row,'hp');const value=healthValue();row.querySelectorAll<HTMLElement>('.cc2-seg').forEach((el,i)=>{el.classList.toggle('on',i<value);el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',`Set health to ${i+1} of 10`);const set=()=>saveHealth(i+1);el.onclick=set;el.onkeydown=(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();set()}}});const label=row.querySelector('.cc2-resval') as HTMLElement|null;if(label)label.textContent=`${value} / 10`}
function paintMana(){const root=document.getElementById('cc-character-dashboard-v2');if(!root)return;const row=root.querySelectorAll<HTMLElement>('.cc2-resrow')[1];if(!row)return;ensureTen(row,'mp');const st=spellState();const max=Math.max(1,Number(st.maxMana||10)||10);const cur=Math.max(0,Math.min(max,Number(st.currentMana??max)));const slots=Math.max(0,Math.min(10,Math.ceil(cur/max*10)));row.querySelectorAll<HTMLElement>('.cc2-seg').forEach((el,i)=>el.classList.toggle('on',i<slots));const label=row.querySelector('.cc2-resval') as HTMLElement|null;if(label)label.textContent=`${cur} / ${max}`}
function installStyle(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
[aria-label="Primary navigation"]{visibility:visible!important;opacity:1!important;position:relative!important;z-index:9999!important}
#cc-mobile-resource-hud{display:none!important}
#cc-character-dashboard-v2 .cc2-track{display:grid!important;grid-template-columns:repeat(10,minmax(20px,1fr))!important;gap:6px!important}
#cc-character-dashboard-v2 .cc2-seg{cursor:pointer!important;min-height:28px!important}
`;document.head.appendChild(s)}
function forceHudScope(){const hud=document.getElementById('cc-mobile-resource-hud') as HTMLElement|null;if(!hud)return;const active=clean((primaryNav()?.querySelector('button.active,[aria-current="page"]') as HTMLElement|null)?.textContent||'').toLowerCase();hud.dataset.visible=String(active==='character')}
function apply(){installStyle();paintHealth();paintMana();forceHudScope()}

document.addEventListener('click',e=>{if((e.target as Element)?.closest('[aria-label="Primary navigation"],.character-bar'))setTimeout(apply,80)},true);
window.addEventListener('cc-resource-change',()=>setTimeout(apply,20));
window.addEventListener('cc:character-updated',()=>setTimeout(apply,60));
window.addEventListener('cc:campaign-changed',()=>setTimeout(apply,60));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,700),{once:true});else setTimeout(apply,700);
export { apply as applyFinalUiStabilityFix };
