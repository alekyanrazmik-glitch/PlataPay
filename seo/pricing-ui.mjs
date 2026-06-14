// Shared mobile/catalog/modal and service pricing UI applied at build time.
// Keep this file framework-free: it is injected into Tilda pages and SEO pages.

const ACCENTS = ['#2e7bff', '#10A37F', '#CC785C', '#1DB954', '#FF0000', '#A259FF', '#5865F2', '#00C4CC', '#ff6a3d'];

export function serviceAccent(service) {
  const key = (service?.slug || service?.name || '').toString();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export function buildPricingUi() {
  return `
<style id="pp-pricing-ui">
  :root{--svc-accent-safe:var(--svc-accent,var(--accent,#2e7bff));--svc-accent-soft:color-mix(in srgb,var(--svc-accent-safe) 18%,transparent);--svc-accent-line:color-mix(in srgb,var(--svc-accent-safe) 46%,#1d3a6b);}
  html,body{max-width:100%;}

  /* Service/tariff pages: native plan picker style */
  .pp-service-mark{display:flex;align-items:center;gap:14px;margin:0 0 18px;padding:14px;border:1px solid var(--svc-accent-line);border-radius:18px;background:linear-gradient(135deg,var(--svc-accent-soft),rgba(12,31,64,.74));box-shadow:0 18px 55px -34px var(--svc-accent-safe);} 
  .pp-service-mark img{width:62px;height:62px;border-radius:16px;object-fit:contain;background:#fff;padding:8px;box-shadow:0 16px 42px -26px var(--svc-accent-safe);} 
  .pp-service-mark b{display:block;color:#eef3ff;font-size:20px;line-height:1.15;letter-spacing:-.02em;} 
  .pp-service-mark span{display:block;color:#9fb2d4;font-size:13px;margin-top:3px;}
  .tiers{list-style:none !important;padding:0 !important;margin:14px 0 4px !important;display:grid;gap:10px;}
  .tiers li{position:relative;margin:0 !important;padding:15px 46px 15px 16px !important;border:1px solid var(--svc-accent-line);border-radius:16px;background:linear-gradient(135deg,rgba(12,31,64,.96),var(--svc-accent-soft));color:#eef3ff;font-weight:750;box-shadow:0 14px 44px -34px var(--svc-accent-safe);}
  .tiers li::before{content:"";position:absolute;right:16px;top:50%;width:18px;height:18px;border-radius:50%;transform:translateY(-50%);border:2px solid var(--svc-accent-safe);box-shadow:0 0 0 4px var(--svc-accent-soft);}
  .tiers li:first-child::after{content:"";position:absolute;right:21px;top:50%;width:8px;height:8px;border-radius:50%;transform:translateY(-50%);background:var(--svc-accent-safe);}
  .order{border-color:var(--svc-accent-line) !important;box-shadow:0 22px 70px -46px var(--svc-accent-safe);}
  .order::before{content:"";display:block;width:46px;height:4px;border-radius:999px;background:var(--svc-accent-safe);opacity:.75;margin:0 0 16px;}
  .order button,.btn-primary,.cta-btn{background:linear-gradient(180deg,color-mix(in srgb,var(--svc-accent-safe) 92%,#fff),color-mix(in srgb,var(--svc-accent-safe) 76%,#06142b)) !important;box-shadow:0 14px 36px -20px var(--svc-accent-safe);} 
  .order select:focus,.order input:focus{border-color:var(--svc-accent-safe) !important;box-shadow:0 0 0 3px var(--svc-accent-soft);} 

  /* Catalog mobile */
  @media(max-width:520px){
    html,body,#allrecords,.t-records{overflow-x:hidden !important;width:100%;max-width:100%;}
    .pp-services,.pp-services *{max-width:100%;}
    .pp-services{overflow-x:hidden !important;}
    .pp-services .t-container,.pp-services .t-container_100,.pp-services .t-width,.pp-services .t-width_100{max-width:100% !important;width:100% !important;}
    .pp-services-inner{padding:16px 12px 44px !important;overflow:hidden;width:100% !important;}
    .pp-layout{display:grid !important;grid-template-columns:1fr !important;gap:14px !important;}
    .pp-main{min-width:0;width:100%;}
    .pp-title{font-size:30px !important;margin-bottom:8px !important;}
    .pp-subtitle{font-size:14px !important;margin-bottom:16px !important;}
    .pp-cats{position:relative !important;top:auto !important;display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px !important;overflow-x:auto !important;overflow-y:hidden !important;width:auto !important;max-width:none !important;margin:0 -12px 18px !important;padding:2px 12px 10px !important;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;overscroll-behavior-x:contain;}
    .pp-cats::-webkit-scrollbar{display:none;}
    .pp-cat{flex:0 0 auto !important;width:auto !important;white-space:nowrap !important;scroll-snap-align:start;padding:9px 12px !important;border-radius:999px !important;font-size:13px !important;}
    .pp-cat .cnt{display:none !important;}
    .pp-search{width:100% !important;max-width:none !important;margin:0 0 18px !important;padding:0 12px !important;border-radius:14px !important;}
    .pp-search input{font-size:16px !important;line-height:20px !important;min-height:46px !important;padding:12px 0 !important;-webkit-appearance:none;}
    .pp-search:focus-within{border-color:var(--accent,#2e7bff) !important;box-shadow:0 0 0 4px rgba(46,123,255,.18);}
    .pp-grid{gap:20px !important;}
    .pp-sec-grid{display:grid !important;grid-template-columns:minmax(0,1fr) !important;gap:12px !important;width:100% !important;}
    .pp-card{height:auto !important;min-height:148px !important;width:100% !important;max-width:100% !important;padding:15px !important;}
    .pp-head,.pp-name,.pp-desc,.pp-price{min-width:0;}
  }

  /* Bottom sheets for compact screens */
  @media(max-width:520px){
    .pp-mm-mask,.ppf-overlay,.ppi-overlay,.ppo-overlay,.ppp-overlay,.t-popup{align-items:flex-end !important;justify-content:center !important;padding:12px max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left)) !important;overflow:hidden !important;}
    .pp-mm-modal,.ppf-modal,.ppi-modal,.ppo-modal,.ppp-modal,.t-popup__container{width:100% !important;max-width:none !important;max-height:calc(100dvh - 24px) !important;overflow:auto !important;border-radius:22px 22px 16px 16px !important;margin:0 !important;padding-bottom:calc(20px + env(safe-area-inset-bottom)) !important;-webkit-overflow-scrolling:touch;}
    .pp-mm-modal::before,.ppf-modal::before,.ppi-modal::before,.ppo-modal::before,.ppp-modal::before,.t-popup__container::before{content:"";display:block;width:42px;height:4px;border-radius:999px;background:rgba(255,255,255,.28);margin:0 auto 14px;}
  }
</style>
<script id="pp-pricing-ui-js">
(function(){
  function closeBurger(){
    var nav=document.getElementById('ppNav');
    var burger=document.getElementById('ppBurger');
    if(nav) nav.classList.remove('open');
    if(burger) burger.classList.remove('open');
    document.documentElement.classList.remove('pp-menu-open');
  }
  document.addEventListener('click',function(e){
    var link=e.target.closest && e.target.closest('#ppNav a');
    if(link) closeBurger();
  },true);
  window.addEventListener('resize',function(){ if(window.innerWidth>900) closeBurger(); },{passive:true});

  function enhanceOrderCards(){
    document.querySelectorAll('.order[data-service]').forEach(function(card){
      if(card.dataset.ppPlanEnhanced) return;
      card.dataset.ppPlanEnhanced='1';
      var logo=card.getAttribute('data-logo');
      var service=card.getAttribute('data-service')||'Сервис';
      var accent=card.getAttribute('data-accent');
      if(accent) card.style.setProperty('--svc-accent',accent);
      if(logo){
        var mark=document.createElement('div');
        mark.className='pp-service-mark';
        mark.innerHTML='<img src="'+logo+'" alt=""><div><b>'+service+'</b><span>Выберите тариф и оставьте контакт</span></div>';
        card.insertBefore(mark,card.firstChild);
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhanceOrderCards); else enhanceOrderCards();
})();
</script>`;
}
