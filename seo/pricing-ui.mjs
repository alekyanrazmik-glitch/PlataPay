import { SERVICES } from './data.mjs';

const RATE_RUB_PER_USD = 80;
const SERVICE_FEE_RUB = 1000;

const CUSTOM_ALIASES = {
  'adobe-cc': ['Adobe CC', 'Adobe', 'Adobe Creative Cloud'],
  'youtube-premium': ['YouTube', 'YouTube Premium'],
  spotify: ['Spotify', 'Spotify Premium'],
  canva: ['Canva', 'Canva Pro'],
  capcut: ['CapCut', 'CapCut Pro'],
  zoom: ['Zoom', 'Zoom Pro'],
  discord: ['Discord', 'Discord Nitro'],
  'proton-mail': ['Proton', 'Proton Mail'],
  'google-drive': ['Google Drive'],
  'ps-plus-turkey': ['PS Plus', 'PS Plus (Турция)'],
};

function rubFromUsd(usd) {
  return Math.round(usd * RATE_RUB_PER_USD + SERVICE_FEE_RUB);
}

function tierToData(tier) {
  const label = String(tier || '').trim() || 'Индивидуальный тариф';
  const match = label.match(/\$\s*(\d+(?:[.,]\d+)?)/);
  const usd = match ? Number(match[1].replace(',', '.')) : null;
  return { label, usd, rub: usd === null ? null : rubFromUsd(usd) };
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/premium|pro|plus|creative cloud|cc|тариф|подписка/g, '')
    .replace(/[^a-zа-я0-9]+/gi, '');
}

const pricingServices = SERVICES.map((service) => {
  const tiers = (service.tiers?.length ? service.tiers : ['Индивидуальный тариф']).map(tierToData);
  const priced = tiers.filter((tier) => tier.rub !== null);
  const aliases = Array.from(new Set([
    service.name,
    service.slug,
    norm(service.name),
    ...(CUSTOM_ALIASES[service.slug] || []),
  ].filter(Boolean)));

  return {
    slug: service.slug,
    name: service.name,
    cat: service.cat,
    logo: service.logo,
    aliases,
    tiers,
    minRub: priced.length ? Math.min(...priced.map((tier) => tier.rub)) : null,
  };
});

export function buildPricingUiPatch() {
  return `
<style id="pp-pricing-ui-style">
  .pp-price b,.pp-pc-price b{white-space:nowrap;}
  .pp-card:not(.pp-cta),.pp-pc{cursor:pointer;}
  .pp-tariff-mask{position:fixed;inset:0;z-index:100000;background:rgba(3,9,22,.78);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:18px;overflow-y:auto;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;}
  .pp-tariff-mask.open{display:flex;}
  .pp-tariff-modal{width:100%;max-width:720px;background:#0c1f40;border:1px solid #1d3a6b;border-radius:22px;color:#eef3ff;box-shadow:0 30px 90px rgba(0,0,0,.45);position:relative;padding:24px;}
  .pp-tariff-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:999px;background:rgba(255,255,255,.06);color:#9fb2d4;font-size:26px;line-height:1;cursor:pointer;}
  .pp-tariff-close:hover{background:rgba(255,255,255,.12);color:#fff;}
  .pp-tariff-title{font-size:25px;font-weight:800;letter-spacing:-.02em;margin:0 42px 6px 0;}
  .pp-tariff-sub{color:#9fb2d4;margin:0 0 18px;font-size:14px;line-height:1.45;}
  .pp-tariff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-top:16px;}
  .pp-tariff-card{border:1px solid #2563FF;border-radius:16px;background:#08172F;padding:16px;display:flex;flex-direction:column;gap:8px;min-height:150px;}
  .pp-tariff-name{font-weight:800;font-size:16px;line-height:1.25;}
  .pp-tariff-usd{color:#8499c0;font-size:13px;}
  .pp-tariff-rub{font-size:22px;font-weight:900;color:#fff;margin-top:auto;}
  .pp-tariff-note{font-size:12px;color:#8499c0;line-height:1.35;}
  .pp-tariff-pick{border:1px solid #39ff14;background:transparent;color:#39ff14;border-radius:11px;padding:10px 12px;font-weight:800;cursor:pointer;margin-top:4px;}
  .pp-tariff-pick:hover{background:rgba(57,255,20,.12);}
  .pp-checkout-box{border:1px solid #1d3a6b;background:#08172F;border-radius:16px;padding:16px;margin-top:16px;}
  .pp-checkout-summary{border:1px solid rgba(46,123,255,.45);background:rgba(46,123,255,.10);border-radius:13px;padding:12px 14px;margin-bottom:14px;}
  .pp-checkout-summary strong{display:block;margin-bottom:3px;}
  .pp-checkout-summary span{color:#9fb2d4;font-size:13px;}
  .pp-checkout-field{margin-bottom:12px;}
  .pp-checkout-field label{display:block;color:#9fb2d4;font-size:13px;margin-bottom:6px;}
  .pp-checkout-field input,.pp-checkout-field select{width:100%;box-sizing:border-box;background:#0c1f40;border:1px solid #1d3a6b;color:#eef3ff;border-radius:11px;padding:12px 13px;font:500 15px -apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif;}
  .pp-checkout-field input:focus,.pp-checkout-field select:focus{outline:none;border-color:#2e7bff;}
  .pp-checkout-row{display:grid;grid-template-columns:180px 1fr;gap:12px;}
  .pp-checkout-submit{width:100%;border:0;border-radius:13px;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;font-weight:800;font-size:16px;padding:14px;cursor:pointer;}
  .pp-checkout-back{width:100%;border:1px solid #1d3a6b;border-radius:13px;background:transparent;color:#cfd9ef;font-weight:700;font-size:14px;padding:12px;cursor:pointer;margin-top:10px;}
  .pp-checkout-error{color:#ff9b9b;font-size:13px;margin:8px 0 0;display:none;}
  .pp-checkout-ok{border:1px solid rgba(34,197,94,.45);background:rgba(34,197,94,.12);border-radius:14px;padding:16px;color:#d9ffe5;margin-top:16px;}
  @media(max-width:560px){.pp-tariff-modal{padding:20px 16px;border-radius:18px}.pp-tariff-grid{grid-template-columns:1fr}.pp-checkout-row{grid-template-columns:1fr}.pp-tariff-title{font-size:22px}}
</style>
<div class="pp-tariff-mask" id="ppTariffMask" aria-hidden="true">
  <div class="pp-tariff-modal" role="dialog" aria-modal="true" aria-label="Выбор тарифа">
    <button class="pp-tariff-close" id="ppTariffClose" aria-label="Закрыть">×</button>
    <div id="ppTariffBody"></div>
  </div>
</div>
<script>
(function(){
  var SERVICES = ${JSON.stringify(pricingServices)};
  var RATE = ${RATE_RUB_PER_USD};
  var FEE = ${SERVICE_FEE_RUB};
  var mask = document.getElementById('ppTariffMask');
  var body = document.getElementById('ppTariffBody');
  var close = document.getElementById('ppTariffClose');
  var currentService = null;

  function norm(s){ return String(s||'').toLowerCase().replace(/premium|pro|plus|creative cloud|cc|тариф|подписка/g,'').replace(/[^a-zа-я0-9]+/gi,''); }
  function money(rub){ return rub ? new Intl.NumberFormat('ru-RU').format(rub) + ' ₽' : 'по запросу'; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function findService(name){
    var n = norm(name);
    if(!n) return null;
    for(var i=0;i<SERVICES.length;i++){
      var s=SERVICES[i];
      var candidates=[s.name,s.slug].concat(s.aliases||[]);
      for(var j=0;j<candidates.length;j++){
        var c=norm(candidates[j]);
        if(c && (c===n || c.indexOf(n)>-1 || n.indexOf(c)>-1)) return s;
      }
    }
    return null;
  }
  function serviceNameFromCard(card){
    var a = card.querySelector && card.querySelector('[data-service]');
    if(a && a.getAttribute('data-service')) return a.getAttribute('data-service');
    var n = card.querySelector && card.querySelector('.pp-name,.pp-pc-name,h3,h4');
    return n ? n.textContent.trim() : '';
  }
  function updateCardPrice(card,s){
    var priceBox = card.querySelector('.pp-price,.pp-pc-price');
    if(priceBox && s && s.minRub){ priceBox.innerHTML = '<span>от</span> <b>'+money(s.minRub)+'</b>'; }
  }
  function hydrateCards(){
    document.querySelectorAll('.pp-card,.pp-pc').forEach(function(card){
      if(card.classList.contains('pp-cta')) return;
      var s = findService(serviceNameFromCard(card));
      if(!s) return;
      card.dataset.ppPricing = s.slug;
      updateCardPrice(card,s);
      var link = card.querySelector('a[href*="#popupforma"],a[href*="popupforma"]');
      if(link){ link.setAttribute('href','#pp-tariffs'); link.setAttribute('role','button'); }
    });
  }
  function tierCardsHtml(s){
    var tiers = s.tiers && s.tiers.length ? s.tiers : [{label:'Индивидуальный тариф',usd:null,rub:null}];
    var html = '<div class="pp-tariff-grid">';
    tiers.forEach(function(tier,idx){
      var usd = tier.usd ? '$'+tier.usd+' × '+RATE+' ₽ + '+FEE+' ₽' : 'Цена зависит от тарифа/суммы';
      html += '<div class="pp-tariff-card"><div class="pp-tariff-name">'+escapeHtml(tier.label)+'</div><div class="pp-tariff-usd">'+escapeHtml(usd)+'</div><div class="pp-tariff-rub">'+money(tier.rub)+'</div><div class="pp-tariff-note">Итоговая цена для оплаты через PlataPay</div><button class="pp-tariff-pick" data-tier="'+idx+'">Выбрать</button></div>';
    });
    html += '<div class="pp-tariff-card"><div class="pp-tariff-name">Другой тариф / сумма</div><div class="pp-tariff-usd">Например, пополнение баланса или годовой тариф</div><div class="pp-tariff-rub">по запросу</div><div class="pp-tariff-note">Уточним сумму и пришлём ссылку на оплату</div><button class="pp-tariff-pick" data-tier="custom">Выбрать</button></div>';
    return html + '</div>';
  }
  function openTariffs(s){
    currentService=s;
    body.innerHTML = '<h3 class="pp-tariff-title">'+escapeHtml(s.name)+'</h3><p class="pp-tariff-sub">Выберите тариф. Цена считается автоматически: стоимость тарифа в долларах × '+RATE+' ₽ + '+FEE+' ₽.</p>' + tierCardsHtml(s);
    mask.classList.add('open');
    mask.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){ mask.classList.remove('open'); mask.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function checkoutHtml(s,tier){
    var priceText = tier && tier.rub ? money(tier.rub) : 'по запросу';
    var tierName = tier ? tier.label : 'Другой тариф / сумма';
    return '<h3 class="pp-tariff-title">Оформить оплату</h3><p class="pp-tariff-sub">Почта обязательна. Остальной способ связи можно выбрать дополнительно.</p><div class="pp-checkout-box"><div class="pp-checkout-summary"><strong>'+escapeHtml(s.name)+' — '+escapeHtml(tierName)+'</strong><span>Цена: '+escapeHtml(priceText)+'</span></div><form id="ppCheckoutForm"><div class="pp-checkout-field"><label>Email <b style="color:#ff9b9b">*</b></label><input id="ppCheckoutEmail" type="email" placeholder="name@example.com" required autocomplete="email"></div><div class="pp-checkout-row"><div class="pp-checkout-field"><label>Доп. способ связи</label><select id="ppCheckoutChannel"><option value="">Не нужен</option><option>Telegram</option><option>WhatsApp</option><option>Телефон</option></select></div><div class="pp-checkout-field"><label>Контакт</label><input id="ppCheckoutContact" type="text" placeholder="@username или номер телефона"></div></div><button class="pp-checkout-submit" type="submit">Продолжить к оплате</button><div class="pp-checkout-error" id="ppCheckoutError"></div></form><button class="pp-checkout-back" id="ppCheckoutBack">← Назад к тарифам</button></div>';
  }
  function openCheckout(s,tier){
    body.innerHTML = checkoutHtml(s,tier);
    var form=document.getElementById('ppCheckoutForm');
    var back=document.getElementById('ppCheckoutBack');
    var err=document.getElementById('ppCheckoutError');
    back.addEventListener('click',function(){openTariffs(s);});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var email=document.getElementById('ppCheckoutEmail').value.trim();
      var channel=document.getElementById('ppCheckoutChannel').value.trim();
      var contact=document.getElementById('ppCheckoutContact').value.trim();
      if(!email || email.indexOf('@')<1 || email.indexOf('.')<0){ err.textContent='Введите корректную почту'; err.style.display='block'; return; }
      var priceText = tier && tier.rub ? money(tier.rub) : 'по запросу';
      var tierName = tier ? tier.label : 'Другой тариф / сумма';
      var serviceLine = s.name+' — '+tierName+' — '+priceText;
      var contactLine = 'Email: '+email+(channel ? '; '+channel+': '+(contact||'не указан') : '');
      var srv=document.getElementById('pp-mm-srv');
      var ctc=document.getElementById('pp-mm-ctc');
      var go=document.getElementById('pp-mm-go');
      if(srv && ctc && go){
        srv.value=serviceLine; ctc.value=contactLine; go.click();
        body.innerHTML='<div class="pp-checkout-ok"><strong>Заявка принята</strong><br>Мы получили сервис, тариф, цену и вашу почту. Следующий шаг — ссылка на оплату.</div>';
      } else { err.textContent='Форма временно недоступна. Напишите в Telegram: @Kimzar_A'; err.style.display='block'; }
    });
  }
  close.addEventListener('click',closeModal);
  mask.addEventListener('click',function(e){ if(e.target===mask) closeModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && mask.classList.contains('open')) closeModal(); });
  body.addEventListener('click',function(e){
    var btn=e.target.closest && e.target.closest('[data-tier]');
    if(!btn || !currentService) return;
    e.preventDefault();
    var idx=btn.getAttribute('data-tier');
    var tier = idx==='custom' ? {label:'Другой тариф / сумма',usd:null,rub:null} : currentService.tiers[Number(idx)];
    openCheckout(currentService,tier);
  });
  document.addEventListener('click',function(e){
    var card=e.target.closest && e.target.closest('.pp-card,.pp-pc');
    if(!card || card.classList.contains('pp-cta')) return;
    var s = SERVICES.find(function(x){return x.slug===card.dataset.ppPricing;}) || findService(serviceNameFromCard(card));
    if(!s) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    openTariffs(s);
  }, true);
  hydrateCards();
  setTimeout(hydrateCards,300);
  setTimeout(hydrateCards,1000);
  setTimeout(hydrateCards,2000);
  if(window.MutationObserver){
    new MutationObserver(function(){ hydrateCards(); }).observe(document.body,{childList:true,subtree:true});
  }
})();
</script>
`;
}
