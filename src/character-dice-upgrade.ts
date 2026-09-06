const STYLE='cc-character-dice-upgrade-style';

function addStyle(){
 if(document.getElementById(STYLE))return;
 const s=document.createElement('style');s.id=STYLE;s.textContent=`
  #cc-character-dashboard-v2 .cc2-dice{overflow:hidden}
  #cc-character-dashboard-v2 .cc-dice-controls{display:grid;grid-template-columns:92px 1fr;gap:8px;margin-bottom:10px}
  #cc-character-dashboard-v2 .cc-dice-controls select{background:#0f1722;border:1px solid var(--a);color:#fff;border-radius:8px;padding:8px}
  #cc-character-dashboard-v2 .cc-poly-area{min-height:112px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 0 4px}
  #cc-character-dashboard-v2 .cc-poly{width:72px;height:72px;display:grid;place-items:center;position:relative;color:#fff;font-size:25px;font-weight:900;text-shadow:0 2px 4px #000;background:linear-gradient(145deg,var(--b),var(--c));border:2px solid var(--a);box-shadow:inset 8px 8px 18px rgba(255,255,255,.11),inset -8px -10px 18px rgba(0,0,0,.35),0 0 18px var(--glow);transform:rotate(0deg)}
  #cc-character-dashboard-v2 .cc-poly::after{content:'';position:absolute;inset:9px;border:1px solid rgba(255,255,255,.24);clip-path:inherit}
  #cc-character-dashboard-v2 .cc-poly.d4{clip-path:polygon(50% 4%,96% 90%,4% 90%)}
  #cc-character-dashboard-v2 .cc-poly.d6{clip-path:polygon(10% 10%,90% 10%,90% 90%,10% 90%)}
  #cc-character-dashboard-v2 .cc-poly.d8{clip-path:polygon(50% 2%,97% 50%,50% 98%,3% 50%)}
  #cc-character-dashboard-v2 .cc-poly.d10{clip-path:polygon(50% 2%,92% 31%,79% 92%,21% 92%,8% 31%)}
  #cc-character-dashboard-v2 .cc-poly.d12{clip-path:polygon(50% 2%,88% 17%,99% 55%,75% 94%,25% 94%,1% 55%,12% 17%)}
  #cc-character-dashboard-v2 .cc-poly.d20{clip-path:polygon(50% 1%,84% 12%,99% 42%,91% 76%,66% 98%,34% 98%,9% 76%,1% 42%,16% 12%)}
  #cc-character-dashboard-v2 .cc-poly.rolling{animation:ccDiceTumble .72s cubic-bezier(.2,.75,.25,1)}
  @keyframes ccDiceTumble{0%{transform:translateY(-8px) rotate(0deg) scale(.84)}35%{transform:translateY(10px) rotate(170deg) scale(1.08)}70%{transform:translateY(-4px) rotate(310deg) scale(.96)}100%{transform:translateY(0) rotate(360deg) scale(1)}}
  #cc-character-dashboard-v2 .cc-dice-total{text-align:center;font-family:Georgia,serif;color:var(--a);font-size:20px;font-weight:800;margin-top:5px;min-height:28px}
 `;document.head.appendChild(s)
}

function upgrade(){
 addStyle();
 const panel=document.querySelector('#cc-character-dashboard-v2 .cc2-dice') as HTMLElement|null;
 if(!panel||panel.dataset.ccDiceUpgraded==='1')return;
 panel.dataset.ccDiceUpgraded='1';
 panel.innerHTML=`<div class="cc2-title">🎲 POLYHEDRAL DICE</div>
 <div class="cc-dice-controls"><select data-cc-poly-count aria-label="Number of dice">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} dice</option>`).join('')}</select><select data-cc-poly-type aria-label="Die type">${[4,6,8,10,12,20].map(d=>`<option value="${d}" ${d===20?'selected':''}>d${d}</option>`).join('')}</select></div>
 <div class="cc-poly-area" data-cc-poly-area></div>
 <button class="cc2-roll" data-cc-poly-roll>ROLL 2d20</button>
 <div class="cc-dice-total" data-cc-poly-total></div>`;
 const count=panel.querySelector('[data-cc-poly-count]') as HTMLSelectElement;
 const type=panel.querySelector('[data-cc-poly-type]') as HTMLSelectElement;
 const area=panel.querySelector('[data-cc-poly-area]') as HTMLElement;
 const button=panel.querySelector('[data-cc-poly-roll]') as HTMLButtonElement;
 const total=panel.querySelector('[data-cc-poly-total]') as HTMLElement;
 const sync=()=>{button.textContent=`ROLL ${count.value}d${type.value}`};count.onchange=sync;type.onchange=sync;
 button.onclick=()=>{
  const qty=Math.max(1,Math.min(6,Number(count.value)||2));const sides=Math.max(2,Number(type.value)||20);
  const rolls=Array.from({length:qty},()=>Math.floor(Math.random()*sides)+1);
  area.innerHTML=rolls.map((n,i)=>`<div class="cc-poly d${sides} rolling" style="animation-delay:${i*70}ms">${n}</div>`).join('');
  total.textContent=qty>1?`Total: ${rolls.reduce((a,b)=>a+b,0)}  •  ${rolls.join(' + ')}`:`Result: ${rolls[0]}`;
  const list=document.querySelector('#cc-character-dashboard-v2 [data-cc2-recent]') as HTMLOListElement|null;
  if(list){const li=document.createElement('li');li.textContent=`${qty}d${sides}: ${rolls.join(', ')} = ${rolls.reduce((a,b)=>a+b,0)}`;list.prepend(li);while(list.children.length>5)list.lastElementChild?.remove()}
 };
 sync();button.click();
}
function q(){setTimeout(upgrade,80)}
document.addEventListener('click',e=>{if((e.target as Element)?.closest('[aria-label="Primary navigation"],.character-bar'))q()},true);
window.addEventListener('cc:character-updated',q);window.addEventListener('cc:campaign-changed',q);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(upgrade,500),{once:true});else setTimeout(upgrade,500);
export { upgrade as upgradeCharacterDice };
