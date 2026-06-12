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

const SRC = 'tilda-original';
const OUT = 'out';
const RAW_BASE = process.env.NEXT_PUBLIC_BASE_PATH;
const BASE = RAW_BASE === undefined ? '/PlataPay' : RAW_BASE;
const BASE_HREF = BASE === '' ? '/' : BASE.endsWith('/') ? BASE : BASE + '/';

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
  //    Strip any pre-existing Tilda <base href="./"> first.
  html = html.replace(/<base\s+href="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${BASE_HREF}">`);

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

console.log(`\nDone. base href = ${BASE_HREF}`);
console.log('Output ready in ./out');
