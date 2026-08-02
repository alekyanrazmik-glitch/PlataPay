// Раздел статей /blog/ — ~520 страниц под реальные информационные
// запросы. В отличие от транзакционных лендингов (/oplata-<slug>/) и
// гео-яруса, статьи закрывают проблемные и исследовательские интенты:
// «оплата не проходит», «как оплатить без зарубежной карты»,
// «чем заменить», «как продлить», гайды по категориям и по покупке
// конкретных игр в Steam — и внутри органично подводят к услуге.
//
// Шесть типов, у каждого своя структура и свои текстовые блоки:
//   1) problemy   — «Оплата X не проходит: причины и решения»   (~140)
//   2) bez-karty  — «Как оплатить X без зарубежной карты»       (~140)
//   3) alternativy— «Альтернативы X в 2026»                     (~120)
//   4) prodlenie  — «Как продлить X из России»                  (~96)
//   5) gidy       — гайды по категориям                          (13)
//   6) igry       — как купить конкретную игру в Steam           (12)
//
// Качество достигается не количеством шаблонов, а данными: у каждого
// сервиса свои тарифы с реальными ценами в рублях, своё описание,
// своя «боль» категории (seo/data.mjs), свои альтернативы; плюс
// вариативные формулировки по детерминированному хэшу.

import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, SERVICES, YEAR, kindOf, usdToRub } from './data.mjs';

// Размер категории — нужен, чтобы «Альтернативы» существовали только там,
// где есть из чего выбирать (и чтобы ссылки на них не были битыми).
const CAT_COUNT = SERVICES.reduce((m, s) => m.set(s.cat, (m.get(s.cat) || 0) + 1), new Map());
import {
  CONTACTS,
  TARIFFS,
  breadcrumbLd,
  breadcrumbs,
  escapeHtml as esc,
  faqDetails,
  hashStr,
  money,
  orderCard,
  pick,
  tariffPrice,
  whyCards,
  wrapPage,
} from './app-shell.mjs';

const SITE = 'https://payoplata.ru';
const BLOG = 'blog';

// ---------------------------------------------------------------- рубрики

export const RUBRICS = {
  problemy: { slug: 'problemy-oplaty', title: 'Проблемы с оплатой', desc: 'Почему платежи в зарубежные сервисы не проходят и как это решить.' },
  bezkarty: { slug: 'bez-zarubezhnoj-karty', title: 'Оплата без зарубежной карты', desc: 'Все рабочие способы платить за зарубежные сервисы без своей иностранной карты.' },
  alternativy: { slug: 'alternativy', title: 'Альтернативы сервисам', desc: 'Чем заменить недоступный сервис и что выбрать в 2026 году.' },
  prodlenie: { slug: 'prodlenie', title: 'Продление подписок', desc: 'Как продлить подписку из России и не потерять аккаунт, историю и скидки.' },
  gidy: { slug: 'gidy', title: 'Гайды', desc: 'Большие разборы: как платить за целые категории сервисов и покупать игры.' },
};

// ------------------------------------------------------------- утилиты

const A = (slug) => `${BLOG}/${slug}/`;

function readingTime(html) {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 180));
}

function tocBlock(items) {
  return `<nav class="toc"><b>Содержание</b><ol>${items
    .map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`)
    .join('')}</ol></nav>`;
}

function articleLd({ canonical, title, description, dateIso }) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'ru-RU',
    datePublished: dateIso,
    dateModified: dateIso,
    mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: 'PlataPay', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'PlataPay', url: `${SITE}/` },
  })}</script>`;
}

function faqLdBlock(faq) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
  })}</script>`;
}

// Стоимость первого тарифа в рублях (для лида и таблиц).
const fromPrice = (s) => (s.price ? `от ${money(s.price)}` : 'по курсу дня');

// «Плюсы/минусы» карточка.
function procon(title, pros, cons) {
  return `<div class="pc"><b>${title}</b>
<ul class="plus">${pros.map((p) => `<li>${p}</li>`).join('')}</ul>
<ul class="minus">${cons.map((c) => `<li>${c}</li>`).join('')}</ul></div>`;
}

// Универсальный блок «4 способа оплаты» — ядро типов 1 и 2. Порядок и
// акценты немного меняются по seed, содержимое честное: у каждого способа
// есть реальные минусы, посредник — не единственный вариант.
function waysBlock(s, seed, { compact = false } = {}) {
  const name = esc(s.name);
  const giftFriendly = ['Игры', 'Музыка', 'GiftCards', 'Маркет'].includes(s.cat);
  const cards = [
    procon(
      'Карта зарубежного банка',
      ['Полный контроль: платите сами, как раньше', 'Подходит для любых сервисов и автопродления'],
      ['Оформление — поездка или удалённо от 15–30 тыс. ₽ и от недели', 'Нужно пополнять через переводы с комиссией', 'Банк может запросить подтверждение резидентства'],
    ),
    procon(
      giftFriendly ? 'Подарочные карты (gift cards)' : 'Подарочные карты, если сервис их принимает',
      ['Активируются на вашем аккаунте, пароль не нужен', 'Код приходит быстро'],
      ['Нужен код строго вашего региона аккаунта — ошибка региона не активируется', 'Продавцов много, гарантий мало', giftFriendly ? 'Курс в кодах обычно выше официального' : `У ${name} гифт-карты есть не для всех тарифов и регионов`],
    ),
    procon(
      'Криптовалюта',
      ['Быстро и без банков', 'Удобно, если уже пользуетесь USDT/TON'],
      [`${name} напрямую криптовалюту ${s.cat === 'Облако' ? 'почти никогда не принимает' : 'не принимает'} — всё равно нужен обмен на карту или посредник`, 'Комиссии обмена и волатильность'],
    ),
    procon(
      'Сервис-посредник (например, PlataPay)',
      ['Ничего не оформляете: заявка → оплата в рублях → доступ за 5–15 минут', 'Фиксированная сумма в рублях до оплаты, комиссия 5%', 'Не нужны пароль от аккаунта и данные вашей карты'],
      ['Комиссия сервиса 5%', 'Продление по заявке, а не автосписанием (многим это, впрочем, спокойнее)'],
    ),
  ];
  const intro = pick(
    [
      `Рабочих сценариев в ${YEAR} году четыре. Коротко — с честными плюсами и минусами каждого:`,
      `Вариантов, которые реально работают, немного — четыре. Разберём каждый без рекламных обещаний:`,
      `Выбор в ${YEAR} году сводится к четырём способам. У каждого есть цена — в деньгах или во времени:`,
    ],
    seed,
  );
  return `<p>${intro}</p><div class="pc-grid">${cards.join('')}</div>${
    compact ? '' : `<p class="hint">Итог: если оплата нужна разово и быстро — посредник почти всегда выигрывает по сумме «деньги + время». Если платите за десятки сервисов ежемесячно и часто бываете за границей — имеет смысл своя зарубежная карта.</p>`
  }`;
}

// Ступени «как это работает через PlataPay».
function ppSteps(s, what = 'подписку') {
  return `<ol class="pp-steps">
<li>Оставляете заявку на этой странице или пишете в <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">Telegram</a> — какой тариф ${esc(s.name)} нужен.</li>
<li>Оператор называет точную сумму в рублях (${fromPrice(s)}, комиссия 5% уже внутри) и присылает реквизиты: карта РФ, СБП или USDT.</li>
<li>После оплаты мы оформляем ${what} с нашей зарубежной карты — доступ на вашем аккаунте через 5–15 минут, чек присылаем.</li>
</ol>`;
}

// Таблица тарифов сервиса в рублях.
function priceTable(s) {
  if (!s.tiers || !s.tiers.length) return '';
  const rows = s.tiers
    .map((t) => {
      const m = String(t).match(/\$\s*(\d+(?:[.,]\d+)?)/);
      const rub = m ? money(usdToRub(Number(m[1].replace(',', '.')))) : (s.price ? `от ${money(s.price)}` : 'по запросу');
      return `<tr><td>${esc(t)}</td><td>${rub}</td></tr>`;
    })
    .join('');
  return `<div class="tbl-wrap"><table><thead><tr><th>Тариф ${esc(s.name)}</th><th>Цена в рублях*</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="hint">* Ориентировочно: официальная цена × курс + комиссия. Точную сумму оператор фиксирует до оплаты — после неё доплат не бывает.</p>`;
}

// Блок перелинковки внутри статьи.
function relatedBlock({ base, s, exceptType, services, sIdx }) {
  const links = [];
  for (const [type, def] of Object.entries(TYPE_DEFS)) {
    if (type === exceptType) continue;
    if (!def.appliesTo(s)) continue;
    links.push(`<a class="pp-link" href="${base}${A(def.slug(s))}">${def.linkTitle(s)}</a>`);
  }
  links.push(`<a class="pp-link" href="${base}oplata-${s.slug}/">Оплатить ${esc(s.name)} — цены и заявка</a>`);
  const sib = [];
  for (let k = 1; sib.length < 3 && k < services.length; k++) {
    const ss = services[(sIdx + k) % services.length];
    if (ss.cat !== s.cat) continue;
    sib.push(`<a class="pp-link" href="${base}${A(TYPE_DEFS.problemy.slug(ss))}">${TYPE_DEFS.problemy.linkTitle(ss)}</a>`);
  }
  return `<section class="pp-sec"><h2 id="more">Читайте также</h2><div class="pp-links">${links.join('')}${sib.join('')}</div>
<div class="pp-chips"><a class="pp-chip" href="${base}${BLOG}/">Все статьи</a><a class="pp-chip" href="${base}seo/">Все сервисы</a></div></section>`;
}

// Обёртка статьи: мета, хлебные крошки, шапка статьи, контент, CTA, FAQ.
function renderArticle({
  base, verifyTags, dateIso,
  slug, rubric, title, h1, description,
  lead, toc, sections, faq,
  s = null, ctaWhat = 'подписку', related = '',
}) {
  const canonical = `${SITE}/${A(slug)}`.replace(/\/$/, '/');
  const faqHtml = faq && faq.length ? `<section class="pp-sec"><h2 id="faq">Частые вопросы</h2>${faqDetails(faq)}</section>` : '';
  const ld =
    breadcrumbLd([
      { name: 'Главная', item: `${SITE}/` },
      { name: 'Статьи', item: `${SITE}/${BLOG}/` },
      { name: RUBRICS[rubric].title, item: `${SITE}/${BLOG}/${RUBRICS[rubric].slug}/` },
      { name: h1 },
    ]) +
    articleLd({ canonical, title, description, dateIso }) +
    (faq && faq.length ? faqLdBlock(faq) : '');

  const order = s
    ? orderCard({
        service: s,
        intent: `article-${rubric}`,
        title: `Оплатить ${esc(s.name)} через PlataPay`,
        sub: 'Оставьте контакт — оператор ответит за 1–15 минут, назовёт точную сумму и проведёт оплату.',
        tiers: s.tiers,
      })
    : `<section class="pp-order" id="zakaz" data-service="Из статьи" data-intent="article-${rubric}">
<div class="kicker">Заявка</div><h2>Оплатим любой зарубежный сервис</h2>
<p class="sub">Напишите, что нужно оплатить — оператор ответит за 1–15 минут и назовёт сумму в рублях.</p>
<form class="row" onsubmit="return ppSubmit(event)">
<div><label for="pp-tier">Что оплатить</label><select id="pp-tier" name="tier"><option value="">Опишем в переписке</option></select></div>
<div><label for="pp-contact">Телефон, Telegram или email</label><input id="pp-contact" name="contact" type="text" placeholder="+7 999… или @username" required autocomplete="off"></div>
<button class="pp-btn" type="submit">Оставить заявку</button>
</form>
<div class="alt">Или сразу напишите: <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">Telegram</a> · <a href="${CONTACTS.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
<div class="err" hidden></div></section>`;

  const bodyHtml = `<main class="wrap">
${breadcrumbs([
    { name: 'Главная', href: base },
    { name: 'Статьи', href: `${base}${BLOG}/` },
    { name: RUBRICS[rubric].title, href: `${base}${BLOG}/${RUBRICS[rubric].slug}/` },
    { name: h1 },
  ])}
<article class="art">
<header class="art-head">
<span class="art-rubric">${RUBRICS[rubric].title}</span>
<h1>${h1}</h1>
<p class="art-meta">Обновлено ${new Date(dateIso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} · ${readingTime(sections)} мин чтения · PlataPay</p>
</header>
<p class="lead">${lead}</p>
${toc}
${sections}
${order}
${faqHtml}
${related}
</article>
</main>`;

  return wrapPage({
    base,
    canonical,
    title,
    description,
    verifyTags,
    ld,
    body: bodyHtml,
    footerCompact: false,
  });
}

// ================================================================ ТИП 1
// «Оплата X не проходит: причины и решения»

function renderProblemy({ base, verifyTags, dateIso, s, services, sIdx }) {
  const seed = hashStr(`art1|${s.slug}`);
  const name = esc(s.name);
  const cat = CATEGORIES[s.cat] || {};
  const slug = TYPE_DEFS.problemy.slug(s);

  const title = `Оплата ${s.name} не проходит из России: причины и решения в ${YEAR} году`;
  const h1 = `Почему не проходит оплата ${name} и что с этим делать`;
  const description = `Карта отклоняется при оплате ${s.name}? Разбираем настоящие причины (это не ошибка карты), какие способы не работают, и 4 рабочих варианта в ${YEAR} году — ${fromPrice(s)}.`;

  const lead = pick(
    [
      `Вы вводите карту на сайте ${name}, а в ответ — «Your card was declined» или бесконечная проверка платежа. Дело не в вашей карте и не в балансе: сервис в принципе не проводит платежи по картам российских банков. Ниже — почему так, что пробовать бесполезно и какие четыре способа реально работают.`,
      `«Payment failed», «card declined», платёж «висит» и отменяется — стандартная картина при попытке оплатить ${name} российской картой. Это не сбой: так работает ограничение на стороне платёжных систем. Разберём причины и все рабочие обходные пути ${YEAR} года — с ценами и подводными камнями.`,
    ],
    seed,
  );

  const toc = tocBlock([
    ['why', `Почему ${name} не принимает карты РФ`],
    ['errors', 'Типичные ошибки и что они значат'],
    ['myths', 'Что пробовать бесполезно'],
    ['ways', '4 рабочих способа'],
    ['pp', 'Как это работает через PlataPay'],
    ['faq', 'Частые вопросы'],
  ]);

  const sections = `
<h2 id="why">Почему ${name} не принимает карты РФ</h2>
<p>В марте 2022 года Visa и Mastercard приостановили работу с российскими банками: карты, выпущенные в РФ, перестали проходить в зарубежных платёжных шлюзах — вне зависимости от банка, баланса и валюты счёта. Карты «Мир» и UnionPay российских банков зарубежные эквайеры ${name} тоже не обрабатывают.</p>
<p>${esc(cat.pain || 'Большинство зарубежных сервисов принимают только карты, выпущенные за пределами РФ.')}</p>
<p>${name} — ${esc(s.hint)}. Сам сервис ${s.cat === 'AI' ? 'дополнительно проверяет страну по IP и биллинг-адресу' : 'сверяет страну выпуска карты на стороне платёжного провайдера'}, поэтому «просто ещё раз попробовать» не помогает.</p>

<h2 id="errors">Типичные ошибки и что они значат</h2>
<div class="tbl-wrap"><table><thead><tr><th>Сообщение</th><th>Что на самом деле</th></tr></thead><tbody>
<tr><td>Your card was declined</td><td>Эквайер отклонил карту по стране выпуска (BIN). Баланс ни при чём.</td></tr>
<tr><td>Payment method not available in your region</td><td>Сервис определил регион аккаунта/IP и скрыл или заблокировал способ оплаты.</td></tr>
<tr><td>Transaction could not be completed</td><td>Платёж дошёл до банка-эквайера и был отклонён на этапе авторизации.</td></tr>
<tr><td>3-D Secure не открывается / вечная загрузка</td><td>Шлюз не может провести верификацию российской карты и обрывает сессию.</td></tr>
</tbody></table></div>

<h2 id="myths">Что пробовать бесполезно</h2>
<ul class="check">
<li><b>VPN.</b> Меняет только IP. Страну выпуска карты он не скрывает — платёж всё равно отклонят, а у ${s.cat === 'AI' || s.cat === 'Музыка' ? 'части сервисов агрессивная антифрод-система может дополнительно ограничить аккаунт' : 'сервиса появится расхождение региона аккаунта и платежа'}.</li>
<li><b>«Виртуальные карты» из случайных телеграм-каналов.</b> Половина — невыпущенные BIN, которые сгорают после пополнения; возвраты никто не делает. Если брать виртуальную карту — то только у сервисов с репутацией и отзывами, и считать полную комиссию: выпуск + пополнение + курс.</li>
<li><b>Смена валюты счёта.</b> Валюта карты не влияет: проверяется страна банка-эмитента.</li>
</ul>

<h2 id="ways">4 рабочих способа в ${YEAR} году</h2>
${waysBlock(s, seed)}

<h2 id="pp">Как это работает через PlataPay</h2>
${ppSteps(s)}
${priceTable(s)}
${whyCards({ inline: false })}`;

  const faq = [
    { q: `Почему карта отклоняется, если на ней есть деньги?`, a: `Отклонение происходит по стране выпуска карты (первые цифры номера — BIN), до проверки баланса. Российский BIN зарубежный эквайер ${s.name} не обрабатывает.` },
    { q: `Поможет ли карта «Мир» или UnionPay?`, a: `Нет. «Мир» за пределами РФ и ЕАЭС не обслуживается, а UnionPay российских банков зарубежные онлайн-шлюзы в большинстве случаев отклоняют так же, как Visa/Mastercard.` },
    { q: `Это законно — оплачивать через посредника?`, a: `Да. Посредник оплачивает услугу со своей зарубежной карты по вашему поручению. Вы платите рублями внутри России; условия использования ${s.name} это не нарушает — аккаунт остаётся вашим.` },
    { q: `Сколько это стоит через PlataPay?`, a: s.price ? `${cap1(fromPrice(s))} за базовый тариф, комиссия 5% уже в сумме. Точную цену по вашему тарифу оператор фиксирует до оплаты.` : `Сумма считается по официальной цене ${s.name} и курсу на день оплаты, комиссия 5%. Итог фиксируется до оплаты.` },
    { q: `Что будет, если платёж всё-таки не пройдёт?`, a: `Вернём деньги полностью. Перед оплатой оператор проверяет тариф и регион аккаунта, поэтому почти все заявки проходят с первого раза.` },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'problemy', title, h1, description, lead, toc, sections, faq, s,
      related: relatedBlock({ base, s, exceptType: 'problemy', services, sIdx }),
    }),
    title: h1,
  };
}

// ================================================================ ТИП 2
// «Как оплатить X без зарубежной карты»

function renderBezKarty({ base, verifyTags, dateIso, s, services, sIdx }) {
  const seed = hashStr(`art2|${s.slug}`);
  const name = esc(s.name);
  const slug = TYPE_DEFS.bezkarty.slug(s);
  const kind = kindOf(s.cat);
  const what = { subscription: 'подписку', ticket: 'билеты', shop: 'заказ', giftcard: 'подарочную карту', asset: 'покупку' }[kind];

  const title = `Как оплатить ${s.name} без зарубежной карты в ${YEAR} году — ${s.price ? 'цена ' + fromPrice(s) : 'все способы'}`;
  const h1 = `Как оплатить ${name} без зарубежной карты`;
  const description = `Оплатить ${s.name} можно без своей иностранной карты: сравниваем способы по времени, стоимости и рискам, показываем пошаговый вариант в рублях — ${fromPrice(s)}, доступ за 5–15 минут.`;

  const lead = pick(
    [
      `Заводить карту зарубежного банка ради одной подписки — как покупать грузовик, чтобы привезти диван. Для оплаты ${name} есть способы проще: ниже — сравнение всех вариантов по времени, стоимости и рискам, и пошаговая инструкция самого быстрого.`,
      `Своя зарубежная карта — самый дорогой и долгий путь к оплате ${name}: оформление от недели и от 15–30 тысяч рублей. В ${YEAR} году есть варианты быстрее. Сравниваем честно — с минусами каждого — и показываем, как оплатить за 15 минут в рублях.`,
    ],
    seed,
  );

  const toc = tocBlock([
    ['compare', 'Сравнение способов'],
    ['ways', 'Разбор каждого способа'],
    ['steps', `Пошагово: оплата ${name} в рублях`],
    ['price', 'Сколько стоит'],
    ['safety', 'Про безопасность'],
    ['faq', 'Частые вопросы'],
  ]);

  const sections = `
<h2 id="compare">Сравнение способов</h2>
<div class="tbl-wrap"><table><thead><tr><th>Способ</th><th>Время до оплаты</th><th>Переплата</th><th>Главный риск</th></tr></thead><tbody>
<tr><td>Карта зарубежного банка</td><td>от 5–10 дней</td><td>15–30 тыс. ₽ разово + комиссии пополнения</td><td>Заморозка/закрытие счёта нерезидента</td></tr>
<tr><td>Подарочные карты</td><td>10–60 минут</td><td>курс кода обычно +10–20%</td><td>Код не того региона не активируется</td></tr>
<tr><td>Криптовалюта</td><td>30–60 минут</td><td>2–5% на обменах</td><td>${name} напрямую крипту не принимает — нужен ещё один шаг</td></tr>
<tr><td>Посредник (PlataPay)</td><td>5–15 минут</td><td>комиссия 5%</td><td>Выбирайте сервис с отзывами и понятными контактами</td></tr>
</tbody></table></div>

<h2 id="ways">Разбор каждого способа</h2>
${waysBlock(s, seed, { compact: true })}

<h2 id="steps">Пошагово: оплата ${name} в рублях</h2>
${ppSteps(s, what)}
<p>Никаких предоплат «на карту физлица» до подтверждения заявки и суммы: сначала оператор фиксирует итог в рублях, затем вы платите по реквизитам, затем получаете доступ и чек.</p>

<h2 id="price">Сколько стоит</h2>
${priceTable(s) || `<p>Итоговая сумма зависит от заказа: оператор считает её по официальной цене ${name} и курсу на день оплаты. Комиссия сервиса — 5%, она уже внутри названной суммы, доплат после не бывает.</p>`}

<h2 id="safety">Про безопасность</h2>
<ul class="check">
<li>Пароль от аккаунта ${name} не нужен: ${kind === 'subscription' ? 'подписка оформляется через биллинг сервиса или подарочный код на ваш e-mail' : 'покупка оформляется на ваш аккаунт или e-mail'}.</li>
<li>Данные вашей банковской карты никуда не передаются — вы просто делаете перевод по реквизитам.</li>
<li>Если оплата не прошла по нашей вине или на стороне сервиса — возвращаем 100% суммы.</li>
</ul>`;

  const faq = [
    { q: `Можно ли оплатить ${s.name} российской картой напрямую?`, a: `Нет: с 2022 года зарубежные платёжные шлюзы не проводят карты, выпущенные в РФ. Работают только обходные способы — гифт-карты, зарубежная карта или посредник.` },
    { q: `Придётся ли отдавать пароль от аккаунта?`, a: `Нет. Достаточно e-mail, на который зарегистрирован аккаунт. Если конкретный тариф требует иначе — оператор предупредит и предложит безопасный вариант заранее.` },
    { q: `Как быстро появится доступ?`, a: `Обычно через 5–15 минут после оплаты. Работаем ежедневно с 08:00 до 24:00 МСК.` },
    { q: `А если нужен другой тариф ${s.name}, которого нет в списке?`, a: `Напишите его в заявке — оплачиваем любой тариф и регион, включая семейные и годовые планы.` },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'bezkarty', title, h1, description, lead, toc, sections, faq, s,
      ctaWhat: what,
      related: relatedBlock({ base, s, exceptType: 'bezkarty', services, sIdx }),
    }),
    title: h1,
  };
}

// ================================================================ ТИП 3
// «Альтернативы X»

function renderAlternativy({ base, verifyTags, dateIso, s, services, sIdx, siblings }) {
  const seed = hashStr(`art3|${s.slug}`);
  const name = esc(s.name);
  const slug = TYPE_DEFS.alternativy.slug(s);
  const alts = siblings.slice(0, 6);

  const title = `Альтернативы ${s.name} в ${YEAR}: ${alts.slice(0, 2).map((a) => a.name).join(', ')} и ещё ${Math.max(alts.length - 2, 1)} варианта`;
  const h1 = `Чем заменить ${name}: альтернативы ${YEAR} года`;
  const description = `Ищете замену ${s.name}? Сравниваем ${alts.length} альтернатив по цене в рублях и задачам, объясняем, кому какая подходит — и как оплатить любую из России.`;

  const lead = pick(
    [
      `Замену ${name} ищут по трём причинам: цена, недоступность оплаты из России или нехватка функций. Собрали реальные альтернативы, которыми пользуются вместо ${name}, — с ценами в рублях и честным «кому подходит».`,
      `${name} — ${esc(s.hint)}. Но это не единственный вариант: ниже — ${alts.length} альтернатив с ценами в рублях, сильными сторонами и способом оплаты каждой из России.`,
    ],
    seed,
  );

  const toc = tocBlock([
    ['list', 'Список альтернатив'],
    ['table', 'Сравнительная таблица'],
    ['stay', `А если остаться на ${name}?`],
    ['faq', 'Частые вопросы'],
  ]);

  const altCards = alts
    .map(
      (a, i) => `<div class="alt-card">
<div class="alt-head"><span class="alt-n">${i + 1}</span><h3>${esc(a.name)}</h3><span class="alt-price">${fromPrice(a)}</span></div>
<p>${esc(cap1(a.hint))}.</p>
<p class="hint">Тарифы: ${a.tiers.map(esc).join(' · ')}</p>
<div class="pp-chips"><a class="pp-chip" href="${base}oplata-${a.slug}/">Оплатить ${esc(a.name)}</a><a class="pp-chip" href="${base}${A(TYPE_DEFS.problemy.slug(a))}">Если оплата не проходит</a></div>
</div>`,
    )
    .join('');

  const tableRows = [s, ...alts]
    .map((a) => `<tr${a.slug === s.slug ? ' class="hl"' : ''}><td>${esc(a.name)}${a.slug === s.slug ? ' (исходный)' : ''}</td><td>${fromPrice(a)}</td><td>${esc(a.tiers[0] || '—')}</td></tr>`)
    .join('');

  const sections = `
<h2 id="list">Альтернативы ${name}</h2>
${altCards}

<h2 id="table">Сравнительная таблица</h2>
<div class="tbl-wrap"><table><thead><tr><th>Сервис</th><th>Цена в рублях</th><th>Базовый тариф</th></tr></thead><tbody>${tableRows}</tbody></table></div>
<p class="hint">Цены — ориентир «официальная цена × курс + комиссия», фиксируются до оплаты.</p>

<h2 id="stay">А если остаться на ${name}?</h2>
<p>Часто «поиск альтернативы» на самом деле означает «не получается оплатить». Если ${name} вас устраивает по функциям — менять сервис не обязательно: оплату из России мы берём на себя, доступ остаётся на вашем аккаунте, ${fromPrice(s)}.</p>
${ppSteps(s)}`;

  const faq = [
    { q: `Какая альтернатива ${s.name} самая дешёвая?`, a: `${alts.reduce((m, a) => ((a.price || 1e9) < (m.price || 1e9) ? a : m), alts[0]).name} — ${fromPrice(alts.reduce((m, a) => ((a.price || 1e9) < (m.price || 1e9) ? a : m), alts[0]))}. Но сравнивайте не только цену: лимиты и функции у тарифов заметно различаются.` },
    { q: `Можно ли оплатить эти сервисы из России?`, a: `Да, любой из списка — тем же способом: заявка, фиксированная сумма в рублях, оплата картой РФ, СБП или USDT, доступ за 5–15 минут.` },
    { q: `Переносится ли история/данные при переходе с ${s.name}?`, a: `Зависит от сервиса: у части есть импорт и экспорт данных. Перед переходом проверьте экспорт в настройках ${s.name} — и не отменяйте старую подписку до переноса.` },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'alternativy', title, h1, description, lead, toc, sections, faq, s,
      related: relatedBlock({ base, s, exceptType: 'alternativy', services, sIdx }),
    }),
    title: h1,
  };
}

// ================================================================ ТИП 4
// «Как продлить X из России»

function renderProdlenie({ base, verifyTags, dateIso, s, services, sIdx }) {
  const seed = hashStr(`art4|${s.slug}`);
  const name = esc(s.name);
  const slug = TYPE_DEFS.prodlenie.slug(s);

  const title = `Как продлить ${s.name} из России в ${YEAR} году — без потери аккаунта и данных`;
  const h1 = `Как продлить подписку ${name} из России`;
  const description = `Подписка ${s.name} заканчивается, а автосписание не проходит? Что происходит с аккаунтом после просрочки, как продлить за 5–15 минут в рублях (${fromPrice(s)}) и не потерять данные.`;

  const lead = pick(
    [
      `Подписка ${name} оплачена когда-то давно, а теперь заканчивается — и автосписание с российской карты, конечно, не проходит. Хорошая новость: продление почти всегда проще первой оплаты. Разбираем, что произойдёт с аккаунтом, какие сроки не критичны и как продлить без пересоздания аккаунта.`,
      `«Ваша подписка истекает» от ${name} — письмо, после которого у большинства пользователей из России начинается квест. Спокойно: у вас есть время, аккаунт сразу не пострадает. Ниже — что именно происходит после просрочки и самый короткий путь продления.`,
    ],
    seed,
  );

  const toc = tocBlock([
    ['grace', 'Что происходит после просрочки'],
    ['ways', 'Способы продления'],
    ['pp', 'Продление через PlataPay: пошагово'],
    ['keep', 'Как не потерять данные'],
    ['faq', 'Частые вопросы'],
  ]);

  const sections = `
<h2 id="grace">Что происходит после просрочки</h2>
<ul class="check">
<li><b>Первые дни.</b> Большинство сервисов, включая ${name}, дают льготный период: доступ закрывается, но данные и настройки аккаунта сохраняются.</li>
<li><b>Недели.</b> Аккаунт переводится на бесплатный план или замораживается: часть контента/лимитов недоступна, история обычно цела.</li>
<li><b>Месяцы.</b> У отдельных сервисов начинается очистка данных неактивных платных аккаунтов — это самый серьёзный риск затягивания.</li>
</ul>
<p>Вывод: продлевать лучше до конца оплаченного периода, но и после «истечения» паниковать рано — восстановление почти всегда возможно на тот же аккаунт.</p>

<h2 id="ways">Способы продления</h2>
${waysBlock(s, seed, { compact: true })}
<p class="hint">Для продления важный нюанс: способ должен «лечь» на существующий аккаунт. Подарочный код не того региона или оплата из «неправильной» страны могут не примениться — при заявке через посредника регион аккаунта проверяется до оплаты.</p>

<h2 id="pp">Продление через PlataPay: пошагово</h2>
${ppSteps(s)}
${priceTable(s)}

<h2 id="keep">Как не потерять данные</h2>
<ul class="check">
<li>Не удаляйте аккаунт и не создавайте новый «на всякий случай» — продление на существующий почти всегда возможно.</li>
<li>Проверьте, что у вас есть доступ к e-mail аккаунта: на него приходят подтверждения.</li>
<li>Если сервис хранит важные данные (${s.cat === 'Облако' ? 'файлы, базы, репозитории' : 'история, настройки, проекты'}) — сделайте экспорт до конца льготного периода.</li>
</ul>`;

  const faq = [
    { q: `Продление придёт на мой текущий аккаунт ${s.name}?`, a: `Да. Продлеваем именно ваш аккаунт — по e-mail, на который он зарегистрирован. Пароль не нужен.` },
    { q: `Успею ли я, если подписка кончается сегодня?`, a: `Обычно да: от заявки до продления проходит 5–15 минут после подтверждения суммы. Работаем ежедневно с 08:00 до 24:00 МСК.` },
    { q: `Можно ли продлить сразу на год?`, a: `Да, годовые тарифы обычно выгоднее месячных на 15–20%. Скажите оператору нужный срок — сумма будет зафиксирована до оплаты.` },
    { q: `Что если автосписание вдруг пройдёт и получится двойная оплата?`, a: `С российской карты автосписание в ${s.name} пройти не может — двойной оплаты не будет. Если у вас подключена зарубежная карта, предупредите оператора: продлим с нужной даты.` },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'prodlenie', title, h1, description, lead, toc, sections, faq, s,
      related: relatedBlock({ base, s, exceptType: 'prodlenie', services, sIdx }),
    }),
    title: h1,
  };
}

// ================================================================ ТИП 5
// Гайды по категориям

function renderCatGuide({ base, verifyTags, dateIso, cat, catKey, list }) {
  const slug = `kak-platit-${translitCat(catKey)}`;
  const title = `${cat.title} из России в ${YEAR}: как оплачивать — полный гайд`;
  const h1 = `${cat.title}: как платить из России в ${YEAR} году`;
  const description = `Полный гайд по оплате: ${list.slice(0, 4).map((s) => s.name).join(', ')} и ещё ${Math.max(list.length - 4, 0)} сервисов. Почему не проходят карты РФ, рабочие способы и цены в рублях.`;

  const lead = `${esc(cat.pain || '')} Ниже — как это решается на практике: способы оплаты, цены в рублях по каждому сервису категории и типичные ошибки.`;

  const toc = tocBlock([
    ['problem', 'В чём проблема'],
    ['services', 'Сервисы и цены в рублях'],
    ['how', 'Как оплачиваем'],
    ['faq', 'Частые вопросы'],
  ]);

  const rows = list
    .map((s) => `<tr><td><a href="${base}oplata-${s.slug}/">${esc(s.name)}</a></td><td>${fromPrice(s)}</td><td>${esc(s.tiers[0] || '—')}</td><td><a href="${base}${A(TYPE_DEFS.problemy.slug(s))}">разбор</a></td></tr>`)
    .join('');

  const sections = `
<h2 id="problem">В чём проблема</h2>
<p>${esc(cat.pain || '')}</p>
<p>${esc(cat.workaround || '')}</p>

<h2 id="services">Сервисы категории и цены в рублях</h2>
<div class="tbl-wrap"><table><thead><tr><th>Сервис</th><th>Цена от</th><th>Базовый тариф</th><th>Если оплата не проходит</th></tr></thead><tbody>${rows}</tbody></table></div>

<h2 id="how">Как оплачиваем</h2>
<ol class="pp-steps">
<li>Выбираете сервис и тариф — из таблицы выше или из <a href="${base}catalog/">каталога</a>.</li>
<li>Оставляете заявку: оператор фиксирует сумму в рублях (комиссия 5% внутри) и присылает реквизиты — карта РФ, СБП или USDT.</li>
<li>Через 5–15 минут после оплаты доступ на вашем аккаунте, чек — в переписке.</li>
</ol>
${whyCards({ inline: false })}`;

  const faq = [
    { q: 'Какие сервисы из категории вы оплачиваете?', a: `Все из таблицы выше и большинство аналогичных: если нужного нет в списке — напишите, оплатим по ссылке. Категория «${cat.title}» — одна из самых частых в заявках.` },
    { q: 'Можно ли оплатить сразу несколько сервисов?', a: 'Да, одной заявкой: оператор посчитает общую сумму, оплата одним переводом, доступы придут по мере оформления — обычно в течение того же часа.' },
    { q: 'Работаете ли вы с юрлицами?', a: 'Да: для компаний возможна оплата по счёту и закрывающие документы. Также оплачиваем invoice зарубежных компаний напрямую по SWIFT.' },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'gidy', title, h1, description, lead, toc, sections, faq,
      related: `<section class="pp-sec"><h2 id="more">Читайте также</h2><div class="pp-links">${list
        .slice(0, 4)
        .map((s) => `<a class="pp-link" href="${base}${A(TYPE_DEFS.bezkarty.slug(s))}">${TYPE_DEFS.bezkarty.linkTitle(s)}</a>`)
        .join('')}</div><div class="pp-chips"><a class="pp-chip" href="${base}${BLOG}/">Все статьи</a><a class="pp-chip" href="${base}seo/">Все сервисы</a></div></section>`,
    }),
    title: h1,
  };
}

// ================================================================ ТИП 6
// Игры в Steam (пример «новая игра вышла — материал под неё»)

const STEAM_GAMES = [
  { slug: 'cyberpunk-2077', name: 'Cyberpunk 2077', usd: 60, note: 'включая дополнение Phantom Liberty — его тоже можно купить отдельно' },
  { slug: 'baldurs-gate-3', name: "Baldur's Gate 3", usd: 60, note: 'одна из самых продаваемых RPG десятилетия, кросс-сейвы между платформами' },
  { slug: 'elden-ring', name: 'Elden Ring', usd: 60, note: 'вместе с дополнением Shadow of the Erdtree продаётся бандлом дешевле' },
  { slug: 'gta-5', name: 'GTA V', usd: 40, note: 'GTA Online входит в издание; для RU-аккаунтов игра недоступна к покупке напрямую' },
  { slug: 'rdr-2', name: 'Red Dead Redemption 2', usd: 60, note: 'часто уходит в скидки до −50–70% — ловим распродажи' },
  { slug: 'hogwarts-legacy', name: 'Hogwarts Legacy', usd: 50, note: 'региональные цены сильно различаются — покупка через нужный регион экономит' },
  { slug: 'the-witcher-3', name: 'Ведьмак 3: Дикая Охота', usd: 40, note: 'полное издание с дополнениями Hearts of Stone и Blood and Wine' },
  { slug: 'ea-fc-26', name: 'EA SPORTS FC 26', usd: 70, note: 'плюс поинты FC Points для Ultimate Team — их тоже пополняем' },
  { slug: 'helldivers-2', name: 'Helldivers 2', usd: 40, note: 'требуется привязка PSN в ряде регионов — учитываем при выборе региона покупки' },
  { slug: 'cs2-popolnenie', name: 'Counter-Strike 2 (пополнение и кейсы)', usd: 10, note: 'сама игра бесплатна: пополняем кошелёк Steam под кейсы и маркет' },
  { slug: 'dota-2-plus', name: 'Dota 2 (Dota Plus и баттл-пасс)', usd: 4, note: 'подписка Dota Plus и сезонные события — оплата через пополнение кошелька' },
  { slug: 'monster-hunter-wilds', name: 'Monster Hunter Wilds', usd: 70, note: 'один из главных релизов последнего времени, есть Deluxe-издания' },
];

function renderSteamGame({ base, verifyTags, dateIso, g, steamService }) {
  const slug = `kak-kupit-${g.slug}-v-steam`;
  const rub = money(usdToRub(g.usd));
  const name = esc(g.name);
  const title = `Как купить ${g.name} в Steam из России в ${YEAR} году — от ${rub}`;
  const h1 = `Как купить ${name} в Steam из России`;
  const description = `${g.name} недоступна к покупке с российского аккаунта Steam. Разбираем рабочие способы ${YEAR} года: гифт, пополнение кошелька, покупка через посредника — от ${rub}.`;

  const lead = `${name} в российском регионе Steam ${g.usd <= 10 ? 'формально доступна, но пополнить кошелёк российской картой нельзя' : 'купить напрямую нельзя: издатель не продаёт её в регионе РФ, а российские карты Steam не принимает'}. ${cap1(esc(g.note))}. Ниже — все способы купить игру на свой аккаунт без смены региона и риска блокировки.`;

  const toc = tocBlock([
    ['why', 'Почему игра недоступна'],
    ['ways', 'Способы покупки'],
    ['steps', 'Как покупаем мы: пошагово'],
    ['price', 'Сколько стоит'],
    ['faq', 'Частые вопросы'],
  ]);

  const sections = `
<h2 id="why">Почему игра недоступна с российского аккаунта</h2>
<ul class="check">
<li>Steam не принимает карты российских банков с 2022 года — пополнить кошелёк напрямую нельзя.</li>
<li>Часть издателей отключила продажу своих игр в регионе РФ — таких игр просто нет в магазине для российских аккаунтов.</li>
<li>Смена региона аккаунта «вручную» нарушает правила Steam: аккаунт с библиотекой можно потерять.</li>
</ul>

<h2 id="ways">Способы покупки в ${YEAR} году</h2>
<div class="pc-grid">
${procon('Гифт от друга за границей', ['Игра сразу в вашей библиотеке', 'Регион аккаунта не меняется'], ['Нужен друг в подходящем регионе с работающей картой', 'Разница регионов может блокировать отправку гифта'])}
${procon('Пополнение кошелька кодами', ['Подходит для игр, доступных в вашем регионе', 'Коды продаются во многих магазинах'], ['Курс кодов заметно выше официального', `Для недоступных в регионе игр (как ${g.usd > 10 ? name : 'многие релизы'}) не поможет`])}
${procon('Покупка через посредника (PlataPay)', ['Работает и для игр, которых нет в регионе РФ: покупка-гифт с аккаунта нужного региона', 'Сумма в рублях фиксируется до оплаты, комиссия 5%', 'Аккаунт и регион не меняются — без риска для библиотеки'], ['Комиссия 5%', 'Покупка по заявке, а не в один клик'])}
</div>

<h2 id="steps">Как покупаем мы: пошагово</h2>
<ol class="pp-steps">
<li>Присылаете ссылку на ${name} в Steam и ссылку на ваш профиль (или логин) в <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">Telegram</a> или через форму ниже.</li>
<li>Оператор проверяет доступность игры для вашего аккаунта, называет точную сумму в рублях и присылает реквизиты — карта РФ, СБП или USDT.</li>
<li>Игра приходит гифтом на аккаунт или активируется пополнением кошелька — обычно в течение 15–60 минут.</li>
</ol>

<h2 id="price">Сколько стоит</h2>
<p>Ориентир: официальная цена ${name} — около $${g.usd}, в рублях с учётом курса и комиссии — <b>от ${rub}</b>. Итоговая сумма зависит от региона покупки и текущих скидок Steam (во время распродаж выходит заметно дешевле) — оператор фиксирует её до оплаты.</p>
${whyCards({ inline: false })}`;

  const faq = [
    { q: 'Это безопасно для моего аккаунта Steam?', a: 'Да: регион и данные аккаунта не меняются, VPN не нужен. Гифт или пополнение — штатные механики Steam, за них не банят.' },
    { q: 'Что нужно от меня для покупки?', a: 'Ссылка на игру, ссылка на ваш профиль Steam (для гифта — добавимся в друзья) и контакт для связи. Пароль от аккаунта не нужен никогда.' },
    { q: 'Скидки Steam действуют при такой покупке?', a: `Да: если ${g.name} в момент заказа со скидкой в регионе покупки, платите скидочную цену + комиссию. Во время больших распродаж это самый выгодный момент.` },
    { q: 'Сколько ждать игру?', a: 'Пополнение кошелька — 5–15 минут. Гифт — от 15 минут; если Steam требует «возраст дружбы», предупредим и предложим альтернативный способ сразу.' },
  ];

  return {
    slug,
    html: renderArticle({
      base, verifyTags, dateIso, slug,
      rubric: 'gidy', title, h1, description, lead, toc, sections, faq,
      s: steamService || null,
      related: `<section class="pp-sec"><h2 id="more">Читайте также</h2><div class="pp-links">${STEAM_GAMES.filter((x) => x.slug !== g.slug)
        .slice(0, 4)
        .map((x) => `<a class="pp-link" href="${base}${A(`kak-kupit-${x.slug}-v-steam`)}">Как купить ${esc(x.name)} в Steam</a>`)
        .join('')}${steamService ? `<a class="pp-link" href="${base}oplata-${steamService.slug}/">Пополнить Steam — цены и заявка</a>` : ''}</div>
<div class="pp-chips"><a class="pp-chip" href="${base}${BLOG}/">Все статьи</a></div></section>`,
    }),
    title: h1,
  };
}

// ---------------------------------------------------------- реестр типов

function cap1(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// «541 материал / 22 материала / 96 материалов»
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}

function translitCat(catKey) {
  const map = {
    AI: 'ai-servisy', Видео: 'video-i-dizajn', Музыка: 'muzyku-i-kino', Игры: 'igry',
    Облако: 'oblachnye-servisy', Бизнес: 'biznes-instrumenty', Обучение: 'obuchenie',
    Путешествия: 'puteshestviya', Маркет: 'marketplejsy', Билеты: 'bilety',
    Магазины: 'zarubezhnye-magaziny', GiftCards: 'gift-cards', Ассеты: 'igrovye-assety',
  };
  return map[catKey] || catKey.toLowerCase();
}

export const TYPE_DEFS = {
  problemy: {
    slug: (s) => `ne-prohodit-oplata-${s.slug}`,
    linkTitle: (s) => `Оплата ${esc(s.name)} не проходит: причины и решения`,
    appliesTo: () => true,
  },
  bezkarty: {
    slug: (s) => `kak-oplatit-${s.slug}-bez-zarubezhnoj-karty`,
    linkTitle: (s) => `Как оплатить ${esc(s.name)} без зарубежной карты`,
    appliesTo: () => true,
  },
  alternativy: {
    slug: (s) => `alternativy-${s.slug}`,
    linkTitle: (s) => `Альтернативы ${esc(s.name)} в ${YEAR} году`,
    appliesTo: (s) => (CAT_COUNT.get(s.cat) || 0) >= 4,
  },
  prodlenie: {
    slug: (s) => `kak-prodlit-${s.slug}`,
    linkTitle: (s) => `Как продлить ${esc(s.name)} из России`,
    appliesTo: (s) => kindOf(s.cat) === 'subscription',
  },
};

// Ссылки на статьи сервиса — для «богатых» страниц (/oplata-<slug>/ и др.).
export function articleLinksFor(service, base) {
  const links = [];
  for (const def of Object.values(TYPE_DEFS)) {
    const ok = typeof def.appliesTo === 'function' ? def.appliesTo(service) : true;
    if (!ok) continue;
    links.push(`<a class="pp-chip" href="${base}${A(def.slug(service))}">${def.linkTitle(service)}</a>`);
  }
  if (!links.length) return '';
  return `<section class="pp-sec"><h2>Статьи про ${esc(service.name)}</h2><div class="pp-chips">${links.join('')}<a class="pp-chip" href="${base}${BLOG}/">Все статьи →</a></div></section>`;
}

// ---------------------------------------------------------------- хабы

function renderRubricHub({ base, verifyTags, rubric, items }) {
  const r = RUBRICS[rubric];
  const canonical = `${SITE}/${BLOG}/${r.slug}/`;
  const links = items.map((a) => `<a class="pp-link" href="${base}${A(a.slug)}">${a.title}</a>`).join('');
  const body = `<main class="wrap">
${breadcrumbs([{ name: 'Главная', href: base }, { name: 'Статьи', href: `${base}${BLOG}/` }, { name: r.title }])}
<div class="pp-sec"><h1>${r.title}</h1><p class="lead">${r.desc} В рубрике ${plural(items.length, 'материал', 'материала', 'материалов')}.</p></div>
<section class="pp-sec"><div class="pp-links">${links}</div></section>
<section class="pp-sec"><div class="pp-chips">${Object.values(RUBRICS)
    .filter((x) => x.slug !== r.slug)
    .map((x) => `<a class="pp-chip" href="${base}${BLOG}/${x.slug}/">${x.title}</a>`)
    .join('')}<a class="pp-chip" href="${base}${BLOG}/">Все статьи</a></div></section>
</main>`;
  return wrapPage({
    base, canonical,
    title: `${r.title} — статьи PlataPay`,
    description: `${r.desc} ${items.length} материалов с инструкциями, ценами в рублях и разбором способов оплаты.`,
    verifyTags, ld: '',
    cta: { href: CONTACTS.telegram, label: 'Написать' },
    body, footerCompact: false,
  });
}

function renderBlogHub({ base, verifyTags, byRubric, total }) {
  const canonical = `${SITE}/${BLOG}/`;
  const sections = Object.entries(byRubric)
    .map(([key, items]) => {
      const r = RUBRICS[key];
      const preview = items.slice(0, 8).map((a) => `<a class="pp-link" href="${base}${A(a.slug)}">${a.title}</a>`).join('');
      return `<section class="pp-sec"><h2>${r.title} <span class="hub-count">${items.length}</span></h2>
<p class="hint" style="margin:0 0 4px">${r.desc}</p>
<div class="pp-links">${preview}</div>
${items.length > 8 ? `<p style="margin-top:10px"><a class="pp-btn-ghost" style="height:40px;padding:0 18px;font-size:13.5px" href="${base}${BLOG}/${r.slug}/">Все материалы рубрики (${items.length}) →</a></p>` : ''}
</section>`;
    })
    .join('');
  const body = `<main class="wrap">
${breadcrumbs([{ name: 'Главная', href: base }, { name: 'Статьи' }])}
<div class="pp-sec"><h1>Статьи и инструкции</h1>
<p class="lead">${plural(total, 'материал', 'материала', 'материалов')} о том, как платить за зарубежные сервисы из России: разборы проблем с оплатой, способы без зарубежной карты, альтернативы, продление подписок и большие гайды. Во всех статьях — реальные цены в рублях и честные плюсы-минусы каждого способа.</p></div>
${sections}
</main>`;
  return wrapPage({
    base, canonical,
    title: `Статьи о зарубежных сервисах и оплате из России — PlataPay`,
    description: `${total} инструкций и разборов: почему не проходит оплата, как платить без зарубежной карты, альтернативы сервисам, продление подписок, покупка игр в Steam.`,
    verifyTags, ld: '',
    cta: { href: CONTACTS.telegram, label: 'Написать' },
    body, footerCompact: false,
  });
}

// ------------------------------------------------------------ генерация

/**
 * Пишет раздел /blog/ в out/ и возвращает список URL для sitemap.
 */
export function generateArticles({ out, base, verifyTags, services }) {
  const t0 = Date.now();
  const dateIso = new Date().toISOString().slice(0, 10);
  const urls = [];
  const byRubric = { problemy: [], bezkarty: [], alternativy: [], prodlenie: [], gidy: [] };

  // Соседи по категории (для «Альтернатив»).
  const byCat = new Map();
  for (const s of services) {
    if (!byCat.has(s.cat)) byCat.set(s.cat, []);
    byCat.get(s.cat).push(s);
  }

  const blogDir = path.join(out, BLOG);
  fs.mkdirSync(blogDir, { recursive: true });

  const write = (rubric, art) => {
    const dir = path.join(blogDir, art.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), art.html);
    urls.push(`${SITE}/${A(art.slug)}`);
    byRubric[rubric].push(art);
  };

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    write('problemy', renderProblemy({ base, verifyTags, dateIso, s, services, sIdx: i }));
    write('bezkarty', renderBezKarty({ base, verifyTags, dateIso, s, services, sIdx: i }));
    if (TYPE_DEFS.alternativy.appliesTo(s)) {
      const siblings = byCat.get(s.cat).filter((x) => x.slug !== s.slug);
      write('alternativy', renderAlternativy({ base, verifyTags, dateIso, s, services, sIdx: i, siblings }));
    }
    if (TYPE_DEFS.prodlenie.appliesTo(s)) {
      write('prodlenie', renderProdlenie({ base, verifyTags, dateIso, s, services, sIdx: i }));
    }
  }

  for (const [catKey, list] of byCat.entries()) {
    const cat = CATEGORIES[catKey];
    if (!cat || list.length < 2) continue;
    write('gidy', renderCatGuide({ base, verifyTags, dateIso, cat, catKey, list }));
  }

  const steamService = services.find((s) => s.slug === 'steam') || null;
  for (const g of STEAM_GAMES) {
    write('gidy', renderSteamGame({ base, verifyTags, dateIso, g, steamService }));
  }

  // Хабы рубрик + главный хаб.
  for (const [key, items] of Object.entries(byRubric)) {
    const dir = path.join(blogDir, RUBRICS[key].slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderRubricHub({ base, verifyTags, rubric: key, items }));
    urls.push(`${SITE}/${BLOG}/${RUBRICS[key].slug}/`);
  }
  const total = Object.values(byRubric).reduce((n, a) => n + a.length, 0);
  fs.writeFileSync(path.join(blogDir, 'index.html'), renderBlogHub({ base, verifyTags, byRubric, total }));
  urls.push(`${SITE}/${BLOG}/`);

  console.log(`blog: ${total} articles + ${Object.keys(byRubric).length} rubric hubs + 1 index in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return urls;
}
