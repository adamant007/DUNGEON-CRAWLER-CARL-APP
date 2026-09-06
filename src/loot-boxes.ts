import { cloudCampaignCharacters, cloudListCharacters, cloudPushEvent, cloudSaveCharacter, cloudSubscribeCampaign } from './cloud';

const PANEL_ID='cc-loot-boxes';
const REVEAL_ID='cc-loot-box-reveal';
const STYLE_ID='cc-loot-box-style';
const ACTIVE_KEY='cc-active-campaign-id';
let unsub:(()=>void)|null=null;
let subscribed='';

type Tier='Bronze'|'Silver'|'Gold'|'Epic'|'Legendary';
type LootItem={name:string;detail:string;rarity:Tier;icon:string;type:'loot'};
type LootBoxPayload={boxTier:Tier;items:LootItem[];title:string;icon:string;pushedAt:string;source:'GM'};

const pools:{name:string;detail:string;icon:string}[]=[
 {name:'Crawler Healing Kit',detail:'A compact emergency healing bundle for the next ugly situation.','icon':'🧰'},
 {name:'Mana Tonic',detail:'A consumable restorative for magical resources.','icon':'🧪'},
 {name:'Reinforced Gloves',detail:'Protective hand gear with improved grip and durability.','icon':'🧤'},
 {name:'Lucky Throwing Knife',detail:'A balanced backup blade that feels suspiciously fortunate.','icon':'🗡️'},
 {name:'Emergency Smoke Capsule',detail:'Creates instant concealment when opened.','icon':'💨'},
 {name:'Crawler Ration Brick',detail:'Dense food that restores morale more than flavor.','icon':'🍫'},
 {name:'Trapwire Spool',detail:'Useful for improvised alarms, snares, and dungeon nonsense.','icon':'🧵'},
 {name:'Utility Flashlight',detail:'Rugged light source with a nearly indestructible casing.','icon':'🔦'},
 {name:'Shield Charm',detail:'A single-use protective charm for one dangerous moment.','icon':'🛡️'},
 {name:'Floor Map Fragment',detail:'Reveals a useful but incomplete section of the current floor.','icon':'🗺️'},
 {name:'Crawler Coin Pouch',detail:'A pouch of spendable dungeon currency and odd tokens.','icon':'🪙'},
 {name:'Monster Bait Packet',detail:'Smells terrible. Probably works.','icon':'🥩'},
 {name:'Lockbreaker Set',detail:'Compact tools for doors, containers, and questionable decisions.','icon':'🗝️'},
 {name:'Adrenal Surge Injector',detail:'A one-use boost for a desperate combat push.','icon':'💉'},
 {name:'Mystery Quest Token',detail:'A strange token tied to a System objective or hidden reward.','icon':'🎟️'},
 {name:'Reactive Armor Patch',detail:'A temporary armor reinforcement patch.','icon':'🩹'},
 {name:'Portable Alarm Bug',detail:'Tiny device that chirps when someone crosses its trigger line.','icon':'🐞'},
 {name:'Crawler Tool Roll',detail:'Assorted compact tools for repairs and improvisation.','icon':'🛠️'},
 {name:'Sponsor Snack Crate',detail:'A small cache of suspiciously premium snacks.','icon':'📦'},
 {name:'Unknown Access Key',detail:'A key with no label and an unnecessarily dramatic finish.','icon':'🔑'},
 {name:'Shock Baton',detail:'Compact close-range weapon with a painful electric discharge.','icon':'⚡'},
 {name:'Phase Chalk',detail:'Marks surfaces with symbols visible under unusual conditions.','icon':'🖍️'},
 {name:'Emergency Rope Launcher',detail:'A fast-deploy climbing and traversal aid.','icon':'🪢'},
 {name:'Anti-Slime Powder',detail:'Highly specialized. Extremely satisfying when needed.','icon':'✨'},
 {name:'Crawler Medallion',detail:'A decorative trinket that may or may not attract attention.','icon':'🏅'},
 {name:'Goblin-Built Multi-Tool',detail:'Ugly, loud, and surprisingly functional.','icon':'🔧'},
 {name:'Cooling Flask',detail:'Keeps one carried item unnaturally cold for hours.','icon':'❄️'},
 {name:'Noise Maker Decoy',detail:'Throws sound to a nearby location when activated.','icon':'📣'},
 {name:'Pocket Barricade',detail:'Deployable cover for a very short but useful moment.','icon':'🚧'},
 {name:'Crawler Repair Foam',detail:'Expanding material for sealing cracks, holes, and damaged gear.','icon':'🫧'}
];

function activeCampaign(){return localStorage.getItem(ACTIVE_KEY)||''}
function tierIcon(t:Tier){return t==='Bronze'?'🟫':t==='Silver'?'⬜':t==='Gold'?'🟨':t==='Epic'?'🟪':'🌟'}
function itemCountFor(t:Tier){return t==='Bronze'?2:t==='Silver'?3:t==='Gold'?4:t==='Epic'?5:6}
function uniqueItems(count:number,tier:Tier):LootItem[]{
 const shuffled=[...pools].sort(()=>Math.random()-.5);return shuffled.slice(0,Math.min(count,shuffled.length)).map(x=>({...x,rarity:tier,type:'loot'}));
}
function boxTitle(t:Tier){return `${t} Loot Box`}

function addStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #${PANEL_ID}{margin-top:18px;padding-top:16px;border-top:1px solid rgba(230,171,82,.28)}
 #${PANEL_ID} .cc-lootbox-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:9px 0}
 #${PANEL_ID} input,#${PANEL_ID} select{width:100%}
 #${REVEAL_ID}{position:fixed;inset:0;z-index:100250;display:grid;place-items:center;background:rgba(0,0,0,.86);backdrop-filter:blur(6px);padding:18px}
 #${REVEAL_ID} .cc-box-card{width:min(700px,95vw);max-height:90vh;overflow:auto;padding:26px;border-radius:24px;background:linear-gradient(180deg,#28170d,#100d0b);border:2px solid #e8ad55;box-shadow:0 28px 100px rgba(0,0,0,.75);text-align:center;animation:ccBoxPop .6s cubic-bezier(.15,.9,.2,1.15)}
 #${REVEAL_ID} .cc-box-icon{font-size:82px;animation:ccBoxShake .7s ease-in-out}
 #${REVEAL_ID} .cc-loot-items{display:grid;gap:10px;margin:18px 0;text-align:left}
 #${REVEAL_ID} .cc-loot-item{padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.055);border:1px solid rgba(232,173,85,.24)}
 #${REVEAL_ID} .cc-loot-item strong{display:block;margin-bottom:4px}
 @keyframes ccBoxPop{from{transform:scale(.58) translateY(50px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
 @keyframes ccBoxShake{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-8deg) scale(1.08)}40%{transform:rotate(8deg) scale(1.12)}60%{transform:rotate(-5deg) scale(1.08)}80%{transform:rotate(4deg) scale(1.04)}}
 @media(max-width:700px){#${PANEL_ID} .cc-lootbox-row{grid-template-columns:1fr}}
 `;document.head.appendChild(s)}

async function loadTargets(select:HTMLSelectElement){const id=activeCampaign();select.innerHTML='';if(!id){select.innerHTML='<option value="">Choose an active campaign first</option>';return}try{const rows=await cloudCampaignCharacters(id) as any[];if(!rows.length){select.innerHTML='<option value="">No crawlers assigned</option>';return}for(const r of rows){const o=document.createElement('option');o.value=r.id;o.textContent=r.name||r.data?.name||'Crawler';select.appendChild(o)}}catch{select.innerHTML='<option value="">Could not load crawlers</option>'}}

function inject(){const gm=document.getElementById('cc-runtime-gm-tools');if(!gm||document.getElementById(PANEL_ID))return;const wrap=document.createElement('div');wrap.id=PANEL_ID;wrap.innerHTML=`
 <h3>📦 Loot Box Push</h3><p>Push a rarity-based box containing unique rewards to one crawler in the active campaign.</p>
 <div class="cc-lootbox-row"><select aria-label="Loot box target"></select><select aria-label="Loot box tier"><option>Bronze</option><option>Silver</option><option>Gold</option><option>Epic</option><option>Legendary</option></select><input aria-label="Loot box count" type="number" min="1" max="12" value="2"></div>
 <div class="cc-runtime-grid"><button data-preview-box>👁 Preview Box</button><button data-push-box>🔊 Push Loot Box</button></div><div class="cc-runtime-output" data-box-preview hidden></div><p data-box-status aria-live="polite"></p>`;gm.appendChild(wrap);
 const target=wrap.querySelector('[aria-label="Loot box target"]') as HTMLSelectElement;const tier=wrap.querySelector('[aria-label="Loot box tier"]') as HTMLSelectElement;const count=wrap.querySelector('[aria-label="Loot box count"]') as HTMLInputElement;const preview=wrap.querySelector('[data-box-preview]') as HTMLElement;const status=wrap.querySelector('[data-box-status]') as HTMLElement;void loadTargets(target);
 count.addEventListener('input',()=>{if(count.value==='')return;const n=Math.max(1,Math.min(12,Number(count.value)||1));count.value=String(n)});count.addEventListener('blur',()=>{if(!count.value)count.value=String(itemCountFor(tier.value as Tier))});tier.onchange=()=>{count.value=String(itemCountFor(tier.value as Tier))};
 const build=()=>{const t=tier.value as Tier;const n=Math.max(1,Math.min(12,Number(count.value)||itemCountFor(t)));return {boxTier:t,items:uniqueItems(n,t),title:boxTitle(t),icon:tierIcon(t),pushedAt:new Date().toISOString(),source:'GM'} as LootBoxPayload};
 (wrap.querySelector('[data-preview-box]') as HTMLButtonElement).onclick=()=>{const b=build();preview.hidden=false;preview.textContent=`${b.icon} ${b.title}\n\n${b.items.map((x,i)=>`${i+1}. ${x.icon} ${x.name} — ${x.detail}`).join('\n')}`};
 (wrap.querySelector('[data-push-box]') as HTMLButtonElement).onclick=async()=>{const campaignId=activeCampaign();if(!campaignId){status.textContent='Choose an active campaign first.';return}if(!target.value){status.textContent='Choose a crawler first.';return}const b=build();try{await cloudPushEvent(campaignId,'gm_loot_box',b,target.value);status.textContent=`✓ ${b.title} with ${b.items.length} unique items pushed to ${target.selectedOptions[0]?.textContent||'crawler'}.`;preview.hidden=false;preview.textContent=`${b.icon} ${b.title}\n\n${b.items.map((x,i)=>`${i+1}. ${x.icon} ${x.name}`).join('\n')}`}catch(e){status.textContent=`Could not push loot box: ${e instanceof Error?e.message:String(e)}`}};
}

function playTone(t:Tier){try{const ctx=new AudioContext();const base=t==='Bronze'?330:t==='Silver'?440:t==='Gold'?554:t==='Epic'?659:784;const notes=t==='Legendary'?[1,1.25,1.5,2]:t==='Epic'?[1,1.2,1.5]:[1,1.25,1.5];notes.forEach((m,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=base*m;g.gain.setValueAtTime(.0001,ctx.currentTime+i*.12);g.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+i*.12+.03);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.12+.42);o.start(ctx.currentTime+i*.12);o.stop(ctx.currentTime+i*.12+.45)})}catch{}}

async function acceptBox(targetId:string,p:LootBoxPayload,status:HTMLElement){try{const chars=await cloudListCharacters() as any[];const c=chars.find(x=>x.id===targetId);if(!c){status.textContent='This box targets another crawler on your account.';return false}const inventory=Array.isArray(c.inventory)?[...c.inventory]:[];const seen=new Set(inventory.map((x:any)=>String(x?.name||x).toLowerCase()));for(const item of p.items){const key=item.name.toLowerCase();if(seen.has(key))continue;inventory.push({...item,source:'GM',boxTier:p.boxTier,receivedAt:p.pushedAt});seen.add(key)}c.inventory=inventory;await cloudSaveCharacter(c);localStorage.setItem(`cc-last-loot-box:${c.id}`,JSON.stringify(p));status.textContent=`✓ ${p.items.length} rewards processed and saved. Existing duplicates were skipped.`;return true}catch(e){status.textContent=`Could not accept box: ${e instanceof Error?e.message:String(e)}`;return false}}

function escapeHtml(v:string){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
function showReveal(event:any){if(document.getElementById(REVEAL_ID))return;const p=event?.payload as LootBoxPayload;if(!p?.items?.length)return;const o=document.createElement('div');o.id=REVEAL_ID;o.innerHTML=`<div class="cc-box-card"><div class="cc-box-icon">${p.icon||tierIcon(p.boxTier)}</div><div style="font-weight:900;letter-spacing:.13em;opacity:.72">LOOT BOX RECEIVED</div><h2>${escapeHtml(p.title||boxTitle(p.boxTier))}</h2><div class="cc-loot-items"></div><div class="cc-reward-actions"><button data-open>Accept All Rewards</button><button data-later>View Later</button></div><p data-status aria-live="polite"></p></div>`;const list=o.querySelector('.cc-loot-items') as HTMLElement;for(const item of p.items){const row=document.createElement('div');row.className='cc-loot-item';const strong=document.createElement('strong');strong.textContent=`${item.icon||'🎁'} ${item.name}`;const d=document.createElement('div');d.textContent=item.detail;row.append(strong,d);list.appendChild(row)}document.body.appendChild(o);playTone(p.boxTier);const status=o.querySelector('[data-status]') as HTMLElement;(o.querySelector('[data-later]') as HTMLButtonElement).onclick=()=>o.remove();(o.querySelector('[data-open]') as HTMLButtonElement).onclick=async()=>{const ok=await acceptBox(String(event.target_character_id||''),p,status);if(ok)setTimeout(()=>o.remove(),1400)}}

function resubscribe(){const id=activeCampaign();if(id===subscribed)return;unsub?.();unsub=null;subscribed=id;if(!id)return;unsub=cloudSubscribeCampaign(id,(e:any)=>{if(e?.event_type==='gm_loot_box')showReveal(e)})}
function refresh(){addStyles();inject();resubscribe();const target=document.querySelector(`#${PANEL_ID} [aria-label="Loot box target"]`) as HTMLSelectElement|null;if(target)void loadTargets(target)}
window.addEventListener('cc:campaign-changed',refresh);window.addEventListener('storage',e=>{if(e.key===ACTIVE_KEY)refresh()});let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()})}).observe(document.documentElement,{subtree:true,childList:true});setTimeout(refresh,1000);

export { uniqueItems, itemCountFor };
