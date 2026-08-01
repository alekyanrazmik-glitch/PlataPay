// Каркас «богатых» SEO-страниц (/oplata-<slug>/, /kak-oplatit-<slug>/ и
// т.д.) в новом дизайне PlataPay. Контентные блоки по-прежнему приходят
// из templates.mjs (page.body) — здесь только оболочка: шапка, hero,
// форма, FAQ, перелинковка, футер.
//
// В отличие от старой версии, CSS и JS не инлайнятся: страницы подключают
// общие css/pp-app.css и js/pp-app.js (см. seo/app-shell.mjs), поэтому
// каждая страница похудела примерно на 15 КБ.

import { relatedLinks } from './templates.mjs';
import {
  breadcrumbLd,
  breadcrumbs,
  escapeHtml,
  faqDetails,
  heroPanel,
  orderCard,
  stickyBar,
  whyCards,
  wrapPage,
} from './app-shell.mjs';
import { geoLinksFor } from './geo.mjs';

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

  const crumbLd = breadcrumbLd([
    { name: 'Главная', item: 'https://payoplata.ru/' },
    { name: 'Каталог', item: 'https://payoplata.ru/catalog/' },
    { name: page.h1, item: canonical },
  ]);

  // Service-схема: провайдер, зона обслуживания и Offer при известной цене.
  const serviceLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    serviceType: `Оплата ${service.name} из России`,
    provider: { '@type': 'Organization', name: 'PlataPay', url: 'https://payoplata.ru/' },
    areaServed: 'RU',
    url: canonical,
    ...(service.price
      ? { offers: { '@type': 'Offer', priceCurrency: 'RUB', price: String(service.price), url: canonical } }
      : {}),
  })}</script>`;

  const crumbs = breadcrumbs([
    { name: 'Главная', href: base },
    { name: 'Каталог', href: `${base}catalog/` },
    { name: service.name, href: `${base}oplata-${service.slug}/` },
    { name: intent.title },
  ]);

  const hero = heroPanel({
    service,
    h1: escapeHtml(page.h1),
    sub: `${escapeHtml(service.hint.charAt(0).toUpperCase() + service.hint.slice(1))}.`,
    price: service.price,
    priceNote: 'Итоговая сумма в рублях фиксируется до оплаты · комиссия 5%',
  });

  const stats = `<div class="pp-stats">
<div><b class="g">5.0</b><span>рейтинг на Avito</span></div>
<div><b>5–15 мин</b><span>от заявки до оплаты</span></div>
<div><b>140+</b><span>сервисов и направлений</span></div>
<div><b>08–24</b><span>ежедневно, МСК</span></div>
</div>`;

  const order = orderCard({
    service,
    intent: intent.key,
    title: `Оплатить ${escapeHtml(service.name)}`,
    sub: 'Оставьте контакт — ответим в течение 5–15 минут и подтвердим сумму.',
    tiers: service.tiers,
  });

  const body = `<main class="wrap">
${crumbs}
${hero}
<div style="margin-top:16px">${page.body}</div>
<section class="pp-sec"><h2>Почему оплачивают через PlataPay</h2>${whyCards()}${stats}</section>
${order}
<section class="pp-sec"><h2>Частые вопросы</h2>${faqDetails(page.faq)}</section>
${geoLinksFor(service, base)}
<section class="pp-sec"><h2>Другие материалы про ${escapeHtml(service.name)}</h2>${relatedLinks(service, intents, intent.key)}</section>
</main>
${stickyBar({ title: `Оплатить ${service.name}` })}`;

  return wrapPage({
    base,
    canonical,
    title: page.title,
    description: page.description,
    verifyTags,
    ld: crumbLd + serviceLd + faqLd,
    body,
    footerCompact: false,
    noscriptPixel: true,
    extraBodyEnd: `<script>window.PP_PAGE_SERVICE=${JSON.stringify(service.slug)};</script>${pricingUi}`,
  });
}
