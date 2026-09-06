import { applyDamage } from './combat-damage';

type DamageType='Physical'|'Fire'|'Cold'|'Electric'|'Acid'|'Magic'|'Unspecified';

const MARK='data-cc-hp-resist-hook';
let busy=false;

function text(el:Element|null){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function hpContext(el:Element){
 let node:Element|null=el;
 for(let i=0;i<6&&node;i++,node=node.parentElement){
  const t=text(node);
  if(/\b(?:hp|health|hit points?)\b/i.test(t))return node;
 }
 return null;
}
function damageAmount(button:HTMLButtonElement){
 const aria=button.getAttribute('aria-label')||'';
 const title=button.getAttribute('title')||'';
 const raw=`${text(button)} ${aria} ${title}`;
 const n=raw.match(/(?:damage|lose|subtract|minus|−|-)\s*(\d+)/i)||raw.match(/(\d+)\s*(?:damage|hp)/i);
 if(n)return Math.max(1,Number(n[1])||1);
 if(/^(?:−|-)\s*\d*$/.test(text(button)))return Math.max(1,Number(text(button).replace(/\D/g,''))||1);
 if(/damage|lose hp|subtract hp|decrease hp/i.test(raw))return 1;
 return 0;
}
function damageType(context:Element):DamageType{
 const select=context.querySelector('select[aria-label*="damage type" i],select[name*="damageType" i]') as HTMLSelectElement|null;
 const v=select?.value||'';
 return ['Physical','Fire','Cold','Electric','Acid','Magic'].includes(v)?v as DamageType:'Unspecified';
}
async function handleClick(ev:Event){
 if(busy)return;
 const button=(ev.target as Element|null)?.closest('button') as HTMLButtonElement|null;
 if(!button||button.disabled)return;
 const context=hpContext(button);if(!context)return;
 const amount=damageAmount(button);if(!amount)return;
 ev.preventDefault();ev.stopPropagation();
 (ev as any).stopImmediatePropagation?.();
 busy=true;button.disabled=true;button.setAttribute(MARK,'working');
 try{
  const result=await applyDamage(amount,damageType(context));
  button.setAttribute(MARK,'applied');
  window.dispatchEvent(new CustomEvent('cc:hp-damage-resolved',{detail:result}));
  const live=context.querySelector('[aria-live]') as HTMLElement|null;
  if(live)live.textContent=`${result.incoming} incoming − ${result.resisted} resisted = ${result.applied} HP damage. HP ${result.hpBefore} → ${result.hpAfter}/${result.maxHp}.`;
 }catch(e){
  console.error('HP damage/resist integration failed',e);
  button.setAttribute(MARK,'error');
 }finally{button.disabled=false;busy=false}
}

document.addEventListener('click',handleClick,true);

// Public bridge for any future React/core HP control: one canonical damage resolver.
(window as any).ccApplyDamage=(amount:number,type:DamageType='Unspecified')=>applyDamage(amount,type);

export { handleClick };
