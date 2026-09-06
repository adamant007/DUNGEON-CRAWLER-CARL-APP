const CLOUD_ID_PREFIX='cc-character-cloud-id:';
const NAME_BY_ID_PREFIX='cc-character-name-by-id:';
const PORTRAIT_PREFIX='cc-character-portrait:';

function nameKey(name:string){return CLOUD_ID_PREFIX+encodeURIComponent(name||'Crawler')}
function reverseKey(id:string){return NAME_BY_ID_PREFIX+encodeURIComponent(id)}
function portraitKey(name:string){return PORTRAIT_PREFIX+encodeURIComponent(name||'Crawler')}

function validId(value:any){
  const id=String(value||'').trim();
  return id.length>=8?id:'';
}

function candidateStableId(candidate:any){
  return validId(candidate?.ccStableId)||validId(candidate?.id)||'';
}

function rememberCharacterIdentity(name:string,id:string){
  const cleanName=String(name||'Crawler').trim()||'Crawler';
  const cleanId=validId(id);if(!cleanId)return '';
  const previousName=localStorage.getItem(reverseKey(cleanId))||'';
  localStorage.setItem(nameKey(cleanName),cleanId);
  localStorage.setItem(reverseKey(cleanId),cleanName);

  // Backward-compatible portrait migration: when a crawler is renamed but keeps
  // the same stable id, carry its portrait forward to the new display name.
  const currentPortrait=localStorage.getItem(portraitKey(cleanName));
  if(!currentPortrait&&previousName&&previousName!==cleanName){
    const previousPortrait=localStorage.getItem(portraitKey(previousName));
    if(previousPortrait)localStorage.setItem(portraitKey(cleanName),previousPortrait);
  }
  return cleanId;
}

function stableCharacterId(name:string,candidate?:any,allowCreate=true){
  const cleanName=String(name||'Crawler').trim()||'Crawler';
  const fromCandidate=candidateStableId(candidate);
  if(fromCandidate)return rememberCharacterIdentity(cleanName,fromCandidate);
  const mapped=validId(localStorage.getItem(nameKey(cleanName)));
  if(mapped)return rememberCharacterIdentity(cleanName,mapped);
  if(!allowCreate)return '';
  const id=crypto.randomUUID();
  return rememberCharacterIdentity(cleanName,id);
}

function previousNameForId(id:string){
  const cleanId=validId(id);return cleanId?localStorage.getItem(reverseKey(cleanId))||'':'';
}

const browserApi={candidateStableId,previousNameForId,rememberCharacterIdentity,stableCharacterId};
if(typeof window!=='undefined'){
  (window as any).__ccCharacterIdentity=browserApi;
}

export { candidateStableId, previousNameForId, rememberCharacterIdentity, stableCharacterId };
