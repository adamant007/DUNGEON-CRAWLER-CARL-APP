const ID='cc-character-extra-sections';
function add(){
  if(document.getElementById(ID))return;
  const root=document.getElementById('cc-character-dashboard-v2'); if(!root)return;
  const host=root.querySelector('.cc2-main')||root;
  const el=document.createElement('section'); el.id=ID; el.className='cc2-card';
  el.innerHTML=`<style>#${ID}{grid-column:1/-1;padding:16px;margin-top:12px}#${ID} .cc-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}#${ID} .cc-extra{border:1px solid #9b6b2d;border-radius:12px;padding:14px;background:#0c121a}#${ID} h3{color:#e4b45e;margin:0 0 10px}#${ID} label{display:block;margin:8px 0;color:#ddd}#${ID} input,#${ID} textarea{width:100%;box-sizing:border-box;background:#121923;color:#fff;border:1px solid #6f542f;border-radius:7px;padding:8px}#${ID} textarea{min-height:70px}@media(max-width:760px){#${ID} .cc-extra-grid{grid-template-columns:1fr}}</style><div class="cc-extra-grid"><div class="cc-extra"><h3>🏰 Guildmaster</h3><label>Name<input data-extra="guildmaster-name"></label><label>Guild / Faction<input data-extra="guildmaster-guild"></label><label>Role / Rank<input data-extra="guildmaster-role"></label><label>Relationship<input data-extra="guildmaster-relationship"></label><label>Notes<textarea data-extra="guildmaster-notes"></textarea></label></div><div class="cc-extra"><h3>⭐ Celebrity</h3><label>Name<input data-extra="celebrity-name"></label><label>Show / Team / Faction<input data-extra="celebrity-show"></label><label>Role / Persona<input data-extra="celebrity-role"></label><label>Location / Relationship<input data-extra="celebrity-relationship"></label><label>Notes<textarea data-extra="celebrity-notes"></textarea></label></div></div>`;
  host.appendChild(el);
  el.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('[data-extra]').forEach(x=>{const k='cc-extra:'+x.dataset.extra; x.value=localStorage.getItem(k)||''; x.addEventListener('input',()=>localStorage.setItem(k,x.value));});
}
function q(){setTimeout(add,80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(add,600),{once:true});else setTimeout(add,600);
document.addEventListener('click',e=>{if((e.target as Element)?.closest('[aria-label="Primary navigation"],.character-bar'))q()},true);
window.addEventListener('cc:character-updated',q);
export {add as mountCharacterExtraSections};
