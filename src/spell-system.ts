const PANEL_ID='cc-spell-system';
const STYLE_ID='cc-spell-system-style';
const HEAL_MANA_COST=2;
const HEAL_BAR_SLOTS=2;

const animalTerms=['animal crawler','animal','dog','cat','labradoodle','wolf','bear','horse','bird','rabbit','rat','mouse','ferret','reptile','lizard','snake'];

function activeName(){
 const bar=document.querySelector('.character-bar');
 const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
 if(selected)return selected;
 const candidates=[...(bar?.querySelectorAll('button,b,strong')||[])].map(x=>x.textContent?.trim()||'').filter(x=>x&&!/character|switch|new|add|cloud|save|delete|side/i.test(x));
 return candidates[0]||document.querySelector('.app>main h2')?.textContent?.trim()||'Crawler';
}

function pageText(){return (document.querySelector('.app>main')?.textContent||'').toLowerCase()}
function isAnimalCrawler(){
 const text=pageText();
 if(/animal crawler/.test(text))return true;
 const race=text.match(/race\s*[:\-]?\s*([a-z][a-z -]{1,24})/i)?.[1]?.trim()||'';
 return animalTerms.some(t=>race===t||race.includes(t));
}
function numberNear(label:string){
 const text=document.querySelector('.app>main')?.textContent||'';
 const m=text.match(new RegExp(`${label}\\s*[:\\-/]?\\s*(\\d+)`,'i'));
 return m?Number(m[1]):0;
}
function enhancedInt(){
 const text=document.querySelector('.app>main')?.textContent||'';
 const direct=text.match(/(?:enhanced\s+intelligence|intelligence\s+enhanced)\s*[:\-/]?\s*(\d+)/i);
 return direct?Number(direct[1]):numberNear('Mana');
}
function storageKey(){return `cc-spell-state:${activeName()}`}
type SpellState={maxMana:number;currentMana:number;maxHealth:number;currentHealth:number};
function loadState():SpellState{
 const detectedMana=enhancedInt();const detectedHealth=numberNear('Health');
 try{const s=JSON.parse(localStorage.getItem(storageKey())||'{}');return {maxMana:Number(s.maxMana||detectedMana||0),currentMana:Number(s.currentMana??s.maxMana??detectedMana??0),maxHealth:Number(s.maxHealth||detectedHealth||0),currentHealth:Number(s.currentHealth??s.maxHealth??detectedHealth??0)}}catch{return {maxMana:detectedMana,currentMana:detectedMana,maxHealth:detectedHealth,currentHealth:detectedHealth}}
}
function saveState(s:SpellState){localStorage.setItem(storageKey(),JSON.stringify(s));window.dispatchEvent(new CustomEvent('cc-resource-change',{detail:{character:activeName(),...s}}))}
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function addStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#${PANEL_ID}{margin:16px 0;padding:16px;border:1px solid rgba(132,102,255,.4);border-radius:14px;background:rgba(20,17,31,.94)}
#${PANEL_ID} h3{margin:0 0 10px}.cc-resource-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;margin:9px 0}.cc-resource-bar{height:16px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.11)}.cc-resource-fill{height:100%;background:linear-gradient(90deg,#6547d8,#b17cff);transition:width .35s ease}.cc-resource-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}.cc-resource-controls input{width:74px}.cc-spell-card{padding:13px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1)}.cc-spell-card button{font-weight:800}.cc-spell-status{min-height:1.4em;margin-top:8px}.cc-animal-note{opacity:.82}
`;document.head.appendChild(s)}
function render(){
 addStyles();const main=document.querySelector('.app>main') as HTMLElement|null;if(!main)return;
 const old=document.getElementById(PANEL_ID);if(old)old.remove();
 const s=loadState(),animal=isAnimalCrawler();
 const panel=document.createElement('section');panel.id=PANEL_ID;panel.innerHTML=`<h3>✨ Spells & Mana</h3><div class="cc-resource-row"><strong>MP</strong><div class="cc-resource-bar"><div class="cc-resource-fill" data-mana-fill></div></div><span data-mana-label></span></div><div class="cc-resource-controls"><label>Max MP <input data-max-mana type="number" min="0" step="1" value="${s.maxMana}"></label><label>Current MP <input data-current-mana type="number" min="0" step="1" value="${s.currentMana}"></label><button data-restore-mana>Restore Mana</button></div>${animal?'<div class="cc-spell-card cc-animal-note">Animal crawler: no automatic starter Heal spell.</div>':'<div class="cc-spell-card"><strong>Heal · Rank 1 (max)</strong><div>Interrupt · Self only · 2 Mana</div><div>Restores 2 Health Bar slots (20% Health).</div><button data-cast-heal>✨ CAST HEAL</button><div class="cc-spell-status" data-spell-status aria-live="polite"></div></div>'}`;
 main.prepend(panel);
 const refresh=()=>{const st=loadState();const pct=st.maxMana?clamp(st.currentMana/st.maxMana*100,0,100):0;(panel.querySelector('[data-mana-fill]') as HTMLElement).style.width=`${pct}%`;(panel.querySelector('[data-mana-label]') as HTMLElement).textContent=`${st.currentMana} / ${st.maxMana} MP`;const cast=panel.querySelector<HTMLButtonElement>('[data-cast-heal]');if(cast){cast.disabled=st.currentMana<HEAL_MANA_COST;cast.title=cast.disabled?'Not enough Mana':''}};
 panel.querySelectorAll<HTMLInputElement>('input').forEach(i=>i.onchange=()=>{const st=loadState();if(i.hasAttribute('data-max-mana')){st.maxMana=Math.max(0,Number(i.value)||0);st.currentMana=clamp(st.currentMana,0,st.maxMana)}else st.currentMana=clamp(Number(i.value)||0,0,st.maxMana);saveState(st);render()});
 panel.querySelector<HTMLButtonElement>('[data-restore-mana]')!.onclick=()=>{const st=loadState();st.currentMana=st.maxMana;saveState(st);render()};
 const cast=panel.querySelector<HTMLButtonElement>('[data-cast-heal]');if(cast)cast.onclick=()=>{const st=loadState(),status=panel.querySelector('[data-spell-status]') as HTMLElement;if(st.currentMana<HEAL_MANA_COST){status.textContent='Not enough Mana to cast Heal.';refresh();return}st.currentMana-=HEAL_MANA_COST;if(st.maxHealth>0)st.currentHealth=clamp(st.currentHealth+Math.ceil(st.maxHealth*.2),0,st.maxHealth);saveState(st);status.textContent=`Heal cast. −${HEAL_MANA_COST} MP · restored ${HEAL_BAR_SLOTS} Health Bar slots.`;refresh()};
 refresh();
}
let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})};
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('storage',queue);setTimeout(render,500);

export { HEAL_MANA_COST, HEAL_BAR_SLOTS, isAnimalCrawler };
