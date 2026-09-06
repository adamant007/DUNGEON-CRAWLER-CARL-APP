import { cloudCampaignCharacters, cloudListCampaigns, cloudListCharacters, cloudPushEvent, cloudSaveCharacter, cloudSubscribeCampaign } from './cloud';

const PANEL_ID='cc-gm-rewards';
const REVEAL_ID='cc-reward-reveal';
const STYLE_ID='cc-gm-reward-style';
const ACTIVE_KEY='cc-active-campaign-id';
let unsubscribe:(()=>void)|null=null;
let subscribedCampaign='';

type RewardKind='loot'|'spell'|'scroll'|'spellbook';
type RewardPayload={
  kind:RewardKind;
  title:string;
  detail:string;
  icon:string;
  source:'GM';
  custom?:boolean;
  pushedAt:string;
};

function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${PANEL_ID}{margin-top:18px;padding-top:16px;border-top:1px solid rgba(230,171,82,.28)}
 #${PANEL_ID} .cc-reward-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}
 #${PANEL_ID} textarea{width:100%;min-height:72px;resize:vertical}
 #${PANEL_ID} select,#${PANEL_ID} input{width:100%}
 #${PANEL_ID} .cc-reward-source{font-size:12px;opacity:.72;margin-top:6px;white-space:pre-wrap}
 #${REVEAL_ID}{position:fixed;inset:0;z-index:100200;display:grid;place-items:center;background:rgba(0,0,0,.78);backdrop-filter:blur(5px);padding:18px}
 #${REVEAL_ID} .cc-reward-card{width:min(590px,94vw);padding:26px;border-radius:22px;border:2px solid #e8ad55;background:linear-gradient(180deg,#28170d,#15100d);box-shadow:0 0 0 4px rgba(232,173,85,.12),0 28px 90px rgba(0,0,0,.7);text-align:center;animation:ccRewardPop .48s cubic-bezier(.2,.9,.25,1.2)}
 #${REVEAL_ID} .cc-reward-icon{font-size:64px;filter:drop-shadow(0 8px 20px rgba(0,0,0,.5));animation:ccRewardPulse 1.1s ease-in-out infinite alternate}
 #${REVEAL_ID} h2{margin:6px 0 10px} #${REVEAL_ID} pre{white-space:pre-wrap;text-align:left;background:rgba(0,0,0,.25);padding:14px;border-radius:12px;max-height:42vh;overflow:auto}
 #${REVEAL_ID} .cc-reward-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:14px}
 @keyframes ccRewardPop{from{transform:scale(.65) rotate(-2deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
 @keyframes ccRewardPulse{from{transform:scale(.96)}to{transform:scale(1.08)}}
 @media(max-width:620px){#${PANEL_ID} .cc-reward-row{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}

function activeCampaignId(){return localStorage.getItem(ACTIVE_KEY)||''}
function activeCharacterName(){
 const bar=document.querySelector('.character-bar') as HTMLElement|null;
 if(bar){const candidates=[...bar.querySelectorAll('button,b,strong,select option:checked')].map(x=>x.textContent?.trim()).filter(Boolean) as string[];const n=candidates.find(x=>x&&!/character|switch|new|add|cloud|save|side|delete/i.test(x));if(n)return n}
 const hero=document.querySelector('.app>main .hero h2,.app>main h2')?.textContent?.trim();return hero&&hero!=='Character'?hero:'';
}

function kindIcon(kind:RewardKind){return kind==='spell'?'✨':kind==='scroll'?'📜':kind==='spellbook'?'📕':'🎁'}
function labelFor(kind:RewardKind){return kind==='spell'?'Permanent Spell':kind==='scroll'?'Scroll':kind==='spellbook'?'Spellbook':'Loot'}

async function loadTargets(select:HTMLSelectElement){
 const id=activeCampaignId();select.innerHTML='';
 if(!id){select.innerHTML='<option value="">Choose an active campaign first</option>';return}
 try{
  const rows=await cloudCampaignCharacters(id) as any[];
  if(!rows.length){select.innerHTML='<option value="">No crawlers assigned to this campaign</option>';return}
  for(const row of rows){const o=document.createElement('option');o.value=row.id;o.textContent=row.name||row.data?.name||'Crawler';select.appendChild(o)}
 }catch(e){select.innerHTML=`<option value="">${e instanceof Error?e.message:'Could not load crawlers'}</option>`}
}

function generatedSpellText(){
 const out=document.querySelector('#cc-custom-spells [data-custom-output]') as HTMLElement|null;
 return out&&!out.hidden?out.textContent?.trim()||'':'';
}
function inferGeneratedKind(text:string):RewardKind{
 if(/^📜 Scroll of/m.test(text))return 'scroll';
 if(/^📕 Spellbook of/m.test(text))return 'spellbook';
 return 'spell';
}
function titleFromDetail(kind:RewardKind,detail:string){
 const first=(detail.split('\n')[0]||'').replace(/^[^A-Za-z0-9]+/,'').trim();
 return first||labelFor(kind);
}

function injectPanel(){
 const gm=document.getElementById('cc-runtime-gm-tools');if(!gm||document.getElementById(PANEL_ID))return;
 const wrap=document.createElement('div');wrap.id=PANEL_ID;wrap.innerHTML=`
  <h3>🎁 Push Reward to Crawler</h3>
  <p>Targets are limited to crawlers assigned to the active campaign.</p>
  <div class="cc-reward-row"><select aria-label="Reward target crawler"></select><select aria-label="Reward type"><option value="loot">🎁 Loot</option><option value="spell">✨ Permanent Spell</option><option value="scroll">📜 Scroll</option><option value="spellbook">📕 Spellbook</option></select></div>
  <input aria-label="Reward title" placeholder="Reward name" />
  <textarea aria-label="Reward details" placeholder="What did the crawler receive?"></textarea>
  <div class="cc-runtime-grid"><button data-use-generated>✨ Use Latest Generated Magic</button><button data-push-reward>🔊 Push Reward</button></div>
  <div class="cc-reward-source">Rewards are stored in campaign event history. Targeted rewards are visible only to that crawler's owner and the campaign GM.</div>
  <p data-reward-status aria-live="polite"></p>`;
 gm.appendChild(wrap);
 const target=wrap.querySelector('[aria-label="Reward target crawler"]') as HTMLSelectElement;
 const type=wrap.querySelector('[aria-label="Reward type"]') as HTMLSelectElement;
 const title=wrap.querySelector('[aria-label="Reward title"]') as HTMLInputElement;
 const details=wrap.querySelector('[aria-label="Reward details"]') as HTMLTextAreaElement;
 const status=wrap.querySelector('[data-reward-status]') as HTMLElement;
 void loadTargets(target);
 (wrap.querySelector('[data-use-generated]') as HTMLButtonElement).onclick=()=>{
  const text=generatedSpellText();if(!text){status.textContent='Generate a spell, scroll, or spellbook in Original Spell Lab first.';return}
  const k=inferGeneratedKind(text);type.value=k;details.value=text;title.value=titleFromDetail(k,text);status.textContent='✓ Generated CUSTOM magic loaded and ready to push.';
 };
 (wrap.querySelector('[data-push-reward]') as HTMLButtonElement).onclick=async()=>{
  const campaignId=activeCampaignId();const targetId=target.value;const kind=type.value as RewardKind;const detail=details.value.trim();const name=title.value.trim()||labelFor(kind);
  if(!campaignId){status.textContent='Choose an active campaign first.';return}if(!targetId){status.textContent='Choose a crawler in this campaign.';return}if(!detail){status.textContent='Add reward details first.';return}
  const payload:RewardPayload={kind,title:name,detail,icon:kindIcon(kind),source:'GM',custom:/\bCUSTOM\b/i.test(detail),pushedAt:new Date().toISOString()};
  try{await cloudPushEvent(campaignId,'gm_reward',payload,targetId);status.textContent=`✓ ${name} pushed to ${target.selectedOptions[0]?.textContent||'crawler'} with reveal sound.`;title.value='';details.value=''}catch(e){status.textContent=`Could not push reward: ${e instanceof Error?e.message:String(e)}`}
 };
}

function rewardTone(){
 try{const ctx=new AudioContext();const now=ctx.currentTime;[523,659,784].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=freq;g.gain.setValueAtTime(.0001,now+i*.11);g.gain.exponentialRampToValueAtTime(.09,now+i*.11+.025);g.gain.exponentialRampToValueAtTime(.001,now+i*.11+.34);o.start(now+i*.11);o.stop(now+i*.11+.36)})}catch{}
}

async function acceptReward(targetCharacterId:string,payload:RewardPayload,status:HTMLElement){
 try{
  const chars=await cloudListCharacters() as any[];const c=chars.find(x=>x.id===targetCharacterId);
  if(!c){status.textContent='This reward targets another crawler on your account. Switch to that crawler to accept it.';return false}
  const entry={name:payload.title,type:payload.kind,detail:payload.detail,source:'GM',custom:Boolean(payload.custom),receivedAt:payload.pushedAt};
  if(payload.kind==='spell'){
   const spells=Array.isArray(c.spells)?[...c.spells]:[];
   if(!spells.some((x:any)=>String(x?.name||x)===payload.title))spells.push(entry);
   c.spells=spells;
  }else{
   const inventory=Array.isArray(c.inventory)?[...c.inventory]:[];inventory.push(entry);c.inventory=inventory;
  }
  await cloudSaveCharacter(c);
  localStorage.setItem(`cc-last-reward:${c.id}`,JSON.stringify(entry));
  status.textContent=payload.kind==='spell'?'✓ Spell learned and saved to this crawler.':'✓ Reward added to inventory and saved to this crawler.';
  return true;
 }catch(e){status.textContent=`Could not accept reward: ${e instanceof Error?e.message:String(e)}`;return false}
}

function showReveal(event:any){
 if(document.getElementById(REVEAL_ID))return;
 const p=event?.payload as RewardPayload;if(!p?.kind||!p?.title)return;
 const overlay=document.createElement('div');overlay.id=REVEAL_ID;overlay.innerHTML=`<div class="cc-reward-card"><div class="cc-reward-icon">${p.icon||kindIcon(p.kind)}</div><div style="font-weight:900;letter-spacing:.12em;opacity:.72">GM REWARD</div><h2>${escapeHtml(p.title)}</h2>${p.custom?'<div style="font-weight:900">CUSTOM MAGIC</div>':''}<pre></pre><div class="cc-reward-actions"><button data-accept>Accept Reward</button><button data-later>View Later</button></div><p data-status aria-live="polite"></p></div>`;
 (overlay.querySelector('pre') as HTMLElement).textContent=p.detail;
 document.body.appendChild(overlay);rewardTone();
 const status=overlay.querySelector('[data-status]') as HTMLElement;
 (overlay.querySelector('[data-later]') as HTMLButtonElement).onclick=()=>overlay.remove();
 (overlay.querySelector('[data-accept]') as HTMLButtonElement).onclick=async()=>{const ok=await acceptReward(String(event.target_character_id||''),p,status);if(ok)setTimeout(()=>overlay.remove(),1200)};
}
function escapeHtml(v:string){const d=document.createElement('div');d.textContent=v;return d.innerHTML}

async function resubscribe(){
 const id=activeCampaignId();if(id===subscribedCampaign)return;
 unsubscribe?.();unsubscribe=null;subscribedCampaign=id;if(!id)return;
 unsubscribe=cloudSubscribeCampaign(id,(event:any)=>{if(event?.event_type==='gm_reward')showReveal(event)});
}
async function ensureValidCampaign(){
 try{const campaigns=await cloudListCampaigns() as any[];if(!campaigns.length)return;const current=activeCampaignId();if(!campaigns.some(c=>c.id===current))localStorage.setItem(ACTIVE_KEY,campaigns[0].id)}catch{}
}

function refresh(){addStyles();injectPanel();void resubscribe();const target=document.querySelector(`#${PANEL_ID} [aria-label="Reward target crawler"]`) as HTMLSelectElement|null;if(target)void loadTargets(target)}
window.addEventListener('cc:campaign-changed',()=>refresh());
window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)refresh()});
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()})}).observe(document.documentElement,{subtree:true,childList:true});
void ensureValidCampaign().then(refresh);setTimeout(refresh,900);
