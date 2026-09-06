const BACKUP_KEY='cc-import-safety-backup';
const STYLE_ID='cc-import-safety-style';
const NOTICE_ID='cc-import-safety-notice';

type Snapshot={createdAt:number;items:Record<string,string>};

function isCharacterKey(key:string){
  const k=key.toLowerCase();
  return /character|crawler|portrait/.test(k)&&!/(auth|token|session|supabase)/.test(k);
}

function snapshot():Snapshot{
  const items:Record<string,string>={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);if(!key||!isCharacterKey(key))continue;
    const value=localStorage.getItem(key);if(value!==null)items[key]=value;
  }
  return {createdAt:Date.now(),items};
}

function saveBackup(){
  try{sessionStorage.setItem(BACKUP_KEY,JSON.stringify(snapshot()));return true}catch{return false}
}

function readBackup():Snapshot|null{
  try{const raw=sessionStorage.getItem(BACKUP_KEY);if(!raw)return null;const parsed=JSON.parse(raw);if(!parsed||typeof parsed.createdAt!=='number'||typeof parsed.items!=='object')return null;return parsed}catch{return null}
}

function restoreBackup(){
  const backup=readBackup();if(!backup)return false;
  const current:string[]=[];
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&isCharacterKey(key))current.push(key)}
  for(const key of current)localStorage.removeItem(key);
  for(const [key,value] of Object.entries(backup.items))localStorage.setItem(key,value);
  window.dispatchEvent(new CustomEvent('cc:character-updated',{detail:{source:'import-restore'}}));
  window.dispatchEvent(new StorageEvent('storage'));
  return true;
}

function addStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  #${NOTICE_ID}{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;width:min(92vw,620px);padding:12px 14px;border-radius:12px;background:#151319;border:1px solid rgba(230,171,82,.48);box-shadow:0 12px 34px rgba(0,0,0,.38);color:#f6e6c8;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
  #${NOTICE_ID} p{margin:0;flex:1 1 280px}#${NOTICE_ID} button{padding:8px 11px;font-weight:800}
  `;document.head.appendChild(s)
}

function showNotice(message='Import backup saved. If the import looks wrong, you can restore the previous crawler state.'){
  addStyles();let n=document.getElementById(NOTICE_ID) as HTMLElement|null;if(!n){n=document.createElement('div');n.id=NOTICE_ID;n.setAttribute('role','status');document.body.appendChild(n)}
  n.innerHTML=`<p>${message}</p><button type="button" data-cc-import-restore>Restore Previous</button><button type="button" data-cc-import-dismiss>Dismiss</button>`;
  (n.querySelector('[data-cc-import-restore]') as HTMLButtonElement).onclick=()=>{if(restoreBackup()){n!.querySelector('p')!.textContent='Previous crawler state restored. Reloading the character view…';setTimeout(()=>location.reload(),450)}else n!.querySelector('p')!.textContent='No usable import backup was found.'};
  (n.querySelector('[data-cc-import-dismiss]') as HTMLButtonElement).onclick=()=>n?.remove();
}

function looksLikeImport(input:HTMLInputElement){
  if(input.type!=='file')return false;
  const label=input.labels?.[0]?.textContent||'';
  const text=`${input.name} ${input.id} ${input.accept} ${input.getAttribute('aria-label')||''} ${label}`.toLowerCase();
  return /import|character|crawler|sheet|pdf|json/.test(text);
}

function install(){
  document.addEventListener('change',e=>{
    const input=e.target as HTMLInputElement|null;if(!input||!looksLikeImport(input)||!input.files?.length)return;
    if(saveBackup())showNotice();
  },true);
  window.addEventListener('cc:character-import-start',()=>{if(saveBackup())showNotice()});
}

install();
export { saveBackup as backupBeforeCharacterImport, restoreBackup as restoreCharacterImportBackup };
