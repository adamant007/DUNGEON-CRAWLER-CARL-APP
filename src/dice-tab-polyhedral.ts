const OWN_ID='cc-dice-tab-polyhedral';
function clean(s:string){return s.replace(/✦/g,'').replace(/^[^A-Za-z]+/,'').trim()}
function diceActive(){if(document.body.dataset.ccPrimaryTab==='dice')return true;const b=document.querySelector('[aria-label="Primary navigation"] button.active,[aria-label="Primary navigation"] [aria-current="page"]') as HTMLElement|null;return /^Dice$/i.test(clean(b?.textContent||''))}
function removeLegacyDuplicate(){document.getElementById(OWN_ID)?.remove()}
function normalizeExisting(){
 removeLegacyDuplicate();if(!diceActive())return;
 const controls=[...document.querySelectorAll<HTMLSelectElement>('select[aria-label="Number of dice"]')];
 controls.slice(1).forEach(x=>{const panel=x.closest('section,article,.card,[class*="panel"]') as HTMLElement|null;if(panel&&panel.id===OWN_ID)panel.remove();else x.remove()});
 const count=controls[0];if(count){const values=new Set([...count.options].map(o=>o.value));for(let n=1;n<=6;n++)if(!values.has(String(n))){const o=document.createElement('option');o.value=String(n);o.textContent=String(n);count.appendChild(o)}if(Number(count.value)<1||Number(count.value)>6)count.value='2'}
}
function mount(){normalizeExisting()}
document.addEventListener('click',e=>{if((e.target as Element|null)?.closest('[aria-label="Primary navigation"] button'))setTimeout(mount,80)},true);
window.addEventListener('cc:primary-tab-changed',()=>setTimeout(mount,40));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,600),{once:true});else setTimeout(mount,600);
export { mount as mountDiceTabPolyhedral };
