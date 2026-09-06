import { cloudListCharacters, cloudSaveCharacter } from './cloud';

const PANEL_ID='cc-combat-damage';
type DamageType='Physical'|'Fire'|'Cold'|'Electric'|'Acid'|'Magic'|'Unspecified';
type Gear={equipped?:boolean;damageResist?:number;resistType?:string;name?:string};

function activeName(){
 const btn=document.querySelector('.character-bar button[aria-current="true"]')?.textContent?.trim();
 const strong=document.querySelector('.character-bar strong')?.textContent?.trim();
 return btn||strong||'';
}
async function activeCharacter(){const rows=await cloudListCharacters() as any[];const n=activeName();return rows.find(x=>x.name===n)||rows[0]}
function equippedResist(inv:any[],type:DamageType){
 let universal=0,typed=0;
 for(const raw of inv||[]){const g=raw as Gear;if(!g.equipped)continue;const v=Math.max(0,Number(g.damageResist)||0);if(!v)continue;if(!g.resistType||g.resistType==='All'||g.resistType==='Universal')universal+=v;else if(type!=='Unspecified'&&String(g.resistType).toLowerCase()===type.toLowerCase())typed+=v;}
 return {universal,typed,total:universal+typed};
}
function resolveHp(c:any){
 const max=Number(c.maxHp??c.maxHP??c.hpMax??c.healthMax??c.data?.maxHp??c.data?.maxHP??100)||100;
 const current=Number(c.hp??c.currentHp??c.currentHP??c.health??c.data?.hp??c.data?.currentHp??max);
 return {current:Math.max(0,current),max:Math.max(1,max)};
}
function writeHp(c:any,hp:number,max:number){
 if('hp' in c||(!('currentHp' in c)&&!('health' in c)))c.hp=hp;else if('currentHp' in c)c.currentHp=hp;else c.health=hp;
 if(!('maxHp' in c)&&!('maxHP' in c)&&!('hpMax' in c)&&!('healthMax' in c))c.maxHp=max;
}
async function applyDamage(raw:number,type:DamageType){
 const c=await activeCharacter();if(!c)throw new Error('No crawler available.');
 const hp=resolveHp(c);const resist=equippedResist(Array.isArray(c.inventory)?c.inventory:[],type);const incoming=Math.max(0,Math.floor(raw));const applied=Math.max(0,incoming-resist.total);const next=Math.max(0,hp.current-applied);writeHp(c,next,hp.max);c.combatLog=Array.isArray(c.combatLog)?c.combatLog:[];c.combatLog.push({at:new Date().toISOString(),kind:'damage',type,incoming,resisted:Math.min(incoming,resist.total),applied,hpBefore:hp.current,hpAfter:next});await cloudSaveCharacter(c);window.dispatchEvent(new CustomEvent('cc:character-updated',{detail:{characterId:c.id,hp:next,maxHp:hp.max}}));return {incoming,applied,resisted:Math.min(incoming,resist.total),hpBefore:hp.current,hpAfter:next,maxHp:hp.max,resist};
}
function inject(){
 if(document.getElementById(PANEL_ID))return;const host=document.getElementById('cc-equipment-stats')||document.querySelector('main');if(!host)return;const w=document.createElement('section');w.id=PANEL_ID;w.style.cssText='margin:16px 0;padding:14px;border:1px solid rgba(230,171,82,.25);border-radius:14px';w.innerHTML=`<h3>💥 Apply Damage</h3><p>Incoming damage automatically subtracts equipped Damage Resist before HP is reduced.</p><div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end"><label>Damage<input aria-label="Incoming damage" type="number" min="0" value="10" style="width:100%"></label><label>Type<select aria-label="Damage type" style="width:100%"><option>Physical</option><option>Fire</option><option>Cold</option><option>Electric</option><option>Acid</option><option>Magic</option><option>Unspecified</option></select></label><button data-apply-damage>Apply</button></div><p data-damage-result aria-live="polite"></p>`;host.appendChild(w);const amount=w.querySelector('[aria-label="Incoming damage"]') as HTMLInputElement;const type=w.querySelector('[aria-label="Damage type"]') as HTMLSelectElement;const result=w.querySelector('[data-damage-result]') as HTMLElement;(w.querySelector('[data-apply-damage]') as HTMLButtonElement).onclick=async()=>{try{const r=await applyDamage(Number(amount.value)||0,type.value as DamageType);result.textContent=`${r.incoming} incoming − ${r.resisted} resisted = ${r.applied} HP damage. HP ${r.hpBefore} → ${r.hpAfter}/${r.maxHp}.`}catch(e){result.textContent=e instanceof Error?e.message:String(e)}};
}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;inject()})}).observe(document.documentElement,{subtree:true,childList:true});setTimeout(inject,1600);
export { applyDamage, equippedResist };
