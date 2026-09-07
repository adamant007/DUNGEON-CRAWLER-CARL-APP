const STYLE='cc-exact-brand-banner-style';

function apply(){
  if(document.getElementById(STYLE))return;
  const s=document.createElement('style');
  s.id=STYLE;
  s.textContent=`
    #cc-character-dashboard-v2 .cc2-banner{
      min-height:180px!important;
      position:relative!important;
      overflow:hidden!important;
      background:linear-gradient(90deg,#170b07 0%,#0b1018 62%,#090b10 100%)!important;
    }
    #cc-character-dashboard-v2 .cc2-banner::after{display:none!important}
    #cc-character-dashboard-v2 .cc2-banner .cc-final-banner-image{
      position:absolute!important;
      right:18px!important;
      top:50%!important;
      transform:translateY(-50%)!important;
      width:168px!important;
      height:168px!important;
      object-fit:contain!important;
      object-position:center!important;
      display:block!important;
      z-index:1!important;
      filter:none!important;
    }
    #cc-character-dashboard-v2 .cc2-banner::before{
      content:""!important;
      position:absolute!important;
      inset:0!important;
      z-index:2!important;
      pointer-events:none!important;
      background:linear-gradient(90deg,rgba(13,8,6,.98) 0%,rgba(13,8,6,.9) 45%,rgba(13,8,6,.22) 72%,rgba(13,8,6,0) 100%)!important;
    }
    #cc-character-dashboard-v2 .cc2-banner .cc2-brand{position:relative!important;z-index:3!important}
    @media(max-width:760px){
      #cc-character-dashboard-v2 .cc2-banner{min-height:150px!important}
      #cc-character-dashboard-v2 .cc2-banner .cc-final-banner-image{
        right:8px!important;
        width:138px!important;
        height:138px!important;
      }
      #cc-character-dashboard-v2 .cc2-banner::before{
        background:linear-gradient(90deg,rgba(13,8,6,.98) 0%,rgba(13,8,6,.9) 48%,rgba(13,8,6,.3) 72%,rgba(13,8,6,0) 100%)!important;
      }
    }
  `;
  document.head.appendChild(s);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
export {apply as applyExactBrandBanner};
