// Страницы активации кодов (Redeem) в дизайне приложения PlataPay.
//
// Зачем свои страницы: витрины поставщиков переведены машинно («Клод
// Достоинство», «ВТОРОЕ ИЗДАНИЕ ЗАВЕРШЕНО») и выглядят чужими. Клиент,
// который только что заплатил PlataPay, не должен вставлять данные своего
// аккаунта на китайском домене с чужим брендом.
//
// Что собирается:
//   /redeem/          — универсальная: продукт определяется по коду
//   /redeem/chatgpt/  — ChatGPT: Session JSON или UID аккаунта
//   /redeem/claude/   — Claude: SessionKey или Organization ID
//   /redeem/grok/     — Grok: userId
//   /redeem/status/   — проверка статуса кода без активации
//   /redeem/restore/  — восстановление подписки, если она не зачислилась
//
// Разметка статическая, вся работа с API — в js/pp-redeem.js. Данные
// аккаунта уходят из браузера клиента прямо в API поставщика и на серверы
// PlataPay не попадают.
//
// API описан в документации «Gift 提交页 API» (redeemgpt), версия 2026-09-10.
// Базовый адрес меняется переменной REDEEM_API на сборке.

import fs from 'node:fs';
import path from 'node:path';
import {
  wrapPage,
  breadcrumbs,
  breadcrumbLd,
  escapeHtml,
  escapeAttr,
  faqDetails,
  CONTACTS,
  APP_CSS,
  APP_JS,
} from './app-shell.mjs';

// Прямой вызов API поставщика. Если у него закрыт CORS — клиент
// автоматически переключается на REDEEM_API_FALLBACK, это тот же API,
// проксированный со своего домена (см. server/vps/nginx-redeem-proxy.conf.example).
export const REDEEM_API = process.env.REDEEM_API || 'https://redeemgpt.com/api';
export const REDEEM_API_FALLBACK = process.env.REDEEM_API_FALLBACK || '/redeem-api';

// ------------------------------------------------------------ словарь кодов
//
// Документация возвращает китайский `msg` и стабильный машинный `code`.
// Показываем клиенту свой текст по `code`, `msg` не разбираем — так и
// требует дока. Второй элемент — что делать дальше.

export const CODE_TEXT = {
  // -- активация и статус кода
  'activation.ready': ['Код действителен', 'Можно активировать — заполните данные аккаунта.'],
  'activation.processing': ['Заказ в обработке', 'Поставщик уже выполняет заявку. Не отправляйте код повторно — статус обновится сам.'],
  'activation.completed': ['Подписка активирована', 'Перезайдите в аккаунт, чтобы увидеть новый тариф.'],
  'activation.cooldown': ['Код временно недоступен', 'После недавней попытки код блокируется на несколько минут. Подождите и повторите.'],
  'activation.verify_failed': ['Оплата прошла, зачисление не подтверждено', 'Перезайдите в аккаунт. Если подписки нет — воспользуйтесь восстановлением подписки.'],
  'stock.out_of_stock': ['Товар временно закончился', 'Поставщик пополняет запас. Попробуйте позже или напишите нам — подберём замену.'],
  'provider.temporary_error': ['Сервис поставщика временно недоступен', 'Повторите через несколько минут. Код не потрачен.'],
  'provider.uncredited': ['Нужна ручная проверка', 'Напишите нам и приложите код — разберёмся с поставщиком.'],

  // -- сам код
  'cdk.not_found': ['Код не найден', 'Проверьте, что скопировали его целиком, вместе с дефисами.'],
  'cdk.voided': ['Код аннулирован', 'Напишите нам — заменим.'],
  'cdk.abnormal': ['С кодом что-то не так', 'Напишите нам, приложите код — разберёмся.'],
  'cdk.after_sale_processed': ['По коду уже было обслуживание', 'Код закрыт сервисной операцией. Напишите нам.'],
  'cdk.exchanged': ['Код обменян на новый', 'Используйте новый код, который вам выдали взамен.'],

  // -- поля формы
  'input.invalid': ['Не хватает данных', 'Заполните код и попробуйте снова.'],
  'input.uid_required': ['Укажите ID аккаунта', 'Без ID поставщик не поймёт, кому зачислять подписку.'],
  'input.uid_invalid': ['ID аккаунта в неверном формате', 'Нужен UUID вида 96eae38f-b751-4079-b116-484bd746c477.'],
  'input.session_required': ['Нужны данные сессии', 'Скопируйте их по инструкции выше и вставьте целиком.'],

  // -- аккаунт
  'account.session_invalid': ['Данные сессии недействительны', 'Скорее всего, они устарели. Войдите в аккаунт заново и скопируйте свежие.'],
  'account.workspace_not_supported': ['Командный аккаунт не поддерживается', 'Нужен личный аккаунт, не workspace и не Team.'],
  'account.plan_not_allowed': ['На аккаунте уже есть платный тариф', 'Активация возможна на аккаунт без подписки. Можно попробовать принудительно — галочка под полем.'],
  'account.recent_activation_blocked': ['На аккаунте уже была активация', 'Поставщик не принимает два кода на один аккаунт в течение 10 минут. Подождите и повторите.'],
  'account.not_submittable': ['Аккаунт не принимает активацию', 'У него уже есть подписка либо он ограничен. Код не потрачен.'],
  'account.idv_required': ['Аккаунт требует подтверждения личности', 'Пройдите проверку ID на стороне сервиса и повторите.'],
  'account.billing_abnormal': ['На аккаунте проблема с оплатой', 'Сервис отметил биллинг как проблемный. Напишите нам.'],
  'account.bind_error': ['Ошибка привязки', 'Нужна ручная обработка — напишите нам, приложите код.'],
  'account.deactivated': ['Аккаунт, возможно, отключён', 'Проверьте, открывается ли он, и повторите.'],

  // -- товар
  'gift.not_found': ['Товар по коду не найден', 'Напишите нам — проверим код.'],
  'gift.inactive': ['Товар отключён', 'Напишите нам — заменим код.'],
  'gift.unsupported_app': ['Тип товара пока не поддерживается', 'Активируем вручную — напишите нам.'],
  'server.internal_error': ['Ошибка на стороне поставщика', 'Повторите позже. Если не пройдёт — напишите нам.'],

  // -- восстановление подписки Claude
  'rebind.success': ['Подписка привязана заново', 'Перезайдите в Claude, чтобы увидеть тариф.'],
  'rebind.processing': ['Восстановление выполняется', 'Подождите и нажмите «Проверить» ещё раз — мы продолжим ту же операцию.'],
  'rebind.cooldown': ['Слишком частые попытки', 'Подождите указанное время и повторите.'],
  'rebind.uid_mismatch': ['Аккаунт не совпадает', 'Код был активирован на другой аккаунт. Нужен SessionKey того аккаунта, на который шла активация.'],
  'rebind.order_not_found': ['Активация по коду не найдена', 'Восстановление работает только для уже активированного кода.'],
  'rebind.not_claude': ['Это не код Claude', 'Восстановление через SessionKey доступно только для Claude.'],
  'rebind.no_receipt': ['Самостоятельное восстановление недоступно', 'Напишите нам — восстановим через поставщика.'],
  'rebind.session_expired': ['SessionKey устарел', 'Получите свежий ключ и повторите.'],
  'rebind.idv_required': ['Аккаунт требует подтверждения личности', 'Пройдите проверку ID и повторите.'],
  'rebind.billing_abnormal': ['На аккаунте проблема с оплатой', 'Привязка временно недоступна. Напишите нам.'],
  'rebind.receipt_invalid': ['Платёжный документ недействителен', 'Нужна ручная обработка — напишите нам.'],
  'rebind.account_error': ['Проблема с аккаунтом заказа', 'Нужна ручная обработка — напишите нам.'],
  'rebind.no_entitlement': ['Привязка прошла, тариф не появился', 'Напишите нам — доведём до конца через поставщика.'],
  'rebind.transaction_lose_oid': ['В заказе нет данных аккаунта', 'Самостоятельно не восстановить — напишите нам.'],
  'rebind.account_disabled': ['Аккаунт ограничен или отключён', 'Восстановление невозможно. Напишите нам.'],
  'rebind.failed': ['Восстановить не удалось', 'Повторите позже или напишите нам.'],
  'rebind.remedy_result': ['Операция завершена', 'Смотрите итог ниже.'],
};

// Статус кода из /api/check → человеческий текст.
export const USE_STATUS_TEXT = {
  '0': 'Ожидает активации',
  '-1': 'В обработке',
  '1': 'Активирован',
  '-9': 'Нет в наличии',
  '-999': 'Ошибка',
  '-1000': 'Аннулирован',
  '-1001': 'Сервисное обслуживание',
  '-1002': 'Обменян на новый код',
};

// Уровни из /api/service_status.
export const LEVEL_TEXT = {
  normal: ['ok', 'Сервис работает штатно'],
  unstable: ['warn', 'Возможны задержки: у поставщика были неудачные попытки'],
  abnormal: ['bad', 'Сейчас много сбоев — лучше активировать позже'],
  unknown: ['dim', 'Статус сервиса неизвестен'],
};

// --------------------------------------------------------------- продукты
//
// `app` — значение, которое /api/check возвращает в data.app. По нему
// страница понимает, какой код ей дали, и какое поле отправлять в
// /api/activate. `claude_s` — исторический тип, принимает только SessionKey,
// но обслуживается той же страницей Claude.

export const REDEEM_PAGES = [
  {
    slug: 'chatgpt',
    apps: ['gpt'],
    name: 'ChatGPT',
    tile: 'CH',
    grad: 'linear-gradient(150deg,#10a37f 0%,#0b6b53 100%)',
    h1: 'Активация кода ChatGPT',
    sub: 'Введите код и данные аккаунта — подписка привяжется к вашему ChatGPT. Ничего платить повторно не нужно.',
    plans: 'Go · Plus · Pro 5x · Pro 20x',
    desc: 'Активация кода ChatGPT на ваш аккаунт: вставьте код и данные сессии — подписка Plus, Go или Pro привяжется автоматически. Инструкция и проверка статуса.',
    howto: [
      ['Войдите в ChatGPT', 'Откройте <a href="https://chatgpt.com" target="_blank" rel="noopener nofollow">chatgpt.com</a> и войдите в тот аккаунт, на который нужна подписка.'],
      ['Откройте страницу сессии', 'В этом же браузере перейдите на <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener nofollow">chatgpt.com/api/auth/session</a> — откроется текст в фигурных скобках.'],
      ['Скопируйте текст целиком', 'От первой <b>{</b> до последней <b>}</b>. Обрезанный кусок не подойдёт — поставщик не сможет его разобрать.'],
      ['Вставьте в поле ниже', 'И нажмите «Активировать». Обычно занимает от нескольких секунд до полутора минут.'],
    ],
    req: 'Нужен личный аккаунт — командные и рабочие (workspace, Team) поставщик не принимает. Если на аккаунте уже есть платный тариф, отметьте галочку «активировать принудительно».',
    faq: [
      { q: 'Чем отличается активация по сессии от активации по UID?', a: 'По сессии поставщик заранее проверяет аккаунт: личный ли он, нет ли уже подписки. Если что-то не так, код не тратится. По UID проверить аккаунт заранее нельзя — если он не подойдёт, код может сгореть.' },
      { q: 'Где взять UID аккаунта ChatGPT?', a: 'Это идентификатор вида 96eae38f-b751-4079-b116-484bd746c477 из данных аккаунта. Если вы не уверены, что нашли именно его, активируйте по сессии — так безопаснее.' },
      { q: 'Подписка не появилась после активации', a: 'Сначала полностью выйдите из аккаунта и войдите заново — тариф часто подтягивается только после повторного входа. Если не помогло, откройте раздел «Восстановление подписки» и проверьте текущий тариф аккаунта.' },
    ],
  },
  {
    slug: 'claude',
    apps: ['claude', 'claude_s'],
    name: 'Claude',
    tile: 'CL',
    grad: 'linear-gradient(150deg,#d97757 0%,#a3502f 100%)',
    h1: 'Активация кода Claude',
    sub: 'Введите код и ключ сессии — подписка Pro или Max привяжется к вашему аккаунту Claude.',
    plans: 'Pro · Max 5x · Max 20x',
    desc: 'Активация кода Claude на ваш аккаунт: подписка Pro, Max 5x или Max 20x привязывается по ключу сессии или Organization ID. Инструкция, проверка статуса и восстановление.',
    howto: [
      ['Войдите в Claude', 'Откройте <a href="https://claude.ai" target="_blank" rel="noopener nofollow">claude.ai</a> и войдите в нужный аккаунт.'],
      ['Откройте инструменты разработчика', 'Клавиша F12 (или Cmd+Option+I на Mac) → вкладка Application → Cookies → claude.ai.'],
      ['Скопируйте cookie sessionKey', 'Значение начинается с <b>sk-ant-sid</b>. Копируйте его полностью.'],
      ['Вставьте в поле ниже', 'И нажмите «Активировать».'],
    ],
    req: 'Ключ сессии — предпочтительный способ: поставщик проверит аккаунт до списания кода и не потратит код, если аккаунт заблокирован или на нём уже есть подписка. Второй способ — Organization ID из настроек аккаунта, но он такой проверки не даёт.',
    faq: [
      { q: 'Безопасно ли давать ключ сессии?', a: 'Ключ отправляется из вашего браузера напрямую в API поставщика — на серверы PlataPay он не попадает и нигде у нас не сохраняется. После активации ключ можно обнулить, выйдя из всех сессий в настройках Claude.' },
      { q: 'Что такое Organization ID и где он?', a: 'Это идентификатор вашего аккаунта Claude в формате UUID, он указан в настройках аккаунта в разделе Account. Важно: при активации по нему поставщик не может заранее проверить аккаунт — если аккаунт ограничен, код спишется, а подписка не придёт.' },
      { q: 'Код активирован, а подписки нет', a: 'Откройте «Восстановление подписки», введите тот же код и ключ сессии — поставщик повторно привяжет тариф к аккаунту. Это штатная операция, код повторно не тратится.' },
    ],
  },
  {
    slug: 'grok',
    apps: ['grok'],
    name: 'Grok',
    tile: 'GR',
    grad: 'linear-gradient(150deg,#4b5563 0%,#111827 100%)',
    h1: 'Активация кода Grok',
    sub: 'Введите код и идентификатор аккаунта — подписка SuperGrok привяжется к вашему профилю.',
    plans: 'SuperGrok',
    desc: 'Активация кода Grok на ваш аккаунт: подписка SuperGrok привязывается по идентификатору пользователя. Пошаговая инструкция и проверка статуса кода.',
    howto: [
      ['Войдите в Grok', 'Откройте <a href="https://grok.com" target="_blank" rel="noopener nofollow">grok.com</a> и войдите в нужный аккаунт.'],
      ['Откройте страницу сессии', 'Перейдите на <a href="https://grok.com/api/auth/session" target="_blank" rel="noopener nofollow">grok.com/api/auth/session</a>.'],
      ['Найдите userId', 'В тексте будет поле <b>session.userId</b> — идентификатор вида b8065aa5-03a3-4a78-9b88-88159f2d55b3.'],
      ['Вставьте в поле ниже', 'Можно вставить только идентификатор или весь текст целиком — мы возьмём из него нужное.'],
    ],
    req: 'Grok активируется только по идентификатору аккаунта — ключа сессии у него нет. Проверьте идентификатор перед отправкой: поставщик не может заранее убедиться, что аккаунт подходит.',
    faq: [
      { q: 'Можно вставить весь текст со страницы сессии?', a: 'Да. Если вставить JSON целиком, поставщик сам возьмёт из него session.userId. Отдельно выделять идентификатор не обязательно.' },
      { q: 'Ошибка «ID аккаунта в неверном формате»', a: 'Значит, в поле не нашлось идентификатора вида b8065aa5-03a3-4a78-9b88-88159f2d55b3. Проверьте, что вы скопировали данные именно со страницы grok.com/api/auth/session и ничего не обрезали.' },
      { q: 'Подписка не появилась', a: 'Полностью выйдите из аккаунта и войдите заново. Если тарифа по-прежнему нет — напишите нам и приложите код, разберёмся с поставщиком.' },
    ],
  },
];

// Вопросы, общие для всех страниц активации.
export const COMMON_FAQ = [
  { q: 'Данные моего аккаунта попадают к PlataPay?', a: 'Нет. Форма отправляет их из вашего браузера напрямую в API сервиса активации. Мы их не получаем, не логируем и не храним — страница нужна только для того, чтобы вы делали это на понятном русском и на знакомом домене.' },
  { q: 'Можно активировать два кода на один аккаунт подряд?', a: 'Не раньше чем через 10 минут. Сервис активации блокирует повторную активацию на тот же аккаунт в течение 10 минут после успешной — это защита от случайных дублей. Подождите и активируйте второй код.' },
  { q: 'Код спишется, если что-то пойдёт не так?', a: 'При активации по ключу сессии аккаунт проверяется до списания: если он не подходит, код остаётся нетронутым. При активации по идентификатору аккаунта такой проверки нет, поэтому мы рекомендуем первый способ везде, где он доступен.' },
  { q: 'Что делать, если статус «в обработке»?', a: 'Ничего. Заявка уже у поставщика, страница сама опросит статус. Повторно отправлять тот же код не нужно — это только создаст путаницу.' },
];

// ------------------------------------------------------------------- CSS
//
// Отдельный файл css/pp-redeem.css поверх общего pp-app.css: токены
// (--panel, --brand, --gold…) объявлены там на :root и здесь переиспользуются.

export const REDEEM_CSS = `.rd-wrap{max-width:860px;margin:0 auto;padding:0 24px 72px}
.rd-hero{position:relative;overflow:hidden;border-radius:26px;border:1px solid var(--line);
  background:linear-gradient(180deg,#1a2e4e 0%,#142543 100%);padding:26px 28px;margin:16px 0 0;
  display:flex;gap:20px;align-items:center}
.rd-hero .veil{position:absolute;inset:0;opacity:.16;pointer-events:none}
.rd-hero .tile{position:relative;flex:none;width:64px;height:64px;border-radius:20px;display:grid;
  place-items:center;border:1px solid var(--line-soft);background:#101e33;color:var(--brand-ice);
  font-size:20px;font-weight:700}
.rd-hero .body{position:relative;min-width:0}
.rd-hero h1{margin:0 0 6px}
.rd-hero .sub{color:var(--muted);font-size:14.5px;margin:0}
.rd-hero .plans{display:inline-block;margin-top:12px;padding:5px 12px;border-radius:999px;
  border:1px solid var(--line-soft);background:#101e33;color:var(--text3);font-size:12.5px;font-weight:600}

/* Шаги 1-2-3 */
.rd-steps{display:flex;align-items:center;gap:10px;margin:22px 0 0;padding:16px 18px;border-radius:18px;
  border:1px solid var(--line-dim);background:var(--panel2)}
.rd-steps .st{display:flex;align-items:center;gap:9px;min-width:0;color:var(--dim);font-size:13.5px;font-weight:600}
.rd-steps .st .n{flex:none;width:26px;height:26px;border-radius:999px;display:grid;place-items:center;
  border:1px solid var(--line);background:var(--deep);color:var(--dim);font-size:12.5px;font-weight:700}
.rd-steps .st.on{color:var(--ice)}
.rd-steps .st.on .n{background:linear-gradient(140deg,#2e7bff,#1b4fd8);border-color:transparent;color:#fff}
.rd-steps .st.done .n{background:var(--mint);border-color:transparent;color:#04281c}
.rd-steps .st.done{color:var(--text3)}
.rd-steps .bar{flex:1;height:1px;background:var(--line);min-width:12px}
@media(max-width:640px){.rd-steps .st span.tx{display:none}.rd-steps{gap:6px}}

/* Карточка шага */
/* Шапка sticky и высотой 64px — без отступа прокрутки scrollIntoView
   прячет под неё заголовок карточки. */
.rd-card,.rd-res,.rd-steps{scroll-margin-top:84px}
.rd-card{border:1px solid var(--line-strong);background:var(--panel);border-radius:26px;padding:24px;margin:18px 0 0}
.rd-card[hidden]{display:none}
.rd-card .kicker{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.rd-card h2{margin:6px 0 4px}
.rd-card .lead2{color:var(--muted);font-size:13.5px;margin:0 0 16px}

.rd-f{margin:0 0 14px}
.rd-lab{display:block;font-size:12px;color:var(--muted);margin:0 0 6px}
.rd-in,.rd-ta{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:14px;
  color:var(--ice);font-size:15px;padding:0 14px;font-family:inherit}
.rd-in{height:48px}
.rd-ta{min-height:132px;padding:12px 14px;line-height:1.5;resize:vertical;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}
.rd-in:focus,.rd-ta:focus{outline:none;border-color:var(--brand)}
.rd-in::placeholder,.rd-ta::placeholder{color:var(--faint)}
.rd-in.bad,.rd-ta.bad{border-color:var(--sale)}
.rd-hint{font-size:12.5px;color:var(--dim);margin:7px 0 0}
.rd-hint a{color:var(--brand-hover)}
.rd-warn{font-size:12.5px;color:var(--gold);margin:8px 0 0;padding:10px 12px;border-radius:12px;
  border:1px solid rgba(255,197,61,.28);background:rgba(255,197,61,.07)}
.rd-check{display:flex;gap:9px;align-items:flex-start;margin:12px 0 0;font-size:13px;color:var(--text3);cursor:pointer}
.rd-check input{flex:none;margin:2px 0 0;width:17px;height:17px;accent-color:var(--brand)}

/* Переключатель канала (сессия / идентификатор) */
.rd-tabs{display:flex;gap:8px;margin:0 0 16px;flex-wrap:wrap}
.rd-tab{flex:1 1 180px;min-height:52px;padding:9px 14px;border-radius:15px;border:1px solid var(--line);
  background:var(--panel2);color:var(--text3);font-size:14px;font-weight:600;font-family:inherit;
  cursor:pointer;text-align:left;transition:border-color .2s,color .2s}
.rd-tab:hover{border-color:var(--line-hover);color:var(--ice)}
.rd-tab.on{border-color:var(--brand);color:#fff;background:rgba(46,123,255,.12)}
.rd-tab .rec{display:block;font-size:11px;font-weight:600;color:var(--mint);margin-top:2px}
.rd-tab.on .rec{color:var(--mint)}
.rd-tab .alt{display:block;font-size:11px;font-weight:500;color:var(--dim);margin-top:2px}
.rd-pane[hidden]{display:none}

/* Баннер состояния сервиса */
.rd-banner{display:flex;gap:10px;align-items:flex-start;margin:0 0 16px;padding:12px 14px;border-radius:14px;
  font-size:13px;border:1px solid var(--line);background:var(--panel2);color:var(--text3)}
.rd-banner .dot{flex:none;width:9px;height:9px;border-radius:999px;margin-top:5px;background:var(--dim)}
.rd-banner.ok{border-color:rgba(47,207,154,.3);background:rgba(47,207,154,.07)}
.rd-banner.ok .dot{background:var(--mint)}
.rd-banner.warn{border-color:rgba(255,197,61,.3);background:rgba(255,197,61,.07)}
.rd-banner.warn .dot{background:var(--gold)}
.rd-banner.bad{border-color:rgba(255,92,122,.32);background:rgba(255,92,122,.08)}
.rd-banner.bad .dot{background:var(--sale)}
.rd-banner[hidden]{display:none}

/* Результат */
.rd-res{margin:18px 0 0;padding:20px;border-radius:20px;border:1px solid var(--line);background:var(--panel2)}
.rd-res[hidden]{display:none}
.rd-res .ring{width:54px;height:54px;border-radius:999px;display:grid;place-items:center;font-size:24px;
  border:1px solid var(--line-soft);background:var(--deep)}
.rd-res h3{font-size:19px;font-weight:700;letter-spacing:-.4px;margin:14px 0 6px}
.rd-res p{color:var(--text3);font-size:14px;margin:0}
.rd-res.ok{border-color:rgba(47,207,154,.35)}
.rd-res.ok .ring{background:rgba(47,207,154,.14);border-color:rgba(47,207,154,.4)}
.rd-res.wait{border-color:rgba(255,197,61,.32)}
.rd-res.wait .ring{background:rgba(255,197,61,.12);border-color:rgba(255,197,61,.36)}
.rd-res.err{border-color:rgba(255,92,122,.34)}
.rd-res.err .ring{background:rgba(255,92,122,.12);border-color:rgba(255,92,122,.38)}
.rd-kv{margin:16px 0 0;border-top:1px solid var(--line-dim);padding-top:14px;display:grid;gap:8px}
.rd-kv div{display:flex;gap:12px;justify-content:space-between;font-size:13.5px;flex-wrap:wrap}
.rd-kv span{color:var(--dim)}
.rd-kv b{color:var(--ice2);font-weight:600;word-break:break-word;text-align:right}
.rd-reqid{margin:14px 0 0;font-size:11.5px;color:var(--faint);font-family:ui-monospace,Menlo,Consolas,monospace}

.rd-actions{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 0}
.rd-spin{display:inline-block;width:15px;height:15px;border-radius:999px;border:2px solid rgba(255,255,255,.35);
  border-top-color:#fff;animation:rd-rot .7s linear infinite;vertical-align:-2px;margin-right:8px}
@keyframes rd-rot{to{transform:rotate(360deg)}}
.pp-btn[disabled]{opacity:.6;cursor:default;filter:none}

/* Инструкция */
.rd-howto{counter-reset:rd;margin:18px 0 0;display:grid;gap:12px}
.rd-howto li{list-style:none;position:relative;padding-left:44px;color:var(--text2);font-size:14px}
.rd-howto li::before{counter-increment:rd;content:counter(rd);position:absolute;left:0;top:-1px;width:29px;
  height:29px;border-radius:999px;display:grid;place-items:center;border:1px solid var(--line-soft);
  background:var(--deep);color:var(--brand-ice);font-size:13px;font-weight:700}
.rd-howto b.t{display:block;color:var(--ice);font-weight:600;margin-bottom:2px}
.rd-howto ol{padding:0;margin:0}

/* Карточки продуктов на хабе */
.rd-prods{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0 0}
@media(max-width:720px){.rd-prods{grid-template-columns:1fr}}
.rd-prod{position:relative;overflow:hidden;display:block;border:1px solid var(--line);border-radius:20px;
  background:var(--panel);padding:18px;transition:border-color .2s,transform .2s}
.rd-prod:hover{border-color:var(--brand);transform:translateY(-2px)}
.rd-prod .veil{position:absolute;inset:0;opacity:.13;pointer-events:none}
.rd-prod .tile{position:relative;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;
  border:1px solid var(--line-soft);background:#101e33;color:var(--brand-ice);font-size:15px;font-weight:700}
.rd-prod b{position:relative;display:block;margin:12px 0 3px;color:var(--ice);font-size:16px;font-weight:600}
.rd-prod span{position:relative;display:block;color:var(--dim);font-size:12.5px}

/* Сноска о безопасности */
.rd-safe{margin:20px 0 0;padding:14px 16px;border-radius:16px;border:1px dashed var(--line-strong);
  background:rgba(46,123,255,.05);color:var(--text3);font-size:13px}
.rd-safe b{color:var(--ice)}
.rd-sec{margin:34px 0 0}
.rd-sec h2{margin:0 0 4px}
.rd-sec .note{color:var(--dim);font-size:13.5px;margin:0 0 14px}
.rd-help{margin:26px 0 0;padding:18px 20px;border-radius:20px;border:1px solid var(--line-dim);
  background:var(--panel2);font-size:14px;color:var(--text3)}
.rd-help a{color:var(--brand-hover)}
`;

// -------------------------------------------------------------------- JS
//
// Один файл js/pp-redeem.js на все страницы активации. Роль страницы —
// в data-rd на <body>: redeem (активация), status (проверка), restore
// (восстановление подписки). Словари подставляются на сборке, чтобы текст
// ошибок жил в одном месте — в CODE_TEXT выше.
//
// Внутри браузерного кода сознательно нет шаблонных строк и стрелочных
// функций: файл отдаётся как есть, без транспиляции, и должен открываться
// на старых WebView.

export const REDEEM_JS = `(function(){
var CT=${JSON.stringify(CODE_TEXT)};
var UST=${JSON.stringify(USE_STATUS_TEXT)};
var LVL=${JSON.stringify(LEVEL_TEXT)};

var body=document.body,KIND=body.getAttribute('data-rd');
if(!KIND)return;
var PAGE_APPS=(body.getAttribute('data-apps')||'').split(',').filter(Boolean);
var TG=body.getAttribute('data-tg')||'';

var API=window.PP_REDEEM_API||'',FB=window.PP_REDEEM_API_FALLBACK||'',switched=false;
var qs=new URLSearchParams(location.search),DEMO=qs.get('demo')||'';
var UUID=/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function $(s,r){return (r||document).querySelector(s);}
function el(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function show(n,v){if(n)n.hidden=!v;}

// ------------------------------------------------------------------ сеть
function request(path,init){
  return fetch(API+path,init).then(function(r){
    var rid='';try{rid=r.headers.get('X-Request-ID')||'';}catch(e){}
    return r.text().then(function(t){
      var j=null;try{j=JSON.parse(t);}catch(e){}
      return {http:r.status,body:j,raw:t,rid:rid};
    });
  });
}
function call(path,init){
  if(DEMO)return demo(path,init);
  return request(path,init)['catch'](function(e){
    // Сетевая ошибка на прямом вызове — почти всегда закрытый CORS.
    // Пробуем тот же API, проксированный с нашего домена.
    if(!switched&&FB&&FB!==API){switched=true;API=FB;return request(path,init);}
    throw e;
  });
}
function httpHint(s){
  if(s===429)return 'Слишком много запросов подряд. Подождите минуту и повторите.';
  if(s===400||s===405||s===415)return 'Сервис отклонил запрос. Проверьте код и повторите.';
  if(s>=500)return 'Сервис активации временно недоступен. Повторите через несколько минут.';
  return 'Не удалось связаться с сервисом активации. Проверьте интернет и повторите.';
}
// Приводим любой ответ к одному виду: код, заголовок, что делать.
function norm(r){
  var b=r.body;
  if(!b||typeof b!=='object'){
    return {ok:false,code:'',title:'Сервис не ответил',detail:httpHint(r.http),data:null,rid:r.rid,http:r.http};
  }
  var d=(b.data&&typeof b.data==='object')?b.data:null;
  var code=b.code||(d&&d.status_code)||'';
  var t=CT[code];
  return {
    ok:b.success===true,code:code,data:d,msg:b.msg||'',rid:r.rid,http:r.http,
    title:t?t[0]:(b.success?'Готово':'Не удалось активировать'),
    detail:t?t[1]:(b.msg||'Сервис вернул неизвестный ответ. Напишите нам — разберёмся.')
  };
}
function fail(e){
  return {ok:false,code:'',title:'Нет связи с сервисом',detail:httpHint(0),data:null,rid:'',http:0};
}

// --------------------------------------------------------------- демо-режим
// ?demo=1 — прогон интерфейса без обращения к поставщику. Ветка выбирается
// суффиксом кода: -WAIT, -ERR, -COOL, иначе успех.
var demoPoll=0;
function demo(path,init){
  var code=(S.code||'').toUpperCase(),app=PAGE_APPS[0]||'gpt';
  if(/CLAUDE/.test(code))app='claude';else if(/GROK/.test(code))app='grok';
  var wait=/-WAIT$/.test(code),err=/-ERR$/.test(code),cool=/-COOL$/.test(code);
  function w(o){return new Promise(function(res){setTimeout(function(){res({http:200,body:o,raw:'',rid:'demo000000000000'});},420);});}
  if(path.indexOf('/service_status')===0)return w({success:true,data:{product:'gptplus',level:'unstable'}});
  if(path.indexOf('/check')===0){
    if(wait&&demoPoll>0){demoPoll--;return w({success:true,code:'activation.processing',data:{cdkey:S.code,app:app,use_status:-1,status_code:'activation.processing'}});}
    if(wait&&demoPoll===0&&S.sent)return w({success:true,code:'activation.completed',data:{cdkey:S.code,app:app,use_status:1,account:'demo@example.com',completed_at:'2026-09-20T12:00:00+03:00',status_code:'activation.completed'}});
    if(cool)return w({success:true,code:'activation.cooldown',data:{cdkey:S.code,app:app,use_status:0,service_product:'claudepro',in_cooldown:true,cooldown_remaining:45,status_code:'activation.cooldown'}});
    return w({success:true,code:'activation.ready',data:{cdkey:S.code,gift_name:'DEMO '+app.toUpperCase(),service_product:'gptplus',app:app,use_status:0,status_code:'activation.ready',in_cooldown:false,cooldown_remaining:0}});
  }
  if(path.indexOf('/activate')===0){
    if(err)return w({success:false,code:'account.session_invalid',msg:'demo',data:''});
    if(wait){demoPoll=2;return w({success:false,code:'activation.processing',data:{cdkey:S.code,use_status:-1,app:app,status_code:'activation.processing'}});}
    return w({success:true,code:'activation.completed',data:{cdkey:S.code,gift_name:'DEMO '+app.toUpperCase(),use_status:1,account:'demo@example.com',completed_at:'2026-09-20T12:00:00+03:00',app:app,status_code:'activation.completed'}});
  }
  if(path.indexOf('/claude_refresh')===0)return w({success:true,code:'rebind.success',data:{cdkey:S.code,uid:'96eae38f-b751-4079-b116-484bd746c477',status_code:'rebind.success'}});
  if(path.indexOf('/refresh-subscription')===0)return w({success:true,msg:'ok',data:{verify_result:[true,['plus','2026-10-20T12:00:00Z','demo-account']],user_id:'demo-account'}});
  return w({success:false,msg:'demo'});
}

// ------------------------------------------------------------- состояние
var S={code:'',app:'',data:null,sent:false,ch:'session'};
var elCode,elErr1,btn1,card1,card2,card3,fields,banner,res,btn2,btn1t,btn2t;

function steps(n){
  var list=document.querySelectorAll('.rd-steps .st');
  for(var i=0;i<list.length;i++){
    var s=+list[i].getAttribute('data-s');
    list[i].className='st'+(s===n?' on':(s<n?' done':''));
  }
}
function lock(b,on,label){
  if(!b)return;
  b.disabled=!!on;
  b.innerHTML=on?'<span class="rd-spin"></span>'+(label||'Проверяем…'):b.getAttribute('data-label');
}
function err1(t){
  if(!elErr1)return;
  elErr1.innerHTML=t?esc(t):'';
  show(elErr1,!!t);
  if(elCode)elCode.className='rd-in'+(t?' bad':'');
}

// ---------------------------------------------------------------- поля
// Разметка шага 2 строится здесь, а не в HTML: хаб и страницы продуктов
// работают одинаково, дублировать формы в четырёх шаблонах незачем.
function fieldsHtml(app){
  var sess={
    gpt:['Данные сессии ChatGPT','<textarea id="rd-session" class="rd-ta" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder="Вставьте сюда весь текст со страницы chatgpt.com/api/auth/session — от { до }"></textarea>',
      'Откройте <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener nofollow">chatgpt.com/api/auth/session</a> в браузере, где вы вошли в нужный аккаунт, и скопируйте текст целиком.'],
    claude:['Ключ сессии Claude','<input id="rd-session" class="rd-in" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="sk-ant-sid...">',
      'Инструменты разработчика (F12) → Application → Cookies → claude.ai → значение cookie <b>sessionKey</b>.']
  };
  var uid={
    gpt:['UID аккаунта ChatGPT','<input id="rd-uid" class="rd-in" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="96eae38f-b751-4079-b116-484bd746c477">',
      'Идентификатор аккаунта в формате UUID.'],
    claude:['Organization ID','<input id="rd-uid" class="rd-in" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="96eae38f-b751-4079-b116-484bd746c477">',
      'Настройки аккаунта Claude → раздел Account → поле Organization ID.'],
    grok:['Идентификатор аккаунта Grok','<textarea id="rd-uid" class="rd-ta" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder="b8065aa5-03a3-4a78-9b88-88159f2d55b3 или весь текст со страницы сессии"></textarea>',
      'Значение <b>session.userId</b> со страницы <a href="https://grok.com/api/auth/session" target="_blank" rel="noopener nofollow">grok.com/api/auth/session</a>. Можно вставить и весь текст целиком.']
  };
  var risk='<div class="rd-warn">Этим способом сервис не может заранее проверить аккаунт. Если идентификатор указан с ошибкой или аккаунт ограничен, код спишется, а подписка не придёт. Проверьте значение перед отправкой.</div>';
  function pane(id,cfg,extra,hid){
    return '<div class="rd-pane" data-ch="'+id+'"'+(hid?' hidden':'')+'>'+
      '<div class="rd-f"><label class="rd-lab" for="'+(id==='session'?'rd-session':'rd-uid')+'">'+cfg[0]+'</label>'+cfg[1]+
      '<p class="rd-hint">'+cfg[2]+'</p></div>'+(extra||'')+'</div>';
  }
  var force='<label class="rd-check"><input type="checkbox" id="rd-force"><span>На аккаунте уже есть платный тариф — попробовать активировать принудительно</span></label>';

  if(app==='grok')return pane('uid',uid.grok,risk);
  if(app==='claude_s')return pane('session',sess.claude);
  var k=(app==='claude')?'claude':'gpt';
  var tabs='<div class="rd-tabs">'+
    '<button type="button" class="rd-tab on" data-ch="session">'+(k==='claude'?'По ключу сессии':'По данным сессии')+'<span class="rec">рекомендуем — код не спишется зря</span></button>'+
    '<button type="button" class="rd-tab" data-ch="uid">'+(k==='claude'?'По Organization ID':'По UID аккаунта')+'<span class="alt">если нет доступа к сессии</span></button>'+
    '</div>';
  return tabs+pane('session',sess[k],k==='gpt'?force:'')+pane('uid',uid[k],risk,true);
}

function bindTabs(){
  var tabs=fields.querySelectorAll('.rd-tab');
  for(var i=0;i<tabs.length;i++){
    tabs[i].addEventListener('click',function(){
      var ch=this.getAttribute('data-ch');S.ch=ch;
      var t=fields.querySelectorAll('.rd-tab');
      for(var j=0;j<t.length;j++)t[j].className='rd-tab'+(t[j].getAttribute('data-ch')===ch?' on':'');
      var p=fields.querySelectorAll('.rd-pane');
      for(var j2=0;j2<p.length;j2++)show(p[j2],p[j2].getAttribute('data-ch')===ch);
    });
  }
}

// -------------------------------------------------------------- результат
function kv(rows){
  var out='';
  for(var i=0;i<rows.length;i++)if(rows[i][1])out+='<div><span>'+esc(rows[i][0])+'</span><b>'+esc(rows[i][1])+'</b></div>';
  return out?'<div class="rd-kv">'+out+'</div>':'';
}
function dateRu(s){
  if(!s)return '';
  var d=new Date(s);
  if(isNaN(d.getTime()))return s;
  return d.toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function result(kind,n,rows,extra){
  if(!res)return;
  var ic=kind==='ok'?'✓':(kind==='wait'?'⏳':'!');
  res.className='rd-res '+kind;
  res.innerHTML='<div class="ring">'+ic+'</div><h3>'+esc(n.title)+'</h3><p>'+esc(n.detail)+'</p>'+
    kv(rows||[])+(extra||'')+
    (n.rid?'<div class="rd-reqid">Код обращения: '+esc(n.rid)+'</div>':'')+
    '<div class="rd-actions">'+
      (kind==='err'?'<button type="button" class="pp-btn-ghost" id="rd-again">Попробовать снова</button>':'')+
      (TG?'<a class="'+(kind==='err'?'pp-btn':'pp-btn-ghost')+'" href="'+TG+'" target="_blank" rel="noopener">Написать в поддержку</a>':'')+
    '</div>';
  show(res,true);
  var again=$('#rd-again',res);
  if(again)again.addEventListener('click',function(){show(res,false);show(card2,true);steps(2);});
  res.scrollIntoView({behavior:'smooth',block:'center'});
}
function rowsOf(d){
  if(!d)return [];
  return [['Товар',d.gift_name],['Аккаунт',d.account],['Статус',UST[String(d.use_status)]||''],['Завершено',dateRu(d.completed_at)]];
}

// ------------------------------------------------------------ шаг 1: код
var SLUG={gpt:'chatgpt',claude:'claude',claude_s:'claude',grok:'grok'};
var LABEL={gpt:'ChatGPT',claude:'Claude',claude_s:'Claude',grok:'Grok'};
var SELF=body.getAttribute('data-self')||'/';
var cdTimer=0;

function cooldown(sec,d){
  var left=Math.max(0,+sec||0);
  var n={title:CT['activation.cooldown'][0],detail:CT['activation.cooldown'][1],rid:''};
  function tick(){
    var m=Math.floor(left/60),s=left%60;
    result('wait',n,rowsOf(d),'<p style="margin-top:12px;color:var(--gold);font-size:14px">Повторить можно через '+m+':'+(s<10?'0':'')+s+'</p>');
    if(left<=0){clearInterval(cdTimer);show(res,false);show(card1,true);steps(1);return;}
    left--;
  }
  clearInterval(cdTimer);tick();cdTimer=setInterval(tick,1000);
}

function serviceBanner(product){
  if(!product||!banner)return;
  call('/service_status?product='+encodeURIComponent(product)).then(function(r){
    var b=r.body;if(!b||!b.data||!b.data.level)return;
    var L=LVL[b.data.level]||LVL.unknown;
    if(b.data.level==='normal')return; // «всё хорошо» не показываем — лишний шум
    banner.className='rd-banner '+L[0];
    banner.innerHTML='<span class="dot"></span><span>'+esc(L[1])+'</span>';
    show(banner,true);
  })['catch'](function(){});
}

function toStep2(d){
  S.app=d.app||'';S.data=d;S.ch='session';
  if(PAGE_APPS.length&&PAGE_APPS.indexOf(S.app)<0){
    var slug=SLUG[S.app];
    err1('Это код '+(LABEL[S.app]||'другого сервиса')+'. '+(slug?'Откройте страницу активации '+LABEL[S.app]+' — ссылка ниже.':'Напишите нам, активируем вручную.'));
    if(slug){
      var a=el('div','rd-actions','<a class="pp-btn" href="'+SELF+slug+'/?code='+encodeURIComponent(S.code)+'">Перейти к активации '+esc(LABEL[S.app])+'</a>');
      elErr1.appendChild(a);
    }
    return;
  }
  if(d.in_cooldown&&d.cooldown_remaining>0){show(card1,false);cooldown(d.cooldown_remaining,d);return;}
  fields.innerHTML=fieldsHtml(S.app);
  bindTabs();
  var t=$('#rd-prod-name');if(t)t.textContent=d.gift_name||LABEL[S.app]||'';
  show(card1,false);show(card2,true);steps(2);
  serviceBanner(d.service_product);
  card2.scrollIntoView({behavior:'smooth',block:'start'});
}

function doCheck(auto){
  var code=(elCode.value||'').trim();
  // Формат кода не проверяем намеренно: у разных партий он разный
  // (XXXXX-XXXXX-XXXXX, ABCD-EFGH-IJKL, bbtgo…), документация прямо
  // запрещает навязывать свою маску.
  if(!code){if(!auto)err1('Введите код активации.');return;}
  err1('');S.code=code;S.sent=false;
  lock(btn1,true,'Проверяем код…');
  call('/check?cdkey='+encodeURIComponent(code))['catch'](fail).then(function(r){
    lock(btn1,false);
    var n=r.title?r:norm(r);
    if(!n.ok||!n.data){err1(n.title+(n.detail?' — '+n.detail:''));return;}
    var d=n.data;
    if(d.use_status===1){show(card1,false);steps(3);result('ok',{title:'Код уже активирован',detail:'Подписка выдана. Если её не видно — перезайдите в аккаунт.',rid:n.rid},rowsOf(d));return;}
    if(d.use_status===-1){show(card1,false);steps(3);S.app=d.app||'';watch(n,d);return;}
    if(d.use_status<0){show(card1,false);steps(3);result('err',n,rowsOf(d));return;}
    toStep2(d);
  });
}

// ------------------------------------------------------- шаг 2: активация
function readAccount(){
  var app=S.app,ch=S.ch,out={};
  if(app==='grok'||ch==='uid'){
    var u=$('#rd-uid');var v=(u&&u.value||'').trim();
    if(!v)return {err:'Укажите идентификатор аккаунта.',node:u};
    if(!UUID.test(v))return {err:'Не нашли идентификатор вида 96eae38f-b751-4079-b116-484bd746c477. Проверьте, что скопировали значение целиком.',node:u};
    out.uid=v;return out;
  }
  var s=$('#rd-session');var val=(s&&s.value||'').trim();
  if(!val)return {err:'Вставьте данные сессии.',node:s};
  if(app==='claude'||app==='claude_s'){
    val=val.replace(/^sessionKey\\s*=\\s*/i,'').trim();
    if(val.indexOf('sk-ant-sid')!==0)return {err:'Ключ сессии Claude начинается с sk-ant-sid. Похоже, скопировано не то значение.',node:s};
    if(val.length>2000)return {err:'Ключ слишком длинный — скорее всего, скопировалось лишнее.',node:s};
    out.session_info=val;return out;
  }
  if(val.charAt(0)!=='{'||val.charAt(val.length-1)!=='}')
    return {err:'Нужен весь текст со страницы сессии — от открывающей { до закрывающей }.',node:s};
  out.session_info=val;
  var f=$('#rd-force');if(f&&f.checked)out.force=1;
  return out;
}

function doActivate(){
  var a=readAccount(),e2=$('#rd-err2');
  if(a.err){
    if(e2){e2.textContent=a.err;show(e2,true);}
    if(a.node){a.node.className=a.node.className.replace(/ bad/g,'')+' bad';a.node.focus();}
    return;
  }
  if(e2)show(e2,false);
  a.cdkey=S.code;S.sent=true;
  lock(btn2,true,'Активируем…');
  call('/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)})['catch'](fail)
  .then(function(r){
    lock(btn2,false);
    var n=r.title?r:norm(r);
    var d=n.data;
    if(n.ok&&n.code!=='activation.processing'){show(card2,false);steps(3);result('ok',n,rowsOf(d));return;}
    if(n.code==='activation.processing'){show(card2,false);steps(3);watch(n,d);return;}
    if(n.code==='activation.cooldown'&&d&&d.cooldown_remaining){show(card2,false);cooldown(d.cooldown_remaining,d);return;}
    // Ошибка аккаунта — оставляем форму открытой, человек поправит поле.
    if(n.code&&(n.code.indexOf('account.')===0||n.code.indexOf('input.')===0)){
      if(e2){e2.innerHTML='<b>'+esc(n.title)+'</b> — '+esc(n.detail);show(e2,true);e2.scrollIntoView({behavior:'smooth',block:'center'});}
      return;
    }
    show(card2,false);steps(3);result('err',n,rowsOf(d));
  });
}

// Опрос статуса, пока заказ в обработке: /api/check, как требует дока.
function watch(n0,d0){
  var left=20;
  result('wait',{title:CT['activation.processing'][0],detail:CT['activation.processing'][1],rid:n0?n0.rid:''},rowsOf(d0));
  (function next(){
    if(left--<=0){
      result('wait',{title:'Заказ ещё выполняется',detail:'Это дольше обычного. Сохраните код и проверьте статус позже — или напишите нам, посмотрим со стороны поставщика.',rid:''},rowsOf(d0));
      return;
    }
    setTimeout(function(){
      call('/check?cdkey='+encodeURIComponent(S.code))['catch'](fail).then(function(r){
        var n=r.title?r:norm(r);var d=n.data;
        if(d&&d.use_status===1){steps(3);result('ok',{title:CT['activation.completed'][0],detail:CT['activation.completed'][1],rid:n.rid},rowsOf(d));return;}
        if(d&&d.use_status===-1){next();return;}
        if(d&&d.use_status<0){result('err',n,rowsOf(d));return;}
        next();
      });
    },6000);
  })();
}

// ------------------------------------------------------- инициализация
function prefill(){
  var c=qs.get('code')||qs.get('cdkey')||'';
  if(c&&elCode){elCode.value=c;doCheck(true);}
}
function initRedeem(){
  elCode=$('#rd-code');btn1=$('#rd-go1');btn2=$('#rd-go2');
  card1=$('#rd-step1');card2=$('#rd-step2');fields=$('#rd-fields');
  banner=$('#rd-banner');res=$('#rd-res');elErr1=$('#rd-err1');
  if(!elCode||!btn1)return;
  btn1.setAttribute('data-label',btn1.innerHTML);
  if(btn2)btn2.setAttribute('data-label',btn2.innerHTML);
  btn1.addEventListener('click',function(){doCheck(false);});
  elCode.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doCheck(false);}});
  if(btn2)btn2.addEventListener('click',doActivate);
  var back=$('#rd-back');
  if(back)back.addEventListener('click',function(){show(card2,false);show(card1,true);show(banner,false);steps(1);});
  prefill();
}

function initStatus(){
  elCode=$('#rd-code');btn1=$('#rd-go1');res=$('#rd-res');elErr1=$('#rd-err1');
  if(!elCode||!btn1)return;
  btn1.setAttribute('data-label',btn1.innerHTML);
  function go(){
    var code=(elCode.value||'').trim();
    if(!code){err1('Введите код.');return;}
    err1('');S.code=code;lock(btn1,true,'Проверяем…');
    call('/check?cdkey='+encodeURIComponent(code))['catch'](fail).then(function(r){
      lock(btn1,false);
      var n=r.title?r:norm(r);var d=n.data;
      if(!n.ok||!d){err1(n.title+(n.detail?' — '+n.detail:''));return;}
      var kind=d.use_status===1?'ok':(d.use_status===-1||d.use_status===0?'wait':'err');
      var rows=rowsOf(d);
      rows.unshift(['Сервис',LABEL[d.app]||d.app||'']);
      if(d.in_cooldown&&d.cooldown_remaining)rows.push(['Повтор через',Math.ceil(d.cooldown_remaining/60)+' мин']);
      var extra='';
      if(d.use_status===0&&SLUG[d.app])
        extra='<div class="rd-actions"><a class="pp-btn" href="'+SELF+SLUG[d.app]+'/?code='+encodeURIComponent(code)+'">Активировать код</a></div>';
      result(kind,n,rows,extra);
    });
  }
  btn1.addEventListener('click',go);
  elCode.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go();}});
  var c=qs.get('code')||qs.get('cdkey')||'';
  if(c){elCode.value=c;go();}
}

function initRestore(){
  res=$('#rd-res');
  var tabs=document.querySelectorAll('.rd-tab[data-rs]');
  for(var i=0;i<tabs.length;i++)tabs[i].addEventListener('click',function(){
    var k=this.getAttribute('data-rs');
    for(var j=0;j<tabs.length;j++)tabs[j].className='rd-tab'+(tabs[j].getAttribute('data-rs')===k?' on':'');
    var p=document.querySelectorAll('.rd-pane[data-rs]');
    for(var j2=0;j2<p.length;j2++)show(p[j2],p[j2].getAttribute('data-rs')===k);
    show(res,false);
  });

  var bC=$('#rs-claude-go'),bG=$('#rs-gpt-go');
  if(bC){
    bC.setAttribute('data-label',bC.innerHTML);
    bC.addEventListener('click',function(){
      var code=($('#rs-code').value||'').trim();
      var key=($('#rs-key').value||'').trim().replace(/^sessionKey\\s*=\\s*/i,'');
      var e=$('#rs-err');
      if(!code||!key){e.textContent='Заполните код и ключ сессии.';show(e,true);return;}
      if(key.indexOf('sk-ant-sid')!==0){e.textContent='Ключ сессии Claude начинается с sk-ant-sid.';show(e,true);return;}
      show(e,false);S.code=code;lock(bC,true,'Восстанавливаем…');
      call('/claude_refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cdkey:code,session_info:key})})['catch'](fail)
      .then(function(r){
        lock(bC,false);
        var n=r.title?r:norm(r);var d=n.data||{};
        var rows=[['Аккаунт',d.uid||''],['Примечание',d.note||'']];
        if(n.code==='rebind.uid_mismatch')
          rows=[['Ваш аккаунт',d.submitted_uid||''],['Аккаунт активации',d.redeemed_uid||'']];
        var extra='';
        // processing/cooldown — не финал: ждём retry_after и даём повторить.
        if(n.code==='rebind.processing'||n.code==='rebind.cooldown'){
          var wait=+(d.retry_after||30);
          bC.disabled=true;
          extra='<p id="rs-wait" style="margin-top:12px;color:var(--gold);font-size:14px"></p>';
          setTimeout(function(){
            var w=wait,t=setInterval(function(){
              var p=$('#rs-wait');
              if(!p){clearInterval(t);return;}
              p.textContent=w>0?('Повторить можно через '+w+' с'):'Можно проверить результат ещё раз.';
              if(w<=0){clearInterval(t);bC.disabled=false;}
              w--;
            },1000);
          },0);
        }
        if(d.replayed)rows.push(['Ответ',' сохранённый результат предыдущей попытки']);
        result(n.ok?'ok':(n.code==='rebind.processing'||n.code==='rebind.cooldown'?'wait':'err'),n,rows,extra);
      });
    });
  }
  if(bG){
    bG.setAttribute('data-label',bG.innerHTML);
    bG.addEventListener('click',function(){
      var v=($('#rs-session').value||'').trim(),e=$('#rs-err2');
      if(!v){e.textContent='Вставьте данные сессии.';show(e,true);return;}
      show(e,false);lock(bG,true,'Проверяем подписку…');
      call('/refresh-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_info:v})})['catch'](fail)
      .then(function(r){
        lock(bG,false);
        var n=r.title?r:norm(r);var d=n.data||{};
        var vr=d.verify_result;
        if(n.ok&&vr&&vr[0]===true&&vr[1]){
          var plan=String(vr[1][0]||'').toLowerCase();
          var free=(plan===''||plan==='free');
          result(free?'wait':'ok',{
            title:free?'Подписки на аккаунте нет':'На аккаунте есть подписка',
            detail:free?'Сервис не видит платный тариф. Если код вы уже активировали — напишите нам, доведём до конца.':'Перезайдите в аккаунт, если тариф ещё не отображается.',
            rid:n.rid
          },[['Тариф',vr[1][0]||''],['Действует до',dateRu(vr[1][1])],['Аккаунт',d.user_id||vr[1][2]||'']]);
          return;
        }
        result('err',n,[['Аккаунт',d.user_id||'']]);
      });
    });
  }
}

if(KIND==='redeem')initRedeem();
else if(KIND==='status')initStatus();
else if(KIND==='restore')initRestore();
})();
`;

// ---------------------------------------------------------------- блоки
function stepsBar(){
  return `<div class="rd-steps">
<div class="st on" data-s="1"><span class="n">1</span><span class="tx">Код</span></div><div class="bar"></div>
<div class="st" data-s="2"><span class="n">2</span><span class="tx">Аккаунт</span></div><div class="bar"></div>
<div class="st" data-s="3"><span class="n">3</span><span class="tx">Готово</span></div>
</div>`;
}

function flowCards({ codeHint }) {
  return `<section class="rd-card" id="rd-step1">
<div class="kicker">Шаг 1</div>
<h2>Проверка кода</h2>
<p class="lead2">Введите код, который вам выдали после оплаты. Мы проверим его и покажем, что заполнить дальше.</p>
<div class="rd-f">
<label class="rd-lab" for="rd-code">Код активации</label>
<input id="rd-code" class="rd-in" type="text" spellcheck="false" autocapitalize="characters" autocomplete="off" placeholder="Вставьте код целиком">
<p class="rd-hint">${codeHint}</p>
</div>
<div id="rd-err1" hidden style="color:#ff8d8d;font-size:13.5px;margin:0 0 14px"></div>
<button type="button" class="pp-btn" id="rd-go1">Проверить код</button>
</section>

<section class="rd-card" id="rd-step2" hidden>
<div class="kicker">Шаг 2 · <span id="rd-prod-name"></span></div>
<h2>Данные аккаунта</h2>
<p class="lead2">Подписка привяжется к тому аккаунту, данные которого вы укажете. Проверьте, что это именно ваш аккаунт.</p>
<div class="rd-banner" id="rd-banner" hidden></div>
<div id="rd-fields"></div>
<div id="rd-err2" hidden style="color:#ff8d8d;font-size:13.5px;margin:12px 0 0"></div>
<div class="rd-actions">
<button type="button" class="pp-btn" id="rd-go2">Активировать</button>
<button type="button" class="pp-btn-ghost" id="rd-back">Назад</button>
</div>
</section>

<div class="rd-res" id="rd-res" hidden></div>`;
}

const SAFE_NOTE = `<div class="rd-safe"><b>Данные аккаунта не попадают в PlataPay.</b> Страница отправляет их из вашего браузера напрямую в сервис активации — мы их не получаем, не логируем и не храним. После активации ключ сессии можно обнулить, выйдя из всех устройств в настройках сервиса.</div>`;

// ---------------------------------------------------------------- адреса
//
// Страницы активации живут на отдельном поддомене redeem.payoplata.ru,
// но остаются частью сайта: шапка, футер и логотип ведут на основной
// домен. Поэтому адресов три, и их нельзя смешивать:
//
//   base   — корень основного сайта (каталог, статьи, контакты)
//   self   — корень сайта активации (ссылки между своими же страницами)
//   asset  — откуда грузятся css/js/favicon
//   origin — абсолютный корень для canonical и sitemap
//
// mode 'site' — поддомен; mode 'path' оставлен для сборки тех же страниц
// внутри основного домена (используется для страниц-перенаправлений).

export const REDEEM_HOST = process.env.REDEEM_HOST || 'redeem.payoplata.ru';
export const MAIN_SITE = 'https://payoplata.ru/';

export function redeemCtx({ mode = 'site', base = MAIN_SITE } = {}) {
  if (mode === 'site') {
    return { mode, base, self: '/', asset: '/', origin: `https://${REDEEM_HOST}/` };
  }
  return { mode, base, self: `${base}redeem/`, asset: base, origin: 'https://payoplata.ru/redeem/' };
}

function helpBlock(c) {
  return `<div class="rd-help">Что-то пошло не так или непонятно — напишите нам в <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">Telegram</a> или <a href="${CONTACTS.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>, поможем вручную. Если код уже активирован, а подписки нет — откройте <a href="${c.self}restore/">восстановление подписки</a>. Просто посмотреть состояние кода можно на странице <a href="${c.self}status/">проверки статуса</a>.</div>`;
}

function howtoBlock(p) {
  const li = p.howto.map(([t, d]) => `<li><b class="t">${t}</b>${d}</li>`).join('');
  return `<section class="rd-sec">
<h2>Где взять данные аккаунта</h2>
<p class="note">Четыре шага, всё делается в браузере.</p>
<ol class="rd-howto">${li}</ol>
<div class="rd-warn" style="margin-top:16px">${p.req}</div>
</section>`;
}

function faqBlock(list) {
  return `<section class="rd-sec">
<h2>Частые вопросы</h2>
<p class="note">Если ответа нет — напишите, разберёмся индивидуально.</p>
${faqDetails(list)}
</section>`;
}

function faqLd(list) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })}</script>`;
}

// Подключение стилей и скрипта активации плюс адреса API. Вынесены в
// window, чтобы адрес можно было поменять без пересборки.
function redeemHead(c) {
  // Порядок важен: сначала значения по умолчанию, зашитые на сборке,
  // затем api-config.js, который их перекрывает. Обычный (не defer)
  // скрипт в <head> выполняется раньше отложенного pp-redeem.js, так что
  // к моменту запуска адрес уже окончательный. Если файла нет или он не
  // загрузился — останутся значения по умолчанию, страница не сломается.
  return `<link rel="stylesheet" href="${c.asset}css/pp-redeem.css">
<script>window.PP_REDEEM_API=${JSON.stringify(REDEEM_API)};window.PP_REDEEM_API_FALLBACK=${JSON.stringify(REDEEM_API_FALLBACK)};</script>
<script src="${c.asset}api-config.js"></script>
<script src="${c.asset}js/pp-redeem.js" defer></script>`;
}

// Единственное место, где живёт адрес поставщика после выкладки. Менять
// поставщика — править этот файл на сервере и обновить страницу: пересборка
// и передеплой не нужны.
export function apiConfigJs() {
  return `// Адрес API активации. Меняется прямо здесь, на сервере —
// пересобирать сайт не нужно, достаточно обновить страницу.
//
//   PP_REDEEM_API          — основной адрес, куда идут запросы
//   PP_REDEEM_API_FALLBACK — запасной, на него скрипт переключается сам,
//                            если браузер заблокировал прямой вызов (CORS).
//                            Это прокси на своём домене, см.
//                            server/vps/nginx-redeem-site.conf.example
//
// После правки: nginx отдаёт файл с Cache-Control: no-cache, так что
// достаточно обычной перезагрузки страницы (Ctrl+F5 не требуется).

window.PP_REDEEM_API = ${JSON.stringify(REDEEM_API)};
window.PP_REDEEM_API_FALLBACK = ${JSON.stringify(REDEEM_API_FALLBACK)};
`;
}

function bodyAttrs(kind, apps, c) {
  return ` data-rd="${kind}" data-apps="${escapeAttr(apps.join(','))}" data-self="${escapeAttr(c.self)}" data-tg="${escapeAttr(CONTACTS.telegram)}"`;
}

// ------------------------------------------------------------- страницы
const HUB_GRAD = 'linear-gradient(150deg,#4B8CFF 0%,#1B4FD8 100%)';
const KEY_ICON =
  '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><path d="M14.5 3.5a6 6 0 1 0-4.2 10.3L4 20.1V22h3.2l1.3-1.3v-1.6h1.6l1.3-1.3v-1.6h1.6l.9-.9A6 6 0 0 0 14.5 3.5zm1.6 4.6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" stroke="#8FB4FF" stroke-width="1.5" stroke-linejoin="round"/></svg>';

const CODE_HINT =
  'Вставьте код целиком, вместе с дефисами. Разные партии выглядят по-разному — ничего дописывать, разбивать или менять регистр не нужно.';

function heroBlock({ grad, tile, h1, sub, plans }) {
  return `<section class="rd-hero">
<div class="veil" style="background:${grad}"></div>
<span class="tile">${tile}</span>
<div class="body">
<h1>${escapeHtml(h1)}</h1>
<p class="sub">${escapeHtml(sub)}</p>
${plans ? `<span class="plans">${escapeHtml(plans)}</span>` : ''}
</div>
</section>`;
}

// Общие параметры wrapPage для всех страниц активации.
function shell(c, { canonical, title, description, verifyTags, ld, body, kind, apps }) {
  return wrapPage({
    base: c.base,
    assetBase: c.asset,
    canonical,
    title,
    description,
    verifyTags,
    ld,
    cta: { href: `${c.base}catalog/`, label: 'Каталог' },
    body,
    extraHead: redeemHead(c),
    bodyAttrs: bodyAttrs(kind, apps, c),
    noscriptPixel: true,
  });
}

/** Универсальная страница: продукт определяется по самому коду. */
function renderHub(c, { verifyTags }) {
  const cards = REDEEM_PAGES.map(
    (p) => `<a class="rd-prod" href="${c.self}${p.slug}/">
<div class="veil" style="background:${p.grad}"></div>
<span class="tile">${p.tile}</span>
<b>${escapeHtml(p.name)}</b><span>${escapeHtml(p.plans)}</span>
</a>`,
  ).join('');

  const body = `<div class="rd-wrap">
${breadcrumbs([{ name: 'PlataPay', href: c.base }, { name: 'Активация кода' }])}
${heroBlock({
    grad: HUB_GRAD,
    tile: KEY_ICON,
    h1: 'Активация кода',
    sub: 'Введите код, полученный после оплаты, — сервис определится сам, и мы покажем только нужные поля.',
    plans: 'ChatGPT · Claude · Grok',
  })}
<section class="rd-sec" style="margin-top:22px">
<h2>Выберите сервис или просто введите код</h2>
<p class="note">Если не уверены, к какому сервису относится код, — вводите его ниже, мы определим сами.</p>
<div class="rd-prods">${cards}</div>
</section>
${stepsBar()}
${flowCards({ codeHint: CODE_HINT })}
${SAFE_NOTE}
${faqBlock(COMMON_FAQ)}
${helpBlock(c)}
</div>`;

  return shell(c, {
    canonical: c.origin,
    title: 'Активация кода — ChatGPT, Claude, Grok · PlataPay',
    description:
      'Активация кода подписки на ваш аккаунт: ChatGPT, Claude и Grok. Введите код — сервис определится автоматически. Проверка статуса и восстановление подписки.',
    verifyTags,
    ld:
      breadcrumbLd([
        { name: 'PlataPay', item: MAIN_SITE },
        { name: 'Активация кода', item: c.origin },
      ]) + faqLd(COMMON_FAQ),
    body,
    kind: 'redeem',
    apps: [],
  });
}

/** Страница одного продукта: код чужого сервиса отсюда перенаправляется. */
function renderProduct(p, c, { verifyTags }) {
  const faq = p.faq.concat(COMMON_FAQ);
  const url = `${c.origin}${p.slug}/`;
  const body = `<div class="rd-wrap">
${breadcrumbs([
    { name: 'PlataPay', href: c.base },
    { name: 'Активация кода', href: c.self },
    { name: p.name },
  ])}
${heroBlock({ grad: p.grad, tile: p.tile, h1: p.h1, sub: p.sub, plans: p.plans })}
${stepsBar()}
${flowCards({ codeHint: CODE_HINT })}
${SAFE_NOTE}
${howtoBlock(p)}
${faqBlock(faq)}
${helpBlock(c)}
</div>`;

  return shell(c, {
    canonical: url,
    title: `${p.h1} — PlataPay`,
    description: p.desc,
    verifyTags,
    ld:
      breadcrumbLd([
        { name: 'PlataPay', item: MAIN_SITE },
        { name: 'Активация кода', item: c.origin },
        { name: p.name, item: url },
      ]) + faqLd(faq),
    body,
    kind: 'redeem',
    apps: p.apps,
  });
}

/** Проверка статуса кода без активации. */
function renderStatus(c, { verifyTags }) {
  const body = `<div class="rd-wrap">
${breadcrumbs([
    { name: 'PlataPay', href: c.base },
    { name: 'Активация кода', href: c.self },
    { name: 'Статус кода' },
  ])}
${heroBlock({
    grad: HUB_GRAD,
    tile: KEY_ICON,
    h1: 'Проверка статуса кода',
    sub: 'Посмотреть, активирован ли код, на какой аккаунт и когда. Ничего не списывается и не активируется.',
    plans: '',
  })}
<section class="rd-card" style="margin-top:22px">
<div class="kicker">Проверка</div>
<h2>Введите код</h2>
<p class="lead2">Покажем текущее состояние: ожидает активации, в обработке, активирован или закрыт.</p>
<div class="rd-f">
<label class="rd-lab" for="rd-code">Код активации</label>
<input id="rd-code" class="rd-in" type="text" spellcheck="false" autocapitalize="characters" autocomplete="off" placeholder="Вставьте код целиком">
<p class="rd-hint">${CODE_HINT}</p>
</div>
<div id="rd-err1" hidden style="color:#ff8d8d;font-size:13.5px;margin:0 0 14px"></div>
<button type="button" class="pp-btn" id="rd-go1">Проверить статус</button>
</section>
<div class="rd-res" id="rd-res" hidden></div>
${helpBlock(c)}
</div>`;

  return shell(c, {
    canonical: `${c.origin}status/`,
    title: 'Проверка статуса кода активации — PlataPay',
    description:
      'Проверьте статус кода активации подписки: ожидает активации, в обработке или уже активирован, на какой аккаунт и когда.',
    verifyTags,
    ld: breadcrumbLd([
      { name: 'PlataPay', item: MAIN_SITE },
      { name: 'Активация кода', item: c.origin },
      { name: 'Статус кода', item: `${c.origin}status/` },
    ]),
    body,
    kind: 'status',
    apps: [],
  });
}

/** Подписка не пришла: повторная привязка Claude и проверка тарифа ChatGPT. */
function renderRestore(c, { verifyTags }) {
  const body = `<div class="rd-wrap">
${breadcrumbs([
    { name: 'PlataPay', href: c.base },
    { name: 'Активация кода', href: c.self },
    { name: 'Подписка не пришла' },
  ])}
${heroBlock({
    grad: HUB_GRAD,
    tile: KEY_ICON,
    h1: 'Подписка не пришла',
    sub: 'Код активирован, а тарифа в аккаунте нет. Сначала полностью выйдите и войдите заново — чаще всего этого достаточно. Если не помогло, используйте инструменты ниже.',
    plans: '',
  })}
<section class="rd-sec" style="margin-top:22px">
<div class="rd-tabs">
<button type="button" class="rd-tab on" data-rs="claude">Claude<span class="alt">повторно привязать подписку</span></button>
<button type="button" class="rd-tab" data-rs="gpt">ChatGPT<span class="alt">проверить текущий тариф</span></button>
</div>

<div class="rd-pane" data-rs="claude">
<section class="rd-card" style="margin-top:0">
<div class="kicker">Claude</div>
<h2>Повторная привязка</h2>
<p class="lead2">Сервис заново привяжет уже оплаченную подписку к аккаунту. Код при этом повторно не расходуется. Нужен тот же аккаунт, на который шла активация.</p>
<div class="rd-f">
<label class="rd-lab" for="rs-code">Код активации</label>
<input id="rs-code" class="rd-in" type="text" spellcheck="false" autocapitalize="characters" autocomplete="off" placeholder="Тот же код, что активировали">
</div>
<div class="rd-f">
<label class="rd-lab" for="rs-key">Ключ сессии Claude</label>
<input id="rs-key" class="rd-in" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="sk-ant-sid...">
<p class="rd-hint">Инструменты разработчика (F12) → Application → Cookies → claude.ai → значение cookie <b>sessionKey</b>.</p>
</div>
<div id="rs-err" hidden style="color:#ff8d8d;font-size:13.5px;margin:0 0 14px"></div>
<button type="button" class="pp-btn" id="rs-claude-go">Привязать заново</button>
</section>
</div>

<div class="rd-pane" data-rs="gpt" hidden>
<section class="rd-card" style="margin-top:0">
<div class="kicker">ChatGPT</div>
<h2>Проверка тарифа</h2>
<p class="lead2">Покажем, какой тариф сервис видит на аккаунте прямо сейчас. Это только проверка — ничего не активируется и не списывается.</p>
<div class="rd-f">
<label class="rd-lab" for="rs-session">Данные сессии ChatGPT</label>
<textarea id="rs-session" class="rd-ta" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder="Вставьте сюда весь текст со страницы chatgpt.com/api/auth/session"></textarea>
<p class="rd-hint">Откройте <a href="https://chatgpt.com/api/auth/session" target="_blank" rel="noopener nofollow">chatgpt.com/api/auth/session</a> и скопируйте текст целиком.</p>
</div>
<div id="rs-err2" hidden style="color:#ff8d8d;font-size:13.5px;margin:0 0 14px"></div>
<button type="button" class="pp-btn" id="rs-gpt-go">Проверить тариф</button>
</section>
</div>
</section>
<div class="rd-res" id="rd-res" hidden></div>
${SAFE_NOTE}
${helpBlock(c)}
</div>`;

  return shell(c, {
    canonical: `${c.origin}restore/`,
    title: 'Подписка не пришла после активации — что делать · PlataPay',
    description:
      'Код активирован, а подписки в аккаунте нет: повторная привязка подписки Claude по ключу сессии и проверка текущего тарифа ChatGPT.',
    verifyTags,
    ld: breadcrumbLd([
      { name: 'PlataPay', item: MAIN_SITE },
      { name: 'Активация кода', item: c.origin },
      { name: 'Подписка не пришла', item: `${c.origin}restore/` },
    ]),
    body,
    kind: 'restore',
    apps: [],
  });
}

// ------------------------------------------------------------- генерация
const SITE_PAGES = [
  { dir: [], render: (c, o) => renderHub(c, o), loc: '' },
  ...REDEEM_PAGES.map((p) => ({ dir: [p.slug], render: (c, o) => renderProduct(p, c, o), loc: `${p.slug}/` })),
  { dir: ['status'], render: (c, o) => renderStatus(c, o), loc: 'status/' },
  { dir: ['restore'], render: (c, o) => renderRestore(c, o), loc: 'restore/' },
];

/**
 * Собирает самостоятельный сайт активации для redeem.payoplata.ru.
 * Это отдельный корень: свои ассеты, свой CNAME, свой sitemap. Шапка,
 * футер и логотип при этом ведут на основной домен — для посетителя это
 * один и тот же PlataPay.
 */
export function generateRedeemSite({ out, verifyTags = '', faviconSrc = '', host = REDEEM_HOST }) {
  const c = redeemCtx({ mode: 'site' });
  const today = new Date().toISOString().slice(0, 10);

  for (const d of ['css', 'js']) fs.mkdirSync(path.join(out, d), { recursive: true });

  // Ассеты кладём рядом, а не ссылаемся на основной домен: поддомен
  // должен открываться, даже если с основным что-то не так.
  fs.writeFileSync(path.join(out, 'css', 'pp-app.css'), APP_CSS);
  fs.writeFileSync(path.join(out, 'js', 'pp-app.js'), APP_JS);
  fs.writeFileSync(path.join(out, 'css', 'pp-redeem.css'), REDEEM_CSS);
  fs.writeFileSync(path.join(out, 'js', 'pp-redeem.js'), REDEEM_JS);
  if (faviconSrc && fs.existsSync(faviconSrc)) fs.copyFileSync(faviconSrc, path.join(out, 'favicon.svg'));

  // Адрес API — отдельным файлом, а не только зашитым в страницы:
  // поставщик меняется чаще, чем вёрстка.
  fs.writeFileSync(path.join(out, 'api-config.js'), apiConfigJs());

  for (const p of SITE_PAGES) {
    const dir = path.join(out, ...p.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), p.render(c, { verifyTags }));
  }

  fs.writeFileSync(path.join(out, 'CNAME'), `${host}\n`);
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
  fs.writeFileSync(
    path.join(out, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: https://${host}/sitemap.xml\n`,
  );
  fs.writeFileSync(
    path.join(out, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITE_PAGES.map(
  (p) =>
    `<url><loc>https://${host}/${p.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${p.loc ? '0.7' : '1.0'}</priority></url>`,
).join('\n')}
</urlset>
`,
  );

  console.log(`built redeem site: ${SITE_PAGES.length} pages → ${host}, api = ${REDEEM_API}`);
  return SITE_PAGES.map((p) => `https://${host}/${p.loc}`);
}

/**
 * Заглушки на основном домене: /redeem/* уводят на поддомен, сохраняя
 * ?code=. Нужны, чтобы не побить ссылки, которые уже ушли клиентам, и
 * чтобы поиск склеил старые адреса с новыми через canonical.
 *
 * На VPS лучше настроить настоящий 301 (см. nginx-redeem-site.conf.example) —
 * эти файлы остаются запасным вариантом и работают на любом хостинге.
 */
export function generateRedeemRedirects({ out, host = REDEEM_HOST }) {
  const stub = (target, label) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(label)} — PlataPay</title>
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0;url=${escapeAttr(target)}">
<meta name="robots" content="noindex,follow">
<style>:root{color-scheme:dark}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#091b36;color:#eef3ff;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;text-align:center;padding:24px}a{color:#6fa8ff}</style>
<script>location.replace(${JSON.stringify(target)}+location.search+location.hash);</script>
</head>
<body><div><p>Активация переехала на <b>${escapeHtml(host)}</b></p>
<p><a href="${escapeAttr(target)}">Перейти к активации →</a></p></div></body>
</html>
`;
  const pages = [
    { dir: [], loc: '', label: 'Активация кода' },
    ...REDEEM_PAGES.map((p) => ({ dir: [p.slug], loc: `${p.slug}/`, label: `Активация кода ${p.name}` })),
    { dir: ['status'], loc: 'status/', label: 'Статус кода' },
    { dir: ['restore'], loc: 'restore/', label: 'Подписка не пришла' },
  ];
  for (const p of pages) {
    const dir = path.join(out, 'redeem', ...p.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), stub(`https://${host}/${p.loc}`, p.label));
  }
  console.log(`built redeem redirects: /redeem/* → ${host}`);
}
