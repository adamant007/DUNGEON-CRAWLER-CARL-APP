const ROOT_ID='cc-two-character-mode';
const BUTTON_ID='cc-two-character-toggle';
const EMBED_PARAM='ccDualPane';

function isEmbedded(){return new URLSearchParams(location.search).get(EMBED_PARAM)==='1'}

function addEmbeddedStyles(){
 if(!isEmbedded())return;
 const s=document.createElement('style');s.textContent=`
   html,body,#root{min-height:100%;background:#0d0d10!important}
   body{margin:0!important;overflow:auto!important}
   .app>nav,.app>footer,footer,#${BUTTON_ID},#${ROOT_ID}{display:none!important}
   .app{min-height:100vh!important}
   .app>main{padding:10px!important;margin:0!important;max-width:none!important}
   .character-bar{position:sticky!important;top:0!important;z-index:50!important;background:#111217!important;padding:8px!important}
 `;document.head.appendChild(s)
}

function normalizeName(v:string){return v.replace(/\s+/g,' ').trim()}

function characterNames(doc:Document=document){
 const names:string[]=[];
 const bar=doc.querySelector('.character-bar');
 bar?.querySelectorAll('select option').forEach(o=>{const n=normalizeName(o.textContent||'');if(n&&!/choose|select|new|add/i.test(n))names.push(n)});
 bar?.querySelectorAll('button,b,strong').forEach(el=>{const n=normalizeName(el.textContent||'');if(n&&!/character|switch|new|add|cloud|save|delete|side|two/i.test(n))names.push(n)});
 return [...new Set(names)].filter(Boolean);
}

function selectCharacterInFrame(frame:HTMLIFrameElement,name:string){
 try{
   const doc=frame.contentDocument;if(!doc)return false;
   const bar=doc.querySelector('.character-bar');if(!bar)return false;
   const select=bar.querySelector('select') as HTMLSelectElement|null;
   if(select){
     const option=[...select.options].find(o=>normalizeName(o.textContent||'')===name);
     if(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));return true}
   }
   const button=[...bar.querySelectorAll('button')].find(b=>normalizeName(b.textContent||'')===name) as HTMLButtonElement|undefined;
   if(button){button.click();return true}
 }catch{}
 return false;
}

function frameUrl(){
 const u=new URL(location.href);u.searchParams.set(EMBED_PARAM,'1');u.hash='';return u.toString();
}

function createSelect(names:string[],value:string){
 const s=document.createElement('select');s.setAttribute('aria-label','Choose crawler for pane');
 names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;s.appendChild(o)});s.value=value;return s;
}

function openTwoCharacterMode(){
 document.getElementById(ROOT_ID)?.remove();
 const names=characterNames();
 if(names.length<2){alert('Create or load at least two crawlers before using Two-Character View.');return}
 const root=document.createElement('div');root.id=ROOT_ID;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Two character view');
 root.innerHTML=`<div class="cc-two-head"><strong>🧑‍🤝‍🧑 Two-Character View</strong><span>Both crawler sheets stay live.</span><button type="button" data-close>Close</button></div><div class="cc-two-pickers"></div><div class="cc-two-grid"></div>`;
 const pickers=root.querySelector('.cc-two-pickers')!;const grid=root.querySelector('.cc-two-grid')!;
 const leftName=names[0],rightName=names[1];
 const leftSelect=createSelect(names,leftName),rightSelect=createSelect(names,rightName);pickers.append(leftSelect,rightSelect);
 const makeFrame=(name:string)=>{const f=document.createElement('iframe');f.title=`Live character sheet: ${name}`;f.src=frameUrl();f.loading='eager';f.addEventListener('load',()=>{let tries=0;const timer=setInterval(()=>{tries++;if(selectCharacterInFrame(f,name)||tries>30)clearInterval(timer)},120)});return f};
 let leftFrame=makeFrame(leftName),rightFrame=makeFrame(rightName);grid.append(leftFrame,rightFrame);
 const wire=(select:HTMLSelectElement,getFrame:()=>HTMLIFrameElement)=>select.addEventListener('change',()=>{const f=getFrame();f.title=`Live character sheet: ${select.value}`;let tries=0;const timer=setInterval(()=>{tries++;if(selectCharacterInFrame(f,select.value)||tries>20)clearInterval(timer)},80)});
 wire(leftSelect,()=>leftFrame);wire(rightSelect,()=>rightFrame);
 root.querySelector<HTMLButtonElement>('[data-close]')!.onclick=()=>root.remove();
 document.body.appendChild(root);
}

function addStyles(){
 if(document.getElementById('cc-two-character-style'))return;
 const s=document.createElement('style');s.id='cc-two-character-style';s.textContent=`
 #${BUTTON_ID}{white-space:nowrap}
 #${ROOT_ID}{position:fixed;inset:0;z-index:100000;background:#090a0d;color:#f7ead3;display:grid;grid-template-rows:auto auto 1fr;gap:8px;padding:10px;box-sizing:border-box}
 #${ROOT_ID} .cc-two-head{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:8px 10px;border:1px solid rgba(230,171,82,.35);border-radius:12px;background:#151318}
 #${ROOT_ID} .cc-two-head span{opacity:.75;font-size:13px}
 #${ROOT_ID} .cc-two-pickers{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 #${ROOT_ID} .cc-two-pickers select{width:100%;padding:10px;border-radius:10px;background:#17181d;color:#fff;border:1px solid rgba(230,171,82,.35);font-weight:800}
 #${ROOT_ID} .cc-two-grid{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
 #${ROOT_ID} iframe{width:100%;height:100%;min-height:0;border:1px solid rgba(230,171,82,.35);border-radius:12px;background:#0d0e12}
 @media(max-width:700px){
   #${ROOT_ID}{padding:6px;gap:6px}
   #${ROOT_ID} .cc-two-head{grid-template-columns:1fr auto}.cc-two-head span{display:none}
   #${ROOT_ID} .cc-two-grid{grid-template-columns:1fr;grid-template-rows:1fr 1fr}
   #${ROOT_ID} iframe{min-height:0}
 }
 `;document.head.appendChild(s)
}

function installLauncher(){
 if(isEmbedded())return;
 addStyles();
 const bar=document.querySelector('.character-bar');if(!bar||document.getElementById(BUTTON_ID))return;
 const b=document.createElement('button');b.id=BUTTON_ID;b.type='button';b.textContent='🧑‍🤝‍🧑 Two-Character View';b.title='Open two live crawler sheets';b.onclick=openTwoCharacterMode;bar.appendChild(b);
}

addEmbeddedStyles();
if(isEmbedded()){
 const wanted=new URLSearchParams(location.search).get('crawler');
 if(wanted){let tries=0;const timer=setInterval(()=>{tries++;const dummy=document.createElement('iframe');Object.defineProperty(dummy,'contentDocument',{value:document});if(selectCharacterInFrame(dummy,wanted)||tries>25)clearInterval(timer)},120)}
}else{
 new MutationObserver(installLauncher).observe(document.documentElement,{subtree:true,childList:true});
 setTimeout(installLauncher,500);setTimeout(installLauncher,1200);
}

export { openTwoCharacterMode };
