// Hand-built modern SaaS home page for PlataPay. Generated at build time
// so it's fully under our control (no Tilda chrome). Reuses the same
// pieces as the rest of the site:
//   • CTAs link to #popupforma  → the mini order form injected by
//     enhance.mjs (Telegram bot + Google Sheets).
//   • Popular cards use the .pp-card class → pricing-ui.mjs hydrates the
//     price and opens the branded tariff modal on click.
//   • Search input (placeholder "Найти сервис…") → enhance.mjs attaches
//     the autocomplete dropdown.
// Catalog / FAQ / Contacts stay as the existing Tilda pages.

import { SERVICES, CATEGORIES } from './data.mjs';

const LOGO_BASE = 'https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/';

// Reviews live on Avito — set the real profile/reviews URL here (or via
// the AVITO_URL env var at build time). The cards below mirror Avito
// reviews and the section links straight to the Avito profile.
const AVITO_URL = process.env.AVITO_URL || 'https://www.avito.ru/user/0458b806c10e79c5e618d6625d9eed1f/profile?src=sharing';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

// Popular services shown as big cards (per spec). Each links to its SEO
// landing for crawlable internal linking; clicking opens the tariff modal.
const POPULAR = [
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Claude', slug: 'claude' },
  { name: 'Google One', slug: 'google' },
  { name: 'Canva', slug: 'canva' },
  { name: 'Midjourney', slug: 'midjourney' },
  { name: 'Spotify', slug: 'spotify' },
  { name: 'Netflix', slug: 'netflix-gift-card' },
  { name: 'YouTube Premium', slug: 'youtube-premium' },
  { name: 'PlayStation', slug: 'playstation-gift-card' },
  { name: 'Steam', slug: 'steam' },
];

function logoCell(name, slug) {
  const svc = bySlug[slug];
  const letter = esc(name[0] || '?');
  if (svc && svc.logo) {
    return `<span class="hp-logo"><img loading="lazy" alt="${esc(name)}" src="${LOGO_BASE}${svc.logo}" onerror="this.parentNode.classList.add('hp-logo-fb');this.parentNode.textContent='${letter}';"></span>`;
  }
  return `<span class="hp-logo hp-logo-fb">${letter}</span>`;
}

function popularCard({ name, slug }) {
  const desc = (bySlug[slug] && bySlug[slug].hint ? bySlug[slug].hint.split(',')[0] : 'Оплата из России');
  return `<div class="pp-card hp-pcard" data-pp-pricing="${esc(slug)}">
    <div class="hp-pcard-head">${logoCell(name, slug)}<span class="hp-pcard-name">${esc(name)}</span></div>
    <div class="hp-pcard-desc">${esc(desc.charAt(0).toUpperCase() + desc.slice(1))}</div>
    <a class="hp-pcard-pay" href="oplata-${esc(slug)}/" data-service="${esc(name)}"><span>Оплатить</span><span aria-hidden="true">›</span></a>
  </div>`;
}

// New verticals block.
const VERTICALS = [
  { icon: '🎟️', title: 'Билеты и достопримечательности', text: 'Disneyland, Louvre, Ticketmaster, Klook и концерты по всему миру.', href: 'kupit-bilet-disneyland/' },
  { icon: '🛍️', title: 'Зарубежные магазины', text: 'Farfetch, Amazon, StockX, Nike — оплатим заказ и поможем с доставкой.', href: 'oplata-magazina-amazon/' },
  { icon: '🎁', title: 'Gift Cards', text: 'App Store, Google Play, Steam, PlayStation — код сразу после оплаты.', href: 'kupit-gift-card-steam-gift-card/' },
  { icon: '🎮', title: 'Игровые ассеты и 3D', text: 'Unity Asset Store, Unreal, CGTrader, TurboSquid — на ваш аккаунт.', href: 'kupit-asset-unity-asset-store/' },
];

const FAQ = [
  ['Какие сервисы вы оплачиваете?', 'Более 500 зарубежных сервисов и направлений: AI (ChatGPT, Claude, Midjourney), подписки (Spotify, Netflix, YouTube Premium), App Store и Google Play, игры (Steam, PlayStation), магазины, билеты, gift cards, игровые ассеты и многое другое.'],
  ['Можно ли оплатить картой РФ?', 'Вы платите нам рублями — СБП, картой российского банка или переводом. Сам зарубежный сервис мы оплачиваем со своей иностранной карты, поэтому ограничения на карты РФ вас не касаются.'],
  ['Это безопасно?', 'Да. Мы не просим пароль от вашего аккаунта и данные вашей карты. Оплата проходит через биллинг сервиса с нашей зарубежной карты.'],
  ['Сколько занимает оплата?', 'Отвечаем за 1–15 минут, оплачиваем в среднем за 5–15 минут после подтверждения суммы. Для билетов на конкретный сеанс оформляем строго к нужной дате.'],
  ['Сколько стоит услуга?', 'Итоговую сумму в рублях называем до оплаты. Наша комиссия — от 5%, никаких скрытых платежей и автосписаний.'],
  ['Как оставить заявку?', 'Нажмите «Оставить заявку», укажите сервис и контакт (Telegram, WhatsApp или телефон) — мы свяжемся и подтвердим стоимость.'],
  ['Что делать, если оплата не прошла?', 'Если оплатить не удалось по нашей вине или со стороны сервиса — возвращаем деньги в полном объёме.'],
  ['Нужен ли мне иностранный аккаунт или карта?', 'Нет. Иностранная карта нужна нам, а не вам. При необходимости поможем создать аккаунт в правильном регионе.'],
  ['Вы оплачиваете подписки на год?', 'Да, оплачиваем как помесячно, так и за год — годовые тарифы обычно выгоднее.'],
  ['Какие способы связи?', 'Telegram (@Kimzar_A), WhatsApp и телефон. Поддержка работает ежедневно.'],
];

const REVIEWS = [
  ['Алексей', 'Оплатил ChatGPT Plus за 10 минут, всё пришло на мой аккаунт. Удобно, что не надо передавать пароль.'],
  ['Марина', 'Брала билеты в Лувр — помогли выбрать сеанс и оплатили. E-mail с билетами пришёл сразу.'],
  ['Дмитрий', 'Заказывал кроссовки на StockX, оплатили и подсказали по доставке. Всё прозрачно по цене.'],
  ['Ольга', 'Покупаю Steam Gift Card регулярно — код присылают быстро, регион всегда правильный.'],
];

export function renderHome({ base, verifyTags = '', inject = '' }) {
  const popular = POPULAR.map(popularCard).join('');
  const verticals = VERTICALS.map((v) => `
    <a class="hp-vert" href="${v.href}">
      <div class="hp-vert-ic">${v.icon}</div>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.text)}</p>
      <span class="hp-vert-go">Смотреть ›</span>
    </a>`).join('');
  const faq = FAQ.map(([q, a]) => `
    <details class="hp-faq-item">
      <summary>${esc(q)}</summary>
      <p>${esc(a)}</p>
    </details>`).join('');
  const reviews = REVIEWS.map(([n, t]) => `
    <figure class="hp-rev">
      <div class="hp-rev-top"><div class="hp-rev-stars">★★★★★</div><span class="hp-rev-src">Авито</span></div>
      <blockquote>${esc(t)}</blockquote>
      <figcaption><span class="hp-rev-av">${esc(n[0])}</span>${esc(n)}</figcaption>
    </figure>`).join('');
  const faqLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  })}</script>`;
  const orgLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization', name: 'PlataPay',
    url: 'https://payoplata.ru/', description: 'Оплата зарубежных сервисов, подписок, магазинов, билетов и gift cards из России.',
  })}</script>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${base}">
<title>PlataPay — оплата зарубежных сервисов, подписок и покупок из России</title>
<meta name="description" content="Оплачиваем зарубежные сервисы, подписки и покупки из России: ChatGPT, Claude, Midjourney, App Store, Google Play, Booking, Airbnb, Farfetch, билеты, музеи и тысячи других. Оплата за 5–15 минут.">
<link rel="canonical" href="https://payoplata.ru/">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="PlataPay">
<meta property="og:title" content="PlataPay — оплата зарубежных сервисов из России">
<meta property="og:description" content="ChatGPT, App Store, Booking, Farfetch, билеты, gift cards и тысячи сервисов. Оплата за 5–15 минут.">
<meta property="og:url" content="https://payoplata.ru/">
${verifyTags}
${orgLd}
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
<style>
  :root{color-scheme:dark;--bg:#08172F;--accent:#2e7bff;--line:#16315f;--text:#eef3ff;--muted:#9fb2d4;}
  *,*::before,*::after{box-sizing:border-box;}
  html,body{margin:0;max-width:100%;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.55;}
  img,svg{max-width:100%;}
  a{color:#7BAEFF;text-decoration:none;}
  .wrap{max-width:1180px;margin:0 auto;padding:0 20px;}
  h2{font-size:30px;letter-spacing:-.02em;margin:0 0 8px;font-weight:750;}
  .sec{padding:54px 0;}
  .sec-sub{color:var(--muted);margin:0 0 26px;font-size:16px;}
  /* header */
  header.hp{position:sticky;top:0;z-index:50;background:rgba(8,23,47,.86);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);}
  header.hp .row{display:flex;align-items:center;justify-content:space-between;height:64px;}
  .hp-logo-txt{font-size:22px;font-weight:800;color:var(--text);}
  .hp-logo-txt span{color:var(--accent);}
  header.hp nav{display:flex;align-items:center;gap:22px;}
  header.hp nav a{color:var(--muted);font-size:15px;}
  header.hp nav a:hover{color:var(--text);}
  .hp-burger{display:none;width:44px;height:44px;border:1px solid var(--line);border-radius:12px;background:transparent;cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:5px;}
  .hp-burger span{display:block;width:20px;height:2px;background:var(--text);border-radius:2px;transition:.2s;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:13px 24px;border-radius:999px;font-weight:700;font-size:16px;cursor:pointer;border:1px solid transparent;transition:filter .15s,transform .15s,background .15s;}
  .btn-pri{background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;box-shadow:0 14px 34px -12px rgba(46,123,255,.7);}
  .btn-pri:hover{filter:brightness(1.08);color:#fff;}
  .btn-ghost{background:rgba(255,255,255,.05);color:var(--text);border-color:var(--line);}
  .btn-ghost:hover{background:rgba(255,255,255,.1);color:var(--text);}
  .btn-sm{min-height:44px;padding:10px 18px;font-size:14px;}
  /* hero */
  .hero{position:relative;padding:72px 0 40px;overflow:hidden;}
  .hero::before{content:"";position:absolute;top:-180px;right:-120px;width:520px;height:520px;background:radial-gradient(circle,rgba(46,123,255,.34),transparent 65%);pointer-events:none;}
  .hero::after{content:"";position:absolute;bottom:-220px;left:-140px;width:520px;height:520px;background:radial-gradient(circle,rgba(124,92,255,.20),transparent 68%);pointer-events:none;}
  .hero .inner{position:relative;max-width:820px;}
  .hero h1{font-size:48px;line-height:1.08;letter-spacing:-.03em;margin:0 0 18px;font-weight:800;}
  .hero p.lead{font-size:19px;color:#cfd9ef;margin:0 0 28px;}
  .hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:26px;}
  .hero-search{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:14px;padding:6px 8px 6px 16px;max-width:520px;margin-bottom:26px;}
  .hero-search svg{flex:0 0 auto;color:var(--muted);}
  .hero-search input{flex:1;min-width:0;background:transparent;border:0;color:var(--text);font-size:16px;min-height:44px;outline:none;}
  .stat-row{display:grid;grid-template-columns:repeat(4,auto);gap:26px;}
  .stat b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em;}
  .stat span{color:var(--muted);font-size:13px;}
  /* trust counters */
  .trust-band{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
  .trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:30px 0;}
  .trust-grid>div{text-align:center;}
  .trust-grid b{display:block;font-size:30px;font-weight:800;color:#fff;letter-spacing:-.02em;}
  .trust-grid span{color:var(--muted);font-size:14px;}
  /* popular cards */
  .hp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
  .hp-pcard{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:18px;padding:18px;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;backdrop-filter:blur(6px);}
  .hp-pcard:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:0 22px 50px -28px rgba(46,123,255,.6);}
  .hp-pcard-head{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
  .hp-logo{width:46px;height:46px;flex:0 0 auto;border-radius:13px;background:#fff;display:grid;place-items:center;overflow:hidden;}
  .hp-logo img{width:100%;height:100%;object-fit:contain;padding:7px;}
  .hp-logo-fb{background:linear-gradient(135deg,var(--accent),#08172F);color:#fff;font-weight:800;font-size:20px;}
  .hp-pcard-name{font-weight:750;font-size:17px;}
  .hp-pcard-desc{color:var(--muted);font-size:13px;min-height:36px;margin-bottom:14px;}
  .hp-pcard-pay{display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:10px 14px;border-radius:12px;background:rgba(46,123,255,.12);border:1px solid rgba(46,123,255,.3);color:#cfe0ff;font-weight:700;font-size:14px;}
  .hp-pcard:hover .hp-pcard-pay{background:var(--accent);color:#fff;}
  .hp-more{text-align:center;margin-top:26px;}
  /* verticals */
  .hp-vert-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;}
  .hp-vert{display:block;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:20px;padding:24px;color:var(--text);transition:transform .15s,border-color .15s;}
  .hp-vert:hover{transform:translateY(-3px);border-color:var(--accent);color:var(--text);}
  .hp-vert-ic{font-size:30px;margin-bottom:12px;}
  .hp-vert h3{margin:0 0 8px;font-size:19px;}
  .hp-vert p{color:var(--muted);font-size:14px;margin:0 0 14px;}
  .hp-vert-go{color:#7BAEFF;font-weight:700;font-size:14px;}
  /* steps */
  .hp-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;counter-reset:st;}
  .hp-step{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:18px;padding:22px;}
  .hp-step-n{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-weight:800;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;margin-bottom:12px;}
  .hp-step h3{margin:0 0 6px;font-size:17px;}
  .hp-step p{color:var(--muted);font-size:14px;margin:0;}
  /* why */
  .hp-why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;}
  .hp-why{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:18px;padding:22px;}
  .hp-why-ic{font-size:24px;margin-bottom:10px;}
  .hp-why h3{margin:0 0 6px;font-size:17px;}
  .hp-why p{color:var(--muted);font-size:14px;margin:0;}
  /* reviews */
  .hp-rev-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;}
  .hp-rev{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:18px;padding:22px;margin:0;}
  .hp-rev-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
  .hp-rev-stars{color:#ffc83d;letter-spacing:2px;}
  .hp-rev-src{font-size:11px;font-weight:800;color:#0af27a;background:rgba(10,242,122,.12);border:1px solid rgba(10,242,122,.35);border-radius:999px;padding:3px 9px;}
  .hp-rev blockquote{margin:0 0 14px;color:#dfe8fb;font-size:15px;}
  .hp-rev figcaption{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:14px;}
  .hp-rev-av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent),#7c5cff);color:#fff;font-weight:800;}
  /* faq */
  .hp-faq{max-width:820px;}
  .hp-faq-item{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;padding:0 18px;}
  .hp-faq-item summary{cursor:pointer;list-style:none;padding:16px 0;font-weight:650;font-size:16px;position:relative;padding-right:30px;}
  .hp-faq-item summary::-webkit-details-marker{display:none;}
  .hp-faq-item summary::after{content:"+";position:absolute;right:2px;top:14px;font-size:22px;color:var(--accent);}
  .hp-faq-item[open] summary::after{content:"–";}
  .hp-faq-item p{color:var(--muted);margin:0 0 16px;font-size:15px;}
  /* big CTA */
  .hp-cta{background:linear-gradient(135deg,#13294e,#0c1f40);border:1px solid #1d3a6b;border-radius:24px;padding:44px;text-align:center;}
  .hp-cta h2{font-size:30px;}
  .hp-cta p{color:#cfd9ef;max-width:560px;margin:0 auto 24px;}
  /* footer */
  footer.hp{border-top:1px solid var(--line);background:#08172F;margin-top:20px;}
  .hp-foot{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:30px;padding:44px 0 24px;}
  .hp-foot p{color:var(--muted);font-size:14px;max-width:320px;}
  .hp-foot h4{font-size:15px;margin:0 0 14px;}
  .hp-foot a{display:block;color:var(--muted);margin-bottom:10px;font-size:14px;}
  .hp-foot a:hover{color:var(--accent);}
  .hp-foot-bottom{border-top:1px solid var(--line);padding:18px 0 36px;color:#8499c0;font-size:12.5px;line-height:1.5;}
  /* mobile */
  @media(max-width:900px){
    header.hp nav{position:fixed;inset:64px 0 auto 0;flex-direction:column;align-items:stretch;gap:0;background:#0a1c3a;border-bottom:1px solid var(--line);padding:8px 20px 18px;transform:translateY(-130%);transition:transform .25s;}
    header.hp nav.open{transform:translateY(0);}
    header.hp nav a{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06);min-height:44px;display:flex;align-items:center;}
    header.hp nav .btn{margin-top:12px;}
    .hp-burger{display:flex;}
    .hp-steps{grid-template-columns:1fr 1fr;}
    .hp-foot{grid-template-columns:1fr 1fr;}
  }
  @media(max-width:640px){
    .sec{padding:40px 0;}
    .hero{padding:44px 0 30px;}
    .hero h1{font-size:33px;}
    .hero p.lead{font-size:16px;}
    h2{font-size:25px;}
    .hero-cta .btn{flex:1 1 100%;}
    .stat-row{grid-template-columns:1fr 1fr;gap:18px;}
    .trust-grid{grid-template-columns:1fr 1fr;gap:18px;}
    .hp-steps{grid-template-columns:1fr;}
    .hp-foot{grid-template-columns:1fr;}
    .hp-cta{padding:30px 20px;}
  }
  @media(max-width:380px){ .hero h1{font-size:29px;} .stat b{font-size:22px;} .trust-grid b{font-size:24px;} }
</style>
</head>
<body>
<header class="hp">
  <div class="wrap row">
    <a class="hp-logo-txt" href="${base}">Plata<span>Pay</span></a>
    <button class="hp-burger" id="hpBurger" aria-label="Меню" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav id="hpNav">
      <a href="${base}catalog/">Каталог</a>
      <a href="#popular">Популярное</a>
      <a href="#how">Как это работает</a>
      <a href="${base}faq/">FAQ</a>
      <a href="${base}contacts/">Контакты</a>
      <a class="btn btn-pri btn-sm" href="#popupforma">Оставить заявку</a>
    </nav>
  </div>
</header>

<section class="hero">
  <div class="wrap inner">
    <h1>Оплачиваем зарубежные сервисы, подписки и покупки из России</h1>
    <p class="lead">ChatGPT, Claude, Midjourney, App Store, Google Play, Booking, Airbnb, Farfetch, билеты, музеи и тысячи других сервисов.</p>
    <div class="hero-cta">
      <a class="btn btn-pri" href="#popupforma">Оставить заявку</a>
      <a class="btn btn-ghost" href="${base}catalog/">Открыть каталог</a>
    </div>
    <form class="hero-search" action="${base}catalog/" method="get">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input type="search" name="q" placeholder="Найти сервис… ChatGPT, Spotify, Steam" autocomplete="off" enterkeyhint="search">
    </form>
    <div class="stat-row">
      <div class="stat"><b>500+</b><span>сервисов</span></div>
      <div class="stat"><b>от 5 мин</b><span>оплата</span></div>
      <div class="stat"><b>от 5%</b><span>комиссия</span></div>
      <div class="stat"><b>7 дней</b><span>в неделю</span></div>
    </div>
  </div>
</section>

<div class="trust-band">
  <div class="wrap">
    <div class="trust-grid">
      <!-- TODO: замените на реальные цифры из вашей статистики -->
      <div><b>10 000+</b><span>выполненных оплат</span></div>
      <div><b>5 000+</b><span>клиентов</span></div>
      <div><b>5–15 мин</b><span>среднее время оплаты</span></div>
      <div><b>4.9/5</b><span>средняя оценка</span></div>
    </div>
  </div>
</div>

<section class="sec" id="popular">
  <div class="wrap">
    <h2>Популярные сервисы</h2>
    <p class="sec-sub">Нажмите на карточку — покажем тарифы в рублях и оформим заявку.</p>
    <div class="hp-grid">${popular}</div>
    <div class="hp-more"><a class="btn btn-ghost" href="${base}catalog/">Все сервисы в каталоге</a></div>
  </div>
</section>

<section class="sec" style="padding-top:0;">
  <div class="wrap">
    <h2>Новые направления</h2>
    <p class="sec-sub">Не только подписки — оплачиваем покупки, билеты и цифровые товары.</p>
    <div class="hp-vert-grid">${verticals}</div>
  </div>
</section>

<section class="sec" id="how" style="background:rgba(255,255,255,.02);border-top:1px solid var(--line);border-bottom:1px solid var(--line);">
  <div class="wrap">
    <h2>Как это работает</h2>
    <p class="sec-sub">Четыре шага — от заявки до результата.</p>
    <div class="hp-steps">
      <div class="hp-step"><div class="hp-step-n">1</div><h3>Отправьте ссылку</h3><p>Сервис, подписку, товар или билет, который нужно оплатить.</p></div>
      <div class="hp-step"><div class="hp-step-n">2</div><h3>Мы проверим стоимость</h3><p>Назовём итоговую сумму в рублях — без скрытых комиссий.</p></div>
      <div class="hp-step"><div class="hp-step-n">3</div><h3>Оплатим за вас</h3><p>С зарубежной карты, на ваш аккаунт. Пароль не нужен.</p></div>
      <div class="hp-step"><div class="hp-step-n">4</div><h3>Получите результат</h3><p>Доступ, код или подтверждение — и чек об оплате.</p></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <h2>Почему PlataPay</h2>
    <p class="sec-sub">Удобно, прозрачно и с гарантией.</p>
    <div class="hp-why-grid">
      <div class="hp-why"><div class="hp-why-ic">⚡</div><h3>Быстро</h3><p>Ответ за 1–15 минут, оплата за 5–15 минут.</p></div>
      <div class="hp-why"><div class="hp-why-ic">🔒</div><h3>Безопасно</h3><p>Не просим пароль и данные вашей карты.</p></div>
      <div class="hp-why"><div class="hp-why-ic">💬</div><h3>Поддержка</h3><p>Telegram и WhatsApp, отвечаем ежедневно.</p></div>
      <div class="hp-why"><div class="hp-why-ic">🌍</div><h3>Тысячи сервисов</h3><p>AI, подписки, магазины, билеты, gift cards, ассеты.</p></div>
      <div class="hp-why"><div class="hp-why-ic">💳</div><h3>Работаем с картами РФ</h3><p>Вы платите рублями — СБП, картой или переводом.</p></div>
      <div class="hp-why"><div class="hp-why-ic">↩️</div><h3>С гарантией</h3><p>Не вышло — вернём деньги в полном объёме.</p></div>
    </div>
  </div>
</section>

<section class="sec" style="background:rgba(255,255,255,.02);border-top:1px solid var(--line);border-bottom:1px solid var(--line);">
  <div class="wrap">
    <h2>Отзывы клиентов</h2>
    <p class="sec-sub">Реальные отзывы покупателей на Авито.</p>
    <div class="hp-rev-grid">${reviews}</div>
    <div style="text-align:center;margin-top:26px;">
      <a class="btn btn-ghost" href="${AVITO_URL}" target="_blank" rel="noopener">Все отзывы на Авито ›</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <h2>Частые вопросы</h2>
    <p class="sec-sub">Коротко о главном.</p>
    <div class="hp-faq">${faq}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="hp-cta">
      <h2>Не нашли нужный сервис?</h2>
      <p>Отправьте заявку — проверим возможность оплаты и подскажем стоимость. Оплачиваем почти всё, что работает за рубежом.</p>
      <a class="btn btn-pri" href="#popupforma">Отправить заявку</a>
    </div>
  </div>
</section>

<footer class="hp">
  <div class="wrap">
    <div class="hp-foot">
      <div>
        <a class="hp-logo-txt" href="${base}" style="display:inline-block;margin-bottom:12px;">Plata<span>Pay</span></a>
        <p>Сервис оплаты зарубежных сервисов, подписок, магазинов, билетов и gift cards из России — быстро, безопасно и без автосписаний.</p>
      </div>
      <div>
        <h4>Навигация</h4>
        <a href="${base}">Главная</a>
        <a href="${base}catalog/">Каталог</a>
        <a href="${base}faq/">FAQ</a>
        <a href="${base}contacts/">Контакты</a>
      </div>
      <div>
        <h4>Контакты</h4>
        <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener">Telegram</a>
        <a href="https://wa.me/79676726909" target="_blank" rel="noopener">WhatsApp</a>
        <a href="mailto:Apolon7-rus@mail.ru">Apolon7-rus@mail.ru</a>
      </div>
    </div>
    <div class="hp-foot-bottom">
      © ${new Date().getFullYear()} PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282 · ОГРН 1252300042356 · г. Геленджик, ул. Островского, 80А<br>
      PlataPay не является банком или платёжной системой. Мы оказываем консультационную и посредническую помощь в оплате зарубежных сервисов.
    </div>
  </div>
</footer>

<script>
(function(){
  var b=document.getElementById('hpBurger'),n=document.getElementById('hpNav');
  if(b&&n){
    b.addEventListener('click',function(){
      var open=n.classList.toggle('open');
      b.classList.toggle('open',open);
      b.setAttribute('aria-expanded',open?'true':'false');
    });
    n.addEventListener('click',function(e){ if(e.target.closest('a')) { n.classList.remove('open'); b.setAttribute('aria-expanded','false'); } });
    window.addEventListener('resize',function(){ if(window.innerWidth>900){ n.classList.remove('open'); } });
  }
})();
</script>
${inject}
</body>
</html>`;
}
