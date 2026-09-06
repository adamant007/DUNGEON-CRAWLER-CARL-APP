const NativeMutationObserver=window.MutationObserver;
class CcMutationObserver extends NativeMutationObserver{
  constructor(cb:MutationCallback){
    super((mutations,obs)=>{
      const meaningful=mutations.filter(m=>{
        const nodes=[...Array.from(m.addedNodes),...Array.from(m.removedNodes)] as Node[];
        if(!nodes.length)return true;
        return !nodes.every(n=>{
          if(!(n instanceof Element))return false;
          return n.id==='cc-spell-system'||!!n.closest?.('#cc-spell-system')||!!n.querySelector?.('#cc-spell-system');
        });
      });
      if(meaningful.length)cb(meaningful,obs);
    });
  }
}
(window as any).MutationObserver=CcMutationObserver;
let seq=0;
function normalizeField(el:HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement){
  if(el.id&&el.name)return;
  const base=(el.getAttribute('data-extra')||el.getAttribute('data-cc-field')||el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.type||el.tagName).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'field';
  const id=el.id||`cc-${base}-${++seq}`;
  el.id=id;if(!el.name)el.name=id;
}
function scan(root:ParentNode=document){root.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input,select,textarea').forEach(normalizeField)}
const observer=new NativeMutationObserver(ms=>{for(const m of ms)for(const n of Array.from(m.addedNodes))if(n instanceof Element){if(n.matches('input,select,textarea'))normalizeField(n as any);scan(n)}});
observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(),{once:true});else scan();
export {scan as normalizeFormFields};
