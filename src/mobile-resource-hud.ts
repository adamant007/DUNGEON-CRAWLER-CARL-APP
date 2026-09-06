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
function spellState(name:string){
 try{return JSON.parse(localStorage.getItem(`cc-spell-state:${name}`)||'{}')}catch{return {}}
}
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
function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${HUD_ID}{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;width:100%;box-sizing:border-box;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(16,14,18,.96),rgba(10,11,15,.96));position:relative;z-index:11}
 #${HUD_ID} .cc-hud-resource{min-width:0;width:100%}
 #${HUD_ID} .cc-hud-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;font-size:12px;font-weight:900;letter-spacing:.03em}
 #${HUD_ID} .cc-hud-track{height:14px;width:100%;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12);box-shadow:inset 0 1px 4px rgba(0,0,0,.55)}
 #${HUD_ID} .cc-hud-fill{height:100%;min-width:0;transition:width .25s ease}
 #${HUD_ID} .cc-hud-hp .cc-hud-fill{background:linear-gradient(90deg,#8d1d20,#ed4f55)}
 #${HUD_ID} .cc-hud-mp .cc-hud-fill{background:linear-gradient(90deg,#4d35bd,#a56cff)}
 @media(min-width:721px){#${HUD_ID}{margin:0 0 8px;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}}
 @media(max-width:430px){#${HUD_ID}{gap:7px;padding:8px 10px}#${HUD_ID} .cc-hud-track{height:12px}}
 `;document.head.appendChild(s);
}
function ensureHud(){
 addStyles();let hud=document.getElementById(HUD_ID);if(hud)return hud;
 const bar=document.querySelector('.app>.character-bar,.character-bar');if(!bar)return null;
 hud=document.createElement('div');hud.id=HUD_ID;hud.setAttribute('aria-label','Crawler health and mana');
 hud.innerHTML=`<div class="cc-hud-resource cc-hud-hp"><div class="cc-hud-top"><span>❤️ HEALTH</span><span data-hp-label>—</span></div><div class="cc-hud-track"><div class="cc-hud-fill" data-hp-fill></div></div></div><div class="cc-hud-resource cc-hud-mp"><div class="cc-hud-top"><span>✨ MANA</span><span data-mp-label>—</span></div><div class="cc-hud-track"><div class="cc-hud-fill" data-mp-fill></div></div></div>`;
 bar.insertAdjacentElement('afterend',hud);return hud;
}
async function render(){
 const hud=ensureHud();if(!hud)return;
 const name=activeName();let c:any=null;
 try{const chars=await cloudListCharacters() as any[];c=chars.find(x=>x.name===name)||chars[0]||null}catch{}
 const hp=hpFrom(c),mp=manaFrom(name||c?.name||'Crawler',c);
 const hpPct=Math.max(0,Math.min(100,hp.current/hp.max*100));const mpPct=mp.max?Math.max(0,Math.min(100,mp.current/mp.max*100)):0;
 (hud.querySelector('[data-hp-fill]') as HTMLElement).style.width=`${hpPct}%`;
 (hud.querySelector('[data-mp-fill]') as HTMLElement).style.width=`${mpPct}%`;
 (hud.querySelector('[data-hp-label]') as HTMLElement).textContent=`${hp.current} / ${hp.max}`;
 (hud.querySelector('[data-mp-label]') as HTMLElement).textContent=mp.max?`${mp.current} / ${mp.max}`:'0 / 0';
}
let timer:number|undefined;function queue(){window.clearTimeout(timer);timer=window.setTimeout(()=>void render(),120)}
window.addEventListener('cc-resource-change',queue);window.addEventListener('cc:character-updated',queue);window.addEventListener('storage',queue);window.addEventListener('cc:campaign-changed',queue);
document.addEventListener('click',e=>{if((e.target as Element)?.closest('.character-bar'))queue()},true);
new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});setTimeout(()=>void render(),650);

export { render as renderMobileResourceHud };
