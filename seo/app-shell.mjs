// Общий каркас SEO-страниц в новом дизайне PlataPay (перенесён из
// Next.js-макета platapayapp: тёмная палитра, стеклянная шапка,
// градиентные стикеры категорий, золотые цены, бейджи «ХИТ» и «−18%»).
//
// Ключевое отличие от старого layout.mjs: CSS и JS не инлайнятся в каждую
// страницу, а пишутся один раз в css/pp-app.css и js/pp-app.js — иначе
// сто тысяч страниц не влезут в лимиты GitHub Pages.

// ---------------------------------------------------------------- tokens

export const CONTACTS = {
  telegram: 'https://t.me/Kimzar_A',
  whatsapp: 'https://wa.me/79676726909',
};

// Куда уходят заявки: напрямую в Telegram (мгновенное подтверждение) и
// резервом в Apps Script — он дублирует заявку в Google Sheets, на почту
// и в тот же Telegram, если браузер клиента до api.telegram.org не достал.
// Используется в APP_JS и на отдельных страницах со своей формой (/booking/).
export const LEAD_DELIVERY = {
  bot: '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg',
  chat: '523060537',
  sheets:
    'https://script.google.com/macros/s/AKfycbyy43Ff5kKivrUsaXWEkda7JXNwHrOI-3BJIJp3UG9H8K6cb4DxjpC8eXNPGNEXQEWt/exec',
};

export const LEGAL =
  '© 2026 PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282 · ОГРН 1252300042356 · г. Геленджик, ул. Островского, 80А';

// Короткая версия для компактного футера массовых страниц.
export const LEGAL_SHORT = '© 2026 PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282';

export const DISCLAIMER =
  'PlataPay не является банком или платёжной системой. Мы оказываем консультационную и посредническую помощь в оплате зарубежных сервисов.';

// Скидочная механика и тарифная сетка — как в макете (lib/catalog.ts).
export const OLD_PRICE_FACTOR = 1.22;
export const DISCOUNT_LABEL = '−18%';
export const TARIFFS = [
  { label: '1 месяц', note: 'Разовая оплата', k: 1 },
  { label: '3 месяца', note: 'Выгоднее на 8%', k: 2.76 },
  { label: '12 месяцев', note: 'Выгоднее на 15%', k: 10.2 },
];

export function money(n) {
  return new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ') + ' ₽';
}

export function oldPrice(price) {
  return money(Math.round((price * OLD_PRICE_FACTOR) / 10) * 10);
}

export function tariffPrice(base, k) {
  return Math.round((base * k) / 10) * 10;
}

/** Буквенный знак сервиса для плитки: «ChatGPT» → «CH» */
export function mark(name) {
  return String(name).replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 2).toUpperCase() || 'PP';
}

// Стикеры категорий из макета: градиент подложки + белая иконка 24×24.
const STICKERS = {
  ai: { g: 'linear-gradient(150deg,#4B8CFF 0%,#1B4FD8 100%)', d: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zm0 5.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z' },
  media: { g: 'linear-gradient(150deg,#3E7BFF 0%,#13317E 100%)', d: 'M3.4 5.6h17.2v12.8H3.4zm7.2 3.4v6l5-3z' },
  music: { g: 'linear-gradient(150deg,#59A0FF 0%,#2350C8 100%)', d: 'M9 17.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2zm9.4-1.8a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2zM10.6 6.2l9.4-2.2v3.2l-9.4 2.2z' },
  games: { g: 'linear-gradient(150deg,#6E86FF 0%,#2B3BC4 100%)', d: 'M5.4 8h13.2a3.6 3.6 0 0 1 0 8H5.4a3.6 3.6 0 0 1 0-8zm2 2.4v1.4H6v1.4h1.4v1.4h1.4v-1.4h1.4v-1.4H8.8v-1.4zm9 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z' },
  design: { g: 'linear-gradient(150deg,#43B0FF 0%,#1667CC 100%)', d: 'M12 4.2l7.6 14.4H4.4z' },
  cloud: { g: 'linear-gradient(150deg,#6ABEFF 0%,#2178D8 100%)', d: 'M7.2 17.6a4.2 4.2 0 0 1 .6-8.4 5.2 5.2 0 0 1 9.6.4 3.9 3.9 0 0 1-.4 8z' },
  business: { g: 'linear-gradient(150deg,#4C7CE8 0%,#16307A 100%)', d: 'M3.6 8.8h16.8v9.6H3.6zm5.2-3.2h6.4v2.4h-6.4z' },
  edu: { g: 'linear-gradient(150deg,#4E9BFF 0%,#1B45B4 100%)', d: 'M12 4.4l9.2 4-9.2 4-9.2-4zm-6 8.4l6 2.8 6-2.8v3.6l-6 3-6-3z' },
  flights: { g: 'linear-gradient(150deg,#38A8FF 0%,#1257C8 100%)', d: 'M2.4 12.6L21.6 4l-7.6 16.6-2.2-6.6z' },
  hotels: { g: 'linear-gradient(150deg,#5FA6FF 0%,#1E56C8 100%)', d: 'M3.8 18.6V8.4L12 4l8.2 4.4v10.2zm5.6 0v-5h5.2v5z' },
  events: { g: 'linear-gradient(150deg,#FF8FA8 0%,#C43F63 100%)', d: 'M3.4 6.2h17.2v3.4a2.4 2.4 0 0 0 0 4.8v3.4H3.4v-3.4a2.4 2.4 0 0 0 0-4.8zm7.6 2.2v7.2h1.8V8.4z' },
  esim: { g: 'linear-gradient(150deg,#4DD0C0 0%,#12857F 100%)', d: 'M6.2 3.4h8.4l4 4v13.2H6.2zm3 9.6h6.2v4.2H9.2z' },
  shops: { g: 'linear-gradient(150deg,#63B4FF 0%,#1D63D0 100%)', d: 'M5.6 8.2h12.8l1.2 11.6H4.4zM9 8.2a3 3 0 0 1 6 0h-1.8a1.2 1.2 0 0 0-2.4 0z' },
  pay: { g: 'linear-gradient(150deg,#2E7BFF 0%,#0F3AA8 100%)', d: 'M3 6.6h18v3.2H3zm0 5.4h18v5.4H3zm2.6 2.2v1.6h4.2v-1.6z' },
  invoice: { g: 'linear-gradient(150deg,#7C9BFF 0%,#2C3FA8 100%)', d: 'M6 3.2h8l4.2 4.2v13.4H6zm2.6 6.4v1.6h6.8V9.6zm0 3.8v1.6h6.8v-1.6zm0 3.8v1.6h4.4v-1.6z' },
};

// Категории каталога seo/data.mjs → стикер макета.
const CAT_STICKER = {
  AI: 'ai',
  Видео: 'design',
  Музыка: 'music',
  Игры: 'games',
  Облако: 'cloud',
  Бизнес: 'business',
  Обучение: 'edu',
  Путешествия: 'flights',
  Маркет: 'pay',
  Билеты: 'events',
  Магазины: 'shops',
  GiftCards: 'pay',
  Ассеты: 'design',
};

export function catSticker(cat) {
  return STICKERS[CAT_STICKER[cat] || 'pay'];
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// Мета-описание в пределах SERP-окна (~160 симв.), обрезка по слову.
export function clampMeta(s, max = 160) {
  const t = String(s || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.—-]+$/, '');
}

// Детерминированный hash для вариативности текстов (FNV-1a, 32 бита).
export function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pick(arr, seed) {
  return arr[seed % arr.length];
}

// ------------------------------------------------------------ shared CSS

// Один файл на весь сайт: пишется в css/pp-app.css. Классы старых
// контентных блоков (.block, .steps, .check, .tiers, .faq-item, .rel-card)
// сохранены — их генерирует templates.mjs, здесь они только перекрашены
// под новую палитру.
export const APP_CSS = `:root{
  color-scheme:dark;
  --ink:#040b18;--navy:#08172f;--app:#091b36;--panel:#112243;--panel2:#0d1c37;
  --deep:#0e1e39;--chip:#16294a;--footer:#0d1c37;
  --line:#26374f;--line-soft:#22334f;--line-strong:#24395c;--line-dim:#16253d;--line-hover:#2e4a7a;
  --brand:#2e7bff;--brand-hover:#5093ff;--brand-soft:#6fa8ff;--brand-ice:#8fb4ff;--brand-deep:#1b4fd8;
  --ice:#eef3ff;--ice2:#dce8ff;--text2:#c7d6f5;--text3:#a3b8dd;--muted:#97add6;--dim:#6b80a8;--faint:#5d7099;
  --gold:#ffc53d;--sale:#ff5c7a;--mint:#2fcf9a;--teal:#4dd0c0;
}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:
    radial-gradient(1100px 560px at 10% -8%,rgba(46,123,255,.26),transparent 60%),
    radial-gradient(920px 480px at 94% 16%,rgba(77,208,192,.16),transparent 62%),
    radial-gradient(760px 420px at 62% 58%,rgba(124,92,255,.10),transparent 66%),
    var(--app);
  color:var(--ice);
  font-family:-apple-system,'SF Pro Text','Helvetica Neue','Segoe UI',system-ui,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
  line-height:1.55;
  overflow-x:hidden;
}
img{max-width:100%;height:auto}
a{color:var(--brand-soft);text-decoration:none}
a:hover{color:var(--ice)}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
h1{font-size:32px;line-height:1.12;letter-spacing:-.8px;margin:0 0 10px;font-weight:800;color:var(--ice)}
h2{font-size:21px;margin:0 0 12px;font-weight:700;letter-spacing:-.3px;color:var(--ice)}
h3{font-size:16px;margin:0 0 6px;font-weight:600;color:var(--ice)}
p{margin:0 0 12px;color:var(--text2)}
.lead{font-size:16.5px;color:var(--ice2)}
ul,ol{margin:0 0 12px;padding-left:20px;color:var(--text2)}
ul li,ol li{margin-bottom:6px}

/* ── Шапка ── */
.pp-header{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--line);
  background:linear-gradient(92deg,rgba(46,123,255,.14) 0%,rgba(46,123,255,.05) 42%,rgba(77,208,192,.09) 100%),rgba(8,23,47,.92);
  -webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px)}
.pp-header .row{max-width:1440px;margin:0 auto;height:64px;padding:0 24px;display:flex;align-items:center;gap:26px}
.pp-logo{display:flex;flex-direction:column;flex:none;line-height:1}
.pp-wm{font-size:21px;font-weight:800;letter-spacing:-.03em;color:var(--ice);white-space:nowrap}
.pp-wm b{color:var(--brand);font-weight:800}
.pp-tagline{margin-top:3px;font-size:10px;font-weight:600;color:var(--brand-soft);white-space:nowrap}
.pp-nav{display:flex;align-items:center;gap:22px;min-width:0;overflow:hidden}
.pp-nav a{font-size:14px;color:#9db2d8;white-space:nowrap;transition:color .2s}
.pp-nav a:hover{color:var(--ice)}
.pp-hcta{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:9px;height:40px;
  padding:0 18px 0 6px;border-radius:999px;border:1px solid var(--line-soft);background:var(--panel);
  color:var(--text2);font-size:14px;font-weight:500;transition:border-color .2s,color .2s}
.pp-hcta:hover{border-color:var(--brand);color:#fff}
.pp-hcta .dot{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;
  background:linear-gradient(140deg,#2e7bff,#1b4fd8);color:#fff;font-size:12px;font-weight:700}

/* ── Крошки ── */
.pp-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:7px;font-size:13px;color:var(--dim);padding:18px 0 0}
.pp-crumbs a{color:var(--dim)}
.pp-crumbs a:hover{color:var(--ice)}
.pp-crumbs .sep{opacity:.6}

/* ── Hero-панель услуги ── */
.pp-hero{position:relative;overflow:hidden;border-radius:26px;border:1px solid #26374f;
  background:linear-gradient(180deg,#1a2e4e 0%,#142543 100%);
  padding:26px 28px;margin:16px 0 0;display:flex;gap:20px;align-items:center}
.pp-hero .veil{position:absolute;inset:0;opacity:.16;pointer-events:none}
.pp-hero .wm-ic{position:absolute;right:26px;bottom:20px;width:96px;height:96px;color:#fff;opacity:.07;pointer-events:none}
.pp-hero .tile{position:relative;flex:none;width:64px;height:64px;border-radius:20px;display:grid;place-items:center;
  border:1px solid var(--line-soft);background:#101e33;color:var(--brand-ice);font-size:20px;font-weight:700}
.pp-hero .hero-body{position:relative;min-width:0}
.pp-hero .sub{color:var(--muted);font-size:14.5px;margin:6px 0 0}
.pp-badge-hot{display:inline-block;vertical-align:middle;margin-left:10px;background:var(--gold);color:#221602;
  border-radius:999px;padding:3px 10px;font-size:11px;font-weight:800;letter-spacing:.02em}
.pp-price-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:14px}
.pp-price{color:var(--gold);font-size:27px;font-weight:800;letter-spacing:-.9px;font-variant-numeric:tabular-nums;line-height:1}
.pp-price-old{color:var(--dim);font-size:14px;text-decoration:line-through;font-variant-numeric:tabular-nums}
.pp-badge-sale{background:var(--sale);color:#fff;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700}
.pp-price-note{color:var(--dim);font-size:12.5px;width:100%}

/* ── Кнопки ── */
.pp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 26px;
  border-radius:999px;border:0;background:linear-gradient(140deg,#2e7bff,#1b4fd8);color:#fff;
  font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;
  box-shadow:0 10px 26px -10px rgba(46,123,255,.7);transition:filter .2s}
.pp-btn:hover{filter:brightness(1.1);color:#fff}
.pp-btn-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;
  border-radius:999px;border:1px solid var(--line-strong);background:transparent;color:var(--text2);
  font-size:14.5px;font-weight:600;transition:border-color .2s,color .2s}
.pp-btn-ghost:hover{border-color:var(--brand);color:#fff}
.pp-cta-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}

/* ── Преимущества («почему PlataPay») ── */
.pp-why{display:grid;gap:12px;grid-template-columns:repeat(3,1fr);margin:14px 0 0}
.pp-why .card{border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:18px}
.pp-why .ic{width:46px;height:46px;border-radius:999px;display:grid;place-items:center;
  background:rgba(46,123,255,.14);border:1px solid rgba(46,123,255,.28)}
.pp-why h3{margin:12px 0 0;font-size:15px}
.pp-why p{margin:6px 0 0;font-size:13px;color:var(--muted);line-height:1.5}
/* статичные версии иконок для массовых страниц (иконки в CSS, не в HTML) */
.pp-why .ic.i-op,.pp-why .ic.i-sh,.pp-why .ic.i-bolt{background-position:center;background-repeat:no-repeat;background-size:24px 24px}
.pp-why .ic.i-op{background-image:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5v-3.6A2.5 2.5 0 0 1 4 13.5z" stroke="%235093FF" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.5" cy="10" r="1.15" fill="%238FB4FF"/><circle cx="12" cy="10" r="1.15" fill="%238FB4FF"/><circle cx="15.5" cy="10" r="1.15" fill="%238FB4FF"/></svg>')}
.pp-why .ic.i-sh{background-image:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 3.2l7 2.6v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9v-6z" stroke="%235093FF" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.6 12.1l2.5 2.4 4.3-4.6" stroke="%238FB4FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>')}
.pp-why .ic.i-bolt{background-image:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M13.2 2.8 5.6 13.4h4.8l-1.6 7.8 8-11h-5z" stroke="%235093FF" stroke-width="1.7" stroke-linejoin="round" fill="rgba(46,123,255,0.18)"/></svg>')}
.why-dot{animation:why-dot 1.6s ease-in-out infinite}
@keyframes why-dot{0%,60%,100%{opacity:.35}30%{opacity:1}}
.why-check{stroke-dasharray:12;animation:why-check 2.6s ease-in-out infinite}
@keyframes why-check{0%,20%{stroke-dashoffset:12}45%,100%{stroke-dashoffset:0}}
.why-bolt{transform-origin:center;animation:why-bolt 2.2s ease-in-out infinite}
@keyframes why-bolt{0%,70%,100%{opacity:1}80%{opacity:.45}85%{opacity:1}}

/* ── Кнопка из старых контентных блоков (templates.mjs) ── */
.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 26px;
  border-radius:999px;border:0;background:linear-gradient(140deg,#2e7bff,#1b4fd8);color:#fff;
  font-size:15px;font-weight:600;box-shadow:0 10px 26px -10px rgba(46,123,255,.7);transition:filter .2s}
.btn-primary:hover{filter:brightness(1.1);color:#fff}

/* ── Полоса статистики ── */
.pp-stats{display:grid;gap:10px;grid-template-columns:repeat(4,1fr);margin-top:14px}
.pp-stats>div{border:1px solid var(--line);background:var(--panel2);border-radius:16px;padding:14px;text-align:center}
.pp-stats b{display:block;font-size:20px;color:var(--ice);letter-spacing:-.4px}
.pp-stats b.g{color:var(--gold)}
.pp-stats span{display:block;font-size:11.5px;color:var(--dim);margin-top:3px}
@media (max-width:640px){.pp-stats{grid-template-columns:1fr 1fr}}

/* ── Панели контента ── */
.block,.pp-panel{border:1px solid var(--line);background:var(--panel2);border-radius:20px;padding:20px 22px;margin:14px 0 0}
.block.cta{text-align:center;background:linear-gradient(180deg,#13294e 0%,#112243 100%)}
.hint{font-size:13px;color:var(--dim);margin-top:10px}
.pp-steps{counter-reset:st;list-style:none;padding:0;margin:0}
.pp-steps li,.steps li{position:relative;padding-left:36px;margin:0 0 10px;color:var(--text2);font-size:14px;line-height:1.5}
.pp-steps li{counter-increment:st}
.steps{counter-reset:st;list-style:none;padding-left:0}
.steps li{counter-increment:st}
.pp-steps li::before,.steps li::before{content:counter(st);position:absolute;left:0;top:0;width:24px;height:24px;
  border-radius:999px;background:rgba(46,123,255,.16);color:var(--brand-ice);display:grid;place-items:center;
  font-weight:700;font-size:12px}
.check{list-style:none;padding-left:0}
.check li{position:relative;padding-left:24px}
.check li::before{content:"";position:absolute;left:0;top:9px;width:8px;height:8px;border-radius:50%;background:var(--brand)}
.pay-line{color:var(--dim);font-size:13px;margin-top:12px}

/* ── Тарифные строки ── */
.pp-tarif{display:flex;align-items:center;gap:13px;border:1px solid #26374f;background:#0d1c37;
  border-radius:18px;padding:13px 16px;margin-top:9px}
.pp-tarif.on{border-color:var(--brand);background:rgba(46,123,255,.10)}
.pp-tarif .r{flex:none;width:18px;height:18px;border-radius:999px;border:2px solid #2a3c5c}
.pp-tarif.on .r{border:5px solid var(--brand)}
.pp-tarif .t{flex:1;min-width:0}
.pp-tarif .t b{display:block;font-size:14.5px;font-weight:600;color:var(--ice)}
.pp-tarif .t span{display:block;margin-top:2px;font-size:12.5px;color:var(--muted)}
.pp-tarif .p{font-size:15.5px;font-weight:700;color:var(--ice);font-variant-numeric:tabular-nums;white-space:nowrap}
.tiers{list-style:none;padding-left:0}
.tiers li{position:relative;padding:8px 0 8px 24px;border-bottom:1px solid var(--line-dim)}
.tiers li:last-child{border-bottom:0}
.tiers li::before{content:"";position:absolute;left:2px;top:16px;width:7px;height:7px;border-radius:50%;background:var(--gold)}

/* ── Форма заявки ── */
.pp-order{border:1px solid var(--line-strong);background:var(--panel);border-radius:26px;padding:24px;margin:18px 0 0}
.pp-order .kicker{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.pp-order h2{margin:6px 0 4px}
.pp-order .sub{color:var(--muted);font-size:13.5px;margin:0 0 14px}
.pp-order .row{display:grid;gap:10px;grid-template-columns:1fr 1fr auto;align-items:end}
.pp-order label{display:block;font-size:12px;color:var(--muted);margin:0 0 6px}
.pp-order select,.pp-order input{width:100%;height:48px;background:var(--panel2);border:1px solid var(--line);
  color:var(--ice);border-radius:14px;padding:0 14px;font-size:15px;font-family:inherit}
.pp-order select:focus,.pp-order input:focus{outline:none;border-color:var(--brand)}
.pp-order .alt{margin-top:13px;font-size:13px;color:var(--dim)}
.pp-order .alt a{color:var(--brand-hover)}
.pp-order .err{color:#ff8d8d;margin-top:10px;font-size:13px}
.pp-order .ok{text-align:center;padding:16px 8px}
.pp-order .ok .ring{width:62px;height:62px;margin:0 auto;border-radius:999px;display:grid;place-items:center;
  background:rgba(47,207,154,.14);border:1px solid rgba(47,207,154,.4)}
.pp-order .ok h3{font-size:20px;font-weight:700;letter-spacing:-.5px;margin:14px 0 6px}
.pp-order .ok p{color:var(--text3);font-size:14px;max-width:420px;margin:0 auto}

/* ── FAQ (нативный аккордеон) ── */
.pp-faq{border:1px solid var(--line);background:var(--panel2);border-radius:16px;margin-top:10px;overflow:hidden}
.pp-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;justify-content:space-between;
  padding:14px 18px;font-size:14.5px;font-weight:600;color:var(--ice)}
.pp-faq summary::-webkit-details-marker{display:none}
.pp-faq summary::after{content:"";flex:none;width:9px;height:9px;border-right:2px solid var(--brand-soft);
  border-bottom:2px solid var(--brand-soft);transform:rotate(45deg);transition:transform .2s;margin-top:-4px}
.pp-faq[open] summary::after{transform:rotate(-135deg);margin-top:4px}
.pp-faq .a{padding:0 18px 14px;color:var(--muted);font-size:13.5px;line-height:1.55}
.pp-faq .a p{color:var(--muted);margin:0 0 8px}
.faq-item{border:1px solid var(--line);background:var(--panel2);border-radius:16px;padding:15px 18px;margin-top:10px}
.faq-item h3{font-size:14.5px;margin-bottom:6px}
.faq-item p{color:var(--muted);font-size:13.5px;margin:0}

/* ── Ссылки-сетки ── */
.rel-grid,.pp-links{display:grid;gap:9px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));margin-top:12px}
.rel-card,.pp-link{display:block;padding:12px 15px;border:1px solid var(--line-dim);background:var(--panel2);
  border-radius:14px;color:var(--text2);font-size:13.5px;line-height:1.35;transition:border-color .2s,color .2s}
.rel-card:hover,.pp-link:hover{border-color:var(--brand);color:var(--ice)}
.pp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.pp-chip{display:inline-flex;align-items:center;border:1px solid var(--line-soft);background:var(--chip);
  border-radius:999px;padding:7px 13px;font-size:13px;color:var(--text2);transition:border-color .2s,color .2s}
a.pp-chip:hover{border-color:var(--brand);color:#fff}
.pp-sec{margin-top:26px}
.pp-sec>h2{padding-left:2px}
.pp-note{font-size:12.5px;color:var(--faint);margin-top:10px}

/* ── Футер ── */
.pp-footer{margin-top:56px;border-top:1px solid var(--line-dim);background:var(--footer)}
.pp-footer .inner{max-width:1440px;margin:0 auto;padding:36px 24px 26px}
.pp-fgrid{display:grid;gap:28px;grid-template-columns:1.4fr 1fr 1fr 1.3fr}
.pp-footer .desc{color:var(--muted);font-size:13.5px;max-width:300px;margin:10px 0 0;line-height:1.55}
.pp-fcol b{display:block;font-size:14px;font-weight:600;color:var(--ice);margin-bottom:11px}
.pp-fcol a{display:block;color:var(--muted);font-size:13.5px;margin-top:8px}
.pp-fcol a:hover{color:var(--ice)}
.pp-fcol .txt{color:var(--muted);font-size:13.5px;line-height:1.55}
.pp-fbtns{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}
.pp-fbtn{display:inline-flex;align-items:center;height:38px;padding:0 18px;border-radius:999px;
  background:var(--brand);color:#fff;font-size:13.5px;font-weight:600}
.pp-fbtn:hover{background:var(--brand-hover);color:#fff}
.pp-fbtn.o{background:transparent;border:1px solid var(--line-soft);color:var(--text2);font-weight:400}
.pp-fbtn.o:hover{border-color:var(--brand);color:#fff}
.pp-legal{border-top:1px solid var(--line-dim);margin-top:26px;padding-top:16px;display:flex;flex-wrap:wrap;gap:8px 20px;
  align-items:center;justify-content:space-between;color:var(--faint);font-size:12px}
.pp-legal a{color:var(--faint)}
.pp-legal a:hover{color:var(--text3)}

/* ── Плавающая кнопка «Оплатить» ── */
.pp-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;padding:10px 16px calc(10px + env(safe-area-inset-bottom));
  background:rgba(8,23,47,.92);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
  border-top:1px solid var(--line-strong);box-shadow:0 -10px 30px -14px rgba(0,0,0,.7);
  transform:translateY(0);opacity:1;transition:transform .28s ease,opacity .28s ease}
.pp-sticky.hide{transform:translateY(130%);opacity:0;pointer-events:none}
.pp-sticky .in{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:14px;justify-content:space-between}
.pp-sticky .tx{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.pp-sticky .tx b{font-size:15px;color:var(--ice);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pp-sticky .tx span{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pp-sticky .pp-btn{flex:none;height:46px}

/* ── Статьи (/blog/) ── */
.art{max-width:800px;margin:0 auto}
.art-head{margin:18px 0 6px}
.art-rubric{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--brand-soft);background:rgba(46,123,255,.12);border:1px solid rgba(46,123,255,.25);border-radius:999px;padding:5px 12px}
.art h1{margin-top:12px}
.art-meta{color:var(--faint);font-size:13px;margin:2px 0 0}
.art h2{margin-top:32px}
.art p{font-size:15.5px;line-height:1.66}
.art .lead{font-size:17px}
.art ul.check li{font-size:15px;line-height:1.6;margin-bottom:9px}
.toc{border:1px solid var(--line);background:var(--panel2);border-radius:16px;padding:14px 18px;margin:18px 0}
.toc b{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.toc ol{margin:8px 0 0;padding-left:20px}
.toc li{margin:4px 0;font-size:14px}
.tbl-wrap{overflow-x:auto;margin:12px 0;border:1px solid var(--line);border-radius:14px;background:var(--panel2)}
.tbl-wrap table{width:100%;border-collapse:collapse;font-size:14px;min-width:520px}
.tbl-wrap th,.tbl-wrap td{padding:10px 14px;text-align:left;border-bottom:1px solid var(--line-dim);color:var(--text2)}
.tbl-wrap th{color:var(--dim);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;background:var(--deep)}
.tbl-wrap tr:last-child td{border-bottom:0}
.tbl-wrap tr.hl td{background:rgba(46,123,255,.08);color:var(--ice)}
.pc-grid{display:grid;gap:12px;grid-template-columns:1fr 1fr;margin:14px 0}
.pc{border:1px solid var(--line);background:var(--panel2);border-radius:16px;padding:16px}
.pc>b{font-size:15px;color:var(--ice)}
.pc ul{list-style:none;padding:0;margin:10px 0 0}
.pc li{position:relative;padding-left:22px;font-size:13.5px;color:var(--text2);margin:5px 0;line-height:1.5}
.pc .plus li::before{content:"+";position:absolute;left:2px;top:0;color:var(--mint);font-weight:700}
.pc .minus li::before{content:"−";position:absolute;left:2px;top:0;color:var(--sale);font-weight:700}
.pc .minus{margin-top:6px}
.alt-card{border:1px solid var(--line);background:var(--panel2);border-radius:18px;padding:18px;margin-top:12px}
.alt-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
.alt-head h3{margin:0;font-size:17px}
.alt-n{flex:none;width:26px;height:26px;border-radius:999px;display:grid;place-items:center;background:rgba(46,123,255,.16);color:var(--brand-ice);font-weight:700;font-size:13px}
.alt-price{margin-left:auto;color:var(--gold);font-weight:700;font-size:15px;white-space:nowrap}
.hub-count{font-size:12px;color:var(--dim);font-weight:600;background:var(--chip);border-radius:999px;padding:3px 9px;vertical-align:middle;margin-left:6px}
@media (max-width:700px){.pc-grid{grid-template-columns:1fr}}

/* ── Адаптив ── */
.pp-btn,.pp-btn-ghost,.pp-order select,.pp-order input,.rel-card,.pp-link,.pp-chip{min-height:44px}
.pp-chip{min-height:36px}
@media (max-width:900px){
  .pp-why{grid-template-columns:1fr}
  .pp-fgrid{grid-template-columns:1fr 1fr}
}
@media (max-width:768px){
  .pp-nav{display:none}
  .wrap{padding:0 16px}
  h1{font-size:25px;letter-spacing:-.5px}
  h2{font-size:19px}
  .pp-hero{padding:20px;gap:14px}
  .pp-hero .tile{width:52px;height:52px;border-radius:16px;font-size:17px}
  .pp-hero .wm-ic{display:none}
  .pp-price{font-size:23px}
  .pp-order .row{grid-template-columns:1fr}
  .block,.pp-panel{padding:16px}
}
@media (max-width:520px){
  .pp-fgrid{grid-template-columns:1fr}
  .rel-grid,.pp-links{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}`;

// ------------------------------------------------------------- shared JS

// Один файл на весь сайт: метрика, отправка заявки, плавающая кнопка.
export const APP_JS = `(function(){
  // Yandex.Metrika
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
  ym(109522965,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});

  var BOT=${JSON.stringify(LEAD_DELIVERY.bot)};
  var CHAT=${JSON.stringify(LEAD_DELIVERY.chat)};
  var SHEETS=${JSON.stringify(LEAD_DELIVERY.sheets)};

  // Отправка заявки: напрямую в Telegram (быстрое подтверждение) и в
  // Apps Script (резерв: у части провайдеров РФ api.telegram.org закрыт,
  // Google доступен — скрипт сам продублирует заявку в TG и на почту).
  window.ppSubmit=function(ev){
    ev.preventDefault();
    var form=ev.target;
    var card=form.closest('.pp-order');
    var tierEl=form.querySelector('select[name="tier"]');
    var tier=tierEl?tierEl.value:'';
    var contact=(form.querySelector('input[name="contact"]').value||'').trim();
    var err=card.querySelector('.err');
    var btn=form.querySelector('button[type="submit"]');
    if(err) err.hidden=true;
    if(contact.length<4){ if(err){err.textContent='Введите контакт (телефон, @username или email)';err.hidden=false;} return false; }
    btn.disabled=true; var btnText=btn.textContent; btn.textContent='Отправляем…';

    var service=card.getAttribute('data-service')||'';
    var intent=card.getAttribute('data-intent')||'';
    var geo=card.getAttribute('data-geo')||'';
    var page=location.pathname;
    var msg=['Заявка с SEO-страницы PlataPay','Сервис: '+service,(geo?'Город: '+geo:null),
      'Тариф: '+(tier||'—'),'Контакт: '+contact,'Страница: https://payoplata.ru'+page,'Интент: '+intent]
      .filter(Boolean).join('\\n');

    var payload={source:'seo',page:page,service:service,intent:intent,geo:geo,tier:tier,contact:contact,ts:Date.now()};
    var tgDirect=new Promise(function(resolve){
      var settled=false,finish=function(v){if(!settled){settled=true;resolve(v);}};
      setTimeout(function(){finish(false);},7000);
      fetch('https://api.telegram.org/bot'+BOT+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:CHAT,text:msg,disable_web_page_preview:true})
      }).then(function(r){finish(r.ok);}).catch(function(){finish(false);});
    });
    tgDirect.then(function(tgSent){
      payload.tgSent=tgSent;
      fetch(SHEETS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(payload)})
        .then(function(){return true;}).catch(function(){return false;})
        .then(function(reached){
          if(tgSent||reached){
            card.innerHTML='<div class="ok"><div class="ring"><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M6 13.6l4.6 4.4L20 7.6" stroke="#2FCF9A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
              '<h3>Заявка принята</h3><p>Оператор напишет вам в течение 5–15 минут, подтвердит сумму и пришлёт реквизиты — карта РФ, СБП или USDT. Если срочно — Telegram: <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener">@Kimzar_A</a>.</p></div>';
            if(window.ym){window.ym(109522965,'reachGoal','zayavka_service');window.ym(109522965,'reachGoal','seo_order');}
          }else{
            if(err){err.textContent='Не удалось отправить. Напишите нам в Telegram: @Kimzar_A';err.hidden=false;}
            btn.disabled=false;btn.textContent=btnText;
          }
        });
    });
    return false;
  };

  // Плавающая кнопка «Оплатить»: прячется, когда форма на экране.
  function initSticky(){
    var bar=document.getElementById('pp-sticky');
    var form=document.getElementById('zakaz');
    if(!bar||!form) return;
    var btn=bar.querySelector('a');
    if(btn) btn.addEventListener('click',function(e){
      e.preventDefault();
      form.scrollIntoView({behavior:'smooth',block:'center'});
      var input=form.querySelector('input[name="contact"]');
      if(input){setTimeout(function(){try{input.focus({preventScroll:true});}catch(_){input.focus();}},520);}
      if(window.ym){window.ym(109522965,'reachGoal','sticky_cta_click');}
    });
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){
        es.forEach(function(en){bar.classList.toggle('hide',en.isIntersecting);});
      },{threshold:.25});
      io.observe(form);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initSticky); else initSticky();
})();`;

// --------------------------------------------------------- HTML-кусочки

/** Шапка в стиле макета: вордмарк + навигация + пилюля-CTA. */
export function pageHeader({ base, nav, cta }) {
  const links = (nav || defaultNav(base))
    .map((l) => `<a href="${l.href}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`)
    .join('');
  const ctaHtml = cta === null ? '' : `<a class="pp-hcta" href="${(cta && cta.href) || '#zakaz'}"><span class="dot">₽</span>${(cta && cta.label) || 'Оплатить'}</a>`;
  return `<header class="pp-header"><div class="row">
<a class="pp-logo" href="${base}" aria-label="PlataPay — на главную"><span class="pp-wm">Plata<b>Pay</b></span><span class="pp-tagline">маркетплейс платежей</span></a>
<nav class="pp-nav" aria-label="Разделы сайта">${links}</nav>
${ctaHtml}
</div></header>`;
}

// Гео-ярус (города/способы оплаты) по умолчанию выключен и включается
// только явным SEO_GEO=1 — ссылки на него появляются в навигации лишь
// тогда, когда страницы реально собираются.
export const GEO_ON = process.env.SEO_GEO === '1';

export function defaultNav(base) {
  return [
    { label: 'Каталог', href: `${base}catalog/` },
    { label: 'Все сервисы', href: `${base}seo/` },
    { label: 'Статьи', href: `${base}blog/` },
    ...(GEO_ON ? [{ label: 'Города', href: `${base}gorod/` }] : []),
    { label: 'Отзывы', href: `${base}reviews/` },
    { label: 'Вопросы', href: `${base}faq/` },
    { label: 'Контакты', href: `${base}contacts/` },
  ];
}

/** Хлебные крошки: массив {name, href?}, последний элемент — текущая страница. */
export function breadcrumbs(items) {
  const parts = items
    .map((it, i) => {
      const name = escapeHtml(it.name);
      const s = it.href ? `<a href="${it.href}">${name}</a>` : `<span>${name}</span>`;
      return i ? `<span class="sep">›</span>${s}` : s;
    })
    .join('');
  return `<nav class="pp-crumbs" aria-label="Хлебные крошки">${parts}</nav>`;
}

/**
 * Hero-панель услуги: стикер-плитка с буквами, водяная иконка категории,
 * H1, подзаголовок, цена (золото + перечёркнутая + «−18%») и бейдж «ХИТ».
 * watermark=false убирает фоновую SVG-иконку (экономия на гео-ярусе).
 */
export function heroPanel({ service, h1, sub, price, hot = false, priceNote = '', watermark = true }) {
  const st = catSticker(service.cat);
  const priceRow = price
    ? `<div class="pp-price-row"><span class="pp-price">от ${money(price)}</span><span class="pp-price-old">${oldPrice(price)}</span><span class="pp-badge-sale">${DISCOUNT_LABEL}</span>${priceNote ? `<span class="pp-price-note">${escapeHtml(priceNote)}</span>` : ''}</div>`
    : `<div class="pp-price-row"><span class="pp-price">По запросу</span>${priceNote ? `<span class="pp-price-note">${escapeHtml(priceNote)}</span>` : ''}</div>`;
  return `<section class="pp-hero">
<div class="veil" style="background:${st.g}"></div>
${watermark ? `<svg class="wm-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${st.d}" fill-rule="evenodd"/></svg>` : ''}
<span class="tile">${escapeHtml(mark(service.name))}</span>
<div class="hero-body">
<h1>${h1}${hot ? '<span class="pp-badge-hot">ХИТ</span>' : ''}</h1>
${sub ? `<p class="sub">${sub}</p>` : ''}
${priceRow}
</div>
</section>`;
}

/**
 * Три карточки преимуществ. inline=true — анимированные SVG из макета
 * (для «богатых» страниц); inline=false — иконки из общего CSS
 * (data-URI), экономия ~2 КБ на каждой из ~100k гео-страниц.
 */
export function whyCards({ inline = true } = {}) {
  if (!inline) {
    return `<section class="pp-why" aria-label="Почему PlataPay">
<div class="card"><span class="ic i-op"></span><h3>Заказ ведёт человек</h3><p>Оператор проверяет заявку и остаётся на связи до выдачи доступа.</p></div>
<div class="card"><span class="ic i-sh"></span><h3>Без доступа к картам</h3><p>Платите один раз за конкретную заявку. Автосписаний нет.</p></div>
<div class="card"><span class="ic i-bolt"></span><h3>Доступ за 5–15 минут</h3><p>Ежедневно с 08:00 до 24:00 МСК. Не получилось — вернём деньги.</p></div>
</section>`;
  }
  return `<section class="pp-why" aria-label="Почему PlataPay">
<div class="card"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5v-3.6A2.5 2.5 0 0 1 4 13.5z" stroke="#5093FF" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.5" cy="10" r="1.15" fill="#8FB4FF" class="why-dot"/><circle cx="12" cy="10" r="1.15" fill="#8FB4FF" class="why-dot" style="animation-delay:.18s"/><circle cx="15.5" cy="10" r="1.15" fill="#8FB4FF" class="why-dot" style="animation-delay:.36s"/></svg></span><h3>Заказ ведёт человек</h3><p>Оператор проверяет заявку и остаётся на связи до выдачи доступа.</p></div>
<div class="card"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2l7 2.6v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9v-6z" stroke="#5093FF" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.6 12.1l2.5 2.4 4.3-4.6" stroke="#8FB4FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="why-check"/></svg></span><h3>Без доступа к картам</h3><p>Платите один раз за конкретную заявку. Автосписаний нет.</p></div>
<div class="card"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.2 2.8 5.6 13.4h4.8l-1.6 7.8 8-11h-5z" stroke="#5093FF" stroke-width="1.7" stroke-linejoin="round" fill="rgba(46,123,255,0.18)" class="why-bolt"/></svg></span><h3>Доступ за 5–15 минут</h3><p>Ежедневно с 08:00 до 24:00 МСК. Не получилось — вернём деньги.</p></div>
</section>`;
}

/**
 * Компактная форма заявки (данные для JS — в data-атрибутах).
 * prefill=false — ссылки на мессенджеры без ?text= (экономия на гео-ярусе).
 */
export function orderCard({ service, intent, geo = '', title, sub, tiers, prefill = true }) {
  const opts = (tiers && tiers.length
    ? `<option value="">Любой / уточнить</option>` + tiers.map((t) => `<option>${escapeAttr(t)}</option>`).join('')
    : `<option value="">Уточним при ответе</option>`);
  const q = prefill ? `?text=${encodeURIComponent('Привет! Хочу оплатить ' + service.name)}` : '';
  const tg = `${CONTACTS.telegram}${q}`;
  const wa = `${CONTACTS.whatsapp}${q}`;
  return `<section class="pp-order" id="zakaz" data-service="${escapeAttr(service.name)}" data-intent="${escapeAttr(intent)}"${geo ? ` data-geo="${escapeAttr(geo)}"` : ''}>
<div class="kicker">Заявка</div>
<h2>${title}</h2>
<p class="sub">${sub}</p>
<form class="row" onsubmit="return ppSubmit(event)">
<div><label for="pp-tier">Тариф</label><select id="pp-tier" name="tier">${opts}</select></div>
<div><label for="pp-contact">Телефон, Telegram или email</label><input id="pp-contact" name="contact" type="text" inputmode="text" placeholder="+7 999… или @username" required autocomplete="off"></div>
<button class="pp-btn" type="submit">Оплатить</button>
</form>
<div class="alt">Или сразу напишите: <a href="${tg}" target="_blank" rel="noopener">Telegram</a> · <a href="${wa}" target="_blank" rel="noopener">WhatsApp</a></div>
<div class="err" hidden></div>
</section>`;
}

/** FAQ на <details> — аккордеон без JS. */
export function faqDetails(faq, { openFirst = true } = {}) {
  return (faq || [])
    .map(
      (q, i) =>
        `<details class="pp-faq"${openFirst && i === 0 ? ' open' : ''}><summary>${escapeHtml(q.q)}</summary><div class="a">${escapeHtml(q.a)}</div></details>`,
    )
    .join('');
}

/** Полный футер (4 колонки, как в макете). */
export function pageFooter({ base, compact = false }) {
  if (compact) {
    return `<footer class="pp-footer"><div class="inner">
<div class="pp-legal" style="border-top:0;margin-top:0;padding-top:0">
<span>${LEGAL_SHORT}</span>
<span><a href="${base}">Главная</a> · <a href="${base}catalog/">Каталог</a> · <a href="${base}seo/">Все сервисы</a> · <a href="${base}blog/">Статьи</a>${GEO_ON ? ` · <a href="${base}gorod/">Города</a>` : ''} · <a href="${base}faq/">FAQ</a> · <a href="${base}contacts/">Контакты</a></span>
</div>
<p class="pp-note">${DISCLAIMER}</p>
</div></footer>`;
  }
  return `<footer class="pp-footer" id="contacts"><div class="inner">
<div class="pp-fgrid">
<div>
<span class="pp-wm" style="font-size:19px">Plata<b>Pay</b></span>
<p class="desc">Оплата зарубежных сервисов из России — быстро, безопасно и без автосписаний.</p>
<div class="pp-fbtns"><a class="pp-fbtn" href="${CONTACTS.telegram}" target="_blank" rel="noopener">Написать в Telegram</a><a class="pp-fbtn o" href="${CONTACTS.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></div>
</div>
<div class="pp-fcol"><b>Навигация</b><a href="${base}">Главная</a><a href="${base}catalog/">Каталог</a><a href="${base}reviews/">Отзывы</a><a href="${base}faq/">Вопросы</a><a href="${base}contacts/">Контакты</a></div>
<div class="pp-fcol"><b>Сервисы</b><a href="${base}seo/">Все сервисы</a><a href="${base}blog/">Статьи и инструкции</a>${GEO_ON ? `<a href="${base}gorod/">Оплата по городам</a>` : ''}<a href="${base}booking/">Оплата брони Booking</a><a href="https://travel.payoplata.ru" target="_blank" rel="noopener">Авиабилеты</a><a href="${base}catalog/">Каталог подписок</a></div>
<div class="pp-fcol"><b>Важно</b><p class="txt">${DISCLAIMER}</p></div>
</div>
<div class="pp-legal"><span>${LEGAL}</span></div>
</div></footer>`;
}

/** Плавающая панель «Оплатить». */
export function stickyBar({ title, sub = 'Ответим за 5–15 минут · без данных вашей карты' }) {
  return `<div class="pp-sticky" id="pp-sticky"><div class="in">
<div class="tx"><b>${escapeHtml(title)}</b><span>${escapeHtml(sub)}</span></div>
<a class="pp-btn" href="#zakaz">Оплатить →</a>
</div></div>`;
}

/**
 * Обёртка страницы: <head> + шапка + контент + футер + общие ассеты.
 * CSS/JS подключаются файлами (см. APP_CSS / APP_JS), инлайна нет.
 */
export function wrapPage({
  base,
  canonical,
  title,
  description,
  verifyTags = '',
  ld = '',
  nav,
  cta,
  body,
  footerCompact = false,
  noscriptPixel = false,
  ogTags = true,
  extraHead = '',
  extraBodyEnd = '',
}) {
  // og:* нужны для шеринга; на массовом гео-ярусе их выключаем — там
  // каждые лишние 300 байт умножаются на сто тысяч страниц.
  const og = ogTags
    ? `<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="PlataPay">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(clampMeta(description))}">
<meta property="og:url" content="${canonical}">
`
    : '';
  // <base> здесь сознательно нет: все ссылки уже с префиксом base, а тег
  // <base> ломал бы якоря (#zakaz уводил бы на главную).
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(clampMeta(description))}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}css/pp-app.css">
${og}${verifyTags}${ld}${extraHead}
<script src="${base}js/pp-app.js" defer></script>
</head>
<body>
${noscriptPixel ? '<noscript><div><img src="https://mc.yandex.ru/watch/109522965" style="position:absolute;left:-9999px;" alt=""/></div></noscript>' : ''}
${pageHeader({ base, nav, cta })}
${body}
${pageFooter({ base, compact: footerCompact })}
${extraBodyEnd}
</body>
</html>`;
}

/** Компактный BreadcrumbList JSON-LD. */
export function breadcrumbLd(items) {
  const list = items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    ...(it.item ? { item: it.item } : {}),
  }));
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list,
  })}</script>`;
}
