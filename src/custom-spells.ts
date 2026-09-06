const CUSTOM_PANEL_ID='cc-custom-spells';

type CustomSpell={name:string;mana:number;range:string;duration:string;cooldown:string;tags:string[];rarity:string;effect:string;upgrade:string};
const pick=<T,>(a:T[])=>a[Math.floor(Math.random()*a.length)];
const prefixes=['Static','Ember','Grave','Mirror','Velvet','Thunder','Ashen','Crooked','Neon','Vacuum','Phantom','Shatter','Lucky','Unstable'];
const nouns=['Lance','Halo','Snare','Burst','Ward','Handshake','Spiral','Beacon','Hook','Veil','Palm','Pulse','Door','Echo'];
const tags=[['Attack','Electric'],['Attack','Fire'],['Attack','Force'],['Attack','Necrotic'],['Utility'],['Defense'],['Control'],['Movement'],['Heal'],['Area of Effect']];
const ranges=['Self only','Melee','15 feet','30 feet','40 feet','60 feet','Line of sight','10ft Burst'];
const durations=['Instant','1 round','2 rounds','1 minute','5 minutes'];
const cooldowns=['None','Once per round','3 rounds','5 minutes','1 hour'];
const rarities=['Common','Uncommon','Rare','Epic','Legendary'];
const effects=[
 'Deal 1d6 + Int damage and shove the target 5 feet.',
 'Create a temporary shield worth 2 Health Bar slots.',
 'Teleport the caster up to 15 feet to a visible unoccupied space.',
 'Bind one target in place until it succeeds on a check or takes damage.',
 'Restore 1d4 Health Bar slots to one valid target.',
 'Create a 10ft zone that imposes Disadvantage on hostile movement checks.',
 'Mark one target; the next successful attack against it deals +1d6 damage.',
 'Create a decoy image that draws attention until struck or dismissed.',
 'Pull one unattended object or willing ally up to 15 feet toward you.',
 'Silence a 10ft area for one round.'
];
const upgrades=[
 'Rank 5: +1 effect die. Rank 10: improved range. Rank 15: affects one additional target.',
 'Rank 5: +5ft range. Rank 10: reduce Mana cost by 1. Rank 15: double duration.',
 'Rank 5: add a minor debuff. Rank 10: +1d6 effect. Rank 15: becomes Area of Effect.',
 'Rank 5: +1 Health Bar slot. Rank 10: removes one Minor Debuff. Rank 15: affects the whole party in a small burst.'
];

function inventSpell():CustomSpell{
 const tag=pick(tags);return {name:`${pick(prefixes)} ${pick(nouns)}`,mana:Math.max(1,Math.floor(Math.random()*14)+2),range:pick(ranges),duration:pick(durations),cooldown:pick(cooldowns),tags:tag,rarity:pick(rarities),effect:pick(effects),upgrade:pick(upgrades)};
}
function renderSpell(s:CustomSpell,form:'spell'|'scroll'|'spellbook'){
 const head=form==='scroll'?`📜 Scroll of ${s.name} (Rank ${Math.floor(Math.random()*5)+1})`:form==='spellbook'?`📕 Spellbook of ${s.name}`:`✨ ${s.name}`;
 const mana=form==='scroll'?'No Mana cost when used':`${s.mana} Mana`;
 const consume=form==='scroll'?'One use; turns to dust after casting.':form==='spellbook'?'Reading teaches the spell, then the book disappears.':'Original permanent spell concept.';
 return `${head}\nCUSTOM · ${s.rarity}\n${s.tags.join(' · ')}\n${mana} · Range ${s.range}\nDuration ${s.duration} · Cooldown ${s.cooldown}\nEffect: ${s.effect}\n${s.upgrade}\n${consume}`;
}
function inject(){
 const gm=document.getElementById('cc-runtime-gm-tools');if(!gm||document.getElementById(CUSTOM_PANEL_ID))return;
 const wrap=document.createElement('div');wrap.id=CUSTOM_PANEL_ID;wrap.innerHTML=`<h3 style="margin-top:18px">✨ Original Spell Lab</h3><p>Create clearly-labeled original magic without mixing it with official rulebook spells.</p><div class="cc-runtime-grid"><button data-custom-spell>✨ Invent Spell</button><button data-custom-scroll>📜 Invent Scroll</button><button data-custom-book>📕 Invent Spellbook</button></div><div class="cc-runtime-output" data-custom-output hidden></div>`;
 gm.appendChild(wrap);const out=wrap.querySelector('[data-custom-output]') as HTMLElement;
 const go=(form:'spell'|'scroll'|'spellbook')=>{out.hidden=false;out.textContent=renderSpell(inventSpell(),form)};
 (wrap.querySelector('[data-custom-spell]') as HTMLButtonElement).onclick=()=>go('spell');
 (wrap.querySelector('[data-custom-scroll]') as HTMLButtonElement).onclick=()=>go('scroll');
 (wrap.querySelector('[data-custom-book]') as HTMLButtonElement).onclick=()=>go('spellbook');
}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;inject()})}).observe(document.documentElement,{subtree:true,childList:true});setTimeout(inject,700);

export { inventSpell, renderSpell };
