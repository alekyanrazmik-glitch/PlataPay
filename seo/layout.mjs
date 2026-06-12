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
<style>
  :root { color-scheme: dark; }
  *,*::before,*::after{box-sizing:border-box;}
  html,body{margin:0;background:#08172F;color:#eef3ff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.55;}
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
  @media (max-width:640px){
    h1{font-size:28px;}
    h2{font-size:19px;}
    nav.top{display:none;}
    .block{padding:18px;}
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
</body>
</html>`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
