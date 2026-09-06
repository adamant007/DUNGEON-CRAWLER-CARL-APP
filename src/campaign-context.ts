import {
  cloudAssignCharacterToCampaign,
  cloudCampaignCharacters,
  cloudListCampaigns,
  cloudListCharacters,
  cloudListEvents,
  cloudLeaderboard,
  cloudRemoveCharacterFromCampaign,
  cloudUser,
} from './cloud';

const ROOT_ID='cc-campaign-context';
const STYLE_ID='cc-campaign-context-style';
const ACTIVE_KEY='cc-active-campaign-id';
let renderQueued=false;

function addStyles(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
  #${ROOT_ID}{margin:14px 0 18px;padding:14px;border:1px solid rgba(230,171,82,.35);border-radius:14px;background:rgba(20,16,13,.92);box-shadow:0 10px 32px rgba(0,0,0,.16)}
  #${ROOT_ID} .cc-campaign-top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}
  #${ROOT_ID} label{display:grid;gap:5px;font-size:12px;opacity:.9}
  #${ROOT_ID} select{width:100%;min-height:42px}
  #${ROOT_ID} .cc-role{font-size:12px;padding:6px 9px;border:1px solid rgba(230,171,82,.3);border-radius:999px;white-space:nowrap}
  #${ROOT_ID} .cc-meta{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0;font-size:12px;opacity:.82}
  #${ROOT_ID} .cc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
  #${ROOT_ID} .cc-card{padding:12px;border-radius:12px;background:rgba(0,0,0,.2);min-width:0}
  #${ROOT_ID} .cc-card h4{margin:0 0 8px;font-size:14px}
  #${ROOT_ID} .cc-list{display:grid;gap:7px;max-height:220px;overflow:auto}
  #${ROOT_ID} .cc-row{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.035);font-size:12px}
  #${ROOT_ID} .cc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
  #${ROOT_ID} button{min-height:38px}
  #${ROOT_ID} .cc-status{margin-top:8px;font-size:12px;opacity:.85;min-height:16px}
  #${ROOT_ID} .cc-muted{opacity:.68;font-size:12px}
  @media(max-width:850px){#${ROOT_ID} .cc-grid{grid-template-columns:1fr}#${ROOT_ID} .cc-campaign-top{grid-template-columns:1fr}#${ROOT_ID} .cc-role{justify-self:start}}
  `;
  document.head.appendChild(style);
}

function activeCharacterName(){
  const bar=document.querySelector('.character-bar') as HTMLElement|null;
  if(bar){
    const values=[...bar.querySelectorAll('button,b,strong,select option:checked')]
      .map(x=>x.textContent?.trim()).filter(Boolean) as string[];
    const found=values.find(x=>x&&!/character|switch|new|add|cloud|save|side|delete/i.test(x));
    if(found) return found;
  }
  const h=document.querySelector('.app>main .hero h2,.app>main h2')?.textContent?.trim();
  return h&&h!=='Character'?h:'';
}

function isRelevantView(){
  const main=document.querySelector('.app>main') as HTMLElement|null;
  if(!main) return false;
  const text=main.innerText||'';
  return /Campaign|Party|Leaderboard|GM Command Center|GM Tools/i.test(text);
}

function setActiveCampaign(id:string){
  if(id) localStorage.setItem(ACTIVE_KEY,id); else localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new CustomEvent('cc:campaign-changed',{detail:{campaignId:id}}));
}

function fmtEvent(e:any){
  const type=String(e.event_type||'event').replaceAll('_',' ');
  const message=e.payload?.message||e.payload?.name||e.payload?.title||'';
  return `${type}${message?` · ${message}`:''}`;
}

async function loadPanel(panel:HTMLElement){
  const status=panel.querySelector('.cc-status') as HTMLElement;
  const select=panel.querySelector('select') as HTMLSelectElement;
  try{
    const user=await cloudUser();
    if(!user){
      panel.querySelector('.cc-role')!.textContent='Cloud login required';
      select.innerHTML='<option value="">Log in to choose a campaign</option>';
      panel.querySelectorAll<HTMLElement>('[data-private]').forEach(x=>x.hidden=true);
      return;
    }
    const campaigns=await cloudListCampaigns() as any[];
    const stored=localStorage.getItem(ACTIVE_KEY)||'';
    const chosen=campaigns.find(c=>c.id===stored)||campaigns[0]||null;
    select.innerHTML='';
    for(const c of campaigns){
      const o=document.createElement('option');
      o.value=c.id;
      o.textContent=`${c.title||c.name||'Campaign'} · ${String(c.role||'player').toUpperCase()}`;
      select.appendChild(o);
    }
    if(!campaigns.length){
      select.innerHTML='<option value="">No campaigns yet</option>';
      panel.querySelector('.cc-role')!.textContent='No active campaign';
      panel.querySelectorAll<HTMLElement>('[data-private]').forEach(x=>x.hidden=true);
      return;
    }
    if(chosen){ select.value=chosen.id; setActiveCampaign(chosen.id); }
    await refreshScope(panel,chosen);
  }catch(e){status.textContent=`Campaign context unavailable: ${e instanceof Error?e.message:String(e)}`;}
}

async function refreshScope(panel:HTMLElement,campaign:any){
  const status=panel.querySelector('.cc-status') as HTMLElement;
  const role=panel.querySelector('.cc-role') as HTMLElement;
  const meta=panel.querySelector('.cc-meta') as HTMLElement;
  const crawlers=panel.querySelector('[data-crawlers]') as HTMLElement;
  const leaderboard=panel.querySelector('[data-leaderboard]') as HTMLElement;
  const events=panel.querySelector('[data-events]') as HTMLElement;
  panel.querySelectorAll<HTMLElement>('[data-private]').forEach(x=>x.hidden=false);
  if(!campaign?.id){return;}
  role.textContent=String(campaign.role||'player').toUpperCase();
  meta.innerHTML=`<span>Campaign: <strong>${campaign.title||campaign.name||'Campaign'}</strong></span><span>Invite: <strong>${campaign.invite_code||'—'}</strong></span><span>Scope: <strong>campaign only</strong></span>`;
  status.textContent='Refreshing campaign-only data…';
  try{
    const [chars,board,eventRows]=await Promise.all([
      cloudCampaignCharacters(campaign.id),
      cloudLeaderboard(campaign.id,'score'),
      cloudListEvents(campaign.id,25),
    ]);
    crawlers.innerHTML='';
    for(const row of chars as any[]){
      const item=document.createElement('div');item.className='cc-row';
      item.innerHTML=`<span>${row.name||row.data?.name||'Crawler'}</span><span>${row.user_id===campaign.owner_id?'GM':''}</span>`;
      crawlers.appendChild(item);
    }
    if(!(chars as any[]).length)crawlers.innerHTML='<div class="cc-muted">No crawlers assigned to this campaign yet.</div>';

    leaderboard.innerHTML='';
    (board as any[]).slice(0,10).forEach((row:any,i:number)=>{
      const item=document.createElement('div');item.className='cc-row';
      item.innerHTML=`<span>#${i+1} ${row.crawler_name||row.display_name||'Crawler'}</span><strong>${Number(row.score||0).toLocaleString()}</strong>`;
      leaderboard.appendChild(item);
    });
    if(!(board as any[]).length)leaderboard.innerHTML='<div class="cc-muted">No leaderboard entries in this campaign.</div>';

    events.innerHTML='';
    (eventRows as any[]).slice(0,10).forEach((row:any)=>{
      const item=document.createElement('div');item.className='cc-row';
      item.innerHTML=`<span>${fmtEvent(row)}</span><span>${row.created_at?new Date(row.created_at).toLocaleDateString():''}</span>`;
      events.appendChild(item);
    });
    if(!(eventRows as any[]).length)events.innerHTML='<div class="cc-muted">No campaign events yet.</div>';
    status.textContent='✓ Campaign context synced.';
  }catch(e){status.textContent=`Could not refresh campaign data: ${e instanceof Error?e.message:String(e)}`;}
}

async function attachActive(panel:HTMLElement){
  const select=panel.querySelector('select') as HTMLSelectElement;
  const status=panel.querySelector('.cc-status') as HTMLElement;
  if(!select.value){status.textContent='Choose a campaign first.';return;}
  const name=activeCharacterName();
  if(!name){status.textContent='Open the crawler you want to assign first.';return;}
  try{
    const chars=await cloudListCharacters() as any[];
    const character=chars.find(c=>String(c.name||'').trim()===name.trim());
    if(!character?.id){status.textContent=`Save ${name} to the cloud first.`;return;}
    await cloudAssignCharacterToCampaign(select.value,character.id);
    status.textContent=`✓ ${name} assigned to this campaign.`;
    const campaigns=await cloudListCampaigns() as any[];
    await refreshScope(panel,campaigns.find(c=>c.id===select.value));
  }catch(e){status.textContent=`Could not assign crawler: ${e instanceof Error?e.message:String(e)}`;}
}

async function removeActive(panel:HTMLElement){
  const select=panel.querySelector('select') as HTMLSelectElement;
  const status=panel.querySelector('.cc-status') as HTMLElement;
  if(!select.value){status.textContent='Choose a campaign first.';return;}
  const name=activeCharacterName();
  if(!name){status.textContent='Open the crawler you want to remove first.';return;}
  try{
    const chars=await cloudListCharacters() as any[];
    const character=chars.find(c=>String(c.name||'').trim()===name.trim());
    if(!character?.id){status.textContent=`Could not find ${name} in your cloud crawlers.`;return;}
    await cloudRemoveCharacterFromCampaign(select.value,character.id);
    status.textContent=`✓ ${name} removed from this campaign only.`;
    const campaigns=await cloudListCampaigns() as any[];
    await refreshScope(panel,campaigns.find(c=>c.id===select.value));
  }catch(e){status.textContent=`Could not remove crawler: ${e instanceof Error?e.message:String(e)}`;}
}

function mount(){
  addStyles();
  if(!isRelevantView()){document.getElementById(ROOT_ID)?.remove();return;}
  const main=document.querySelector('.app>main') as HTMLElement|null;
  if(!main||document.getElementById(ROOT_ID))return;
  const panel=document.createElement('section');
  panel.id=ROOT_ID;
  panel.innerHTML=`
    <div class="cc-campaign-top">
      <label>Active Campaign<select aria-label="Active Campaign"></select></label>
      <div class="cc-role">Loading…</div>
    </div>
    <div class="cc-meta"></div>
    <div class="cc-actions" data-private>
      <button type="button" data-attach>➕ Assign Active Crawler</button>
      <button type="button" data-remove>➖ Remove Active Crawler</button>
      <button type="button" data-refresh>↻ Refresh Campaign</button>
    </div>
    <div class="cc-grid" data-private>
      <div class="cc-card"><h4>🧑‍🤝‍🧑 Campaign Crawlers</h4><div class="cc-list" data-crawlers></div></div>
      <div class="cc-card"><h4>🏆 Campaign Leaderboard</h4><div class="cc-list" data-leaderboard></div></div>
      <div class="cc-card"><h4>📜 Campaign Activity</h4><div class="cc-list" data-events></div></div>
    </div>
    <div class="cc-status" aria-live="polite"></div>`;
  main.prepend(panel);
  const select=panel.querySelector('select') as HTMLSelectElement;
  select.onchange=async()=>{
    setActiveCampaign(select.value);
    const campaigns=await cloudListCampaigns() as any[];
    await refreshScope(panel,campaigns.find(c=>c.id===select.value));
  };
  (panel.querySelector('[data-attach]') as HTMLButtonElement).onclick=()=>void attachActive(panel);
  (panel.querySelector('[data-remove]') as HTMLButtonElement).onclick=()=>void removeActive(panel);
  (panel.querySelector('[data-refresh]') as HTMLButtonElement).onclick=async()=>{
    const campaigns=await cloudListCampaigns() as any[];
    await refreshScope(panel,campaigns.find(c=>c.id===select.value));
  };
  void loadPanel(panel);
}

function queueMount(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;mount();});}
new MutationObserver(queueMount).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:campaign-changed',queueMount);
window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)queueMount();});
queueMount();
