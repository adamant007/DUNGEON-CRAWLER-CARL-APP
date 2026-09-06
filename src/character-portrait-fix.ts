const STYLE_ID='cc-character-portrait-fix-style';

function installStyles(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
  @media(max-width:1100px){
    .app>main img[data-cc-character-portrait="true"],
    .app>main [class*="portrait" i] img,
    .app>main [class*="avatar" i] img,
    .app>main [class*="photo" i] img,
    .app>main img[class*="portrait" i],
    .app>main img[class*="avatar" i],
    .app>main img[class*="photo" i],
    .app>main img[alt*="character" i],
    .app>main img[alt*="crawler" i]{
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
      width:min(100%,460px)!important;
      max-width:100%!important;
      height:auto!important;
      max-height:72vh!important;
      aspect-ratio:auto!important;
      object-fit:contain!important;
      object-position:center!important;
      margin-inline:auto!important;
    }
    .app>main [data-cc-character-portrait-wrap="true"],
    .app>main [class*="portrait" i],
    .app>main [class*="avatar" i],
    .app>main [class*="photo" i]{
      height:auto!important;
      max-height:none!important;
      min-height:0!important;
      aspect-ratio:auto!important;
      overflow:visible!important;
      background-size:contain!important;
      background-position:center!important;
      background-repeat:no-repeat!important;
    }
  }
  `;
  document.head.appendChild(style);
}

function textSignature(el:Element){
  const parts=[el.id,el.className,el.getAttribute('alt'),el.getAttribute('aria-label'),el.getAttribute('title')]
    .map(v=>typeof v==='string'?v:'').join(' ').toLowerCase();
  return parts;
}

function likelyPortrait(img:HTMLImageElement){
  if(img.id==='cc-mobile-brand-image') return false;
  if(/brand|logo|icon|die|dice|loot/.test(textSignature(img))) return false;
  const own=textSignature(img);
  const parent=img.parentElement;
  const ancestry=[parent,parent?.parentElement,parent?.parentElement?.parentElement]
    .filter(Boolean).map(x=>textSignature(x as Element)).join(' ');
  if(/portrait|avatar|character.?image|character.?photo|crawler.?image|crawler.?photo|profile.?image/.test(`${own} ${ancestry}`)) return true;
  const src=img.currentSrc||img.src||'';
  const userImage=/^(data:image\/|blob:)/i.test(src);
  const substantial=(img.naturalWidth>=180&&img.naturalHeight>=180)||(img.width>=140&&img.height>=140);
  return userImage&&substantial;
}

function fixImage(img:HTMLImageElement){
  if(!likelyPortrait(img)) return;
  img.dataset.ccCharacterPortrait='true';
  img.style.setProperty('display','block','important');
  img.style.setProperty('visibility','visible','important');
  img.style.setProperty('opacity','1','important');
  img.style.setProperty('object-fit','contain','important');
  img.style.setProperty('object-position','center','important');
  img.style.setProperty('width','min(100%, 460px)','important');
  img.style.setProperty('max-width','100%','important');
  img.style.setProperty('height','auto','important');
  img.style.setProperty('max-height','72vh','important');
  img.style.setProperty('aspect-ratio','auto','important');
  const p=img.parentElement;
  if(p){
    p.dataset.ccCharacterPortraitWrap='true';
    p.style.setProperty('height','auto','important');
    p.style.setProperty('max-height','none','important');
    p.style.setProperty('overflow','visible','important');
    p.style.setProperty('aspect-ratio','auto','important');
  }
}

function fixBackgroundPortraits(){
  document.querySelectorAll<HTMLElement>('.app>main [class*="portrait" i],.app>main [class*="avatar" i],.app>main [class*="photo" i]').forEach(el=>{
    const bg=getComputedStyle(el).backgroundImage;
    if(bg&&bg!=='none'){
      el.style.setProperty('display','block','important');
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('background-size','contain','important');
      el.style.setProperty('background-position','center','important');
      el.style.setProperty('background-repeat','no-repeat','important');
      el.style.setProperty('height','auto','important');
      el.style.setProperty('min-height','280px','important');
      el.style.setProperty('max-height','72vh','important');
      el.style.setProperty('aspect-ratio','auto','important');
    }
  });
}

function apply(){
  installStyles();
  if(!matchMedia('(max-width:1100px)').matches) return;
  document.querySelectorAll<HTMLImageElement>('.app>main img').forEach(img=>{
    if(img.complete) fixImage(img);
    else img.addEventListener('load',()=>fixImage(img),{once:true});
  });
  fixBackgroundPortraits();
}

let queued=false;
function queue(){
  if(queued) return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;apply()});
}

new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style','class']});
window.addEventListener('resize',queue);
window.addEventListener('cc:character-updated',queue);
window.addEventListener('storage',queue);
setTimeout(apply,350);
setTimeout(apply,1000);

export { apply as fixCharacterPortraits };
