const STYLE='cc-dice-tab-polyhedral-style';

function addStyle(){
 if(document.getElementById(STYLE))return;
 const s=document.createElement('style');s.id=STYLE;s.textContent=`
  .cc-dice-tab-poly{margin:16px 0;padding:16px;border:1px solid #b98a3c;border-radius:12px;background:#101722;color:#fff}
  .cc-dice-tab-poly h3{margin:0 0 12px;color:#e6bd6b;font-family:Georgia,serif}
  .cc-dice-tab-controls{display:grid;grid-template-columns:110px 1fr;gap:10px}
  .cc-dice-tab-controls select{background:#0b111a;border:1px solid #b98a3c;color:#fff;border-radius:8px;padding:9px}
  .cc-dice-tab-area{min-height:120px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:14px 0}
  .cc-dice-tab-die{width:74px;height:74px;display:grid;place-items:center;position:relative;color:#fff;font-size:25px;font-weight:900;text-shadow:0 2px 4px #000;background:linear-gradient(145deg,#8f2d22,#3c1010);border:2px solid #e6bd6b;box-shadow:inset 8px 8px 18px rgba(255,255,255,.12),inset -8px -10px 18px rgba(0,0,0,.38),0 0 18px rgba(230,189,107,.24)}
  .cc-dice-tab-die::after{content:'';position:absolute;inset:9px;border:1px solid rgba(255,255,255,.24);clip-path:inherit}
  .cc-dice-tab-die.d4{clip-path:polygon(50% 4%,96% 90%,4% 90%)}
  .cc-dice-tab-die.d6{clip-path:polygon(10% 10%,90% 10%,90% 90%,10% 90%)}
  .cc-dice-tab-die.d8{clip-path:polygon(50% 2%,97% 50%,50% 98%,3% 50%)}
  .cc-dice-tab-die.d10{clip-path:polygon(50% 2%,92% 31%,79% 92%,21% 92%,8% 31%)}
  .cc-dice-tab-die.d12{clip-path:polygon(50% 2%,88% 17%,99% 55%,75% 94%,25% 94%,1% 55%,12% 17%)}
  .cc-dice-tab-die.d20{clip-path:polygon(50% 1%,84% 12%,99% 42%,91% 76%,66% 98%,34% 98%,9% 76%,1% 42%,16% 12%)}
  .cc-dice-tab-die.rolling{animation:ccDiceTabTumble .72s cubic-bezier(.2,.75,.25,1)}
  @keyframes ccDiceTabTumble{0%{transform:translateY(-8px) rotate(0deg) scale(.84)}35%{transform:translateY(10px) rotate(170deg) scale(1.08)}70%{transform:translateY(-4px) rotate(310deg) scale(.96)}100%{transform:translateY(0) rotate(360deg) scale(1)}}
  .cc-dice-tab-roll{width:100%;border:1px solid #e6bd6b;background:#7a241c;color:#fff;border-radius:9px;padding:11px;font-weight:900;cursor:pointer}
  .cc-dice-tab-total{text-align:center;color:#e6bd6b;font-size:20px;font-weight:800;min-height:28px;margin-top:8px}
 `;document.head.appendChild(s)
}
function clean(s:string){return s.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}
function diceActive(){
 if(document.body.dataset.ccPrimaryTab==='dice')return true;
 const b=document.querySelector('[aria-label="Primary navigation"] button.active,[aria-label="Primary navigation"] [aria-current="page"]') as HTMLElement|null;
 return /^Dice$/i.test(clean(b?.textContent||''));
}
function mainHost(){return document.querySelector('.app>main,main') as HTMLElement|null}
function mount(){
 addStyle();const old=document.getElementById('cc-dice-tab-polyhedral');
 if(!diceActive()){if(old)old.hidden=true;return}
 const host=mainHost();if(!host)return;
 let box=old as HTMLElement|null;
 if(!box){
  box=document.createElement('section');box.id='cc-dice-tab-polyhedral';box.className='cc-dice-tab-poly';
  box.innerHTML=`<h3>🎲 POLYHEDRAL DICE</h3><div class="cc-dice-tab-controls"><select data-count aria-label="Number of dice">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} dice</option>`).join('')}</select><select data-type aria-label="Die type">${[4,6,8,10,12,20].map(d=>`<option value="${d}" ${d===20?'selected':''}>d${d}</option>`).join('')}</select></div><div class="cc-dice-tab-area" data-area></div><button class="cc-dice-tab-roll" data-roll>ROLL 2d20</button><div class="cc-dice-tab-total" data-total></div>`;
  host.prepend(box);
  const count=box.querySelector('[data-count]') as HTMLSelectElement;const type=box.querySelector('[data-type]') as HTMLSelectElement;const area=box.querySelector('[data-area]') as HTMLElement;const roll=box.querySelector('[data-roll]') as HTMLButtonElement;const total=box.querySelector('[data-total]') as HTMLElement;
  const sync=()=>roll.textContent=`ROLL ${count.value}d${type.value}`;count.onchange=sync;type.onchange=sync;
  roll.onclick=()=>{const qty=Math.max(1,Math.min(6,Number(count.value)||2));const sides=Number(type.value)||20;const vals=Array.from({length:qty},()=>Math.floor(Math.random()*sides)+1);area.innerHTML=vals.map((v,i)=>`<div class="cc-dice-tab-die d${sides} rolling" style="animation-delay:${i*70}ms">${v}</div>`).join('');const sum=vals.reduce((a,b)=>a+b,0);total.textContent=qty>1?`Total: ${sum} • ${vals.join(' + ')}`:`Result: ${vals[0]}`;window.dispatchEvent(new CustomEvent('cc:dice-roll',{detail:{qty,sides,rolls:vals,total:sum}}))};sync();roll.click();
 }
 box.hidden=false;
}
document.addEventListener('click',e=>{if((e.target as Element|null)?.closest('[aria-label="Primary navigation"] button'))setTimeout(mount,80)},true);
window.addEventListener('cc:primary-tab-changed',()=>setTimeout(mount,40));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,600),{once:true});else setTimeout(mount,600);
export { mount as mountDiceTabPolyhedral };
