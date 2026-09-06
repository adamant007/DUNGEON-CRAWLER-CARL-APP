import { cloudListCharacters } from './cloud';

const HUD_ID='cc-mobile-resource-hud';
const STYLE_ID='cc-mobile-resource-hud-style';

function activeName(){
 const bar=document.querySelector('.character-bar');
 const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
 if(selected)return selected;
 const current=bar?.querySelector('button[aria-current="true"],strong,b')?.textContent?.trim();
 return current||'';
}
function pageNumber(label:string){
 const text=document.querySelector('.app>main')?.textContent||'';
 const m=text.match(new RegExp(`${label}\\s*[:\\-/]?\\s*(\\d+)`,'i'));
 return m?Number(m[1]):0;
}
function spellState(name:string){try{return JSON.parse(localStorage.getItem(`cc-spell-state:${name}`)||'{}')}catch{return {}}}
function hpFrom(c:any){
 const max=Number(c?.maxHp??c?.maxHP??c?.hpMax??c?.healthMax??c?.data?.maxHp??c?.data?.maxHP??pageNumber('Health')??100)||100;
 const current=Number(c?.hp??c?.currentHp??c?.currentHP??c?.health??c?.data?.hp??c?.data?.currentHp??max);
 return {current:Math.max(0,current),max:Math.max(1,max)};
}
function manaFrom(name:string,c:any){
 const s=spellState(name);
 const max=Number(s.maxMana??c?.maxMana??c?.manaMax??c?.data?.maxMana??c?.data?.mana??pageNumber('Mana')??0)||0;
 const current=Number(s.currentMana??c?.mana??c?.currentMana??c?.data?.currentMana??max);
 return {current:Math.max(0,current),max:Math.max(0,max)};
}
function stateFor(pct:number){if(pct<=0)return'empty';if(pct<40)return'critical';if(pct<70)return'low';return'good'}
function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${HUD_ID}{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;width:100%;box-sizing:border-box;padding:12px 16px;border:1px solid rgba(218,165,70,.2);border-radius:14px;background:linear-gradient(180deg,rgba(13,18,26,.98),rgba(8,12,18,.98));position:relative;z-index:11;box-shadow:0 8px 28px rgba(0,0,0,.25)}
 #${HUD_ID} .cc-hud-resource{min-width:0;width:100%}
 #${HUD_ID} .cc-hud-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:14px;font-weight:900;letter-spacing:.045em}
 #${HUD_ID} .cc-hud-track{height:22px;width:100%;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:5px;background:transparent}
 #${HUD_ID} .cc-hud-seg{border-radius:5px;background:#1b2430;border:1px solid #3b4654;box-shadow:inset 0 1px 3px rgba(0,0,0,.7);transition:background .2s ease,box-shadow .2s ease,border-color .2s ease}
 #${HUD_ID} .cc-hud-hp[data-state='good'] .cc-hud-seg.on{background:linear-gradient(180deg,#22ef79,#0cb954);border-color:#30ff89;box-shadow:0 0 9px rgba(26,230,112,.45)}
 #${HUD_ID} .cc-hud-hp[data-state='low'] .cc-hud-seg.on{background:linear-gradient(180deg,#ffd84a,#d99000);border-color:#ffd55d;box-shadow:0 0 9px rgba(255,190,32,.4)}
 #${HUD_ID} .cc-hud-hp[data-state='critical'] .cc-hud-seg.on{background:linear-gradient(180deg,#ff5a58,#b81920);border-color:#ff6464;box-shadow:0 0 10px rgba(255,61,61,.45)}
 #${HUD_ID} .cc-hud-mp[data-state='good'] .cc-hud-seg.on{background:linear-gradient(180deg,#25d5ff,#087dd8);border-color:#3adfff;box-shadow:0 0 9px rgba(31,177,255,.45)}
 #${HUD_ID} .cc-hud-mp[data-state='low'] .cc-hud-seg.on{background:linear-gradient(180deg,#7e70ff,#3542c8);border-color:#8f84ff;box-shadow:0 0 9px rgba(101,91,255,.4)}
 #${HUD_ID} .cc-hud-mp[data-state='critical'] .cc-hud-seg.on{background:linear-gradient(180deg,#c048ff,#6c17a8);border-color:#d36cff;box-shadow:0 0 10px rgba(180,61,255,.42)}
 #${HUD_ID} [data-state='empty'] .cc-hud-seg{background:#161d26;border-color:#303947;box-shadow:none}
 @media(max-width:430px){#${HUD_ID}{gap:10px;padding:10px 12px}#${HUD_ID} .cc-hud-track{height:18px;gap:3px}#${HUD_ID} .cc-hud-top{font-size:12px}}
 `;document.head.appendChild(s);
}
function segments(){return Array.from({length:10},()=>'<span class="cc-hud-seg"></span>').join('')}
function ensureHud(){
 addStyles();let hud=document.getElementById(HUD_ID);if(hud)return hud;
 const bar=document.querySelector('.app>.character-bar,.character-bar');if(!bar)return null;
 hud=document.createElement('div');hud.id=HUD_ID;hud.setAttribute('aria-label','Crawler health and mana');
 hud.innerHTML=`<div class="cc-hud-resource cc-hud-hp" data-state="good"><div class="cc-hud-top"><span>❤️ HEALTH</span><span data-hp-label>—</span></div><div class="cc-hud-track" data-hp-track>${segments()}</div></div><div class="cc-hud-resource cc-hud-mp" data-state="good"><div class="cc-hud-top"><span>✨ MANA</span><span data-mp-label>—</span></div><div class="cc-hud-track" data-mp-track>${segments()}</div></div>`;
 bar.insertAdjacentElement('afterend',hud);return hud;
}
function paint(track:Element|null,pct:number){const on=Math.max(0,Math.min(10,Math.ceil(pct/10)));track?.querySelectorAll('.cc-hud-seg').forEach((el,i)=>el.classList.toggle('on',i<on))}
async function render(){
 const hud=ensureHud();if(!hud)return;
 const name=activeName();let c:any=null;
 try{const chars=await cloudListCharacters() as any[];c=chars.find(x=>x.name===name)||chars[0]||null}catch{}
 const hp=hpFrom(c),mp=manaFrom(name||c?.name||'Crawler',c);
 const hpPct=Math.max(0,Math.min(100,hp.current/hp.max*100));const mpPct=mp.max?Math.max(0,Math.min(100,mp.current/mp.max*100)):0;
 paint(hud.querySelector('[data-hp-track]'),hpPct);paint(hud.querySelector('[data-mp-track]'),mpPct);
 (hud.querySelector('.cc-hud-hp') as HTMLElement).dataset.state=stateFor(hpPct);
 (hud.querySelector('.cc-hud-mp') as HTMLElement).dataset.state=stateFor(mpPct);
 (hud.querySelector('[data-hp-label]') as HTMLElement).textContent=`${hp.current} / ${hp.max}`;
 (hud.querySelector('[data-mp-label]') as HTMLElement).textContent=mp.max?`${mp.current} / ${mp.max}`:'0 / 0';
}
let timer:number|undefined;function queue(){window.clearTimeout(timer);timer=window.setTimeout(()=>void render(),75)}
window.addEventListener('cc-resource-change',queue);
window.addEventListener('cc:character-updated',queue);
window.addEventListener('storage',queue);
window.addEventListener('cc:campaign-changed',queue);
document.addEventListener('click',e=>{if((e.target as Element)?.closest('.character-bar,[data-cast],[data-restore-mana],[data-hp-delta],[data-hp-set]'))queue()},true);
document.addEventListener('change',e=>{if((e.target as Element)?.closest('.character-bar,input[data-current-mana],input[data-max-mana]'))queue()},true);
setTimeout(()=>void render(),450);

export { render as renderMobileResourceHud };
