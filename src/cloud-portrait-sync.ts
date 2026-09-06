import { cloudAuthChanges, cloudListCharacters, cloudSaveCharacter, cloudUser } from './cloud';

const PORTRAIT_PREFIX='cc-character-portrait:';
const CLOUD_ID_PREFIX='cc-character-cloud-id:';
let syncing=false;
let hydrateTimer:number|undefined;

function activeCharacterName(){
  const bar=document.querySelector('.character-bar');
  const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
  if(selected)return selected;
  const current=bar?.querySelector('button[aria-current="true"],button.active,strong,b')?.textContent?.trim();
  if(current&&!/character|switch|new|add|cloud|save|delete|side/i.test(current))return current;
  const nameInput=document.querySelector('main input[aria-label="Name"],main input[name="name"]') as HTMLInputElement|null;
  return nameInput?.value?.trim()||'Crawler';
}
function portraitKey(name:string){return PORTRAIT_PREFIX+encodeURIComponent(name||'Crawler')}
function cloudIdKey(name:string){return CLOUD_ID_PREFIX+encodeURIComponent(name||'Crawler')}
function stableCloudId(name:string){let id=localStorage.getItem(cloudIdKey(name));if(!id){id=crypto.randomUUID();localStorage.setItem(cloudIdKey(name),id)}return id}

function looksCharacterLike(value:any,name:string){
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const n=String(value.name||value.characterName||value.crawlerName||'').trim();
  if(n!==name)return false;
  const keys=Object.keys(value).map(k=>k.toLowerCase());
  return ['level','race','class','hp','health','inventory','skills','spells','equipment','floor','stats','attributes'].some(k=>keys.includes(k));
}
function findCharacterIn(value:any,name:string,depth=0):any|null{
  if(depth>4||value==null)return null;
  if(looksCharacterLike(value,name))return value;
  if(Array.isArray(value)){for(const item of value){const found=findCharacterIn(item,name,depth+1);if(found)return found}return null}
  if(typeof value==='object'){for(const item of Object.values(value)){const found=findCharacterIn(item,name,depth+1);if(found)return found}}
  return null;
}
function findLocalCharacter(name:string){
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);if(!k||k.startsWith(PORTRAIT_PREFIX)||k.startsWith(CLOUD_ID_PREFIX))continue;
    const raw=localStorage.getItem(k);if(!raw||raw.length>2_000_000)continue;
    try{const found=findCharacterIn(JSON.parse(raw),name);if(found)return structuredClone(found)}catch{}
  }
  return null;
}

async function compactPortrait(data:string){
  if(!data.startsWith('data:image/'))return data;
  if(data.length<900_000)return data;
  return await new Promise<string>(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const max=1600;const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx){resolve(data);return}
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      try{resolve(canvas.toDataURL('image/webp',0.84))}catch{resolve(canvas.toDataURL('image/jpeg',0.86))}
    };
    img.onerror=()=>resolve(data);img.src=data;
  });
}

async function syncActivePortraitToCloud(name=activeCharacterName()){
  if(syncing)return;
  const portrait=localStorage.getItem(portraitKey(name));if(!portrait)return;
  const user=await cloudUser();if(!user)return;
  syncing=true;
  try{
    const rows=await cloudListCharacters();
    const existing=(rows as any[]).find(c=>String(c?.name||'').trim()===name);
    const base=existing||findLocalCharacter(name)||{id:stableCloudId(name),name};
    const compact=await compactPortrait(portrait);
    if(compact!==portrait)localStorage.setItem(portraitKey(name),compact);
    const saved=await cloudSaveCharacter({...base,name,portrait:compact,portraitUpdatedAt:new Date().toISOString()});
    const id=(saved as any)?.id||base.id;if(id)localStorage.setItem(cloudIdKey(name),String(id));
    window.dispatchEvent(new CustomEvent('cc:character-updated',{detail:{name,source:'cloud-portrait-sync'}}));
  }catch(e){console.warn('Portrait cloud sync skipped:',e)}finally{syncing=false}
}

async function hydrateActivePortraitFromCloud(name=activeCharacterName()){
  if(localStorage.getItem(portraitKey(name)))return;
  const user=await cloudUser();if(!user)return;
  try{
    const rows=await cloudListCharacters();
    const existing=(rows as any[]).find(c=>String(c?.name||'').trim()===name);
    const portrait=existing?.portrait||existing?.portraitDataUrl||existing?.image||existing?.photo||existing?.avatar;
    if(typeof portrait==='string'&&portrait.startsWith('data:image/')){
      localStorage.setItem(portraitKey(name),portrait);
      if(existing?.id)localStorage.setItem(cloudIdKey(name),String(existing.id));
      window.dispatchEvent(new CustomEvent('cc:character-portrait-updated',{detail:{name,source:'cloud'}}));
    }
  }catch(e){console.warn('Portrait cloud restore skipped:',e)}
}

function queueHydrate(){clearTimeout(hydrateTimer);hydrateTimer=window.setTimeout(()=>void hydrateActivePortraitFromCloud(),180)}
window.addEventListener('cc:character-portrait-updated',(e:any)=>{if(e?.detail?.source==='cloud')return;void syncActivePortraitToCloud(e?.detail?.name||activeCharacterName())});
window.addEventListener('cc:character-updated',queueHydrate);
document.addEventListener('click',e=>{if((e.target as Element)?.closest('.character-bar'))queueHydrate()},true);
cloudAuthChanges(user=>{if(user)queueHydrate()});
setTimeout(queueHydrate,900);

export { hydrateActivePortraitFromCloud, syncActivePortraitToCloud };
