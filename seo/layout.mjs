// Shared page shell for SEO landings — keeps the brand look without
// pulling in the heavy Tilda chrome, so the pages stay fast and easy
// for crawlers to parse.

import { faqBlock, relatedLinks } from './templates.mjs';

export function renderPage({
  base,          // base href, e.g. '/' on custom domain
  page,          // { title, description, h1, body, faq }
  service,
  intent,
  intents,
  verifyTags = '',
  pricingUi = '', // branded tariff-card modal + form, injected before </body>
}) {
  const canonical = `https://payoplata.ru/${intent.slug(service.slug)}/`;
  const faqLd = page.faq && page.faq.length
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((q) => ({
          '@type': 'Question',
          name: q.q,
          acceptedAnswer: { '@type': 'Answer', text: q.a },
        })),
      })}</script>`
    : '';

  // BreadcrumbList so Главная → Каталог → текущая страница shows up as a
  // rich result and gives crawlers an explicit hierarchy.
  const breadcrumbLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://payoplata.ru/' },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: 'https://payoplata.ru/catalog/' },
      { '@type': 'ListItem', position: 3, name: page.h1, item: canonical },
    ],
  })}</script>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${base}">
<title>${page.title}</title>
<meta name="description" content="${escapeAttr(page.description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="PlataPay">
<meta property="og:title" content="${escapeAttr(page.title)}">
<meta property="og:description" content="${escapeAttr(page.description)}">
<meta property="og:url" content="${canonical}">
${verifyTags}
${breadcrumbLd}
<style>
  :root { color-scheme: dark; }
  *,*::before,*::after{box-sizing:border-box;}
  html,body{margin:0;background:#08172F;color:#eef3ff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.55;max-width:100%;overflow-x:hidden;}
  img{max-width:100%;height:auto;}
  a{color:#7BAEFF;text-decoration:none;}
  a:hover{color:#eef3ff;}
  .wrap{max-width:980px;margin:0 auto;padding:24px;}
  header.site{position:sticky;top:0;z-index:30;background:rgba(8,23,47,0.92);backdrop-filter:blur(10px);border-bottom:1px solid #16315f;}
  header.site .row{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;max-width:1180px;margin:0 auto;}
  .logo{font-size:22px;font-weight:600;letter-spacing:-.01em;color:#eef3ff;}
  .logo span{color:#2e7bff;}
  nav.top a{color:#9fb2d4;margin:0 10px;font-size:14px;}
  nav.top a:hover{color:#eef3ff;}
  .cta-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;}
  .btn-primary{display:inline-flex;align-items:center;gap:6px;padding:14px 24px;border-radius:999px;font-weight:600;font-size:15px;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;box-shadow:0 8px 24px -8px rgba(46,123,255,.7);}
  .btn-primary:hover{filter:brightness(1.08);color:#fff;}
  .hero{padding:48px 0 24px;}
  .crumbs{font-size:13px;color:#8499c0;margin-bottom:12px;}
  .crumbs a{color:#8499c0;}
  h1{font-size:36px;line-height:1.15;letter-spacing:-.02em;margin:0 0 16px;font-weight:600;}
  h2{font-size:22px;margin:0 0 12px;font-weight:600;letter-spacing:-.01em;}
  h3{font-size:17px;margin:0 0 6px;font-weight:600;}
  p{margin:0 0 12px;color:#cfd9ef;}
  .lead{font-size:17px;color:#eef3ff;}
  .block{background:#0c1f40;border:1px solid #16315f;border-radius:18px;padding:22px;margin:0 0 16px;}
  .block.cta{text-align:center;background:linear-gradient(180deg,#0c1f40,#13294e);}
  .block.cta h2{font-size:24px;}
  .hint{font-size:13px;color:#8499c0;margin-top:10px;}
  ul,ol{margin:0 0 12px;padding-left:20px;color:#cfd9ef;}
  ul li,ol li{margin-bottom:6px;}
  .tiers li, .check li, .steps li{padding:4px 0;}
  .check{list-style:none;padding:0;}
  .check li{position:relative;padding-left:24px;}
  .check li::before{content:"";position:absolute;left:0;top:10px;width:8px;height:8px;border-radius:50%;background:#2e7bff;}
  .steps{counter-reset:step;list-style:none;padding:0;}
  .steps li{position:relative;padding-left:36px;margin-bottom:10px;counter-increment:step;}
  .steps li::before{content:counter(step);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;}
  .faq{margin-top:24px;}
  .faq-item{background:#0d1f44;border:1px solid #16315f;border-radius:14px;padding:16px 18px;margin-bottom:10px;}
  .faq-item h3{color:#eef3ff;margin-bottom:6px;}
  .faq-item p{color:#9fb2d4;font-size:14px;margin:0;}
  .rel{margin:32px 0 8px;}
  .rel-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));}
  .rel-card{display:block;padding:14px 16px;background:#0c1f40;border:1px solid #16315f;border-radius:12px;color:#eef3ff;font-size:14px;}
  .rel-card:hover{border-color:#2e7bff;color:#eef3ff;}
  footer.site{margin-top:64px;border-top:1px solid #16315f;background:#08172F;}
  footer.site .row{max-width:1180px;margin:0 auto;padding:28px 24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;color:#8499c0;font-size:13px;}
  footer.site a{color:#8499c0;margin-left:16px;}
  footer.site a:hover{color:#eef3ff;}
  /* mini order form */
  .order{background:linear-gradient(180deg,#0c1f40,#13294e);border:1px solid #1d3a6b;border-radius:18px;padding:24px;margin:24px 0;}
  .order h2{margin-bottom:6px;}
  .order .sub{color:#9fb2d4;font-size:14px;margin-bottom:18px;}
  .order .row{display:grid;gap:10px;grid-template-columns:1fr 1fr auto;align-items:end;}
  .order label{display:block;font-size:12px;color:#9fb2d4;margin-bottom:6px;}
  .order select,.order input{width:100%;background:#08172F;border:1px solid #1d3a6b;color:#eef3ff;border-radius:10px;padding:12px 14px;font-size:15px;font-family:inherit;}
  .order select:focus,.order input:focus{outline:none;border-color:#2e7bff;}
  .order button{background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;border:none;border-radius:10px;padding:13px 22px;font-weight:600;font-size:15px;cursor:pointer;font-family:inherit;white-space:nowrap;}
  .order button:hover{filter:brightness(1.08);}
  .order button:disabled{opacity:.6;cursor:wait;}
  .order .alt{margin-top:14px;font-size:13px;color:#8499c0;}
  .order .alt a{color:#2e7bff;}
  .order .err{color:#ff8d8d;margin-top:10px;font-size:13px;}
  .order .ok{background:#0c1f40;border:1px solid #15A34A;border-radius:14px;padding:24px;text-align:center;}
  .order .ok h3{color:#22C55E;margin-bottom:8px;}
  .order .ok p{color:#cfd9ef;margin:0;}
  /* Accessible tap targets (≥44px) for every interactive control */
  .btn-primary,.cta-btn,.order button,.order select,.order input,.rel-card{min-height:44px;}
  @media (max-width:768px){
    nav.top{display:none;}
    .block{padding:18px;}
  }
  @media (max-width:640px){
    .wrap{padding:16px;}
    h1{font-size:26px;}
    h2{font-size:19px;}
    .lead{font-size:16px;}
    .order .row{grid-template-columns:1fr;}
    .rel-grid{grid-template-columns:1fr;}
    .crumbs{font-size:12px;}
  }
  @media (max-width:380px){
    h1{font-size:23px;}
    .wrap{padding:14px;}
    .block{padding:15px;}
  }
</style>
${faqLd}
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(109522965, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/109522965" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
<script>
  // Mini order form: posts to the same Telegram bot + Google Sheets
  // that the main Tilda forms use. Both requests are fire-and-forget;
  // the user sees a success screen as long as at least one succeeds.
  window.ppSubmit = function(ev){
    ev.preventDefault();
    var form = ev.target;
    var card = form.closest('.order');
    var tier = form.querySelector('#pp-tier').value || '';
    var contact = form.querySelector('#pp-contact').value.trim();
    var err = card.querySelector('#pp-err');
    var btn = form.querySelector('#pp-submit');
    err.hidden = true;
    if (contact.length < 4) { err.textContent='Введите контакт (телефон, @username или email)'; err.hidden=false; return false; }
    btn.disabled = true; btn.textContent = 'Отправляем…';

    var service = card.dataset.service;
    var intent = card.dataset.intent;
    var page = location.pathname;
    var msg = [
      'Заявка с SEO-страницы PlataPay',
      'Сервис: ' + service,
      'Тариф: ' + (tier || '—'),
      'Контакт: ' + contact,
      'Страница: https://payoplata.ru' + page,
      'Интент: ' + intent,
    ].join('\\n');

    var BOT='8842294846:AAEYOKRa-M80_fnZGu1Qk_fbmB7fknIR8UE';
    var CHAT='523060537';
    var SHEETS='https://script.google.com/macros/s/AKfycbyy43Ff5kKivrUsaXWEkda7JXNwHrOI-3BJIJp3UG9H8K6cb4DxjpC8eXNPGNEXQEWt/exec';

    var tg = fetch('https://api.telegram.org/bot'+BOT+'/sendMessage', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id:CHAT, text:msg, parse_mode:'HTML', disable_web_page_preview:true})
    }).then(function(r){return r.ok;}).catch(function(){return false;});

    var sheet = fetch(SHEETS, {
      method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({source:'seo', page:page, service:service, intent:intent, tier:tier, contact:contact, ts:Date.now()})
    }).then(function(){return true;}).catch(function(){return false;});

    Promise.all([tg, sheet]).then(function(res){
      if (res[0] || res[1]) {
        card.innerHTML = '<div class="ok"><h3>Заявка принята</h3><p>Свяжемся в течение 5–15 минут по указанному контакту. Если срочно — напишите в Telegram: <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener">@Kimzar_A</a>.</p></div>';
        if (window.ym) window.ym(109522965, 'reachGoal', 'seo_order');
      } else {
        err.textContent = 'Не удалось отправить. Напишите нам в Telegram: @Kimzar_A';
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Оплатить';
      }
    });
    return false;
  };
</script>
</head>
<body>
<header class="site">
  <div class="row">
    <a class="logo" href="${base}">Plata<span>Pay</span></a>
    <nav class="top">
      <a href="${base}">Главная</a>
      <a href="${base}catalog/">Каталог</a>
      <a href="${base}faq/">FAQ</a>
      <a href="${base}contacts/">Контакты</a>
    </nav>
    <a class="cta-btn" href="${base}#popupforma">Оплатить сервис</a>
  </div>
</header>

<main class="wrap">
  <div class="hero">
    <div class="crumbs">
      <a href="${base}">Главная</a> · <a href="${base}catalog/">Каталог</a> · ${service.name}
    </div>
    <h1>${page.h1}</h1>
  </div>

  ${page.body}

  <section class="order" id="zakaz" data-service="${escapeAttr(service.name)}" data-intent="${intent.key}">
    <h2>Оплатить ${service.name}</h2>
    <p class="sub">Оставьте контакт — ответим в течение 5–15 минут и подтвердим сумму.</p>
    <form class="row" onsubmit="return ppSubmit(event)">
      <div>
        <label for="pp-tier">Тариф</label>
        <select id="pp-tier" name="tier">
          ${
            (service.tiers || []).length
              ? `<option value="">Любой / уточнить</option>` +
                service.tiers.map((t) => `<option>${escapeAttr(t)}</option>`).join('')
              : `<option value="">Уточним при ответе</option>`
          }
        </select>
      </div>
      <div>
        <label for="pp-contact">Телефон, Telegram или email</label>
        <input id="pp-contact" name="contact" type="text" inputmode="text" placeholder="+7 999 123-45-67 или @username" required autocomplete="off">
      </div>
      <button type="submit" id="pp-submit">Оплатить</button>
    </form>
    <div class="alt">
      Или сразу напишите:
      <a href="https://t.me/Kimzar_A?text=${encodeURIComponent('Привет! Хочу оплатить ' + service.name)}" target="_blank" rel="noopener">Telegram</a> ·
      <a href="https://wa.me/79676726909?text=${encodeURIComponent('Привет! Хочу оплатить ' + service.name)}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
    <div class="err" id="pp-err" hidden></div>
  </section>

  <section class="faq">
    <h2 style="padding-left:4px;">Частые вопросы</h2>
    ${faqBlock(page.faq)}
  </section>

  <section class="rel">
    <h2 style="padding-left:4px;">Другие материалы про ${service.name}</h2>
    ${relatedLinks(service, intents, intent.key)}
  </section>
</main>

<footer class="site">
  <div class="row">
    <div>© ${new Date().getFullYear()} PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282</div>
    <div>
      <a href="${base}">Главная</a>
      <a href="${base}catalog/">Каталог</a>
      <a href="${base}faq/">FAQ</a>
      <a href="${base}contacts/">Контакты</a>
    </div>
  </div>
</footer>
<script>window.PP_PAGE_SERVICE=${JSON.stringify(service.slug)};</script>
${pricingUi}
</body>
</html>`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
