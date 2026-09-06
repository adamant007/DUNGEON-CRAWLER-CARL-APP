const STYLE='cc-character-dashboard-polish-style';
const HP='cc2-hp:';
const MP='cc2-mp:';
function name(){return document.querySelector('#cc-character-dashboard-v2 .cc2-name')?.textContent?.trim()||'Crawler'}
function k(p:string){return p+encodeURIComponent(name())}
function read(p:string,d:number){const n=Number(localStorage.getItem(k(p)));return Number.isFinite(n)?Math.max(0,Math.min(10,n)):d}
function write(p:string,n:number){localStorage.setItem(k(p),String(Math.max(0,Math.min(10,n))))}
function placeholder(){return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#24110d"/><stop offset="1" stop-color="#09111b"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="175" r="72" fill="#2c3541"/><path d="M75 455c12-110 68-165 125-165s113 55 125 165" fill="#2c3541"/><text x="200" y="475" text-anchor="middle" fill="#d8a654" font-size="22" font-family="serif">ADD PORTRAIT</text></svg>`)}`}
function style(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
#cc-character-dashboard-v2 .cc2-track{display:grid!important;grid-template-columns:repeat(10,minmax(20px,1fr))!important;gap:6px!important;height:30px!important}
#cc-character-dashboard-v2 .cc2-seg{display:block!important;height:30px!important;border-radius:5px!important;border:1px solid #465361!important;background:#121923!important;cursor:pointer!important}
#cc-character-dashboard-v2 .cc2-seg.hp.on{background:linear-gradient(180deg,#ff6858,#c7201e)!important;border-color:#ff796a!important;box-shadow:0 0 8px rgba(255,70,50,.35)!important}
#cc-character-dashboard-v2 .cc2-seg.mp.on{background:linear-gradient(180deg,#36d8ff,#1678df)!important;border-color:#62e2ff!important;box-shadow:0 0 8px rgba(35,177,255,.34)!important}
#cc-character-dashboard-v2 .cc2-resrow{grid-template-columns:86px minmax(0,1fr) 56px auto!important;gap:8px!important}
#cc-character-dashboard-v2 .cc2-resctrl{display:flex;gap:4px}
#cc-character-dashboard-v2 .cc2-resctrl button{width:32px;height:30px;border:1px solid var(--a);border-radius:7px;background:#121923;color:#fff;font-weight:900;font-size:18px;line-height:1;cursor:pointer}
@media(max-width:760px){#cc-character-dashboard-v2 .cc2-track{gap:3px!important;height:24px!important}#cc-character-dashboard-v2 .cc2-seg{height:24px!important}#cc-character-dashboard-v2 .cc2-resrow{grid-template-columns:60px minmax(0,1fr) 44px!important}.cc2-resctrl{grid-column:2/4;justify-content:flex-end}}
`;document.head.appendChild(s)}
function paint(row:Element,prefix:string,def:number){const val=read(prefix,def);const segs=[...row.querySelectorAll<HTMLElement>('.cc2-seg')];segs.forEach((el,i)=>{el.classList.toggle('on',i<val);el.onclick=()=>{write(prefix,i+1);apply()}});const label=row.querySelector('.cc2-resval') as HTMLElement|null;if(label)label.textContent=`${val} / 10`;let c=row.querySelector('.cc2-resctrl') as HTMLElement|null;if(!c){c=document.createElement('span');c.className='cc2-resctrl';c.innerHTML='<button type="button" data-minus aria-label="Decrease">−</button><button type="button" data-plus aria-label="Increase">+</button>';row.appendChild(c)};(c.querySelector('[data-minus]') as HTMLButtonElement).onclick=()=>{write(prefix,val-1);apply()};(c.querySelector('[data-plus]') as HTMLButtonElement).onclick=()=>{write(prefix,val+1);apply()}}
function apply(){style();const root=document.getElementById('cc-character-dashboard-v2');if(!root)return;root.querySelectorAll<HTMLImageElement>('.cc2-mini,.cc2-portrait').forEach(img=>{if(!img.src||img.src.includes('/brand/app-icon.svg')){img.src=placeholder();img.alt='Character portrait placeholder'}});const rows=[...root.querySelectorAll('.cc2-resrow')];if(rows[0])paint(rows[0],HP,7);if(rows[1])paint(rows[1],MP,4);root.querySelectorAll('option').forEach(o=>{if(o.textContent==='Ginger Fire')o.textContent='Dragon Gold'});const sel=root.querySelector('.cc2-theme') as HTMLSelectElement|null;if(sel&&sel.value==='Ginger Fire')sel.options[sel.selectedIndex].text='Dragon Gold'}
function q(ms=60){setTimeout(apply,ms)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>q(500),{once:true});else q(500);
document.addEventListener('click',e=>{if((e.target as Element)?.closest('[aria-label="Primary navigation"],.character-bar,[data-cc2-file],[data-cc2-theme]'))q(120)},true);
window.addEventListener('cc:character-updated',()=>q());window.addEventListener('cc-resource-change',()=>q());window.addEventListener('storage',()=>q());
export { apply as polishCharacterDashboard };
