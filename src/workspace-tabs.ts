const BAR_ID='cc-workspace-tabs';
const DICE_ID='cc-workspace-dice';
const STYLE_ID='cc-workspace-tabs-style';
type Tab='Sheet'|'Spells'|'Inventory'|'Combat'|'Dice'|'Campaign'|'GM';
const groups:Record<Tab,string[]>={
 Sheet:[],
 Spells:['cc-spell-system'],
 Inventory:['cc-equipment-stats','cc-magic-items'],
 Combat:['cc-combat-damage'],
 Dice:[DICE_ID],
 Campaign:['cc-campaign-context'],
 GM:['cc-runtime-gm-tools','cc-gm-rewards','cc-loot-boxes']
};
let active:Tab='Sheet';
function addStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${BAR_ID}{display:flex;gap:8px;overflow-x:auto;padding:10px 12px;position:sticky;top:0;z-index:60;background:rgba(12,13,17,.97);border-bottom:1px solid rgba(230,171,82,.28);-webkit-overflow-scrolling:touch}
 #${BAR_ID} button{flex:0 0 auto;min-width:max-content;padding:10px 13px;border-radius:10px;border:1px solid rgba(230,171,82,.35);background:#19151a;color:#f6e6c8;font-weight:800}
 #${BAR_ID} button[aria-selected="true"]{border-color:#f1bd66;background:#512116;color:#fff2d6}
 #${DICE_ID}{padding:16px;border:1px solid rgba(230,171,82,.3);border-radius:14px;background:rgba(18,16,19,.94)}
 .cc-dice-controls{display:grid;grid-template-columns:repeat(3,minmax(90px,1fr));gap:10px;max-width:520px}.cc-dice-controls input,.cc-dice-controls select{width:100%}.cc-dice-result{font-size:22px;font-weight:900;margin-top:14px}.cc-dice-breakdown{opacity:.82;margin-top:6px}
 @media(max-width:720px){#${BAR_ID}{top:0}.cc-dice-controls{grid-template-columns:1fr 1fr}.cc-dice-controls button{grid-column:1/-1}}
 `;document.head.appendChild(s)}
function isInjected(el:Element){const id=(el as HTMLElement).id;return Object.values(groups).flat().includes(id)}
function hasGM(){return !!document.getElementById('cc-runtime-gm-tools')}
function ensureDice(main:HTMLElement){let p=document.getElementById(DICE_ID) as HTMLElement|null;if(p)return p;p=document.createElement('section');p.id=DICE_ID;p.innerHTML=`<h2>🎲 Dice Roller</h2><p>Roll one or many polyhedral dice.</p><div class="cc-dice-controls"><label>Count<input data-dice-count type="number" min="1" max="100" value="1"></label><label>Die<select data-dice-sides><option>4</option><option>6</option><option>8</option><option>10</option><option>12</option><option selected>20</option><option>100</option></select></label><button data-roll>ROLL</button></div><div class="cc-dice-result" data-total>—</div><div class="cc-dice-breakdown" data-breakdown></div>`;main.appendChild(p);const count=p.querySelector('[data-dice-count]') as HTMLInputElement;const sides=p.querySelector('[data-dice-sides]') as HTMLSelectElement;const total=p.querySelector('[data-total]') as HTMLElement;const breakdown=p.querySelector('[data-breakdown]') as HTMLElement;(p.querySelector('[data-roll]') as HTMLButtonElement).onclick=()=>{const n=Math.max(1,Math.min(100,Number(count.value)||1));const d=Number(sides.value)||20;const rolls=Array.from({length:n},()=>Math.floor(Math.random()*d)+1);const sum=rolls.reduce((a,b)=>a+b,0);total.textContent=`${n}d${d} = ${sum}`;breakdown.textContent=rolls.join(' + ');window.dispatchEvent(new CustomEvent('cc:dice-rolled',{detail:{count:n,sides:d,rolls,total:sum}}))};return p}
function markCore(main:HTMLElement){for(const child of [...main.children] as HTMLElement[]){if(!isInjected(child)&&child.id!==DICE_ID&&!child.hasAttribute('data-cc-workspace-ui'))child.dataset.ccCoreContent='true'}}
function apply(){const main=document.querySelector('.app>main') as HTMLElement|null;if(!main)return;markCore(main);const wanted=new Set(groups[active]);for(const child of [...main.children] as HTMLElement[]){if(child.dataset.ccCoreContent==='true'){child.style.display=active==='Sheet'?'':'none';continue}if(isInjected(child)||child.id===DICE_ID)child.style.display=wanted.has(child.id)?'':'none'}const bar=document.getElementById(BAR_ID);bar?.querySelectorAll<HTMLButtonElement>('button[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===active)))}
function select(tab:Tab){active=tab;ensure();apply();window.scrollTo({top:0,behavior:'smooth'})}
function ensure(){addStyles();const app=document.querySelector('.app') as HTMLElement|null;const main=document.querySelector('.app>main') as HTMLElement|null;if(!app||!main)return;ensureDice(main);let bar=document.getElementById(BAR_ID) as HTMLElement|null;if(!bar){bar=document.createElement('div');bar.id=BAR_ID;bar.dataset.ccWorkspaceUi='true';bar.setAttribute('role','tablist');const hud=document.getElementById('cc-mobile-resource-hud');(hud||document.querySelector('.character-bar'))?.insertAdjacentElement('afterend',bar)}const tabs:Tab[]=['Sheet','Spells','Inventory','Combat','Dice','Campaign'];if(hasGM())tabs.push('GM');const current=[...bar.querySelectorAll('button[data-tab]')].map(x=>(x as HTMLButtonElement).dataset.tab);if(current.join('|')!==tabs.join('|')){bar.innerHTML='';for(const t of tabs){const b=document.createElement('button');b.type='button';b.dataset.tab=t;b.textContent=t==='Sheet'?'🧑 Sheet':t==='Spells'?'✨ Spells':t==='Inventory'?'🎒 Inventory':t==='Combat'?'⚔️ Combat':t==='Dice'?'🎲 Dice':t==='Campaign'?'🏰 Campaign':'📣 GM';b.onclick=()=>select(t);bar.appendChild(b)}if(active==='GM'&&!tabs.includes('GM'))active='Sheet'}apply()}
let timer:number|undefined;function queue(){clearTimeout(timer);timer=window.setTimeout(ensure,80)}
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('cc:campaign-changed',queue);setTimeout(ensure,500);
export { select as selectWorkspaceTab };
