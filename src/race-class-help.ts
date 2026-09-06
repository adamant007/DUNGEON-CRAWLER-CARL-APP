const STYLE_ID='cc-race-class-help-style';
const BUBBLE_ID='cc-choice-help-bubble';

type Kind='race'|'class';

const raceHelp:Record<string,string>={
 human:'Adaptable and flexible. A strong all-around choice when you want freedom to shape the crawler around equipment, skills, and play style.',
 dwarf:'Tough, durable, and built for dangerous close-quarters exploration. Usually a natural fit for defensive or strength-focused builds.',
 elf:'Quick and precise, with a natural lean toward agility, awareness, and magical or ranged approaches.',
 halfling:'Small, nimble, and difficult to pin down. A good fit for clever, mobile, luck-driven play.',
 gnome:'Inventive and resourceful, favoring clever solutions, unusual tools, and magical or technical tricks.',
 orc:'Powerful and direct, favoring physical strength, durability, and aggressive combat.',
 goblin:'Fast, opportunistic, and unpredictable. Well suited to traps, scavenging, mobility, and improvised tactics.',
 kobold:'Small and cunning, with a natural talent for teamwork, traps, tunnels, and making dangerous places work in their favor.',
 dragonborn:'A physically imposing draconic ancestry that typically mixes martial toughness with an innate elemental or supernatural edge.',
 tiefling:'A supernatural ancestry often suited to magic, social pressure, resistance, and unconventional problem solving.',
 aasimar:'A radiant supernatural ancestry often associated with resilience, support, and bursts of extraordinary power.',
 catfolk:'Fast, alert, and agile, favoring movement, reflexes, and precision.',
 ratfolk:'Resourceful and difficult to corner, favoring scavenging, agility, and survival in cramped or hazardous spaces.'
};

const classHelp:Record<string,string>={
 fighter:'A straightforward combat specialist built around reliable weapon damage, armor, and staying power.',
 warrior:'A durable front-line combatant focused on weapons, toughness, and consistent physical pressure.',
 barbarian:'An aggressive front-line class built around raw power, durability, and explosive melee damage.',
 rogue:'A mobile precision class that excels at positioning, opportunistic damage, stealth, traps, and utility.',
 ranger:'A mobile weapon specialist with strong ranged or skirmishing potential plus exploration utility.',
 wizard:'A broad magical specialist with powerful spell options and high versatility, balanced by greater dependence on resources and positioning.',
 sorcerer:'An innate spellcaster focused on forceful, flexible magic and strong magical offense.',
 warlock:'A supernatural caster that combines repeatable magical offense with unusual powers and utility.',
 cleric:'A resilient divine caster combining support, recovery, defensive magic, and respectable combat ability.',
 paladin:'A durable martial-support class mixing weapon combat, protection, healing, and supernatural power.',
 druid:'A flexible nature-focused caster with control, recovery, utility, and transformation-style options.',
 bard:'A versatile support and utility class that strengthens allies, manipulates encounters, and contributes magic and skills.',
 monk:'A fast close-combat specialist built around mobility, repeated attacks, control, and defensive movement.',
 artificer:'A gear-focused specialist built around inventions, upgrades, tools, and magical technology.',
 necromancer:'A magic specialist focused on death-themed effects, minions, attrition, and battlefield control.',
 gunslinger:'A precision ranged combatant built around firearms, positioning, and high-impact attacks.',
 healer:'A support specialist focused on keeping the party alive, restoring resources, and preventing damage.',
 tank:'A defensive front-liner designed to absorb pressure, protect allies, and control enemy attention.'
};

function normalize(v:string){return v.trim().toLowerCase().replace(/[^a-z0-9]+/g,' ')}
function bestKnown(map:Record<string,string>,name:string){const n=normalize(name);if(map[n])return map[n];for(const [key,text] of Object.entries(map))if(n.includes(key)||key.includes(n))return text;return ''}
function generic(kind:Kind,name:string){return kind==='race'
 ? `${name} is your crawler's ancestry or species choice. It can shape appearance, identity, and any race-specific traits provided by the character creator.`
 : `${name} is your crawler's class or primary role. It can shape combat style, abilities, resource use, and how the character contributes to the party.`}
function description(kind:Kind,control:HTMLSelectElement|HTMLInputElement,name:string){
 if(control instanceof HTMLSelectElement){const o=control.selectedOptions[0];const supplied=o?.dataset.description||o?.getAttribute('title')||o?.getAttribute('aria-description');if(supplied)return supplied}
 const supplied=control.dataset.description||control.getAttribute('title')||control.getAttribute('aria-description');if(supplied)return supplied;
 const known=bestKnown(kind==='race'?raceHelp:classHelp,name);return known||generic(kind,name)
}
function addStyles(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 .cc-choice-help{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:26px!important;height:26px!important;min-width:26px!important;padding:0!important;margin-left:7px!important;border-radius:999px!important;font-weight:900!important;font-size:14px!important;line-height:1!important;vertical-align:middle!important;touch-action:manipulation}
 #${BUBBLE_ID}{position:fixed;z-index:100400;width:min(390px,calc(100vw - 24px));padding:15px 16px;border-radius:15px;border:1px solid rgba(232,173,85,.75);background:#1b140f;color:#fff5df;box-shadow:0 20px 60px rgba(0,0,0,.62);line-height:1.45}
 #${BUBBLE_ID} strong{display:block;font-size:16px;margin:0 28px 5px 0;color:#ffd38c}
 #${BUBBLE_ID} button{position:absolute;right:8px;top:8px;width:28px;height:28px;min-width:28px;padding:0;border-radius:999px}
 @media(max-width:600px){#${BUBBLE_ID}{left:12px!important;right:12px!important;bottom:14px!important;top:auto!important;width:auto!important}}
 `;document.head.appendChild(s)}
function close(){document.getElementById(BUBBLE_ID)?.remove()}
function show(btn:HTMLElement,kind:Kind,control:HTMLSelectElement|HTMLInputElement){
 close();const name=control instanceof HTMLSelectElement?(control.selectedOptions[0]?.textContent?.trim()||control.value):(control.value||`Selected ${kind}`);const b=document.createElement('div');b.id=BUBBLE_ID;b.setAttribute('role','dialog');b.setAttribute('aria-label',`${kind} description`);b.innerHTML=`<button type="button" aria-label="Close description">×</button><strong></strong><div></div>`;(b.querySelector('strong') as HTMLElement).textContent=name;(b.querySelector('div') as HTMLElement).textContent=description(kind,control,name);document.body.appendChild(b);(b.querySelector('button') as HTMLButtonElement).onclick=close;
 if(!matchMedia('(max-width:600px)').matches){const r=btn.getBoundingClientRect();const left=Math.min(innerWidth-b.offsetWidth-12,Math.max(12,r.left));const top=Math.min(innerHeight-b.offsetHeight-12,Math.max(12,r.bottom+8));b.style.left=`${left}px`;b.style.top=`${top}px`}
}
function labelText(el:Element){const id=(el as HTMLElement).id;const explicit=id?document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent||'':'';const parent=el.closest('label')?.textContent||'';return `${explicit} ${parent} ${(el as HTMLElement).getAttribute('aria-label')||''} ${(el as HTMLInputElement).name||''}`.toLowerCase()}
function kindFor(el:HTMLSelectElement|HTMLInputElement):Kind|null{const t=labelText(el);if(/\brace\b|ancestry|species/.test(t))return'race';if(/\bclass\b|archetype|profession/.test(t))return'class';return null}
function decorate(){
 document.querySelectorAll<HTMLSelectElement|HTMLInputElement>('main select,main input').forEach(control=>{const kind=kindFor(control);if(!kind||control.dataset.ccHelpDecorated)return;control.dataset.ccHelpDecorated='true';const btn=document.createElement('button');btn.type='button';btn.className='cc-choice-help';btn.textContent='?';btn.title=`Explain selected ${kind}`;btn.setAttribute('aria-label',`Explain selected ${kind}`);btn.dataset.ccChoiceHelp=kind;btn.onclick=e=>{e.preventDefault();e.stopPropagation();show(btn,kind,control)};control.insertAdjacentElement('afterend',btn)});
}
addStyles();decorate();let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})}).observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{const t=e.target as Element;if(!t.closest(`#${BUBBLE_ID},.cc-choice-help`))close()},true);

export { description };
