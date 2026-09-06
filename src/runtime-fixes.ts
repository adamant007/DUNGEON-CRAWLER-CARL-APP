import { cloudDeleteCharacter, cloudListCampaigns, cloudListCharacters, cloudPushEvent, cloudSubscribeCampaign } from './cloud';

const STYLE_ID='cc-runtime-fixes';
const GM_ID='cc-runtime-gm-tools';
const DELETE_ID='cc-delete-character';
const subs=new Map<string,()=>void>();

function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
 @media(max-width:720px){
  .app>nav{scroll-behavior:smooth!important;touch-action:pan-x!important;scroll-snap-type:none!important;overscroll-behavior-x:auto!important;padding-bottom:12px!important}
  .app>nav button{min-width:max-content!important;max-width:none!important;white-space:nowrap!important;scroll-snap-align:none!important}
  .app>main{scroll-margin-top:76px!important}
 }
 .dragon-mark{background-image:url('/brand/app-icon.svg')!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important}
 .cc-runtime-panel{margin:16px 0;padding:16px;border:1px solid rgba(230,171,82,.35);border-radius:14px;background:rgba(19,17,18,.92)}
 .cc-runtime-panel h3{margin:0 0 8px}.cc-runtime-panel p{opacity:.82}
 .cc-runtime-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin:12px 0}
 .cc-runtime-output{margin-top:12px;padding:13px;border-radius:12px;background:rgba(0,0,0,.22);white-space:pre-wrap;line-height:1.5}
 .cc-runtime-announcement{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:10px}.cc-runtime-announcement textarea{min-height:78px;resize:vertical}
 .cc-runtime-announcement select{grid-column:1/-1}
 .cc-danger{border-color:#b94b43!important;color:#ffd9d5!important}
 .cc-toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:99999;width:min(560px,calc(100vw - 24px));padding:16px 18px;border-radius:15px;border:1px solid #e8ad55;background:#211610;color:#fff4dc;box-shadow:0 18px 60px rgba(0,0,0,.55);font-weight:800;text-align:center;animation:ccToastIn .28s ease-out}
 @keyframes ccToastIn{from{transform:translate(-50%,-18px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
 .cc-dice-tray{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;pointer-events:none;background:rgba(0,0,0,.18);backdrop-filter:blur(1px)}
 .cc-dice-box{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;max-width:min(680px,94vw);padding:24px}
 .cc-die{width:88px;height:88px;filter:drop-shadow(0 15px 12px rgba(0,0,0,.55));animation:ccTumble .9s cubic-bezier(.2,.75,.25,1)}
 .cc-die svg{width:100%;height:100%;overflow:visible}.cc-die polygon{fill:#26170f;stroke:#f0b65f;stroke-width:3}.cc-die line{stroke:#9a6535;stroke-width:2}.cc-die text{fill:#fff3d6;font:800 25px system-ui;text-anchor:middle;dominant-baseline:middle}
 @keyframes ccTumble{0%{transform:translateY(-46vh) rotate(0deg) scale(.72)}35%{transform:translateY(18px) rotate(410deg) scale(1.06)}58%{transform:translateY(-48px) rotate(570deg)}78%{transform:translateY(8px) rotate(675deg)}100%{transform:translateY(0) rotate(720deg) scale(1)}}
 `;document.head.appendChild(style);
}

function scrollActiveSection(button:HTMLElement){
 if(!matchMedia('(max-width:720px)').matches)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  button.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  const main=document.querySelector('.app>main') as HTMLElement|null;if(!main)return;
  const nav=document.querySelector('.app>nav') as HTMLElement|null;
  const y=window.scrollY+main.getBoundingClientRect().top-(nav?.offsetHeight||58)-8;
  window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
 }));
}

function fixNavigation(){
 const nav=document.querySelector('.app>nav');if(!nav||nav.getAttribute('data-cc-fixed'))return;
 nav.setAttribute('data-cc-fixed','true');nav.addEventListener('click',e=>{const b=(e.target as Element)?.closest('button') as HTMLElement|null;if(b)setTimeout(()=>scrollActiveSection(b),20)},true);
}

function fixBrandingAndFooter(){
 document.querySelectorAll<HTMLElement>('.dragon-mark').forEach(el=>{el.style.backgroundImage="url('/brand/app-icon.svg')"});
 const footer=document.querySelector('.app>footer, footer') as HTMLElement|null;
 if(footer&&!footer.querySelector('[data-gdf-copyright]')){const line=document.createElement('div');line.dataset.gdfCopyright='true';line.textContent='© 2026 Ginger Dragon Fire Studios';line.style.cssText='margin-top:10px;opacity:.78;font-size:12px;text-align:center';footer.appendChild(line)}
 document.querySelectorAll<HTMLElement>('button,span,div,p').forEach(el=>{if(el.children.length===0&&el.textContent?.trim()==='Roadmap Build')el.remove()});
}

const pick=<T,>(a:T[])=>a[Math.floor(Math.random()*a.length)];
const first=['Mara','Tobias','Juno','Rook','Sable','Dex','Vera','Milo','Iris','Knox','Penny','Ash'];
const last=['Vance','Holloway','Quill','Morrow','Stone','Vale','Mercer','Crowe','Kestrel','Briggs'];
const jobs=['scavenger','floor medic','black-market cook','retired crawler','trap technician','merchant','cartographer','monster handler','System clerk','mercenary'];
const quirks=['whispers when nervous','collects broken keys','never removes one glove','laughs at danger','keeps meticulous receipts','is terrified of harmless birds','claims to know a secret shortcut','speaks to an invisible friend'];
const rooms=['collapsed banquet hall','flooded maintenance tunnel','abandoned gift shop','mirror-lined chapel','monster nursery','silent casino','overgrown transit station','burned-out kitchen','clockwork archive','fake suburban living room'];
const hazards=['pressure plates hidden under debris','a ceiling predator waiting for noise','poison mist released by opening the wrong door','a floor that tilts toward a grinder','an alarm that summons patrols','unstable magical lighting that changes gravity'];
const rewards=['a locked bronze loot box','a cache of healing consumables','a strange quest token','a map fragment','an uncommon crafting bundle','a suspiciously valuable key'];
const quests=['escort a terrified NPC to the saferoom','recover a stolen System token','destroy a monster nest before the timer expires','find three missing crawlers','steal a ledger from a hostile faction','repair a broken floor mechanism'];
const twists=['the apparent villain is protecting someone','the objective moves every ten minutes','another party has the same objective','the reward is sentient','the quest giver is lying about one important detail','completion opens a much worse route'];
const enemies=['goblin demolition crew','armored rat swarm','cultist security team','mutated kitchen staff','clockwork executioners','possessed mannequins','fungal hounds','mini-boss and two shield drones'];

function genNPC(){return `NPC: ${pick(first)} ${pick(last)}\nRole: ${pick(jobs)}\nPersonality: ${pick(quirks)}.\nWant: ${pick(['safe passage','a specific monster killed','medicine','a missing friend found','proof of a conspiracy','a valuable item delivered'])}.\nSecret: ${pick(['owes the System a debt','has a hidden floor map','is working for a rival faction','knows a shortcut to the boss','stole the item they are asking you to find'])}.`}
function genRoom(){return `ROOM: ${pick(rooms).toUpperCase()}\nFeature: ${pick(['flickering red System panels','waist-high cover','a locked service door','strange footprints','a disabled vending machine','a deep central pit'])}.\nHazard: ${pick(hazards)}.\nReward/Clue: ${pick(rewards)}.`}
function genQuest(){return `QUEST: ${pick(quests)}.\nComplication: ${pick(twists)}.\nReward: ${pick(rewards)} plus ${pick(['popularity','AI Favor','a temporary buff','access to a hidden room','information about the floor boss'])}.`}
function genEncounter(){return `ENCOUNTER: ${pick(enemies)}\nLocation: ${pick(rooms)}.\nPressure: ${pick(['a 6-round timer','civilians in the crossfire','reinforcements arrive if an alarm sounds','the exit seals when combat starts','terrain changes every round'])}.\nTactical feature: ${pick(['explosive scenery','elevated firing positions','moving cover','hazard zones','a usable trap control panel'])}.`}

async function loadCampaignOptions(select:HTMLSelectElement){
 try{const campaigns=await cloudListCampaigns();select.innerHTML='';for(const c of campaigns as any[]){const o=document.createElement('option');o.value=c.id;o.textContent=`${c.title||c.name||'Campaign'}${c.role?' · '+String(c.role).toUpperCase():''}`;select.appendChild(o)}if(!campaigns.length){const o=document.createElement('option');o.textContent='No cloud campaign found';o.value='';select.appendChild(o)}}catch{select.innerHTML='<option value="">Log in to use announcements</option>'}
}

function showToast(message:string){document.querySelector('.cc-toast')?.remove();const t=document.createElement('div');t.className='cc-toast';t.textContent=`📢 ANNOUNCEMENT — ${message}`;document.body.appendChild(t);try{const ctx=new AudioContext();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=660;g.gain.setValueAtTime(.06,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.45);o.start();o.stop(ctx.currentTime+.45)}catch{}setTimeout(()=>t.remove(),6500)}

async function ensureAnnouncementSubscriptions(){
 try{const campaigns=await cloudListCampaigns() as any[];for(const c of campaigns){if(subs.has(c.id))continue;subs.set(c.id,cloudSubscribeCampaign(c.id,(event:any)=>{if(event?.event_type==='announcement'&&event?.payload?.message)showToast(String(event.payload.message))}))}}catch{}
}

function injectGMTools(){
 if(document.getElementById(GM_ID))return;
 const main=document.querySelector('.app>main') as HTMLElement|null;if(!main||!/GM Command Center|GM Tools/i.test(main.innerText))return;
 const panel=document.createElement('section');panel.id=GM_ID;panel.className='cc-runtime-panel';panel.innerHTML=`<h3>GM Quick Tools</h3><p>Ready-to-use generators and live campaign announcements.</p><div class="cc-runtime-grid"><button data-gen="npc">🧑 Generate NPC</button><button data-gen="room">🚪 Generate Room</button><button data-gen="quest">📜 Generate Quest</button><button data-gen="encounter">⚔️ Generate Encounter</button></div><div class="cc-runtime-output" hidden></div><h3 style="margin-top:18px">📢 Push Announcement</h3><div class="cc-runtime-announcement"><select aria-label="Announcement campaign"></select><textarea aria-label="Announcement message" placeholder="The System has an announcement…"></textarea><button data-announce>Push to Players</button></div><p class="cc-announce-status" aria-live="polite"></p>`;
 main.prepend(panel);const output=panel.querySelector('.cc-runtime-output') as HTMLElement;panel.querySelectorAll<HTMLButtonElement>('[data-gen]').forEach(b=>b.onclick=()=>{const k=b.dataset.gen;output.hidden=false;output.textContent=k==='npc'?genNPC():k==='room'?genRoom():k==='quest'?genQuest():genEncounter()});
 const select=panel.querySelector('select')!;void loadCampaignOptions(select);panel.querySelector<HTMLButtonElement>('[data-announce]')!.onclick=async()=>{const text=(panel.querySelector('textarea') as HTMLTextAreaElement).value.trim();const status=panel.querySelector('.cc-announce-status') as HTMLElement;if(!select.value){status.textContent='Choose or create a cloud campaign first.';return}if(!text){status.textContent='Type an announcement first.';return}try{await cloudPushEvent(select.value,'announcement',{message:text,icon:'📢',sound:true});status.textContent='✓ Announcement pushed live.';(panel.querySelector('textarea') as HTMLTextAreaElement).value=''}catch(e){status.textContent=`Could not push announcement: ${e instanceof Error?e.message:String(e)}`}};
}

function activeCharacterName(){
 const bar=document.querySelector('.character-bar') as HTMLElement|null;if(bar){const candidates=[...bar.querySelectorAll('button,b,strong,select option:checked')].map(x=>x.textContent?.trim()).filter(Boolean) as string[];const n=candidates.find(x=>x&&!/character|switch|new|add|cloud|save|side/i.test(x));if(n)return n}
 const hero=document.querySelector('.app>main .hero h2,.app>main h2')?.textContent?.trim();return hero&&hero!=='Character'?hero:'';
}
function scrub(value:any,name:string):any{
 if(Array.isArray(value))return value.filter(v=>!(typeof v==='object'&&v&&String(v.name||'').trim()===name)).map(v=>typeof v==='string'&&v.trim()===name?'':scrub(v,name));
 if(value&&typeof value==='object'){if(String(value.name||'').trim()===name)return null;const out:any={};for(const [k,v] of Object.entries(value))out[k]=scrub(v,name);return out}return value;
}
async function deleteActiveCharacter(){
 const name=activeCharacterName();if(!name){alert('I could not identify the active character. Open that character first and try again.');return}if(!confirm(`Delete ${name}? This removes the character from this device, cloud backup, Party references, and GM selectors.`))return;
 try{const cloud=await cloudListCharacters();for(const c of cloud as any[])if(String(c.name||'').trim()===name&&c.id)await cloudDeleteCharacter(c.id)}catch{}
 for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(!key||!/crawler|character|party|gm/i.test(key))continue;const raw=localStorage.getItem(key);if(!raw)continue;try{const parsed=JSON.parse(raw);const cleaned=scrub(parsed,name);if(cleaned===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(cleaned))}catch{if(raw.trim()===name)localStorage.removeItem(key)}}
 location.reload();
}
function injectDeleteCharacter(){
 if(document.getElementById(DELETE_ID))return;const bar=document.querySelector('.character-bar') as HTMLElement|null;if(!bar)return;const b=document.createElement('button');b.id=DELETE_ID;b.className='cc-danger';b.textContent='🗑 Delete Character';b.title='Delete active character everywhere';b.onclick=()=>void deleteActiveCharacter();bar.appendChild(b);
}

function dieSvg(sides:number,label:string){const pts=sides===4?'50,6 94,86 6,86':sides===6?'14,14 86,14 86,86 14,86':sides===8?'50,5 94,50 50,95 6,50':'50,4 91,27 88,76 50,96 12,76 9,27';return `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="${pts}"/><line x1="50" y1="8" x2="50" y2="92" opacity=".45"/><line x1="10" y1="50" x2="90" y2="50" opacity=".35"/><text x="50" y="52">${label}</text></svg>`}
function animateDice(button:HTMLElement){const m=button.textContent?.match(/(\d+)d(4|6|8|10|12|20|100)/i);if(!m)return;const count=Math.max(1,Math.min(20,Number(m[1]))),sides=Number(m[2]);document.querySelector('.cc-dice-tray')?.remove();const tray=document.createElement('div');tray.className='cc-dice-tray';const box=document.createElement('div');box.className='cc-dice-box';for(let i=0;i<Math.min(count,6);i++){const d=document.createElement('div');d.className='cc-die';d.style.animationDelay=`${i*55}ms`;d.innerHTML=dieSvg(sides,`d${sides}`);box.appendChild(d)}if(count>6){const more=document.createElement('div');more.className='cc-die';more.innerHTML=dieSvg(20,`+${count-6}`);box.appendChild(more)}tray.appendChild(box);document.body.appendChild(tray);setTimeout(()=>tray.remove(),1250)}
function bindDice(){document.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{if(b.dataset.ccDice)return;if(/Roll\s+\d+d(?:4|6|8|10|12|20|100)/i.test(b.textContent||'')){b.dataset.ccDice='1';b.addEventListener('click',()=>animateDice(b),true)}})}

function enhance(){addStyles();fixNavigation();fixBrandingAndFooter();injectGMTools();injectDeleteCharacter();bindDice();void ensureAnnouncementSubscriptions()}
const observer=new MutationObserver(enhance);observer.observe(document.documentElement,{subtree:true,childList:true});addEventListener('DOMContentLoaded',enhance,{once:true});setTimeout(enhance,250);setInterval(()=>void ensureAnnouncementSubscriptions(),15000);
