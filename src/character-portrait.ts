const STYLE_ID='cc-character-portrait-style';
const PANEL_ID='cc-character-portrait';
const KEY_PREFIX='cc-character-portrait:';
let lastName='';

function activePrimaryTab(){
 const nav=document.querySelector('[aria-label="Primary navigation"]');
 const active=nav?.querySelector('button.active,[aria-current="page"]') as HTMLElement|null;
 return active?.textContent?.trim()||'';
}

function activeCharacterName(){
 const bar=document.querySelector('.character-bar');
 const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
 if(selected)return selected;
 const current=bar?.querySelector('button[aria-current="true"],button.active,strong,b')?.textContent?.trim();
 if(current&&!/character|switch|new|add|cloud|save|delete|side/i.test(current))return current;
 const nameInput=document.querySelector('main input[aria-label="Name"],main input[name="name"],main label input') as HTMLInputElement|null;
 if(nameInput?.value?.trim())return nameInput.value.trim();
 return 'Crawler';
}

function key(name:string){return KEY_PREFIX+encodeURIComponent(name||'Crawler')}

function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${PANEL_ID}{display:none;width:min(100%,900px);margin:12px auto 16px;padding:12px;border:1px solid rgba(230,171,82,.3);border-radius:14px;background:rgba(12,13,17,.92);box-sizing:border-box}
 #${PANEL_ID}[data-visible="true"]{display:block}
 #${PANEL_ID} .cc-portrait-frame{width:100%;display:grid;place-items:center;overflow:visible;border-radius:12px;background:rgba(255,255,255,.035);min-height:120px}
 #${PANEL_ID} img{display:block!important;width:auto!important;max-width:100%!important;height:auto!important;max-height:72vh!important;object-fit:contain!important;object-position:center!important;border-radius:10px!important;margin:0 auto!important}
 #${PANEL_ID} .cc-portrait-empty{padding:28px 16px;text-align:center;opacity:.72}
 #${PANEL_ID} .cc-portrait-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin-top:10px}
 #${PANEL_ID} label{display:inline-flex;align-items:center;justify-content:center;padding:9px 13px;border:1px solid rgba(230,171,82,.45);border-radius:10px;background:#19151a;color:#f6e6c8;font-weight:800;cursor:pointer}
 #${PANEL_ID} input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
 #${PANEL_ID} button{padding:9px 13px}
 @media(max-width:1100px){#${PANEL_ID}{width:100%;margin:8px 0 14px}#${PANEL_ID} img{max-height:none!important;width:100%!important;height:auto!important;object-fit:contain!important}}
 `;document.head.appendChild(s);
}

function ensurePanel(){
 addStyles();let panel=document.getElementById(PANEL_ID) as HTMLElement|null;if(panel)return panel;
 panel=document.createElement('section');panel.id=PANEL_ID;panel.dataset.ccWorkspaceUi='true';panel.setAttribute('aria-label','Full character portrait');
 panel.innerHTML=`<div class="cc-portrait-frame"><div class="cc-portrait-empty">No portrait saved for this crawler.</div><img alt="Full character portrait" hidden></div><div class="cc-portrait-actions"><label>🖼 Choose Full Portrait<input type="file" accept="image/*" data-cc-portrait-file></label><button type="button" data-cc-portrait-remove hidden>Remove Portrait</button></div>`;
 const anchor=document.getElementById('cc-workspace-tabs')||document.getElementById('cc-mobile-resource-hud')||document.querySelector('.character-bar');
 if(anchor)anchor.insertAdjacentElement('afterend',panel);else document.querySelector('.app')?.prepend(panel);
 const file=panel.querySelector('[data-cc-portrait-file]') as HTMLInputElement;
 file.addEventListener('change',()=>{const f=file.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const data=String(reader.result||'');if(!data.startsWith('data:image/'))return;localStorage.setItem(key(activeCharacterName()),data);render();window.dispatchEvent(new CustomEvent('cc:character-portrait-updated',{detail:{name:activeCharacterName()}}));};reader.readAsDataURL(f)});
 (panel.querySelector('[data-cc-portrait-remove]') as HTMLButtonElement).onclick=()=>{localStorage.removeItem(key(activeCharacterName()));render()};
 return panel;
}

async function adoptExisting(name:string){
 if(localStorage.getItem(key(name)))return;
 const candidates=[...document.querySelectorAll<HTMLImageElement>('.app main img,.app .character-card img,.app .character-sheet img')]
  .filter(img=>img.id!=='cc-mobile-brand-image'&&!/brand|logo|icon/i.test(`${img.alt} ${img.className}`));
 for(const img of candidates){
  const src=img.currentSrc||img.src;if(!src||src.includes('/brand/'))continue;
  if(src.startsWith('data:image/')){localStorage.setItem(key(name),src);return}
  if(src.startsWith('blob:')){try{const blob=await fetch(src).then(r=>r.blob());if(!blob.type.startsWith('image/'))continue;const reader=new FileReader();reader.onload=()=>{const data=String(reader.result||'');if(data.startsWith('data:image/')){localStorage.setItem(key(name),data);render()}};reader.readAsDataURL(blob);return}catch{}}
 }
}

function render(){
 const panel=ensurePanel();if(!panel)return;
 const visible=/^Character$/i.test(activePrimaryTab())||/character/i.test(document.querySelector('.app>main h1,.app>main h2')?.textContent||'');
 panel.dataset.visible=String(visible);
 const name=activeCharacterName();if(name!==lastName){lastName=name;void adoptExisting(name)}
 const data=localStorage.getItem(key(name));
 const img=panel.querySelector('img') as HTMLImageElement;const empty=panel.querySelector('.cc-portrait-empty') as HTMLElement;const remove=panel.querySelector('[data-cc-portrait-remove]') as HTMLButtonElement;
 if(data){img.src=data;img.hidden=false;empty.hidden=true;remove.hidden=false;img.alt=`Full portrait of ${name}`}
 else{img.removeAttribute('src');img.hidden=true;empty.hidden=false;remove.hidden=true}
}

let timer:number|undefined;function queue(){clearTimeout(timer);timer=window.setTimeout(render,80)}
document.addEventListener('click',queue,true);document.addEventListener('change',e=>{const t=e.target as HTMLInputElement;if(t?.type==='file'&&t.dataset.ccPortraitFile===undefined)setTimeout(()=>void adoptExisting(activeCharacterName()).then(render),120)},true);
window.addEventListener('storage',queue);window.addEventListener('cc:character-updated',queue);new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true});setTimeout(render,500);

export { render as renderCharacterPortrait };
