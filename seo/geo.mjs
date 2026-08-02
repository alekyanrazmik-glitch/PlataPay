// Массовый генератор SEO-страниц (гео-матрица + способы оплаты + хабы
// городов) в новом дизайне. Именно этот модуль даёт основной объём —
// ~100 тысяч страниц: сервис × город × {оплата, купить}.
//
// Принципы:
//  - страницы лёгкие (~6 КБ): общий CSS/JS файлами, без инлайна;
//  - тексты вариативные: интро, шаги, FAQ и заголовки выбираются
//    детерминированным хэшем от (сервис, город, интент) из пулов,
//    чтобы страницы не были дословными копиями друг друга;
//  - гео-страницы честные: везде сказано, что работаем онлайн по всей
//    России и город на сроки не влияет;
//  - плоские .html файлы (g/<сервис>/oplata-<город>.html) — вдвое меньше
//    inode'ов, чем каталоги с index.html: важно при деплое 100k файлов.
//
// Управление объёмом:
//  SEO_GEO=0           — полностью выключить массовый ярус (быстрая сборка);
//  SEO_GEO_CITIES=N    — сколько городов брать из cities.mjs (по умолчанию 350).

import fs from 'node:fs';
import path from 'node:path';
import { CITIES } from './cities.mjs';
import { kindOf } from './data.mjs';
import {
  CONTACTS,
  TARIFFS,
  breadcrumbs,
  clampMeta,
  escapeAttr,
  escapeHtml,
  faqDetails,
  hashStr,
  heroPanel,
  money,
  orderCard,
  pick,
  stickyBar,
  tariffPrice,
  whyCards,
  wrapPage,
  breadcrumbLd,
} from './app-shell.mjs';

const SITE = 'https://payoplata.ru';

// ------------------------------------------------------------- словари

// Существительное для интента «купить» по типу вертикали.
const KIND_KUPIT = {
  subscription: { verb: 'Купить подписку', noun: 'подписку' },
  ticket: { verb: 'Купить билеты', noun: 'билеты' },
  shop: { verb: 'Заказать и оплатить', noun: 'товары' },
  giftcard: { verb: 'Купить подарочную карту', noun: 'подарочную карту' },
  asset: { verb: 'Купить ассеты', noun: 'ассеты' },
};

// Способы оплаты: slug → фраза для H1/тайтла («Оплата X …») + деталь.
export const PAY_METHODS = [
  { slug: 'kartoj-mir', phrase: 'картой «Мир»', detail: 'Принимаем карты «Мир» любого российского банка — вы платите нам в рублях, дальше мы рассчитываемся с сервисом зарубежной картой.' },
  { slug: 'kartoj-sberbanka', phrase: 'картой Сбербанка', detail: 'Перевод на карту или по СБП из приложения Сбербанка — как обычный платёж внутри России.' },
  { slug: 'kartoj-tinkoff', phrase: 'картой Т-Банка', detail: 'Оплата с карты Т-Банка (Тинькофф) переводом или по СБП — без валютных операций.' },
  { slug: 'kartoj-alfa-banka', phrase: 'картой Альфа-Банка', detail: 'Оплата с карты Альфа-Банка переводом или по СБП — без валютных операций.' },
  { slug: 'kartoj-vtb', phrase: 'картой ВТБ', detail: 'Оплата с карты ВТБ переводом или по СБП — без валютных операций.' },
  { slug: 'cherez-sbp', phrase: 'через СБП', detail: 'Система быстрых платежей: перевод по номеру телефона из приложения любого банка РФ, зачисление мгновенное.' },
  { slug: 'kriptovalyutoj', phrase: 'криптовалютой', detail: 'Принимаем USDT (TRC-20), TON и BTC — удобно, если рублёвые способы не подходят.' },
  { slug: 'cherez-yumoney', phrase: 'через ЮMoney', detail: 'Оплата с кошелька ЮMoney — подходит тем, кто держит баланс в электронных деньгах.' },
  { slug: 'bez-zarubezhnoj-karty', phrase: 'без зарубежной карты', detail: 'Своя иностранная карта не нужна: платите российской картой, зарубежной картой платим мы.' },
  { slug: 's-rossijskoj-karty', phrase: 'с российской карты', detail: 'Платёж уходит с вашей обычной российской карты нам, а сервису платит наша зарубежная карта.' },
  { slug: 'za-rubli', phrase: 'за рубли', detail: 'Вся сумма фиксируется в рублях до оплаты: курс и комиссия уже включены, доплат не будет.' },
  { slug: 'onlajn', phrase: 'онлайн', detail: 'Полностью дистанционно: заявка на сайте, подтверждение в Telegram или WhatsApp, доступ приходит онлайн.' },
];

// ------------------------------------------------------ пулы текстов

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Интро для «оплата {name} {в городе}».
function introOplata(s, c, seed, kind) {
  const price = s.price ? `от ${money(s.price)}` : 'по курсу дня';
  const what = {
    subscription: 'подписку',
    ticket: 'билеты',
    shop: 'заказ',
    giftcard: 'подарочную карту нужного региона',
    asset: 'покупку на площадке',
  }[kind];
  const v = [
    `${s.name} — это ${s.hint}. Напрямую из России оплатить сервис не выйдет: карты российских банков он не принимает. PlataPay решает задачу ${c.v} за 5–15 минут: вы оставляете заявку, мы проводим оплату с зарубежной карты, и ${what === 'подписку' ? 'подписка остаётся на вашем аккаунте' : 'вы получаете свой заказ как обычно'}.`,
    `Ищете, как оплатить ${s.name} ${c.v}? Российские карты сервис не принимает, но задача решаемая: PlataPay оплатит ${what} за вас с зарубежной карты. Всё онлайн — заявка, подтверждение суммы в Telegram, готово. Стоимость — ${price}, комиссия сервиса 5% уже видна до оплаты.`,
    `${cap(c.v)} ${s.name} оплачивают через PlataPay: это сервис-посредник с живым оператором. ${s.name} — ${s.hint}. Мы берём оплату на себя: вы платите в рублях картой РФ, по СБП или в USDT, а сервису платит наша зарубежная карта.`,
    `Оплата ${s.name} ${c.v} занимает 5–15 минут: оставьте заявку, оператор подтвердит сумму (${price}) и пришлёт реквизиты. Никаких данных вашей карты и пароля от аккаунта — платёж проходит с нашей зарубежной карты, доступ остаётся у вас.`,
  ];
  return pick(v, seed);
}

// Интро для «купить {…} {name} {в городе}».
function introKupit(s, c, seed, kind) {
  const k = KIND_KUPIT[kind];
  const price = s.price ? `от ${money(s.price)}` : 'считается по курсу и видна до оплаты';
  const v = [
    `Купить ${k.noun} ${s.name} ${c.v} с российской карты напрямую не получится — сервис работает только с зарубежными платёжными системами. PlataPay покупает за вас: вы платите в рублях, мы оформляем покупку на ваш аккаунт. Цена — ${price}.`,
    `${cap(c.v)} ${k.noun} ${s.name} проще всего купить через PlataPay: заявка на сайте, подтверждение суммы у оператора, оплата картой РФ, по СБП или в USDT — и покупка у вас за 5–15 минут. ${s.name} — ${s.hint}.`,
    `PlataPay помогает купить ${k.noun} ${s.name} без зарубежной карты: работаем онлайн, город значения не имеет — ${c.v} услуга работает так же, как везде по России. Сумма фиксируется в рублях до оплаты, комиссия 5%.`,
    `${s.name} — ${s.hint}. Чтобы купить ${k.noun} ${c.v}, оставьте заявку: оператор ответит за 1–15 минут, назовёт итоговую сумму (${price}) и проведёт оплату с зарубежной карты. Доступ и чеки — ваши.`,
  ];
  return pick(v, seed);
}

// Варианты блока «Как проходит оплата».
const STEP_SETS = [
  ['Оставляете заявку — выбираете тариф и способ оплаты.', 'Оператор подтверждает сумму в Telegram и присылает реквизиты.', 'После оплаты оформляем услугу и передаём доступ — обычно 5–15 минут.'],
  ['Пишете нам на сайте, в Telegram или WhatsApp.', 'Согласовываем тариф и итоговую сумму в рублях — без скрытых доплат.', 'Оплачиваете картой РФ, по СБП или в USDT — и получаете доступ за 5–15 минут.'],
  ['Заявка: тариф, регион аккаунта, контакт для связи.', 'Подтверждение: оператор фиксирует сумму и присылает реквизиты.', 'Оплата и выдача: проводим платёж с зарубежной карты и отчитываемся чеком.'],
];

const STEP_TITLES = ['Как проходит оплата', 'Как это работает', 'Три шага до оплаты'];

// FAQ-пул. Функции получают (service, city, kind) и возвращают {q, a}.
const FAQ_POOL = [
  (s, c) => ({
    q: `Как быстро оплатят ${s.name} ${c.v}?`,
    a: `Обычно 5–15 минут после подтверждения суммы. Работаем онлайн ежедневно с 08:00 до 24:00 МСК — ${c.v} сроки такие же, как по всей России.`,
  }),
  (s) => ({
    q: 'Это безопасно?',
    a: `Да. Мы не запрашиваем пароль от аккаунта и данные вашей карты: вы платите по выставленным реквизитам, а ${s.name} оплачивает наша зарубежная карта. Если оплата не пройдёт — вернём деньги полностью.`,
  }),
  (s) => ({
    q: 'Какая комиссия?',
    a: 'Комиссия сервиса — 5%. Итоговая сумма в рублях фиксируется до оплаты: в неё уже входят курс и комиссия, доплат не будет.',
  }),
  (s, c) => ({
    q: `Вы работаете только ${c.v}?`,
    a: `Нет, по всей России и СНГ: услуга полностью онлайн, город не влияет ни на цену, ни на сроки. ${c.n} — один из городов, где нас часто ищут.`,
  }),
  (s) => ({
    q: 'Какие способы оплаты вы принимаете?',
    a: 'Карта любого российского банка, СБП по номеру телефона, криптовалюта (USDT TRC-20, TON, BTC). Для юрлиц — счёт по договорённости.',
  }),
  (s) => ({
    q: `Нужно ли передавать вам аккаунт ${s.name}?`,
    a: 'В большинстве случаев достаточно e-mail, на который оформлена учётная запись, или ссылки-приглашения. Пароль не нужен; если сервису требуется вход — согласуем безопасный вариант заранее.',
  }),
  (s) => ({
    q: 'Что будет, если оплата не пройдёт?',
    a: 'Вернём деньги полностью. Такое бывает редко: перед оплатой оператор проверяет тариф и регион аккаунта, чтобы платёж прошёл с первого раза.',
  }),
  (s) => ({
    q: `Сколько стоит ${s.name}?`,
    a: s.price
      ? `От ${money(s.price)} за базовый тариф с учётом комиссии. Точную сумму по вашему тарифу и региону оператор назовёт до оплаты.`
      : 'Сумма зависит от тарифа и курса на день оплаты — оператор посчитает и назовёт её до оплаты, доплат после не бывает.',
  }),
];

// ------------------------------------------------------------- helpers

function geoUrl(svcSlug, intent, citySlug) {
  return `g/${svcSlug}/${intent}-${citySlug}.html`;
}

function h1For(intentKey, s, c, kind) {
  return intentKey === 'oplata'
    ? `Оплата ${escapeHtml(s.name)} ${c.v}`
    : `${KIND_KUPIT[kind].verb} ${escapeHtml(s.name)} ${c.v}`;
}

function titleFor(intentKey, s, c, kind, seed) {
  const p = s.price ? ` от ${money(s.price)}` : '';
  if (intentKey === 'oplata') {
    return pick(
      [
        `Оплата ${s.name} ${c.v} —${p ? p + ',' : ''} за 5–15 минут | PlataPay`,
        `${s.name} ${c.v}: оплата картой РФ, СБП или USDT${p} | PlataPay`,
        `Оплатить ${s.name} ${c.v}${p ? ' —' + p : ''} без зарубежной карты | PlataPay`,
      ],
      seed,
    );
  }
  const noun = KIND_KUPIT[kind].noun;
  return pick(
    [
      `Купить ${noun} ${s.name} ${c.v}${p ? ' —' + p : ''} | PlataPay`,
      `${KIND_KUPIT[kind].verb} ${s.name} ${c.v}: цена${p}, оплата картой РФ | PlataPay`,
      `${s.name} ${c.v} — купить ${noun} за рубли${p} | PlataPay`,
    ],
    seed,
  );
}

function descFor(intentKey, s, c, kind, seed) {
  const p = s.price ? `от ${money(s.price)}` : 'по фиксированному курсу';
  const v =
    intentKey === 'oplata'
      ? [
          `Оплатим ${s.name} ${c.v} за 5–15 минут: карта РФ, СБП или USDT, ${p}, комиссия 5%. Без данных вашей карты, с гарантией возврата.`,
          `Оплата ${s.name} для жителей города ${c.n}: онлайн, ${p}, доступ за 5–15 минут. Оператор на связи ежедневно с 08:00 до 24:00 МСК.`,
        ]
      : [
          `Купить ${KIND_KUPIT[kind].noun} ${s.name} ${c.v}: платите в рублях, оформляем на ваш аккаунт за 5–15 минут, ${p}. Гарантия возврата.`,
          `${KIND_KUPIT[kind].verb} ${s.name} ${c.v} без зарубежной карты — ${p}, комиссия 5%, всё онлайн. PlataPay: живой оператор и чек.`,
        ];
  return pick(v, seed);
}

// Блок тарифов: для подписок — сетка 1/3/12 месяцев, для остального —
// панель «сколько это стоит».
function priceBlock(s, kind, seed) {
  if (kind === 'subscription' && s.price) {
    const rows = TARIFFS.map(
      (t, i) =>
        `<div class="pp-tarif${i === 0 ? ' on' : ''}"><span class="r"></span><span class="t"><b>${t.label}</b><span>${t.note}</span></span><span class="p">${money(tariffPrice(s.price, t.k))}</span></div>`,
    ).join('');
    return `<section class="pp-sec"><h2>${pick(['Сколько стоит', 'Цены и тарифы', 'Стоимость'], seed)} ${escapeHtml(s.name)}</h2><div class="pp-panel">${rows}<p class="pay-line">Оплата: карта РФ, СБП или криптовалюта — USDT, TON, BTC. Комиссия 5% уже в цене.</p></div></section>`;
  }
  return `<section class="pp-sec"><h2>Сколько это стоит</h2><div class="pp-panel"><p>${
    s.price
      ? `Базовая стоимость — от ${money(s.price)}.`
      : 'Итоговая сумма зависит от заказа и курса на день оплаты.'
  } Оператор считает точную сумму в рублях по вашему запросу и называет её до оплаты: в неё уже входят курс и комиссия 5%, доплат не бывает.</p><p class="pay-line">Оплата: карта РФ, СБП или криптовалюта — USDT, TON, BTC.</p></div></section>`;
}

function linksBlock({ base, s, c, cities, services, sIdx, cIdx, intentKey, count = 5, includeServices = true }) {
  // Соседние города (по кольцу) — у каждой страницы свой набор.
  const cityLinks = [];
  for (let k = 1; cityLinks.length < count && k < cities.length; k++) {
    const cc = cities[(cIdx + k) % cities.length];
    cityLinks.push(`<a class="pp-link" href="${base}${geoUrl(s.slug, intentKey, cc.slug)}">${escapeHtml(s.name)} ${cc.v}</a>`);
  }
  const other = intentKey === 'oplata' ? 'kupit' : 'oplata';
  const otherLabel = intentKey === 'oplata' ? `${KIND_KUPIT[kindOf(s.cat)].verb} ${escapeHtml(s.name)} ${c.v}` : `Оплата ${escapeHtml(s.name)} ${c.v}`;
  let html = `<section class="pp-sec"><h2>${escapeHtml(s.name)} в других городах</h2><div class="pp-links">${cityLinks.join('')}</div>
<div class="pp-chips"><a class="pp-chip" href="${base}gorod/${c.slug}.html">Все сервисы ${c.v}</a><a class="pp-chip" href="${base}gorod/">Все города</a><a class="pp-chip" href="${base}oplata-${s.slug}/">Подробно об оплате ${escapeHtml(s.name)}</a><a class="pp-chip" href="${base}${geoUrl(s.slug, other, c.slug)}">${otherLabel}</a></div></section>`;
  if (includeServices) {
    // Другие сервисы в этом городе.
    const svcLinks = [];
    for (let k = 1; svcLinks.length < count && k < services.length; k++) {
      const ss = services[(sIdx + k) % services.length];
      svcLinks.push(`<a class="pp-link" href="${base}${geoUrl(ss.slug, 'oplata', c.slug)}">Оплата ${escapeHtml(ss.name)} ${c.v}</a>`);
    }
    html += `
<section class="pp-sec"><h2>Другие сервисы ${c.v}</h2><div class="pp-links">${svcLinks.join('')}</div></section>`;
  }
  return html;
}

// --------------------------------------------------------- гео-страница

function renderGeoPage({ base, verifyTags, s, c, cities, services, sIdx, cIdx, intentKey }) {
  const kind = kindOf(s.cat);
  const seed = hashStr(`${s.slug}|${c.slug}|${intentKey}`);
  const canonical = `${SITE}/${geoUrl(s.slug, intentKey, c.slug)}`;
  const slim = intentKey !== 'oplata'; // «купить» — компактный вариант

  const h1 = h1For(intentKey, s, c, kind);
  const intro = intentKey === 'oplata' ? introOplata(s, c, seed, kind) : introKupit(s, c, seed, kind);

  const steps = pick(STEP_SETS, seed >>> 2);
  const stepsHtml = `<section class="pp-sec"><h2>${pick(STEP_TITLES, seed >>> 4)}</h2><div class="pp-panel"><ol class="pp-steps">${steps
    .map((t) => `<li>${t}</li>`)
    .join('')}</ol><p class="pay-line">Работаем онлайн по всей России — ${c.v} сроки те же: 5–15 минут.</p></div></section>`;

  // Вопросы из пула, стартовая позиция зависит от seed.
  const faq = [];
  for (let k = 0; k < (slim ? 2 : 3); k++) faq.push(FAQ_POOL[(seed + k * 3) % FAQ_POOL.length](s, c, kind));

  const crumbs = breadcrumbs([
    { name: 'Главная', href: base },
    { name: s.name, href: `${base}oplata-${s.slug}/` },
    { name: c.n },
  ]);

  const hero = heroPanel({
    service: s,
    h1,
    sub: slim ? '' : `${escapeHtml(cap(s.hint))}.`,
    price: s.price,
    priceNote: 'Сумма фиксируется до оплаты · комиссия 5%',
    watermark: false,
  });

  const order = orderCard({
    service: s,
    intent: `geo-${intentKey}`,
    geo: c.n,
    title: `${intentKey === 'oplata' ? 'Оплатить' : 'Купить'} ${escapeHtml(s.name)} ${c.v}`,
    sub: 'Ответим за 1–15 минут и подтвердим сумму.',
    tiers: s.tiers,
    prefill: false,
  });

  const faqHtml = `<section class="pp-sec"><h2>Частые вопросы</h2>${faqDetails(faq)}</section>`;
  const links = linksBlock({ base, s, c, cities, services, sIdx, cIdx, intentKey, count: slim ? 4 : 5, includeServices: !slim });

  let mid;
  if (slim) {
    mid = stepsHtml;
  } else {
    const priceHtml = priceBlock(s, kind, seed >>> 3);
    // Лёгкая вариативность порядка: цена ⇄ шаги.
    mid = seed & 1 ? priceHtml + stepsHtml : stepsHtml + priceHtml;
  }

  const body = `<main class="wrap">
${crumbs}
${hero}
<p class="lead" style="margin-top:16px">${escapeHtml(intro)}</p>
${slim ? '' : whyCards({ inline: false })}
${mid}
${order}
${faqHtml}
${links}
</main>`;

  return wrapPage({
    base,
    canonical,
    title: titleFor(intentKey, s, c, kind, seed),
    description: descFor(intentKey, s, c, kind, seed >>> 1),
    verifyTags,
    ld: '',
    ogTags: false,
    nav: GEO_NAV(base),
    body,
    footerCompact: true,
  });
}

// Короткая навигация для массового яруса (полный набор ссылок остаётся в футере).
const GEO_NAV = (base) => [
  { label: 'Каталог', href: `${base}catalog/` },
  { label: 'Города', href: `${base}gorod/` },
  { label: 'Отзывы', href: `${base}reviews/` },
  { label: 'Контакты', href: `${base}contacts/` },
];

// -------------------------------------------------- страница способа оплаты

function renderMethodPage({ base, verifyTags, s, m, mIdx, services, sIdx }) {
  const kind = kindOf(s.cat);
  const seed = hashStr(`${s.slug}|m|${m.slug}`);
  const slugDir = `oplata-${s.slug}-${m.slug}`;
  const canonical = `${SITE}/${slugDir}/`;
  const h1 = `Оплата ${escapeHtml(s.name)} ${m.phrase}`;

  const intro = pick(
    [
      `${s.name} не принимает российские платёжные средства напрямую, но оплатить его ${m.phrase} можно через PlataPay. ${m.detail} Дальше мы проводим платёж сервису с нашей зарубежной карты — доступ остаётся на вашем аккаунте.`,
      `Хотите оплатить ${s.name} ${m.phrase}? Схема простая: вы платите нам ${m.phrase.startsWith('без') || m.phrase.startsWith('онлайн') ? 'удобным способом' : m.phrase}, а зарубежному сервису платит наша иностранная карта. ${m.detail}`,
      `PlataPay принимает оплату ${s.name} ${m.phrase}: сумма фиксируется в рублях до платежа, комиссия сервиса 5%. ${m.detail}`,
    ],
    seed,
  );

  const otherMethods = [];
  for (let k = 1; otherMethods.length < 6 && k < PAY_METHODS.length; k++) {
    const mm = PAY_METHODS[(mIdx + k) % PAY_METHODS.length];
    otherMethods.push(`<a class="pp-link" href="${base}oplata-${s.slug}-${mm.slug}/">Оплата ${escapeHtml(s.name)} ${mm.phrase}</a>`);
  }
  const svcLinks = [];
  for (let k = 1; svcLinks.length < 6 && k < services.length; k++) {
    const ss = services[(sIdx + k) % services.length];
    svcLinks.push(`<a class="pp-link" href="${base}oplata-${ss.slug}-${m.slug}/">Оплата ${escapeHtml(ss.name)} ${m.phrase}</a>`);
  }

  const faq = [
    {
      q: `Как оплатить ${s.name} ${m.phrase}?`,
      a: `Оставьте заявку на этой странице или напишите в Telegram. Оператор подтвердит сумму в рублях и пришлёт реквизиты. ${m.detail}`,
    },
    FAQ_POOL[2](s, null, kind),
    FAQ_POOL[6](s, null, kind),
    FAQ_POOL[7](s, null, kind),
  ];

  const faqLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.q, acceptedAnswer: { '@type': 'Answer', text: qa.a } })),
  })}</script>`;
  const ld =
    breadcrumbLd([
      { name: 'Главная', item: `${SITE}/` },
      { name: 'Каталог', item: `${SITE}/catalog/` },
      { name: `Оплата ${s.name}`, item: `${SITE}/oplata-${s.slug}/` },
      { name: `Оплата ${s.name} ${m.phrase}` },
    ]) + faqLd;

  const steps = STEP_SETS[seed % STEP_SETS.length];
  const body = `<main class="wrap">
${breadcrumbs([
    { name: 'Главная', href: base },
    { name: 'Каталог', href: `${base}catalog/` },
    { name: s.name, href: `${base}oplata-${s.slug}/` },
    { name: m.phrase },
  ])}
${heroPanel({ service: s, h1, sub: `${escapeHtml(cap(s.hint))}.`, price: s.price, priceNote: 'Сумма в рублях фиксируется до оплаты · комиссия 5%' })}
<p class="lead" style="margin-top:16px">${escapeHtml(intro)}</p>
${whyCards()}
<section class="pp-sec"><h2>${pick(STEP_TITLES, seed >>> 3)}</h2><div class="pp-panel"><ol class="pp-steps">${steps.map((t) => `<li>${t}</li>`).join('')}</ol></div></section>
${priceBlock(s, kind, seed >>> 2)}
${orderCard({
    service: s,
    intent: `method-${m.slug}`,
    title: `Оплатить ${escapeHtml(s.name)} ${m.phrase}`,
    sub: 'Оставьте контакт — оператор ответит за 1–15 минут и подтвердит сумму.',
    tiers: s.tiers,
  })}
<section class="pp-sec"><h2>Частые вопросы</h2>${faqDetails(faq)}</section>
<section class="pp-sec"><h2>Другие способы оплаты ${escapeHtml(s.name)}</h2><div class="pp-links">${otherMethods.join('')}</div>
<div class="pp-chips"><a class="pp-chip" href="${base}oplata-${s.slug}/">Подробно об оплате ${escapeHtml(s.name)}</a><a class="pp-chip" href="${base}seo/">Все сервисы</a></div></section>
<section class="pp-sec"><h2>Оплата ${m.phrase} — другие сервисы</h2><div class="pp-links">${svcLinks.join('')}</div></section>
</main>
${stickyBar({ title: `Оплатить ${s.name}` })}`;

  return wrapPage({
    base,
    canonical,
    title: `Оплата ${s.name} ${m.phrase} — от ${s.price ? money(s.price) : 'суммы заказа'}, за 5–15 минут | PlataPay`,
    description: `Оплатить ${s.name} ${m.phrase} из России: сумма в рублях до оплаты, комиссия 5%, доступ за 5–15 минут. ${m.detail}`,
    verifyTags,
    ld,
    body,
    footerCompact: false,
  });
}

// --------------------------------------------------------- хабы городов

function renderCityHub({ base, verifyTags, c, cities, cIdx, services }) {
  const canonical = `${SITE}/gorod/${c.slug}.html`;
  const byCat = new Map();
  for (const s of services) {
    if (!byCat.has(s.cat)) byCat.set(s.cat, []);
    byCat.get(s.cat).push(s);
  }
  const sections = [...byCat.entries()]
    .map(
      ([cat, list]) =>
        `<section class="pp-sec"><h2>${escapeHtml(cat)}</h2><div class="pp-links">${list
          .map((s) => `<a class="pp-link" href="${base}${geoUrl(s.slug, 'oplata', c.slug)}">Оплата ${escapeHtml(s.name)} ${c.v}</a>`)
          .join('')}</div></section>`,
    )
    .join('');

  const near = [];
  for (let k = 1; near.length < 10 && k < cities.length; k++) {
    const cc = cities[(cIdx + k) % cities.length];
    near.push(`<a class="pp-chip" href="${base}gorod/${cc.slug}.html">${escapeHtml(cc.n)}</a>`);
  }

  const body = `<main class="wrap">
${breadcrumbs([{ name: 'Главная', href: base }, { name: 'Города', href: `${base}gorod/` }, { name: c.n }])}
<div class="pp-sec"><h1>Оплата зарубежных сервисов ${c.v}</h1>
<p class="lead">PlataPay оплачивает подписки, игры, билеты и покупки в зарубежных сервисах для клиентов ${c.v} — полностью онлайн, за 5–15 минут. Карта РФ, СБП или USDT; комиссия 5%; если оплата не прошла — вернём деньги.</p></div>
${whyCards()}
${sections}
<section class="pp-sec"><h2>Другие города</h2><div class="pp-chips">${near.join('')}<a class="pp-chip" href="${base}gorod/">Все города →</a></div></section>
</main>`;

  return wrapPage({
    base,
    canonical,
    title: `Оплата зарубежных сервисов ${c.v} — ${services.length} сервисов | PlataPay`,
    description: `Оплатим из России любой зарубежный сервис для жителей города ${c.n}: подписки, игры, билеты, покупки. За 5–15 минут, картой РФ, по СБП или в USDT.`,
    verifyTags,
    ld: '',
    cta: { href: CONTACTS.telegram, label: 'Написать' },
    body,
    footerCompact: false,
  });
}

function renderCitiesIndex({ base, verifyTags, cities }) {
  const canonical = `${SITE}/gorod/`;
  const links = cities
    .map((c) => `<a class="pp-link" href="${base}gorod/${c.slug}.html">${escapeHtml(c.n)}</a>`)
    .join('');
  const body = `<main class="wrap">
${breadcrumbs([{ name: 'Главная', href: base }, { name: 'Города' }])}
<div class="pp-sec"><h1>Оплата зарубежных сервисов по городам России</h1>
<p class="lead">Мы работаем онлайн по всей России: выберите свой город — внутри список сервисов, которые мы оплачиваем, с ценами и инструкциями. Сроки и цены везде одинаковые: 5–15 минут, комиссия 5%.</p></div>
<section class="pp-sec"><h2>${cities.length} городов</h2><div class="pp-links">${links}</div></section>
</main>`;
  return wrapPage({
    base,
    canonical,
    title: `Оплата зарубежных сервисов по городам России — PlataPay`,
    description: `Оплата ChatGPT, Netflix, Spotify, Steam и ещё 100+ зарубежных сервисов в ${cities.length} городах России. Онлайн, за 5–15 минут, картой РФ, по СБП или в USDT.`,
    verifyTags,
    ld: '',
    cta: { href: CONTACTS.telegram, label: 'Написать' },
    body,
    footerCompact: false,
  });
}

// Массовый ярус по умолчанию ВЫКЛЮЧЕН: ставка сделана на качественные
// статьи (/blog/), а не на гео-клоны. Включение — явное: SEO_GEO=1.
export const GEO_ENABLED = process.env.SEO_GEO === '1' && Number(process.env.SEO_GEO_CITIES || 350) > 0;

/**
 * Блоки перелинковки для «богатых» страниц (/oplata-<slug>/ и т.п.):
 * города + способы оплаты. Связывают старый ярус с новым, чтобы у
 * гео-страниц были входящие ссылки не только из sitemap.
 */
export function geoLinksFor(service, base) {
  if (!GEO_ENABLED) return '';
  const topCities = CITIES.slice(0, 12);
  const cityChips = topCities
    .map((c) => `<a class="pp-chip" href="${base}${geoUrl(service.slug, 'oplata', c.slug)}">${escapeHtml(c.n)}</a>`)
    .join('');
  const methodChips = PAY_METHODS.map(
    (m) => `<a class="pp-chip" href="${base}oplata-${service.slug}-${m.slug}/">${escapeHtml(m.phrase)}</a>`,
  ).join('');
  return `<section class="pp-sec"><h2>Оплата ${escapeHtml(service.name)} в вашем городе</h2>
<div class="pp-chips">${cityChips}<a class="pp-chip" href="${base}gorod/">Все города →</a></div></section>
<section class="pp-sec"><h2>Способы оплаты ${escapeHtml(service.name)}</h2>
<div class="pp-chips">${methodChips}</div></section>`;
}

// ------------------------------------------------------------ генерация

/**
 * Пишет весь массовый ярус в out/ и возвращает списки URL для sitemap.
 * services — SERVICES из seo/data.mjs (порядок сохраняется).
 */
export function generateGeo({ out, base, verifyTags, services }) {
  const cityLimit = Number(process.env.SEO_GEO_CITIES || 350);
  const cities = CITIES.slice(0, Math.max(0, cityLimit));

  const urls = { geo: [], methods: [], hubs: [] };
  if (!GEO_ENABLED || cities.length === 0) {
    console.log('geo tier: skipped (set SEO_GEO=1 to enable)');
    return urls;
  }

  const t0 = Date.now();

  // 1) Гео-страницы: сервис × город × {oplata, kupit}.
  for (let sIdx = 0; sIdx < services.length; sIdx++) {
    const s = services[sIdx];
    const dir = path.join(out, 'g', s.slug);
    fs.mkdirSync(dir, { recursive: true });
    for (let cIdx = 0; cIdx < cities.length; cIdx++) {
      const c = cities[cIdx];
      for (const intentKey of ['oplata', 'kupit']) {
        const html = renderGeoPage({ base, verifyTags, s, c, cities, services, sIdx, cIdx, intentKey });
        fs.writeFileSync(path.join(dir, `${intentKey}-${c.slug}.html`), html);
        urls.geo.push(`${SITE}/${geoUrl(s.slug, intentKey, c.slug)}`);
      }
    }
  }

  // 2) Способы оплаты: сервис × 12.
  for (let sIdx = 0; sIdx < services.length; sIdx++) {
    const s = services[sIdx];
    for (let mIdx = 0; mIdx < PAY_METHODS.length; mIdx++) {
      const m = PAY_METHODS[mIdx];
      const dir = path.join(out, `oplata-${s.slug}-${m.slug}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), renderMethodPage({ base, verifyTags, s, m, mIdx, services, sIdx }));
      urls.methods.push(`${SITE}/oplata-${s.slug}-${m.slug}/`);
    }
  }

  // 3) Хабы городов.
  const gorodDir = path.join(out, 'gorod');
  fs.mkdirSync(gorodDir, { recursive: true });
  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const c = cities[cIdx];
    fs.writeFileSync(path.join(gorodDir, `${c.slug}.html`), renderCityHub({ base, verifyTags, c, cities, cIdx, services }));
    urls.hubs.push(`${SITE}/gorod/${c.slug}.html`);
  }
  fs.writeFileSync(path.join(gorodDir, 'index.html'), renderCitiesIndex({ base, verifyTags, cities }));
  urls.hubs.push(`${SITE}/gorod/`);

  const total = urls.geo.length + urls.methods.length + urls.hubs.length;
  console.log(
    `geo tier: ${urls.geo.length} geo + ${urls.methods.length} methods + ${urls.hubs.length} hubs = ${total} pages in ${((Date.now() - t0) / 1000).toFixed(1)}s (${cities.length} cities × ${services.length} services)`,
  );
  return urls;
}
