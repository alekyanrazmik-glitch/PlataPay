// Geo dimension for the SEO landing generator. Every service gets a
// per-city landing ("оплата <сервис> в <городе>"). The work itself is
// done online, so the city only changes the framing — but search
// demand for "оплатить X в Москве" is real, so each city/service pair
// gets its own page with the city woven through the copy, title,
// description and FAQ.
//
// Content is varied deterministically: a stable string hash of the
// service+city slug selects intro/closing phrasings, so rebuilds are
// reproducible (clean diffs) while neighbouring pages don't read as
// byte-identical templates.

import { CATEGORIES, YEAR } from './data.mjs';

// 73 cities, hand-curated with the prepositional case ("в Москве"),
// a latin slug and the federal subject. 97 services × 73 cities =
// 7081 landing pages.
export const CITIES = [
  { name: 'Москва', prep: 'в Москве', slug: 'moskve', region: 'Москва' },
  { name: 'Санкт-Петербург', prep: 'в Санкт-Петербурге', slug: 'sankt-peterburge', region: 'Санкт-Петербург' },
  { name: 'Новосибирск', prep: 'в Новосибирске', slug: 'novosibirske', region: 'Новосибирская область' },
  { name: 'Екатеринбург', prep: 'в Екатеринбурге', slug: 'ekaterinburge', region: 'Свердловская область' },
  { name: 'Казань', prep: 'в Казани', slug: 'kazani', region: 'Татарстан' },
  { name: 'Нижний Новгород', prep: 'в Нижнем Новгороде', slug: 'nizhnem-novgorode', region: 'Нижегородская область' },
  { name: 'Челябинск', prep: 'в Челябинске', slug: 'chelyabinske', region: 'Челябинская область' },
  { name: 'Красноярск', prep: 'в Красноярске', slug: 'krasnoyarske', region: 'Красноярский край' },
  { name: 'Самара', prep: 'в Самаре', slug: 'samare', region: 'Самарская область' },
  { name: 'Уфа', prep: 'в Уфе', slug: 'ufe', region: 'Башкортостан' },
  { name: 'Ростов-на-Дону', prep: 'в Ростове-на-Дону', slug: 'rostove-na-donu', region: 'Ростовская область' },
  { name: 'Краснодар', prep: 'в Краснодаре', slug: 'krasnodare', region: 'Краснодарский край' },
  { name: 'Омск', prep: 'в Омске', slug: 'omske', region: 'Омская область' },
  { name: 'Воронеж', prep: 'в Воронеже', slug: 'voronezhe', region: 'Воронежская область' },
  { name: 'Пермь', prep: 'в Перми', slug: 'permi', region: 'Пермский край' },
  { name: 'Волгоград', prep: 'в Волгограде', slug: 'volgograde', region: 'Волгоградская область' },
  { name: 'Саратов', prep: 'в Саратове', slug: 'saratove', region: 'Саратовская область' },
  { name: 'Тюмень', prep: 'в Тюмени', slug: 'tyumeni', region: 'Тюменская область' },
  { name: 'Тольятти', prep: 'в Тольятти', slug: 'tolyatti', region: 'Самарская область' },
  { name: 'Ижевск', prep: 'в Ижевске', slug: 'izhevske', region: 'Удмуртия' },
  { name: 'Барнаул', prep: 'в Барнауле', slug: 'barnaule', region: 'Алтайский край' },
  { name: 'Ульяновск', prep: 'в Ульяновске', slug: 'ulyanovske', region: 'Ульяновская область' },
  { name: 'Иркутск', prep: 'в Иркутске', slug: 'irkutske', region: 'Иркутская область' },
  { name: 'Хабаровск', prep: 'в Хабаровске', slug: 'habarovske', region: 'Хабаровский край' },
  { name: 'Ярославль', prep: 'в Ярославле', slug: 'yaroslavle', region: 'Ярославская область' },
  { name: 'Владивосток', prep: 'во Владивостоке', slug: 'vladivostoke', region: 'Приморский край' },
  { name: 'Махачкала', prep: 'в Махачкале', slug: 'mahachkale', region: 'Дагестан' },
  { name: 'Томск', prep: 'в Томске', slug: 'tomske', region: 'Томская область' },
  { name: 'Оренбург', prep: 'в Оренбурге', slug: 'orenburge', region: 'Оренбургская область' },
  { name: 'Кемерово', prep: 'в Кемерове', slug: 'kemerovo', region: 'Кемеровская область' },
  { name: 'Новокузнецк', prep: 'в Новокузнецке', slug: 'novokuznetske', region: 'Кемеровская область' },
  { name: 'Рязань', prep: 'в Рязани', slug: 'ryazani', region: 'Рязанская область' },
  { name: 'Набережные Челны', prep: 'в Набережных Челнах', slug: 'naberezhnyh-chelnah', region: 'Татарстан' },
  { name: 'Астрахань', prep: 'в Астрахани', slug: 'astrahani', region: 'Астраханская область' },
  { name: 'Пенза', prep: 'в Пензе', slug: 'penze', region: 'Пензенская область' },
  { name: 'Киров', prep: 'в Кирове', slug: 'kirove', region: 'Кировская область' },
  { name: 'Липецк', prep: 'в Липецке', slug: 'lipecke', region: 'Липецкая область' },
  { name: 'Чебоксары', prep: 'в Чебоксарах', slug: 'cheboksarah', region: 'Чувашия' },
  { name: 'Калининград', prep: 'в Калининграде', slug: 'kaliningrade', region: 'Калининградская область' },
  { name: 'Тула', prep: 'в Туле', slug: 'tule', region: 'Тульская область' },
  { name: 'Курск', prep: 'в Курске', slug: 'kurske', region: 'Курская область' },
  { name: 'Ставрополь', prep: 'в Ставрополе', slug: 'stavropole', region: 'Ставропольский край' },
  { name: 'Сочи', prep: 'в Сочи', slug: 'sochi', region: 'Краснодарский край' },
  { name: 'Тверь', prep: 'в Твери', slug: 'tveri', region: 'Тверская область' },
  { name: 'Магнитогорск', prep: 'в Магнитогорске', slug: 'magnitogorske', region: 'Челябинская область' },
  { name: 'Иваново', prep: 'в Иванове', slug: 'ivanovo', region: 'Ивановская область' },
  { name: 'Брянск', prep: 'в Брянске', slug: 'bryanske', region: 'Брянская область' },
  { name: 'Белгород', prep: 'в Белгороде', slug: 'belgorode', region: 'Белгородская область' },
  { name: 'Сургут', prep: 'в Сургуте', slug: 'surgute', region: 'ХМАО — Югра' },
  { name: 'Владимир', prep: 'во Владимире', slug: 'vladimire', region: 'Владимирская область' },
  { name: 'Нижний Тагил', prep: 'в Нижнем Тагиле', slug: 'nizhnem-tagile', region: 'Свердловская область' },
  { name: 'Архангельск', prep: 'в Архангельске', slug: 'arhangelske', region: 'Архангельская область' },
  { name: 'Чита', prep: 'в Чите', slug: 'chite', region: 'Забайкальский край' },
  { name: 'Симферополь', prep: 'в Симферополе', slug: 'simferopole', region: 'Крым' },
  { name: 'Калуга', prep: 'в Калуге', slug: 'kaluge', region: 'Калужская область' },
  { name: 'Смоленск', prep: 'в Смоленске', slug: 'smolenske', region: 'Смоленская область' },
  { name: 'Волжский', prep: 'в Волжском', slug: 'volzhskom', region: 'Волгоградская область' },
  { name: 'Якутск', prep: 'в Якутске', slug: 'yakutske', region: 'Якутия' },
  { name: 'Саранск', prep: 'в Саранске', slug: 'saranske', region: 'Мордовия' },
  { name: 'Череповец', prep: 'в Череповце', slug: 'cherepovce', region: 'Вологодская область' },
  { name: 'Вологда', prep: 'в Вологде', slug: 'vologde', region: 'Вологодская область' },
  { name: 'Курган', prep: 'в Кургане', slug: 'kurgane', region: 'Курганская область' },
  { name: 'Орёл', prep: 'в Орле', slug: 'orle', region: 'Орловская область' },
  { name: 'Владикавказ', prep: 'во Владикавказе', slug: 'vladikavkaze', region: 'Северная Осетия' },
  { name: 'Подольск', prep: 'в Подольске', slug: 'podolske', region: 'Московская область' },
  { name: 'Грозный', prep: 'в Грозном', slug: 'groznom', region: 'Чечня' },
  { name: 'Мурманск', prep: 'в Мурманске', slug: 'murmanske', region: 'Мурманская область' },
  { name: 'Тамбов', prep: 'в Тамбове', slug: 'tambove', region: 'Тамбовская область' },
  { name: 'Стерлитамак', prep: 'в Стерлитамаке', slug: 'sterlitamake', region: 'Башкортостан' },
  { name: 'Петрозаводск', prep: 'в Петрозаводске', slug: 'petrozavodske', region: 'Карелия' },
  { name: 'Кострома', prep: 'в Костроме', slug: 'kostrome', region: 'Костромская область' },
  { name: 'Новороссийск', prep: 'в Новороссийске', slug: 'novorossijske', region: 'Краснодарский край' },
  { name: 'Нижневартовск', prep: 'в Нижневартовске', slug: 'nizhnevartovske', region: 'ХМАО — Югра' },
];

const fmtRub = (n) => (n ? `от ${n.toLocaleString('ru-RU')} ₽` : 'по сумме заказа');
const fmtRubBare = (n) => `${n.toLocaleString('ru-RU')} ₽`;

// Stable, order-independent string hash → non-negative int. Lets us
// pick a deterministic content variant per service/city pair.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const pick = (arr, seed) => arr[seed % arr.length];

export function geoSlug(service, city) {
  return `oplata-${service.slug}-${city.slug}`;
}

function tiersHtml(s) {
  if (!s.tiers || !s.tiers.length) return '';
  return `<ul class="tiers">${s.tiers.map((t) => `<li>${t}</li>`).join('')}</ul>`;
}

// Links to a handful of other cities for the same service + the city
// hub, forming a crawlable geo spine without a 7000-link page.
function geoSpine(service, city, cities) {
  const idx = cities.indexOf(city);
  const neighbours = [];
  for (let step = 1; neighbours.length < 6 && step < cities.length; step++) {
    const c = cities[(idx + step) % cities.length];
    if (c !== city) neighbours.push(c);
  }
  const links = neighbours
    .map((c) => `<a href="${geoSlug(service, c)}/" class="rel-card">${service.name} ${c.prep}</a>`)
    .join('');
  return `
    <section class="rel">
      <h2 style="padding-left:4px;">${service.name} в других городах</h2>
      <div class="rel-grid">
        ${links}
        <a href="geo/${city.slug}/" class="rel-card">Все сервисы ${city.prep} →</a>
      </div>
    </section>`;
}

export function geoPage(service, city, cities) {
  const s = service;
  const cat = CATEGORIES[s.cat];
  const seed = hash(`${s.slug}|${city.slug}`);

  const leadVariants = [
    `Нужно оплатить ${s.name} ${city.prep}? Прямой платёж картой российского банка сервис не пропускает, но способ оплатить ${s.name} из ${city.region} есть — мы оплачиваем подписку с зарубежной карты на ваш аккаунт. ${s.name} — ${s.hint}.`,
    `${s.name} ${city.prep}: сервис работает, а вот оплата картой, выпущенной в России, не проходит. PlataPay закрывает этот разрыв — оформляете заявку, мы оплачиваем ${s.name}, доступ остаётся на вашем аккаунте. ${s.name} — ${s.hint}.`,
    `Жителям ${city.region} ${s.name} доступен так же, как и везде, — проблема только в оплате. С 2022 года карты РФ сервис не принимает. Мы оплачиваем ${s.name} ${city.prep} с реальной зарубежной карты за 5–15 минут. ${s.name} — ${s.hint}.`,
    `Оплата ${s.name} ${city.prep} ничем не отличается от оплаты в любом другом городе России: всё происходит онлайн. Вы оставляете заявку, мы оплачиваем подписку ${s.name} с иностранной карты, вы получаете доступ. ${s.name} — ${s.hint}.`,
  ];

  const closeVariants = [
    `Оставьте заявку — ответим в течение 1–15 минут, оплатим ${s.name} и пришлём подтверждение. Работаем со всей ${city.region} онлайн.`,
    `Заполните форму ниже или напишите в Telegram — оплатим ${s.name} ${city.prep} в тот же день.`,
    `Готовы оплатить ${s.name} прямо сейчас: оставьте контакт, и мы подтвердим сумму до перевода.`,
  ];

  const body = `
      <section class="block">
        <p class="lead">${pick(leadVariants, seed)}</p>
      </section>

      <section class="block">
        <h2>Как оплатить ${s.name} ${city.prep}</h2>
        <p>Никуда ехать не нужно — оплата ${s.name} для жителей ${city.name} проходит полностью онлайн:</p>
        <ol class="steps">
          <li>Вы оставляете заявку с почтой аккаунта ${s.name} и выбранным тарифом.</li>
          <li>Мы подтверждаем сумму в рублях — ${fmtRub(s.price)} с учётом курса и комиссии.</li>
          <li>Вы оплачиваете удобно: СБП, картой банка ${city.region} или переводом.</li>
          <li>Мы оплачиваем ${s.name} с зарубежной карты и активируем подписку на вашем аккаунте.</li>
          <li>Присылаем чек и подтверждение в Telegram или на почту.</li>
        </ol>
      </section>

      <section class="block">
        <h2>Сколько стоит ${s.name} ${city.prep}</h2>
        <p>Цена в ${city.name} такая же, как по всей России, — мы не накручиваем за город. Минимальный заказ оплаты ${s.name} — ${fmtRubBare(s.price)}, в сумму уже входят конвертация по курсу банка-эмитента и наша комиссия. Точную цифру называем до оплаты.</p>
        ${s.tiers && s.tiers.length ? `<p>Тарифы ${s.name}, которые оплачиваем чаще всего:</p>${tiersHtml(s)}` : ''}
      </section>

      <section class="block">
        <h2>Почему картой из ${city.region} не оплатить напрямую</h2>
        <p>${cat.pain}</p>
        <p>${cat.workaround} Поэтому географически неважно, где вы находитесь — ${city.name}, область или другой регион: оплату ${s.name} мы проводим на своей стороне с иностранной карты.</p>
      </section>

      <section class="block">
        <h2>Что нужно от вас</h2>
        <ul class="check">
          <li>Email аккаунта ${s.name}</li>
          <li>Выбранный тариф или сумма пополнения</li>
          <li>Способ связи — Telegram, WhatsApp или телефон</li>
        </ul>
        <p>Пароль и данные вашей карты не нужны. Оплата идёт через биллинг сервиса или активацию подарочного кода у вас в аккаунте.</p>
      </section>

      <section class="block cta">
        <h2>Оплатить ${s.name} ${city.prep}</h2>
        <p>${pick(closeVariants, seed >> 3)}</p>
        <a class="btn-primary" href="https://payoplata.ru/#popupforma">Оформить заявку</a>
      </section>

      ${geoSpine(s, city, cities)}
    `;

  return {
    slug: geoSlug(s, city),
    title: `Оплата ${s.name} ${city.prep} — ${city.name}, ${YEAR} | PlataPay`,
    description: `Как оплатить ${s.name} ${city.prep} в ${YEAR} году с карты РФ не получится — оплачиваем с зарубежной карты на ваш аккаунт. ${fmtRub(s.price)}, оплата за 5–15 минут, доставка по ${city.region} онлайн.`,
    h1: `Оплата ${s.name} ${city.prep}`,
    body,
    faq: [
      { q: `Можно ли оплатить ${s.name} ${city.prep}?`, a: `Да. Оплата проходит онлайн, поэтому ваше местоположение — ${city.name} или любой другой город ${city.region} — не имеет значения. Мы оплачиваем ${s.name} с зарубежной карты на ваш аккаунт.` },
      { q: `Сколько стоит оплата ${s.name} ${city.prep}?`, a: `${fmtRub(s.price)} за минимальный тариф. Цена в ${city.name} не отличается от общероссийской — наценки за город нет.` },
      { q: `Нужно ли куда-то ехать в ${city.name}?`, a: `Нет. Всё дистанционно: заявка на сайте, оплата по СБП или карте, активация ${s.name} на вашем аккаунте. Офис посещать не нужно.` },
      { q: `Как быстро оплатят ${s.name}?`, a: `Обычно 5–15 минут после подтверждения оплаты. Ответ на заявку — в течение 1–15 минут в рабочее время.` },
    ],
  };
}
