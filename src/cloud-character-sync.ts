import { cloudAuthChanges, cloudListCharacters, cloudSaveCharacter, cloudUser } from './cloud';

const PORTRAIT_PREFIX='cc-character-portrait:';
const CLOUD_ID_PREFIX='cc-character-cloud-id:';
const LAST_HASH_PREFIX='cc-character-cloud-hash:';
let syncTimer:number|undefined;
let syncing=false;

function activeCharacterName(){
  const bar=document.querySelector('.character-bar');
  const selected=bar?.querySelector('select option:checked')?.textContent?.trim();
  if(selected)return selected;
  const current=bar?.querySelector('button[aria-current="true"],button.active,strong,b')?.textContent?.trim();
  if(current&&!/character|switch|new|add|cloud|save|delete|side/i.test(current))return current;
  const nameInput=document.querySelector('main input[aria-label="Name"],main input[name="name"]') as HTMLInputElement|null;
  return nameInput?.value?.trim()||'';
}

function cloudIdKey(name:string){return CLOUD_ID_PREFIX+encodeURIComponent(name)}
function hashKey(name:string){return LAST_HASH_PREFIX+encodeURIComponent(name)}
function portraitKey(name:string){return PORTRAIT_PREFIX+encodeURIComponent(name)}

function characterScore(value:any,name:string){
  if(!value||typeof value!=='object'||Array.isArray(value))return -1;
  const n=String(value.name||value.characterName||value.crawlerName||'').trim();
  if(!n||n!==name)return -1;
  const important=['level','race','class','hp','health','maxhp','mana','maxmana','inventory','skills','spells','equipment','floor','stats','attributes','resist','resistance','damageResistance','popularity','aiFavor'];
  const keys=Object.keys(value);
  let score=keys.length;
  for(const k of important)if(k in value)score+=12;
  return score;
}

function collectCharacters(value:any,name:string,out:any[],depth=0){
  if(depth>5||value==null)return;
  const score=characterScore(value,name);if(score>=0)out.push({value,score});
  if(Array.isArray(value)){for(const item of value)collectCharacters(item,name,out,depth+1);return}
  if(typeof value==='object'){for(const item of Object.values(value))collectCharacters(item,name,out,depth+1)}
}

function findBestLocalCharacter(name:string){
  const candidates:any[]=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);if(!key||key.startsWith(PORTRAIT_PREFIX)||key.startsWith(CLOUD_ID_PREFIX)||key.startsWith(LAST_HASH_PREFIX))continue;
    if(!/crawler|character|sheet|party|save|app/i.test(key))continue;
    const raw=localStorage.getItem(key);if(!raw||raw.length>4_000_000)continue;
    try{collectCharacters(JSON.parse(raw),name,candidates)}catch{}
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0]?.value?structuredClone(candidates[0].value):null;
}

function stableStringify(value:any):string{
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
  const keys=Object.keys(value).filter(k=>!/^ccCloud(Synced|Backup)/i.test(k)).sort();
  return '{'+keys.map(k=>JSON.stringify(k)+':'+stableStringify(value[k])).join(',')+'}';
}

function hashString(s:string){
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(36);
}

async function syncActiveCharacter(){
  if(syncing)return;
  const name=activeCharacterName();if(!name)return;
  const user=await cloudUser();if(!user)return;
  const local=findBestLocalCharacter(name);if(!local)return;
  syncing=true;
  try{
    const cloud=await cloudListCharacters() as any[];
    const existing=cloud.find(c=>String(c?.name||'').trim()===name);
    const id=existing?.id||local.id||localStorage.getItem(cloudIdKey(name))||crypto.randomUUID();
    localStorage.setItem(cloudIdKey(name),String(id));
    const portrait=localStorage.getItem(portraitKey(name));
    const payload={...existing,...local,id,name,ccCloudSyncedAt:new Date().toISOString()};
    if(portrait&&!payload.portrait)payload.portrait=portrait;
    const fingerprint=hashString(stableStringify(payload));
    if(localStorage.getItem(hashKey(name))===fingerprint)return;
    const saved=await cloudSaveCharacter(payload);
    if((saved as any)?.id)localStorage.setItem(cloudIdKey(name),String((saved as any).id));
    localStorage.setItem(hashKey(name),fingerprint);
    window.dispatchEvent(new CustomEvent('cc:cloud-character-synced',{detail:{name,id}}));
  }catch(e){console.warn('Automatic character backup skipped:',e)}finally{syncing=false}
}

function queueSync(delay=1200){clearTimeout(syncTimer);syncTimer=window.setTimeout(()=>void syncActiveCharacter(),delay)}

const originalSetItem=Storage.prototype.setItem;
if(!(Storage.prototype as any).__ccCharacterSyncPatched){
  (Storage.prototype as any).__ccCharacterSyncPatched=true;
  Storage.prototype.setItem=function(key:string,value:string){
    originalSetItem.call(this,key,value);
    if(this===localStorage&&!key.startsWith(LAST_HASH_PREFIX)&&!/supabase|sb-|cc-device-id/i.test(key))queueSync();
  };
}

document.addEventListener('input',()=>queueSync(),true);
document.addEventListener('change',()=>queueSync(),true);
document.addEventListener('click',e=>{
  const el=(e.target as Element)?.closest('button,[role="button"]');
  if(el)setTimeout(()=>queueSync(700),50);
},true);
window.addEventListener('cc:character-updated',()=>queueSync(500));
window.addEventListener('cc:character-portrait-updated',()=>queueSync(500));
window.addEventListener('beforeunload',()=>{void syncActiveCharacter()});
cloudAuthChanges(user=>{if(user)queueSync(600)});
setTimeout(()=>queueSync(400),1400);

export { syncActiveCharacter };
