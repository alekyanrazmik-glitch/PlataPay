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
// Patches each page so it works under GitHub Pages /PlataPay/:
//   - injects <base href="/PlataPay/"> so relative asset paths resolve
//   - rewrites nav links /, /catalog, /faq, /contacts to relative
//     paths so they survive the basePath

import fs from 'node:fs';
import path from 'node:path';

const SRC = 'tilda-original';
const OUT = 'out';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '/PlataPay';
const BASE_HREF = BASE.endsWith('/') ? BASE : BASE + '/';

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

// Copy the favicon and 404 at the root for browsers/CDNs
fs.copyFileSync(
  path.join(SRC, 'tild3863-3361-4433-b334-613561366261__platapay_favicon.svg'),
  path.join(OUT, 'favicon.svg'),
);
fs.copyFileSync(path.join(SRC, '404.html'), path.join(OUT, '404.html'));
fs.copyFileSync(path.join(SRC, 'robots.txt'), path.join(OUT, 'robots.txt'));
fs.copyFileSync(path.join(SRC, 'sitemap.xml'), path.join(OUT, 'sitemap.xml'));

// .nojekyll so GitHub Pages serves _next-style files too
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

function patchPage(html, isHome) {
  // 1) base href so relative asset paths (css/, js/, images/) resolve
  //    correctly from any depth and under any GitHub Pages basePath.
  if (!/<base\s+href=/.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${BASE_HREF}">`);
  }

  // 2) Nav links: rewrite absolute SPA-style paths to relative paths
  //    that combine with <base href> correctly.
  const navMap = {
    '"/"': '"./"',
    '"/catalog"': '"catalog/"',
    '"/catalog/"': '"catalog/"',
    '"/faq"': '"faq/"',
    '"/faq/"': '"faq/"',
    '"/contacts"': '"contacts/"',
    '"/contacts/"': '"contacts/"',
  };
  for (const [k, v] of Object.entries(navMap)) {
    html = html.split(`href=${k}`).join(`href=${v}`);
  }
  // Query strings like /catalog?q=ChatGPT — preserve the query
  html = html.replace(/href="\/catalog\?/g, 'href="catalog/?');

  // 3) Anchors that point to the home page section like /#Otzivi
  //    should target the home, which lives at the base href.
  html = html.replace(/href="\/#/g, 'href="./#');

  // 4) Form action attributes that were /catalog should also be relative
  html = html.replace(/action="\/catalog"/g, 'action="catalog/"');

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
