import { SERVICES, usdToRub } from './data.mjs';

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

const CATEGORY_ACCENTS = {
  AI: '#2e7bff',
  Видео: '#a855f7',
  Музыка: '#22c55e',
  Игры: '#f97316',
  Облако: '#38bdf8',
  Бизнес: '#f59e0b',
  Обучение: '#10b981',
  Путешествия: '#14b8a6',
  Маркет: '#ef4444',
  Билеты: '#e11d48',
  Магазины: '#0ea5e9',
  GiftCards: '#f43f5e',
  Ассеты: '#8b5cf6',
};

// Per-service brand colors so the tariff cards are dressed in the design
// of the actual service (requirement: "оформлены в дизайне сервиса").
// Values are picked to read well on the dark navy modal and as button
// backgrounds with white text — pure black/white brands get a vivid,
// brand-adjacent tone instead. Anything missing falls back to the
// category accent below.
const BRAND_ACCENTS = {
  // AI
  chatgpt: '#10a37f', claude: '#d97757', gemini: '#4285f4', grok: '#1d9bf0',
  perplexity: '#20b8a6', qwen: '#615ced', kimi: '#6b5cff', deepl: '#1e63d6',
  codex: '#10a37f', cursor: '#5b8cff', 'github-copilot': '#8957e5',
  openrouter: '#6467f2', minimax: '#f0506e', manus: '#6d5bd0',
  writesonic: '#5d5fef', 'candy-ai': '#ff4f8b', 'higgsfield-ai': '#7c3aed',
  'kits-ai': '#6d5bd0', n8n: '#ea4b71', manychat: '#2c63ff',
  // Видео / Дизайн
  'sora-2': '#10a37f', midjourney: '#6f7bf7', 'kling-ai': '#2b6cf6',
  ideogram: '#f5564a', krea: '#5b6cff', 'lensa-ai': '#ff4d6d', heygen: '#7c5cfc',
  pika: '#ff5c8a', gling: '#6c5ce7', gamma: '#8b5cf6', 'nano-banana': '#e8a317',
  'adobe-cc': '#fa0f00', 'adobe-photoshop': '#31a8ff', 'adobe-premiere': '#9b6dff',
  'adobe-after-effects': '#b388ff', 'adobe-firefly': '#ff7a59', canva: '#00c4cc',
  capcut: '#fe2c55', figma: '#f24e1e', freepik: '#1273eb', shutterstock: '#e91c24',
  artlist: '#19c37d', 'maxon-cinema-4d': '#1ea7fd', 'cults-3d': '#ff5b4a',
  loom: '#625df5',
  // Музыка / Кино
  ableton: '#e8a317', splice: '#19c3c3', 'epidemic-sound': '#ff6a3d',
  bandcamp: '#629aa9', suno: '#8b5cf6', spotify: '#1db954',
  'youtube-premium': '#ff0000', twitch: '#9146ff', tiktok: '#fe2c55',
  // Игры
  steam: '#4b9fd5', nintendo: '#e60012', faceit: '#ff5500',
  'ps-plus-turkey': '#0070d1', discord: '#5865f2',
  // Облако
  'microsoft-365': '#d83b01', google: '#4285f4', 'google-drive': '#1da462',
  'google-cloud': '#4285f4', 'google-bigquery': '#669df6', dropbox: '#0061ff',
  cloudflare: '#f38020', supabase: '#3ecf8e', 'proton-mail': '#6d4aff',
  swift: '#f05138', flutterflow: '#4d9cf6', weavy: '#5b5bd6', wix: '#116dff',
  // Бизнес
  notion: '#6e7b8a', miro: '#ffd02f', airtable: '#2d7ff9', jira: '#2684ff',
  zoom: '#2d8cff', tradingview: '#2962ff', patreon: '#ff424d', boosty: '#f15f2c',
  'ko-fi': '#ff5e5b', onlyfans: '#00aff0', fansly: '#1da1f2', 'x-premium': '#1d9bf0',
  // Маркет
  paypal: '#0070ba', stripe: '#635bff', alipay: '#1677ff', 'app-store': '#0a84ff',
  // Обучение
  coursera: '#0056d2', udemy: '#a435f0', duolingo: '#58cc02', italki: '#ff5b3a',
  myheritage: '#34a853',
  // Путешествия
  airbnb: '#ff385c', booking: '#003580', agoda: '#5b2bcb', airalo: '#f4364c',
};

function cleanPlanName(tier) {
  const text = String(tier || '').trim();
  const noPrice = text.replace(/\s*\([^)]*\$[^)]*\)\s*/g, '').replace(/\s*\$\s*\d+(?:[.,]\d+)?\s*/g, '').trim();
  return noPrice || text || 'Тариф';
}

function tierToData(tier) {
  const label = String(tier || '').trim() || 'Индивидуальный тариф';
  const match = label.match(/\$\s*(\d+(?:[.,]\d+)?)/);
  const usd = match ? Number(match[1].replace(',', '.')) : null;
  return {
    label,
    plan: cleanPlanName(label),
    usd,
    rub: usd === null ? null : usdToRub(usd),
  };
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/premium|pro|plus|creative cloud|cc|тариф|подписка/g, '')
    .replace(/[^a-zа-я0-9]+/gi, '');
}

function formatRub(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

const pricingServices = SERVICES.map((service) => {
  const tiers = (service.tiers?.length ? service.tiers : ['Индивидуальный тариф']).map(tierToData);
  const priced = tiers.filter((tier) => tier.rub !== null).sort((a, b) => a.rub - b.rub);
  const best = priced[0] || null;
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
    accent: BRAND_ACCENTS[service.slug] || CATEGORY_ACCENTS[service.cat] || '#2e7bff',
    aliases,
    tiers,
    minRub: best ? best.rub : null,
    cardDisplay: best ? `${best.plan} — ${formatRub(best.rub)}` : 'по запросу',
  };
});

export function buildPricingUiPatch() {
  return `
<style id="pp-pricing-ui-style">
  .pp-price b,.pp-pc-price b{white-space:nowrap;}
  .pp-card:not(.pp-cta),.pp-pc{cursor:pointer;}
  .pp-inline-tariffs{margin:0 0 16px;}
  .pp-inline-tariffs .pp-tariff-card{cursor:pointer;}
  .pp-inline-tariffs .pp-tariff-card:hover{transform:translateY(-2px);border-color:var(--svc-accent);box-shadow:0 18px 38px -26px var(--svc-accent),inset 0 1px 0 rgba(255,255,255,.08);}
  /* align-items:flex-start + margin:auto on the modal centers it when it
     fits and lets the user scroll to the very top (title + first tariff)
     when the modal is taller than the viewport. align-items:center would
     clip the top of a tall modal in a scroll container. */
  .pp-tariff-mask{position:fixed;inset:0;z-index:100000;background:rgba(3,9,22,.78);backdrop-filter:blur(5px);display:none;align-items:flex-start;justify-content:center;padding:18px;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;}
  .pp-tariff-mask.open{display:flex;}
  .pp-tariff-mask *{box-sizing:border-box;}
  .pp-tariff-modal{--svc-accent:#2e7bff;box-sizing:border-box;margin:auto;width:100%;max-width:760px;background:linear-gradient(180deg,rgba(12,31,64,.98),rgba(8,23,47,.98));border:1px solid color-mix(in srgb,var(--svc-accent) 45%,#1d3a6b);border-radius:24px;color:#eef3ff;box-shadow:0 30px 90px rgba(0,0,0,.48);position:relative;padding:24px;overflow:hidden;}
  .pp-tariff-modal:before{content:"";position:absolute;inset:-120px -90px auto auto;width:280px;height:280px;background:radial-gradient(circle,color-mix(in srgb,var(--svc-accent) 35%,transparent),transparent 68%);pointer-events:none;}
  .pp-tariff-modal:after{content:"";position:absolute;left:-120px;bottom:-160px;width:340px;height:340px;background:radial-gradient(circle,color-mix(in srgb,var(--svc-accent) 18%,transparent),transparent 70%);pointer-events:none;}
  .pp-tariff-modal>*{position:relative;z-index:1;}
  .pp-tariff-close{position:absolute;z-index:3;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#c9d7ef;font-size:26px;line-height:1;cursor:pointer;}
  .pp-tariff-close:hover{background:rgba(255,255,255,.14);color:#fff;}
  .pp-tariff-hero{display:flex;align-items:center;gap:14px;margin:0 42px 18px 0;}
  .pp-tariff-logo{width:58px;height:58px;flex:0 0 auto;border-radius:16px;background:#fff;display:grid;place-items:center;overflow:hidden;box-shadow:0 12px 28px -14px var(--svc-accent),0 0 0 1px rgba(255,255,255,.10);}
  .pp-tariff-logo img{width:100%;height:100%;object-fit:contain;padding:7px;box-sizing:border-box;}
  .pp-tariff-logo-fallback{background:linear-gradient(135deg,var(--svc-accent),#08172F);color:#fff;font-weight:900;font-size:22px;}
  .pp-tariff-title{font-size:25px;font-weight:800;letter-spacing:-.02em;margin:0 0 4px;}
  .pp-tariff-sub{color:#9fb2d4;margin:0;font-size:14px;line-height:1.45;}
  .pp-tariff-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--svc-accent) 55%,transparent);background:color-mix(in srgb,var(--svc-accent) 16%,transparent);color:#fff;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;margin:0 0 8px;}
  .pp-tariff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:12px;margin-top:16px;}
  .pp-tariff-card{border:1px solid color-mix(in srgb,var(--svc-accent) 50%,#1d3a6b);border-top:3px solid var(--svc-accent);border-radius:18px;background:linear-gradient(180deg,color-mix(in srgb,var(--svc-accent) 9%,rgba(255,255,255,.04)),rgba(255,255,255,.015));padding:16px;display:flex;flex-direction:column;gap:8px;min-height:168px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);transition:transform .15s,border-color .15s,box-shadow .15s;}
  .pp-tariff-card:hover{transform:translateY(-2px);border-color:var(--svc-accent);box-shadow:0 18px 38px -26px var(--svc-accent),inset 0 1px 0 rgba(255,255,255,.08);}
  .pp-tariff-top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .pp-tariff-mini{width:28px;height:28px;border-radius:9px;background:#fff;display:grid;place-items:center;overflow:hidden;flex:0 0 auto;}
  .pp-tariff-mini img{width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box;}
  .pp-tariff-name{font-weight:850;font-size:17px;line-height:1.25;}
  .pp-tariff-usd{color:#9fb2d4;font-size:13px;}
  .pp-tariff-rub{font-size:26px;font-weight:950;color:#fff;margin-top:auto;letter-spacing:-.02em;}
  .pp-tariff-official{font-size:12px;color:#8aa0c6;line-height:1.35;margin-top:2px;}
  .pp-tariff-note{font-size:12px;color:#8499c0;line-height:1.35;}
  .pp-tariff-card-custom{border-style:dashed;}
  .pp-tariff-pick{border:1px solid var(--svc-accent);background:color-mix(in srgb,var(--svc-accent) 18%,transparent);color:#fff;border-radius:12px;padding:11px 12px;font-weight:850;cursor:pointer;margin-top:4px;}
  .pp-tariff-pick:hover{background:var(--svc-accent);}
  .pp-checkout-box{border:1px solid color-mix(in srgb,var(--svc-accent) 40%,#1d3a6b);background:rgba(8,23,47,.82);border-radius:16px;padding:16px;margin-top:16px;}
  .pp-checkout-summary{border:1px solid color-mix(in srgb,var(--svc-accent) 48%,transparent);background:color-mix(in srgb,var(--svc-accent) 12%,transparent);border-radius:13px;padding:12px 14px;margin-bottom:14px;}
  .pp-checkout-summary strong{display:block;margin-bottom:3px;}
  .pp-checkout-summary span{color:#cbd7ef;font-size:13px;}
  .pp-checkout-field{margin-bottom:12px;}
  .pp-checkout-field label{display:block;color:#9fb2d4;font-size:13px;margin-bottom:6px;}
  .pp-checkout-field input,.pp-checkout-field select{width:100%;box-sizing:border-box;background:#0c1f40;border:1px solid #1d3a6b;color:#eef3ff;border-radius:11px;padding:12px 13px;font:500 15px -apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif;}
  .pp-checkout-field input[readonly]{opacity:.92;background:rgba(255,255,255,.045);border-color:color-mix(in srgb,var(--svc-accent) 35%,#1d3a6b);}
  .pp-checkout-field input:focus,.pp-checkout-field select:focus{outline:none;border-color:var(--svc-accent);}
  .pp-checkout-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .pp-checkout-contact-row{display:grid;grid-template-columns:180px 1fr;gap:12px;}
  .pp-checkout-contact-hint{font-size:12px;color:#8fa3c6;margin:2px 0 10px;}
  .pp-checkout-contact-hint b{color:#d6e2fb;}
  .pp-checkout-or{display:flex;align-items:center;gap:10px;color:#7e90b4;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin:4px 0 10px;}
  .pp-checkout-or:before,.pp-checkout-or:after{content:"";flex:1;height:1px;background:#1d3a6b;}
  .pp-checkout-submit{width:100%;border:0;border-radius:13px;background:linear-gradient(180deg,var(--svc-accent),color-mix(in srgb,var(--svc-accent) 70%,#08172F));color:#fff;font-weight:850;font-size:16px;padding:14px;cursor:pointer;}
  .pp-checkout-back{width:100%;border:1px solid #1d3a6b;border-radius:13px;background:transparent;color:#cfd9ef;font-weight:750;font-size:14px;padding:12px;cursor:pointer;margin-top:10px;}
  .pp-checkout-error{color:#ff9b9b;font-size:13px;margin:8px 0 0;display:none;}
  .pp-checkout-ok{border:1px solid rgba(34,197,94,.45);background:rgba(34,197,94,.12);border-radius:14px;padding:16px;color:#d9ffe5;margin-top:16px;}
  .pp-checkout-check{display:flex;align-items:flex-start;gap:9px;margin:14px 0 4px;font-size:12.5px;line-height:1.45;color:#9fb2d4;cursor:pointer;}
  .pp-checkout-check input{width:18px;height:18px;min-width:18px;margin:1px 0 0;accent-color:var(--svc-accent,#2e7bff);cursor:pointer;}
  .pp-checkout-check a{color:#7BAEFF;text-decoration:none;}
  .pp-checkout-check a:hover{text-decoration:underline;}
  .pp-checkout-hp{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;}
  @media(max-width:560px){.pp-tariff-modal{padding:20px 16px;border-radius:18px}.pp-tariff-hero{align-items:flex-start}.pp-tariff-logo{width:50px;height:50px}.pp-tariff-grid{grid-template-columns:1fr}.pp-checkout-row,.pp-checkout-contact-row{grid-template-columns:1fr}.pp-tariff-title{font-size:22px}}
</style>
<div class="pp-tariff-mask" id="ppTariffMask" aria-hidden="true">
  <div class="pp-tariff-modal" id="ppTariffModal" role="dialog" aria-modal="true" aria-label="Выбор тарифа">
    <button class="pp-tariff-close" id="ppTariffClose" aria-label="Закрыть">×</button>
    <div id="ppTariffBody"></div>
  </div>
</div>
<script>
(function(){
  var SERVICES = ${JSON.stringify(pricingServices)};
  var LOGO_BASE = 'https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/';
  var BOT = '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg';
  var CHAT = '523060537';
  var SHEETS = 'https://script.google.com/macros/s/AKfycbyy43Ff5kKivrUsaXWEkda7JXNwHrOI-3BJIJp3UG9H8K6cb4DxjpC8eXNPGNEXQEWt/exec';

  // Источник перехода (первое касание): UTM-метки из ссылки объявления и
  // реферер запоминаются на сессию, чтобы дойти до формы через внутренние
  // переходы. Определяется один раз и переиспользуется всеми формами сайта.
  if(!window.ppLeadSource){ window.ppLeadSource = function(){
    try{ var c=window.sessionStorage.getItem('ppSrc'); if(c) return JSON.parse(c); }catch(e){}
    var q={}, parts=(location.search||'').replace(/^\\?/,'').split('&');
    for(var i=0;i<parts.length;i++){ var kv=parts[i].split('='); if(kv[0]) q[decodeURIComponent(kv[0])]=decodeURIComponent((kv[1]||'').replace(/\\+/g,' ')); }
    var src={ utm_source:q.utm_source||'', utm_medium:q.utm_medium||'', utm_campaign:q.utm_campaign||'', ref:(document.referrer||'') };
    try{ window.sessionStorage.setItem('ppSrc', JSON.stringify(src)); }catch(e2){}
    return src;
  }; }

  // Логируем переходы по ссылкам «Написать в Telegram»/WhatsApp в таблицу
  // (отдельной строкой «Переход в …»). tgSent:true — чтобы сервер не слал по
  // такому клику письмо и уведомление. sendBeacon переживает уход со страницы.
  if(!window.ppClickLogged){ window.ppClickLogged=true;
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href*="t.me/"],a[href*="telegram.me"],a[href*="wa.me/"],a[href*="api.whatsapp.com"]');
      if(!a) return;
      var href = a.getAttribute('href') || '';
      var isWa = /wa\\.me|whatsapp/i.test(href);
      var s = window.ppLeadSource ? window.ppLeadSource() : {};
      var payload = { event:'click', type:'Переход в '+(isWa?'WhatsApp':'Telegram'), contact:href, page:location.pathname, ts:Date.now(), tgSent:true, utm_source:s.utm_source||'', utm_medium:s.utm_medium||'', utm_campaign:s.utm_campaign||'', ref:s.ref||'' };
      try{
        var body = JSON.stringify(payload);
        if(navigator.sendBeacon){ navigator.sendBeacon(SHEETS, new Blob([body],{type:'text/plain;charset=utf-8'})); }
        else { fetch(SHEETS,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}); }
      }catch(err){}
    }, true);
  }

  var mask = document.getElementById('ppTariffMask');
  var modal = document.getElementById('ppTariffModal');
  var body = document.getElementById('ppTariffBody');
  var close = document.getElementById('ppTariffClose');
  var currentService = null;

  function norm(s){ return String(s||'').toLowerCase().replace(/premium|pro|plus|creative cloud|cc|тариф|подписка/g,'').replace(/[^a-zа-я0-9]+/gi,''); }
  function money(rub){ return rub ? new Intl.NumberFormat('ru-RU').format(rub) + ' ₽' : 'по запросу'; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  // --- Anti-duplicate (shared namespace with the mini-form): the same
  // request isn't sent twice; plus a short global cooldown against spam.
  var DEDUP_MS = 30*60*1000, COOLDOWN_MS = 15*1000;
  function reqKey(a,b){ return (String(a)+'|'+String(b)).toLowerCase().replace(/\\s+/g,''); }
  function lstore(){ try{ return window.localStorage; }catch(e){ return null; } }
  function recentlySent(key){
    var s=lstore(); if(!s) return false;
    try{
      if(Date.now()-(+s.getItem('ppReqLast')||0) < COOLDOWN_MS) return 'cooldown';
      if(Date.now()-(+s.getItem('ppReq_'+key)||0) < DEDUP_MS) return 'dup';
    }catch(e){}
    return false;
  }
  function markSent(key){ var s=lstore(); if(!s) return; try{ s.setItem('ppReq_'+key,''+Date.now()); s.setItem('ppReqLast',''+Date.now()); }catch(e){} }
  function policyHref(){ return (location.pathname==='/'||location.pathname==='') ? '#popuppolicy' : '/#popuppolicy'; }
  function ofertaHref(){ return (location.pathname==='/'||location.pathname==='') ? '#popupoferta' : '/#popupoferta'; }
  function logoSrc(s){ return s && s.logo ? LOGO_BASE + s.logo : ''; }
  window.ppLogoFB=function(img){
    var p=img.parentNode; if(!p) return;
    p.className=(img.getAttribute('data-fbcls')||'')+' pp-tariff-logo-fallback';
    p.textContent=img.getAttribute('data-fbch')||'?';
  };
  function logoHtml(s, cls){
    var src=logoSrc(s);
    var ch=escapeHtml((s.name||'?')[0]);
    if(src) return '<div class="'+cls+'"><img src="'+escapeHtml(src)+'" alt="" data-fbcls="'+cls+'" data-fbch="'+ch+'" onerror="window.ppLogoFB&&window.ppLogoFB(this)"></div>';
    return '<div class="'+cls+' pp-tariff-logo-fallback">'+ch+'</div>';
  }
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
  var ppObserver=null, ppHydrateScheduled=false;
  function updateCardPrice(card,s){
    var priceBox = card.querySelector('.pp-price,.pp-pc-price');
    if(!priceBox || !s || !s.cardDisplay) return;
    var html='<b>'+escapeHtml(s.cardDisplay)+'</b>';
    // Only write when the value actually changes. Writing innerHTML on
    // every pass would trigger the MutationObserver below and spin into
    // an infinite reflow loop that freezes the page.
    if(priceBox.innerHTML!==html) priceBox.innerHTML=html;
  }
  function hydrateCards(){
    if(ppObserver) ppObserver.disconnect();
    document.querySelectorAll('.pp-card,.pp-pc').forEach(function(card){
      if(card.classList.contains('pp-cta')) return;
      var s = (card.dataset.ppPricing && SERVICES.find(function(x){return x.slug===card.dataset.ppPricing;})) || findService(serviceNameFromCard(card));
      if(!s) return;
      card.dataset.ppPricing = s.slug;
      updateCardPrice(card,s);
      var link = card.querySelector('a[href*="#popupforma"],a[href*="popupforma"]');
      if(link){ link.setAttribute('href','#pp-tariffs'); link.setAttribute('role','button'); }
    });
    if(ppObserver) ppObserver.observe(document.body,{childList:true,subtree:true});
  }
  function scheduleHydrate(){
    if(ppHydrateScheduled) return;
    ppHydrateScheduled=true;
    setTimeout(function(){ ppHydrateScheduled=false; hydrateCards(); },250);
  }
  function setAccent(s){
    modal.style.setProperty('--svc-accent', s.accent || '#2e7bff');
  }
  function tariffHeaderHtml(s){
    return '<div class="pp-tariff-hero">'+logoHtml(s,'pp-tariff-logo')+'<div><div class="pp-tariff-badge">'+escapeHtml(s.cat || 'Сервис')+'</div><h3 class="pp-tariff-title">'+escapeHtml(s.name)+'</h3><p class="pp-tariff-sub">Выберите тариф — как на сайте '+escapeHtml(s.name)+'. Цена уже в рублях, с учётом оплаты сервиса и нашей комиссии.</p></div></div>';
  }
  function tierCardsHtml(s){
    var tiers = s.tiers && s.tiers.length ? s.tiers : [{label:'Индивидуальный тариф',plan:'Индивидуальный тариф',usd:null,rub:null}];
    var html = '<div class="pp-tariff-grid">';
    tiers.forEach(function(tier,idx){
      var official = tier.usd ? 'Официально $'+tier.usd+' у сервиса' : 'Цена зависит от тарифа или суммы';
      var price = money(tier.rub);
      html += '<div class="pp-tariff-card" data-tier="'+idx+'" role="button" tabindex="0"><div class="pp-tariff-top"><div class="pp-tariff-name">'+escapeHtml(tier.plan || tier.label)+'</div>'+logoHtml(s,'pp-tariff-mini')+'</div><div class="pp-tariff-rub">'+escapeHtml(price)+'</div><div class="pp-tariff-official">'+escapeHtml(official)+'</div><button class="pp-tariff-pick" data-tier="'+idx+'">Выбрать тариф</button></div>';
    });
    html += '<div class="pp-tariff-card pp-tariff-card-custom" data-tier="custom" role="button" tabindex="0"><div class="pp-tariff-top"><div class="pp-tariff-name">Другой тариф / сумма</div>'+logoHtml(s,'pp-tariff-mini')+'</div><div class="pp-tariff-rub">по запросу</div><div class="pp-tariff-official">Пополнение баланса, годовой план или другой тариф — уточним сумму</div><button class="pp-tariff-pick" data-tier="custom">Выбрать тариф</button></div>';
    return html + '</div>';
  }
  function showModal(){
    mask.classList.add('open');
    mask.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    // Push a history entry so the phone "Back" button closes the modal
    // instead of leaving the site. Guard against pushing twice when we
    // switch between the tariff and checkout views of the same modal.
    if(!(window.history.state && window.history.state.ppModal)){
      try{ history.pushState({ppModal:true}, ''); }catch(e){}
    }
  }
  function openTariffs(s){
    currentService=s;
    setAccent(s);
    body.innerHTML = tariffHeaderHtml(s) + tierCardsHtml(s);
    showModal();
  }
  function openCheckoutModal(s,tier){
    currentService=s;
    showModal();
    openCheckout(s,tier);
  }
  function closeModal(fromPop){
    mask.classList.remove('open');
    mask.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    // If the user closed via the UI (× / overlay / Esc), consume the
    // history entry we pushed. If they closed via the Back button
    // (fromPop), the entry is already gone — don't pop again.
    if(!fromPop && window.history.state && window.history.state.ppModal){
      try{ history.back(); }catch(e){}
    }
  }
  window.addEventListener('popstate', function(){
    if(mask.classList.contains('open')) closeModal(true);
  });
  function checkoutHtml(s,tier){
    var priceText = tier && tier.rub ? money(tier.rub) : 'по запросу';
    var tierName = tier ? tier.label : 'Другой тариф / сумма';
    return tariffHeaderHtml(s)+'<h3 class="pp-tariff-title" style="font-size:21px;margin-top:8px;">Оформить оплату</h3><p class="pp-tariff-sub">Сервис, тариф и сумма уже заполнены. Остаётся выбрать способ связи — укажите контакт <b>или</b> почту, чего-то одного достаточно.</p><div class="pp-checkout-box"><div class="pp-checkout-summary"><strong>'+escapeHtml(s.name)+' — '+escapeHtml(tierName)+'</strong><span>Цена: '+escapeHtml(priceText)+'</span></div><form id="ppCheckoutForm"><div class="pp-checkout-row"><div class="pp-checkout-field"><label>Сервис</label><input readonly value="'+escapeHtml(s.name)+'"></div><div class="pp-checkout-field"><label>Тариф</label><input readonly value="'+escapeHtml(tierName)+'"></div></div><div class="pp-checkout-field"><label>Сумма</label><input readonly value="'+escapeHtml(priceText)+'"></div><div class="pp-checkout-contact-hint">Заполните <b>любой</b> из вариантов связи ниже — контакт в мессенджере или почту.</div><div class="pp-checkout-contact-row"><div class="pp-checkout-field"><label>Способ связи</label><select id="ppCheckoutChannel"><option value="Telegram">Telegram</option><option value="WhatsApp">WhatsApp</option><option value="Skype">Skype</option><option value="Телефон">Телефон</option></select></div><div class="pp-checkout-field"><label>Контакт</label><input id="ppCheckoutContact" type="text" placeholder="@username, Skype или номер" autocomplete="off"></div></div><div class="pp-checkout-or"><span>или</span></div><div class="pp-checkout-field"><label>Email</label><input id="ppCheckoutEmail" type="email" placeholder="name@example.com" autocomplete="email"></div><div class="pp-checkout-hp" aria-hidden="true"><label>Компания<input type="text" id="ppCheckoutHp" tabindex="-1" autocomplete="off" data-lpignore="true" data-1p-ignore data-form-type="other"></label></div><label class="pp-checkout-check"><input type="checkbox" id="ppCheckoutAgree"><span>Я согласен на <a href="'+policyHref()+'" target="_blank" rel="noopener">обработку персональных данных</a> и принимаю <a href="'+ofertaHref()+'" target="_blank" rel="noopener">оферту</a></span></label><button class="pp-checkout-submit" type="submit">Продолжить к оплате</button><div class="pp-checkout-error" id="ppCheckoutError"></div></form><button class="pp-checkout-back" id="ppCheckoutBack">← Назад к тарифам</button></div>';
  }
  function openCheckout(s,tier){
    setAccent(s);
    body.innerHTML = checkoutHtml(s,tier);
    var form=document.getElementById('ppCheckoutForm');
    var back=document.getElementById('ppCheckoutBack');
    var err=document.getElementById('ppCheckoutError');
    back.addEventListener('click',function(){openTariffs(s);});
    var submitting=false;
    function showCheckoutOk(){
      body.innerHTML='<div class="pp-checkout-ok"><strong>Заявка принята</strong><br>Мы получили сервис, тариф, цену и ваш контакт. Свяжемся в течение 5–15 минут и пришлём ссылку на оплату. Если срочно — <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener" style="color:#7BAEFF;">@Kimzar_A</a>.</div>';
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(submitting) return;
      err.style.display='none';
      var hp=document.getElementById('ppCheckoutHp');
      if(hp && hp.value){ showCheckoutOk(); return; }   // bot honeypot — pretend success, send nothing
      var email=document.getElementById('ppCheckoutEmail').value.trim();
      var channel=document.getElementById('ppCheckoutChannel').value.trim();
      var contact=document.getElementById('ppCheckoutContact').value.trim();
      var agree=document.getElementById('ppCheckoutAgree');
      var emailOk = email && email.indexOf('@')>0 && email.indexOf('.')>email.indexOf('@');
      var contactOk = contact.length>=3;
      if(!emailOk && !contactOk){ err.textContent='Укажите контакт в мессенджере или почту — что-то одно'; err.style.display='block'; return; }
      if(email && !emailOk){ err.textContent='Почта введена с ошибкой — проверьте адрес'; err.style.display='block'; return; }
      if(agree && !agree.checked){ err.textContent='Подтвердите согласие на обработку персональных данных'; err.style.display='block'; return; }
      var dedupKey=reqKey(s.name+'|'+(tier?tier.label:''), contact||email);
      var rc=recentlySent(dedupKey);
      if(rc==='dup'){ showCheckoutOk(); return; }
      if(rc==='cooldown'){ err.textContent='Заявка уже отправляется. Подождите несколько секунд.'; err.style.display='block'; return; }
      var priceText = tier && tier.rub ? money(tier.rub) : 'по запросу';
      var tierName = tier ? tier.label : 'Другой тариф / сумма';
      var contactParts=[];
      if(contactOk) contactParts.push((channel||'Контакт')+': '+contact);
      if(emailOk) contactParts.push('Email: '+email);
      var contactLine = contactParts.join('; ');
      var submitBtn = form.querySelector('.pp-checkout-submit');
      submitting=true;
      if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='Отправляем…'; }
      var msg=[
        'Заявка с сайта PlataPay (карточка тарифа)',
        'Сервис: '+s.name,
        'Тариф: '+tierName,
        'Цена: '+priceText,
        'Контакт: '+contactLine,
        'Страница: https://payoplata.ru'+location.pathname
      ].join('\\n');
      var leadPayload={source:'tariff', service:s.name, tier:tierName, price:priceText, contact:contactLine, page:location.pathname, ts:Date.now()};
      try{ var _src=window.ppLeadSource?window.ppLeadSource():{}; for(var _k in _src){ leadPayload[_k]=_src[_k]; } }catch(e){}
      // Прямая отправка в Telegram — быстрый путь подтверждения. У части
      // клиентов (особенно из РФ) провайдер блокирует api.telegram.org,
      // поэтому её сбой НЕ должен проваливать заявку: резервно уходит запрос
      // в Apps Script (Google доступен), который сам продублирует заявку в
      // Telegram, почту и Sheets. Таймаут не даёт заблокированному соединению
      // «подвесить» форму.
      var tgDirect=new Promise(function(resolve){
        var settled=false, finish=function(v){ if(!settled){ settled=true; resolve(v); } };
        setTimeout(function(){ finish(false); }, 7000);
        fetch('https://api.telegram.org/bot'+BOT+'/sendMessage',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({chat_id:CHAT, text:msg, disable_web_page_preview:true})
        }).then(function(r){ finish(r.ok); }).catch(function(){ finish(false); });
      });
      tgDirect.then(function(tgSent){
        leadPayload.tgSent=tgSent;
        fetch(SHEETS,{
          method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'},
          body: JSON.stringify(leadPayload)
        }).then(function(){return true;}).catch(function(){return false;}).then(function(reached){
          submitting=false;
          // Успех, если Telegram подтвердил доставку ИЛИ заявка ушла в Apps
          // Script (Google доступен из РФ; скрипт продублирует её в Telegram и
          // на почту). Иначе — реальная ошибка сети, показываем сообщение.
          if(tgSent || reached){
            markSent(dedupKey);
            showCheckoutOk();
            try{ if(typeof ym==='function'){ ym(109522965,'reachGoal','tariff_order'); ym(109522965,'reachGoal','zayavka_service'); } }catch(e){}
          } else {
            err.textContent='Не удалось отправить. Напишите в Telegram: @Kimzar_A'; err.style.display='block';
            if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='Продолжить к оплате'; }
          }
        });
      });
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
    var tier = idx==='custom' ? {label:'Другой тариф / сумма',plan:'Другой тариф / сумма',usd:null,rub:null} : currentService.tiers[Number(idx)];
    openCheckout(currentService,tier);
  });
  document.addEventListener('click',function(e){
    // Let the service name/logo link (.pp-pc-head, .pp-name-link) navigate to
    // its SEO landing page instead of being swallowed into the tariff modal —
    // only the rest of the card (price, "Оплатить") opens tariffs.
    if(e.target.closest && e.target.closest('.pp-pc-head,.pp-name-link')) return;
    var card=e.target.closest && e.target.closest('.pp-card,.pp-pc');
    if(!card || card.classList.contains('pp-cta')) return;
    var s = SERVICES.find(function(x){return x.slug===card.dataset.ppPricing;}) || findService(serviceNameFromCard(card));
    if(!s) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    openTariffs(s);
  }, true);
  // -------- SEO landing pages: single known service --------
  // On a per-service SEO page window.PP_PAGE_SERVICE is set. There the
  // plain "Тарифы" list becomes branded clickable cards and the order
  // CTAs open the same branded tariff modal, so every tariff card is
  // dressed in the service's design and the form is pre-filled.
  var PAGE_SVC = window.PP_PAGE_SERVICE
    ? (SERVICES.find(function(x){ return x.slug===window.PP_PAGE_SERVICE; }) || null)
    : null;

  function renderInlineTariffs(){
    if(!PAGE_SVC) return;
    var lists = document.querySelectorAll('ul.tiers');
    for(var i=0;i<lists.length;i++){
      var ul=lists[i];
      if(ul.dataset.ppDone) continue;
      ul.dataset.ppDone='1';
      var wrap=document.createElement('div');
      wrap.className='pp-inline-tariffs';
      wrap.setAttribute('data-slug',PAGE_SVC.slug);
      wrap.style.setProperty('--svc-accent',PAGE_SVC.accent||'#2e7bff');
      wrap.innerHTML=tierCardsHtml(PAGE_SVC);
      ul.parentNode.replaceChild(wrap,ul);
    }
  }
  function inlineTierFromCard(card){
    var host=card.closest('.pp-inline-tariffs');
    if(!host) return null;
    var s=SERVICES.find(function(x){ return x.slug===host.getAttribute('data-slug'); });
    if(!s) return null;
    var idx=card.getAttribute('data-tier');
    var tier= idx==='custom'
      ? {label:'Другой тариф / сумма',plan:'Другой тариф / сумма',usd:null,rub:null}
      : s.tiers[Number(idx)];
    return {s:s,tier:tier};
  }
  if(PAGE_SVC){
    // Clicking an inline tariff card opens the pre-filled checkout.
    document.addEventListener('click',function(e){
      var card=e.target.closest && e.target.closest('.pp-inline-tariffs [data-tier]');
      if(!card) return;
      e.preventDefault();
      var hit=inlineTierFromCard(card);
      if(hit) openCheckoutModal(hit.s,hit.tier);
    });
    // Order CTAs (header button + in-body buttons + legacy popup links)
    // open the branded tariff modal for this page's service.
    document.addEventListener('click',function(e){
      var a=e.target.closest && e.target.closest('a[href*="popupforma"],.cta-btn,.btn-primary');
      if(!a) return;
      var href=a.getAttribute('href')||'';
      if(/t\\.me|wa\\.me|whatsapp|tel:|mailto:/.test(href)) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      openTariffs(PAGE_SVC);
    }, true);
    renderInlineTariffs();
    setTimeout(renderInlineTariffs,300);
  }
  // Keyboard support for card-as-button.
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter' && e.key!==' ') return;
    var card=e.target.closest && e.target.closest('.pp-tariff-card[data-tier]');
    if(!card) return;
    e.preventDefault();
    var hit=inlineTierFromCard(card);
    if(hit){ openCheckoutModal(hit.s,hit.tier); return; }
    if(currentService){
      var idx=card.getAttribute('data-tier');
      var tier= idx==='custom' ? {label:'Другой тариф / сумма',plan:'Другой тариф / сумма',usd:null,rub:null} : currentService.tiers[Number(idx)];
      openCheckout(currentService,tier);
    }
  });

  hydrateCards();
  setTimeout(hydrateCards,300);
  setTimeout(hydrateCards,1000);
  setTimeout(hydrateCards,2000);
  if(window.MutationObserver){
    ppObserver=new MutationObserver(scheduleHydrate);
    ppObserver.observe(document.body,{childList:true,subtree:true});
  }
})();
</script>
<script>
(function(){
  // Yandex.Metrika goal: клик по Telegram/WhatsApp. Guarded so nothing
  // breaks when ym failed to load. Injected on every page.
  var YM = 109522965;
  function ppGoal(name, cb){
    var fired = false;
    function go(){ if(fired) return; fired = true; if(cb) cb(); }
    try{
      if(typeof ym === 'function'){
        ym(YM, 'reachGoal', name, cb ? { callback: go } : undefined);
        if(cb) setTimeout(go, 700); // fallback if the callback never fires
      } else if(cb){ go(); }
    }catch(e){ if(cb) go(); }
  }
  window.ppGoal = window.ppGoal || ppGoal;
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if(!/(?:\\/\\/|^)(?:t\\.me|telegram\\.me|wa\\.me|api\\.whatsapp\\.com)/i.test(href) && !/whatsapp/i.test(href)) return;
    // Telegram links already carry an inline onclick goal — skip to avoid
    // double-counting; this handler covers WhatsApp and any missed links.
    if((a.getAttribute('onclick') || '').indexOf('klik_telegram') > -1) return;
    // New tab / modified click: the page stays, so just fire the goal.
    if(a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1){
      ppGoal('klik_telegram');
      return;
    }
    // Same tab: send the goal first, then follow the link.
    e.preventDefault();
    ppGoal('klik_telegram', function(){ window.location.href = href; });
  }, true);
})();
</script>
<style id="pp-cookie-style">
  /* Bottom-right card (OZON-style layout) in PlataPay's own colours. */
  .pp-cookie{position:fixed;right:20px;bottom:20px;left:auto;z-index:100001;width:360px;max-width:calc(100vw - 32px);background:linear-gradient(180deg,#0c1f40,#13294e);border:1px solid #1d3a6b;border-radius:18px;padding:22px 22px 18px;box-shadow:0 30px 70px -24px rgba(0,0,0,.7);color:#a9bbdd;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',system-ui,sans-serif;animation:ppCookieUp .35s ease;}
  @keyframes ppCookieUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
  .pp-cookie[hidden]{display:none;}
  .pp-cookie h4{margin:0 0 10px;font-size:19px;font-weight:800;line-height:1.25;letter-spacing:-.01em;color:#eef3ff;}
  .pp-cookie p{margin:0 0 16px;font-size:13.5px;line-height:1.55;color:#a9bbdd;}
  .pp-cookie a{color:#7BAEFF;text-decoration:none;}
  .pp-cookie a:hover{text-decoration:underline;}
  .pp-cookie button{width:100%;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;border:none;border-radius:12px;padding:13px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;box-shadow:0 12px 28px -12px rgba(46,123,255,.9);}
  .pp-cookie button:hover{filter:brightness(1.08);}
  @media(max-width:520px){.pp-cookie{right:12px;left:12px;bottom:12px;width:auto;max-width:none;padding:18px;}}
</style>
<script>
(function(){
  // Cookie notice — site uses cookies (incl. Яндекс.Метрика). Shown once,
  // acceptance stored in localStorage. Fails silently if storage blocked.
  function seen(){ try{ return localStorage.getItem('ppCookieOk')==='1'; }catch(e){ return false; } }
  if(seen()) return;
  function build(){
    if(document.getElementById('pp-cookie')) return;
    var policy = (location.pathname === '/' || location.pathname === '') ? '#popuppolicy' : '/#popuppolicy';
    var bar = document.createElement('div');
    bar.className = 'pp-cookie';
    bar.id = 'pp-cookie';
    bar.setAttribute('role','dialog');
    bar.setAttribute('aria-label','Уведомление о файлах cookie');
    bar.innerHTML = '<h4>Мы используем файлы cookie</h4><p>Это чтобы сайт работал лучше, а мы видели статистику через Яндекс.Метрику. Оставаясь на сайте, вы соглашаетесь с использованием файлов cookie и <a href="'+policy+'">политикой обработки данных</a>.</p><button type="button">Хорошо</button>';
    bar.querySelector('button').addEventListener('click', function(){
      try{ localStorage.setItem('ppCookieOk','1'); }catch(e){}
      bar.hidden = true;
      if(bar.parentNode) bar.parentNode.removeChild(bar);
    });
    document.body.appendChild(bar);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
</script>
`;
}
