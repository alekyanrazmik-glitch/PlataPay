// Build script: assembles a static GitHub Pages site from the
// original Tilda export in tilda-original/.
//
// Output: out/
//   ├── index.html              (was page142115676.html — home)
//   ├── catalog/index.html      (was page143711326.html)
//   ├── faq/index.html          (was page144727686.html)
//   ├── contacts/index.html     (was page144877396.html)
//   ├── 404.html
//   ├── robots.txt, sitemap.xml, .nojekyll
//   ├── css/   js/   images/
//
// Patches each page so it works under both a project-pages basePath
// (e.g. /PlataPay/ at *.github.io) and a custom-domain root (e.g.
// payoplata.ru/). actions/configure-pages emits an empty string when
// a custom domain is set, so an empty env value must mean "no prefix"
// — not fall back to /PlataPay/.

import fs from 'node:fs';
import path from 'node:path';
import { buildEnhancement } from './seo/enhance.mjs';
import { buildPricingUiPatch } from './seo/pricing-ui.mjs';
import { patchStaticPrices } from './seo/static-pricing-patch.mjs';

const SRC = 'tilda-original';
const OUT = 'out';
const RAW_BASE = process.env.NEXT_PUBLIC_BASE_PATH;
const BASE = RAW_BASE === undefined ? '/PlataPay' : RAW_BASE;
const BASE_HREF = BASE === '' ? '/' : BASE.endsWith('/') ? BASE : BASE + '/';

// Search engine site-ownership verification codes. Empty string ->
// the meta tag is skipped. Override via env to rotate without code
// changes.
export const YANDEX_VERIFY = process.env.YANDEX_VERIFY || 'faaec45fb982b403';
export const GOOGLE_VERIFY = process.env.GOOGLE_VERIFY || '';

const enhanceInject = buildEnhancement(BASE_HREF);
const pricingUiPatch = buildPricingUiPatch();

const searchLayoutFix = `
<style id="pp-search-layout-fix">
  .pp-search-form .pp-ac-wrap,
  .pp-search .pp-ac-wrap{flex:1 1 auto !important;min-width:0 !important;display:block !important;}
  .pp-search-form .pp-ac-wrap input,
  .pp-search .pp-ac-wrap input{width:100% !important;}
  .pp-search-form{cursor:text;}
  .pp-search-form .pp-search-ico,
  .pp-search .pp-search-ico{pointer-events:none;}
</style>
<script>
(function(){
  function focusInput(input){
    if(!input) return;
    try{ input.focus({preventScroll:true}); }catch(e){ input.focus(); }
    if(typeof input.setSelectionRange==='function'){
      var len=input.value.length;
      try{ input.setSelectionRange(len,len); }catch(e){}
    }
  }
  function wireSearchFocus(root){
    var input=root.querySelector('input[name="q"], #ppSearch, input[placeholder*="ChatGPT"], input[placeholder*="Найти"]');
    if(!input || root.dataset.ppFocusFix) return;
    root.dataset.ppFocusFix='1';
    ['click','touchend'].forEach(function(evt){
      root.addEventListener(evt,function(e){
        if(e.target===input || e.target.closest('button,a')) return;
        if(evt==='touchend') e.preventDefault();
        focusInput(input);
      }, {passive:false});
    });
  }
  function init(){
    document.querySelectorAll('.pp-search-form,.pp-search').forEach(wireSearchFocus);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  setTimeout(init,500);
  setTimeout(init,1500);
})();
</script>
`;

function verifyTags() {
  let s = '';
  if (YANDEX_VERIFY) s += `<meta name="yandex-verification" content="${YANDEX_VERIFY}">`;
  if (GOOGLE_VERIFY) s += `<meta name="google-site-verification" content="${GOOGLE_VERIFY}">`;
  return s;
}

const PAGES = [
  { src: 'page142115676.html', dest: 'index.html', isHome: true },
  { src: 'page143711326.html', dest: 'catalog/index.html' },
  { src: 'page144727686.html', dest: 'faq/index.html' },
  { src: 'page144877396.html', dest: 'contacts/index.html' },
];

const ASSET_DIRS = {
  css: (f) => f.endsWith('.css'),
  js: (f) => f.endsWith('.js'),
  images: (f) => /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(f),
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const dir of Object.keys(ASSET_DIRS)) {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
}

const skip = new Set([
  ...PAGES.map((p) => p.src),
  'page142115676body.html',
  'page143711326body.html',
  'page144727686body.html',
  'page144877396body.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'htaccess',
  'readme.txt',
]);

for (const f of fs.readdirSync(SRC)) {
  if (skip.has(f)) continue;
  const full = path.join(SRC, f);
  if (!fs.statSync(full).isFile()) continue;

  let placed = false;
  for (const [dir, match] of Object.entries(ASSET_DIRS)) {
    if (match(f)) {
      fs.copyFileSync(full, path.join(OUT, dir, f));
      placed = true;
      break;
    }
  }
  if (!placed) fs.copyFileSync(full, path.join(OUT, f));
}

// Copy the favicon at the root for browsers/CDNs
fs.copyFileSync(
  path.join(SRC, 'tild3863-3361-4433-b334-613561366261__platapay_favicon.svg'),
  path.join(OUT, 'favicon.svg'),
);
fs.copyFileSync(path.join(SRC, 'robots.txt'), path.join(OUT, 'robots.txt'));
fs.copyFileSync(path.join(SRC, 'sitemap.xml'), path.join(OUT, 'sitemap.xml'));

// Custom 404 that matches the site rather than Tilda's stock page
fs.writeFileSync(
  path.join(OUT, '404.html'),
  `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>404 — PlataPay</title>
${verifyTags()}
<link rel="icon" href="${BASE_HREF}favicon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: dark; }
  html,body{margin:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',system-ui,sans-serif;background:#08172F;color:#eef3ff;}
  .wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;}
  .tag{font-size:12px;letter-spacing:.12em;color:#7BAEFF;text-transform:uppercase;font-weight:600;}
  h1{font-size:48px;margin:16px 0 8px;font-weight:600;letter-spacing:-.02em;}
  p{color:#9fb2d4;max-width:480px;margin:0 0 24px;line-height:1.5;}
  .btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
  a{display:inline-flex;align-items:center;padding:12px 20px;border-radius:999px;font-size:15px;font-weight:600;text-decoration:none;}
  .primary{background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;}
  .ghost{background:#0c1f40;color:#eef3ff;border:1px solid #1d3a6b;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="tag">404</div>
    <h1>Страница не найдена</h1>
    <p>Возможно, страница была перемещена или ссылка устарела. Откройте каталог или вернитесь на главную.</p>
    <div class="btns">
      <a class="primary" href="${BASE_HREF}">На главную</a>
      <a class="ghost" href="${BASE_HREF}catalog/">Открыть каталог</a>
    </div>
  </div>
</body>
</html>
`,
);

// .nojekyll so GitHub Pages serves _next-style files too
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

function patchCatalogSearch(html) {
  if (!html.includes('id="ppSearch"')) return html;

  html = html.replace(
    '<div class="pp-search"> <svg viewBox="0 0 24 24"',
    '<div class="pp-search" role="search"> <svg class="pp-search-ico" aria-hidden="true" viewBox="0 0 24 24"',
  );
  html = html.replace(
    '<input id="ppSearch" type="text" placeholder="Найти сервис…" autocomplete="off"> </div>',
    '<input id="ppSearch" type="search" placeholder="Найти сервис…" autocomplete="off" enterkeyhint="search" autocapitalize="none" spellcheck="false"><button class="pp-search-clear" id="ppSearchClear" type="button" aria-label="Очистить поиск" hidden>&times;</button> </div>',
  );
  html = html.replace(
    '    transition:border-color .2s;\n  }\n  .pp-search:focus-within{border-color:var(--accent);}',
    '    transition:border-color .2s;\n    cursor:text;\n  }\n  .pp-search:focus-within{border-color:var(--accent);}',
  );
  html = html.replace(
    '  .pp-search input::placeholder{color:var(--muted);}\n',
    `  .pp-search input::placeholder{color:var(--muted);}
  .pp-search-ico{flex:0 0 auto; pointer-events:none;}
  .pp-search input[type="search"]::-webkit-search-cancel-button{display:none;}
  .pp-search-clear{
    width:28px; height:28px; flex:0 0 auto;
    display:none; place-items:center;
    border:0; border-radius:999px; padding:0;
    background:rgba(255,255,255,.08); color:var(--muted);
    font:700 20px/1 -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
    cursor:pointer; -webkit-tap-highlight-color:transparent;
    transition:background .2s,color .2s;
  }
  .pp-search-clear:not([hidden]){display:grid;}
  .pp-search-clear:hover{background:rgba(255,255,255,.14); color:var(--text);}
`,
  );
  html = html.replace(
    '  const searchEl=document.getElementById("ppSearch");\n  let active="all";',
    '  const searchEl=document.getElementById("ppSearch");\n  const searchWrap=document.querySelector(".pp-search");\n  const clearSearchEl=document.getElementById("ppSearchClear");\n  let active="all";',
  );
  html = html.replace(
    '  searchEl.addEventListener("input",function(){query=this.value; renderCards();});\n',
    `  function focusSearch(){
    if(!searchEl) return;
    try{ searchEl.focus({preventScroll:true}); }catch(e){ searchEl.focus(); }
    if(typeof searchEl.setSelectionRange==="function"){
      var len=searchEl.value.length;
      try{ searchEl.setSelectionRange(len,len); }catch(e){}
    }
  }
  function syncSearchClear(){
    if(clearSearchEl){ clearSearchEl.hidden = !searchEl.value; }
  }
  searchEl.addEventListener("input",function(){query=this.value; syncSearchClear(); renderCards();});
  if(searchWrap){
    ["click","touchend"].forEach(function(evt){
      searchWrap.addEventListener(evt,function(e){
        if(e.target===searchEl || e.target===clearSearchEl) return;
        if(evt==="touchend") e.preventDefault();
        focusSearch();
      }, {passive:false});
    });
  }
  if(clearSearchEl){
    ["click","touchend"].forEach(function(evt){
      clearSearchEl.addEventListener(evt,function(e){
        e.preventDefault();
        searchEl.value="";
        query="";
        syncSearchClear();
        renderCards();
        focusSearch();
      }, {passive:false});
    });
  }
`,
  );
  html = html.replace(
    '      searchEl.value = urlQ;\n    }\n  }catch(e){}\n\n  renderCats(); renderCards();',
    '      searchEl.value = urlQ;\n    }\n  }catch(e){}\n\n  syncSearchClear();\n  renderCats(); renderCards();',
  );
  return html;
}

function patchPage(html, isHome) {
  // 1) Nav links: rewrite absolute SPA-style paths to relative paths
  //    that combine with <base href> correctly. Done BEFORE the base
  //    tag is injected — otherwise href="/" inside <base href="/">
  //    would itself match and turn into href="./".
  const navRewrites = [
    [/href="\/"/g, 'href="./"'],
    [/href="\/catalog\/?"/g, 'href="catalog/"'],
    [/href="\/catalog\?/g, 'href="catalog/?'],
    [/href="\/faq\/?"/g, 'href="faq/"'],
    [/href="\/contacts\/?"/g, 'href="contacts/"'],
    [/href="\/#/g, 'href="./#'],
    [/action="\/catalog\/?"/g, 'action="catalog/"'],
  ];
  for (const [re, repl] of navRewrites) html = html.replace(re, repl);

  // 2) base href so relative asset paths (css/, js/, images/) resolve
  //    correctly from any depth and under any GitHub Pages basePath.
  //    Strip any pre-existing Tilda <base href="./"> first. Also inject
  //    site-verification meta tags here so every Tilda page carries them.
  html = html.replace(/<base\s+href="[^"]*"\s*\/?>/gi, '');
  html = html.replace(
    /<head([^>]*)>/i,
    `<head$1><base href="${BASE_HREF}">${verifyTags()}`,
  );

  // 3) Keep the catalog search usable on mobile Safari and add a clear button.
  html = patchCatalogSearch(html);

  // 4) Replace hardcoded card prices with calculated prices before the page is written.
  html = patchStaticPrices(html);

  // 5) Drop the Tilda branding badge ("Made on Tilda") that's hardcoded
  //    in the export.
  html = html.replace(
    /<!--\s*Tilda copyright[^>]*-->\s*<div class="t-tildalabel[\s\S]*?<\/div>\s*<\/div>/i,
    '',
  );
  html = html.replace(/<div class="t-tildalabel[\s\S]*?<\/a>\s*<\/div>/gi, '');

  // 6) Inject our mini order form, search autocomplete, layout fixes and pricing UI just before </body>.
  // Use a function replacer: the injected scripts contain "$'" and other
  // "$" sequences that String.replace would otherwise treat as special
  // replacement patterns and corrupt.
  html = html.replace('</body>', () => `${pricingUiPatch}${enhanceInject}${searchLayoutFix}</body>`);

  return html;
}

for (const { src, dest, isHome } of PAGES) {
  const html = fs.readFileSync(path.join(SRC, src), 'utf8');
  const patched = patchPage(html, isHome);
  const outPath = path.join(OUT, dest);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, patched);
  console.log(`built ${dest}`);
}

// ---------------- SEO landing pages ----------------
const { SERVICES: SEO_SERVICES, INTENTS } = await import('./seo/data.mjs');
const { RENDERERS } = await import('./seo/templates.mjs');
const { renderPage } = await import('./seo/layout.mjs');

const seoUrls = [];
let seoCount = 0;
for (const service of SEO_SERVICES) {
  for (const intent of INTENTS) {
    const page = RENDERERS[intent.key](service, INTENTS);
    const html = renderPage({ base: BASE_HREF, page, service, intent, intents: INTENTS, verifyTags: verifyTags(), pricingUi: pricingUiPatch });
    const slug = intent.slug(service.slug);
    const dir = path.join(OUT, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    seoUrls.push(`https://payoplata.ru/${slug}/`);
    seoCount++;
  }
}
console.log(`built ${seoCount} SEO pages`);

// Hub index of SEO pages, grouped by service. Helps crawlers find
// every landing and serves as an internal-linking spine.
const grouped = {};
for (const s of SEO_SERVICES) {
  (grouped[s.cat] ||= []).push(s);
}
const hub = `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${BASE_HREF}">
<title>Все сервисы PlataPay — оплата подписок из России</title>
<meta name="description" content="Полный список зарубежных сервисов, которые мы оплачиваем из России: оплата, инструкции, тарифы и подписки.">
<link rel="canonical" href="https://payoplata.ru/seo/">
${verifyTags()}
<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109522965,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
<noscript><div><img src="https://mc.yandex.ru/watch/109522965" style="position:absolute;left:-9999px;" alt=""/></div></noscript>
<style>
  :root{color-scheme:dark;}
  body{margin:0;background:#08172F;color:#eef3ff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',system-ui,sans-serif;}
  .wrap{max-width:1080px;margin:0 auto;padding:32px 24px;}
  h1{font-size:34px;font-weight:600;letter-spacing:-.02em;margin:0 0 12px;}
  .sub{color:#9fb2d4;margin-bottom:32px;}
  h2{font-size:20px;margin:32px 0 12px;color:#7BAEFF;}
  .svc{background:#0c1f40;border:1px solid #16315f;border-radius:14px;padding:14px 16px;margin-bottom:10px;}
  .svc h3{margin:0 0 8px;font-size:16px;}
  .svc a{display:inline-block;margin:0 12px 4px 0;font-size:13px;color:#cfd9ef;}
  .svc a:hover{color:#2e7bff;}
  a{color:#7BAEFF;text-decoration:none;}
  a.home{display:inline-block;margin-bottom:16px;color:#9fb2d4;font-size:14px;}
</style>
</head><body>
<div class="wrap">
<a class="home" href="${BASE_HREF}">← На главную</a>
<h1>Все сервисы и материалы</h1>
<p class="sub">${SEO_SERVICES.length} сервисов × ${INTENTS.length} материалов = ${seoCount} страниц. Выберите сервис и тип материала.</p>
${Object.entries(grouped).map(([cat, list]) => `
  <h2>${cat}</h2>
  ${list.map((s) => `
    <div class="svc">
      <h3>${s.name}</h3>
      ${INTENTS.map((i) => `<a href="${BASE_HREF}${i.slug(s.slug)}/">${i.title} ${s.name}</a>`).join('')}
    </div>
  `).join('')}
`).join('')}
</div>
</body></html>`;
fs.mkdirSync(path.join(OUT, 'seo'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'seo', 'index.html'), hub);
seoUrls.push('https://payoplata.ru/seo/');

// Rewrite sitemap.xml so search engines actually find the new pages.
const baseUrls = [
  'https://payoplata.ru/',
  'https://payoplata.ru/catalog/',
  'https://payoplata.ru/faq/',
  'https://payoplata.ru/contacts/',
];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...baseUrls, ...seoUrls]
  .map(
    (u) => `<url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u === 'https://payoplata.ru/' ? '1.0' : '0.6'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml: ${baseUrls.length + seoUrls.length} urls`);

console.log(`\nDone. base href = ${BASE_HREF}`);
console.log('Output ready in ./out');
