import { cloudListCharacters, cloudSaveCharacter } from './cloud';

const PANEL_ID='cc-magic-items';
const CUSTOM_ID='cc-cloud-spells';

type MagicEntry={name:string;type?:string;detail?:string;custom?:boolean;source?:string;receivedAt?:string;mana?:number;range?:string;effect?:string};

function activeName(){
 const bar=document.querySelector('.character-bar');
 const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
 if(selected)return selected;
 const current=bar?.querySelector('button[aria-current="true"],strong')?.textContent?.trim();
 return current||'';
}
async function activeCharacter(){
 const rows=await cloudListCharacters() as any[];
 const name=activeName();
 return rows.find(x=>x.name===name)||rows[0];
}
function cleanSpellName(item:MagicEntry){
 return String(item.name||'Unnamed Spell').replace(/^Scroll of\s+/i,'').replace(/^Spellbook of\s+/i,'').trim();
}
function customKey(name:string){return `cc-custom-known:${name}`}
function readCustom(name:string):MagicEntry[]{try{return JSON.parse(localStorage.getItem(customKey(name))||'[]')}catch{return []}}
function writeCustom(name:string,items:MagicEntry[]){localStorage.setItem(customKey(name),JSON.stringify(items));window.dispatchEvent(new CustomEvent('cc:spell-list-updated',{detail:{character:name}}))}
function normalizeSpell(raw:any):MagicEntry{
 if(typeof raw==='string')return {name:raw,type:'spell',source:'Cloud'};
 return {name:String(raw?.name||'Unnamed Spell'),type:'spell',detail:String(raw?.detail||raw?.effect||''),custom:Boolean(raw?.custom),source:String(raw?.source||'Cloud'),mana:Number(raw?.mana)||0,range:String(raw?.range||'Varies')};
}
async function syncCloudSpells(c:any){
 const existing=readCustom(c.name||activeName());const byName=new Map(existing.map(x=>[x.name.toLowerCase(),x]));
 for(const raw of Array.isArray(c.spells)?c.spells:[]){const s=normalizeSpell(raw);if(!byName.has(s.name.toLowerCase()))byName.set(s.name.toLowerCase(),s)}
 const merged=[...byName.values()];writeCustom(c.name||activeName(),merged);return merged;
}
async function consumeItem(c:any,item:MagicEntry,action:'cast'|'read'){
 const inv=Array.isArray(c.inventory)?[...c.inventory]:[];const idx=inv.findIndex((x:any)=>x===item||(x?.name===item.name&&x?.type===item.type));if(idx<0)throw new Error('Magic item is no longer in inventory.');
 const spellName=cleanSpellName(item);
 if(action==='read'){
  const spells=Array.isArray(c.spells)?[...c.spells]:[];
  if(!spells.some((x:any)=>String(x?.name||x).toLowerCase()===spellName.toLowerCase()))spells.push({name:spellName,type:'spell',detail:item.detail||'',custom:Boolean(item.custom),source:'Spellbook',learnedAt:new Date().toISOString()});
  c.spells=spells;
  const local=readCustom(c.name||activeName());if(!local.some(x=>x.name.toLowerCase()===spellName.toLowerCase()))local.push({name:spellName,type:'spell',detail:item.detail||'',custom:Boolean(item.custom),source:'Spellbook'});writeCustom(c.name||activeName(),local);
 }
 c.combatLog=Array.isArray(c.combatLog)?c.combatLog:[];c.combatLog.push({at:new Date().toISOString(),kind:action==='cast'?'scroll_cast':'spellbook_read',item:item.name,spell:spellName,noMana:action==='cast'});
 inv.splice(idx,1);c.inventory=inv;await cloudSaveCharacter(c);window.dispatchEvent(new CustomEvent('cc:character-updated',{detail:{characterId:c.id}}));return spellName;
}
function renderCloudSpells(c:any,spells:MagicEntry[]){
 const known=document.querySelector('#cc-spell-system [data-known]') as HTMLElement|null;if(!known)return;document.getElementById(CUSTOM_ID)?.remove();
 const wrap=document.createElement('div');wrap.id=CUSTOM_ID;wrap.style.cssText='display:contents';
 for(const s of spells){const card=document.createElement('div');card.className='cc-spell-card';card.innerHTML=`<strong>✨ ${escapeHtml(s.name)}</strong><div>${s.custom?'CUSTOM · ':''}${s.source||'Learned'}</div><div>${escapeHtml(s.detail||s.effect||'Learned spell.')}</div>${s.mana?`<div>${s.mana} Mana${s.range?` · ${escapeHtml(s.range)}`:''}</div>`:''}`;wrap.appendChild(card)}
 known.appendChild(wrap);
}
function escapeHtml(v:string){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
async function render(){
 const spellPanel=document.getElementById('cc-spell-system');if(!spellPanel)return;let panel=document.getElementById(PANEL_ID);if(!panel){panel=document.createElement('section');panel.id=PANEL_ID;panel.style.cssText='margin-top:16px;padding-top:14px;border-top:1px solid rgba(132,102,255,.3)';spellPanel.appendChild(panel)}
 try{
  const c=await activeCharacter();if(!c){panel.innerHTML='<h3>📜 Magic Items</h3><p>No crawler available.</p>';return}
  const spells=await syncCloudSpells(c);renderCloudSpells(c,spells);
  const items=(Array.isArray(c.inventory)?c.inventory:[]).filter((x:any)=>x?.type==='scroll'||x?.type==='spellbook') as MagicEntry[];
  panel.innerHTML=`<h3>📜 Scrolls & Spellbooks</h3><p>Scrolls cast once without Mana and are consumed. Spellbooks teach their spell, then disappear.</p><div data-magic-list style="display:grid;gap:8px"></div><p data-magic-status aria-live="polite"></p>`;
  const list=panel.querySelector('[data-magic-list]') as HTMLElement;const status=panel.querySelector('[data-magic-status]') as HTMLElement;
  if(!items.length){list.textContent='No scrolls or spellbooks in inventory.';return}
  for(const item of items){const row=document.createElement('div');row.className='cc-spell-card';const isBook=item.type==='spellbook';row.innerHTML=`<strong>${isBook?'📕':'📜'} ${escapeHtml(item.name)}</strong><div>${escapeHtml(item.detail||'')}</div><button data-use>${isBook?'Read & Learn':'Cast & Consume'}</button>`;(row.querySelector('[data-use]') as HTMLButtonElement).onclick=async()=>{try{const spell=await consumeItem(c,item,isBook?'read':'cast');status.textContent=isBook?`✓ Learned ${spell}. Spellbook consumed.`:`✓ Cast ${spell} without Mana. Scroll consumed.`;setTimeout(()=>void render(),250)}catch(e){status.textContent=e instanceof Error?e.message:String(e)}};list.appendChild(row)}
 }catch(e){panel.innerHTML=`<h3>📜 Magic Items</h3><p>${e instanceof Error?e.message:String(e)}</p>`}
}
window.addEventListener('cc:character-updated',()=>void render());window.addEventListener('cc:spell-list-updated',()=>void render());window.addEventListener('cc:campaign-changed',()=>void render());let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;void render()},350)}).observe(document.documentElement,{subtree:true,childList:true});setTimeout(()=>void render(),1200);

export { consumeItem, cleanSpellName };
