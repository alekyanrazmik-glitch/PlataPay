/**
 * PlataPay — дубль заявок на почту и в Telegram (Google Apps Script).
 *
 * Сайт и раньше отправлял данные заявки в этот веб-скрипт для записи в Google
 * Sheets. Теперь скрипт вдобавок шлёт копию заявки на почту и — при
 * необходимости — дублирует её в Telegram.
 *
 * Зачем дублировать Telegram здесь: у части клиентов (особенно из РФ)
 * провайдер блокирует api.telegram.org, поэтому прямая отправка из браузера
 * не проходит и заявка «терялась» (клиент видел «Не удалось отправить»).
 * Google-серверам Telegram доступен, поэтому этот скрипт гарантированно
 * доносит заявку. Браузер в поле tgSent сообщает, удалось ли ему отправить
 * напрямую: если да — скрипт Telegram не дублирует, чтобы не приходило два
 * одинаковых сообщения; если нет — отправляет сам.
 *
 * Что делает doPost на каждую заявку:
 *   1. пишет строку в Google Sheets (вкладка «Заявки», создаётся сама);
 *   2. отправляет копию заявки письмом на LEAD_EMAIL;
 *   3. дублирует заявку в Telegram, если браузер не отправил её сам (tgSent).
 *
 * ─── УСТАНОВКА (один раз) ────────────────────────────────────────────────
 * 1. Откройте ваш Apps Script (в таблице: Расширения → Apps Script).
 * 2. Замените весь код этим файлом.
 * 3. Проверьте BOT_TOKEN и CHAT_ID ниже (те же, что на сайте).
 * 4. Deploy → Manage deployments → откройте текущий деплой на редактирование (✎)
 *    → Version: New version → Deploy.  Оставьте Execute as: Me,
 *    Who has access: Anyone.  URL /exec останется прежним — на сайте менять
 *    ничего не нужно.
 * 5. При первом запуске Google попросит разрешить доступ (к таблице, почте и
 *    внешним запросам) — разрешите. Письма уходят с того Google-аккаунта,
 *    под которым скрипт.
 */

// Куда дублировать заявки на почту (можно указать несколько через запятую).
var LEAD_EMAIL = 'alekyan.razmik@gmail.com';

// Telegram-бот для резервной доставки заявок (когда браузер клиента не смог
// достучаться до api.telegram.org сам). Те же значения, что зашиты на сайте.
var BOT_TOKEN = '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg';
var CHAT_ID = '523060537';

var COLUMNS = [
  'Дата', 'Тип', 'Сервис', 'Тариф/План', 'Сумма', 'Имя', 'Телефон',
  'Способ связи', 'Контакт', 'Назначение', 'Реквизиты', 'Срок',
  'Файл', 'Комментарий', 'Страница', 'Интент'
];

function doPost(e) {
  var out = { ok: true, sheet: false, email: false };
  try {
    var data = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents) : {};

    // Отзыв с сайта — отдельная ветка: пишем во вкладку «Отзывы» (на
    // модерации), уведомляем на почту и в Telegram. В «Заявки» не пишем.
    if (data && data.type === 'review') {
      try { out.sheet = appendReview(data); } catch (se) { out.sheetError = String(se); }
      try { out.email = sendReviewEmail(data); } catch (me) { out.emailError = String(me); }
      try { if (!data.tgSent) out.telegram = sendReviewTelegram(data); } catch (te) { out.telegramError = String(te); }
      return json(out);
    }

    try { out.sheet = appendRow(data); } catch (se) { out.sheetError = String(se); }
    try { out.email = sendEmailCopy(data); } catch (me) { out.emailError = String(me); }
    // Дублируем в Telegram, только если браузер не смог отправить сам.
    try {
      if (!data.tgSent) out.telegram = sendTelegram(data);
    } catch (te) { out.telegramError = String(te); }
  } catch (err) {
    out.error = String(err);
  }
  return json(out);
}

// GET:
//   • /exec                       → health check {ok:true,...}
//   • /exec?reviews=1             → JSON одобренных отзывов
//   • /exec?reviews=1&callback=fn → то же, но JSONP (для страницы /reviews/)
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.reviews) {
    var list = [];
    try { list = getApprovedReviews(); } catch (err) { list = []; }
    if (p.callback) return jsonp(p.callback, list);
    return json(list);
  }
  return json({ ok: true, service: 'platapay-mail' });
}

function appendRow(d) {
  if (!d || typeof d !== 'object') return false;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return false;

  var sheet = ss.getSheetByName('Заявки');
  if (!sheet) {
    sheet = ss.insertSheet('Заявки');
    sheet.appendRow(COLUMNS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }

  var pick = function () {
    for (var i = 0; i < arguments.length; i++) {
      var v = d[arguments[i]];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };
  sheet.appendRow([
    new Date(),
    pick('type', 'source'),
    pick('service'),
    pick('tier', 'plan'),
    pick('price', 'amount'),
    pick('name'),
    pick('phone'),
    pick('channel'),
    pick('contact'),
    pick('purpose'),
    pick('bank'),
    pick('deadline'),
    pick('file'),
    pick('note'),
    pick('page', 'host'),
    pick('intent')
  ]);
  return true;
}

function sendEmailCopy(d) {
  if (!LEAD_EMAIL || !d || typeof d !== 'object') return false;

  var labels = {
    type: 'Тип', source: 'Тип', service: 'Сервис', tier: 'Тариф', plan: 'Тариф/План',
    price: 'Сумма', amount: 'Сумма', currency: 'Валюта', name: 'Имя', phone: 'Телефон',
    channel: 'Способ связи', contact: 'Контакт', purpose: 'Назначение', bank: 'Реквизиты',
    deadline: 'Срок', file: 'Файл', note: 'Комментарий', page: 'Страница', host: 'Сайт',
    intent: 'Интент'
  };
  var order = ['type', 'source', 'service', 'tier', 'plan', 'price', 'amount', 'currency',
    'name', 'phone', 'channel', 'contact', 'purpose', 'bank', 'deadline', 'file', 'note',
    'page', 'host', 'intent'];

  var lines = [];
  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    if (d[k] !== undefined && d[k] !== null && d[k] !== '' && labels[k]) {
      lines.push(labels[k] + ': ' + d[k]);
    }
  }
  if (!lines.length) lines.push(JSON.stringify(d));

  var tag = d.type || d.service || d.source || '';
  var subject = 'Заявка с сайта PlataPay' + (tag ? ' — ' + tag : '');
  MailApp.sendEmail(LEAD_EMAIL, subject, lines.join('\n'), { name: 'PlataPay сайт' });
  return true;
}

// Резервная доставка заявки в Telegram силами Google-сервера (когда прямая
// отправка из браузера клиента не прошла — например, провайдер в РФ блокирует
// api.telegram.org). Возвращает true при успешной доставке.
function sendTelegram(d) {
  if (!BOT_TOKEN || !CHAT_ID || !d || typeof d !== 'object') return false;

  var labels = {
    type: 'Тип', source: 'Тип', service: 'Сервис', tier: 'Тариф', plan: 'Тариф/План',
    price: 'Сумма', amount: 'Сумма', currency: 'Валюта', name: 'Имя', phone: 'Телефон',
    channel: 'Способ связи', contact: 'Контакт', purpose: 'Назначение', bank: 'Реквизиты',
    deadline: 'Срок', file: 'Файл', note: 'Комментарий', intent: 'Интент'
  };
  var order = ['type', 'source', 'service', 'tier', 'plan', 'price', 'amount', 'currency',
    'name', 'phone', 'channel', 'contact', 'purpose', 'bank', 'deadline', 'file', 'note',
    'intent'];

  var lines = ['Заявка с сайта PlataPay'];
  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    if (d[k] !== undefined && d[k] !== null && d[k] !== '' && labels[k]) {
      lines.push(labels[k] + ': ' + d[k]);
    }
  }
  var page = d.page || d.host;
  if (page) {
    lines.push('Страница: ' + (String(page).indexOf('http') === 0
      ? page : 'https://payoplata.ru' + page));
  }

  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: lines.join('\n'),
      disable_web_page_preview: true
    }),
    muteHttpExceptions: true
  });
  return resp.getResponseCode() === 200;
}

// ─────────────────────────── ОТЗЫВЫ ────────────────────────────────────
// Вкладка «Отзывы». Колонки:
//   Дата | Имя | Оценка | Отзыв | Показывать | Страница
// «Показывать» — модерация: отзыв появляется на сайте (/reviews/) только
// когда в этой колонке стоит «да» (также подходят yes/true/1/✓/x/да).
var REVIEW_SHEET = 'Отзывы';
var REVIEW_COLUMNS = ['Дата', 'Имя', 'Оценка', 'Отзыв', 'Показывать', 'Страница'];
var RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function reviewSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  var sheet = ss.getSheetByName(REVIEW_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(REVIEW_SHEET);
    sheet.appendRow(REVIEW_COLUMNS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(REVIEW_COLUMNS);
  }
  return sheet;
}

function clampStars_(v) {
  var n = parseInt(v, 10);
  if (isNaN(n)) return 5;
  return Math.max(1, Math.min(5, n));
}

function appendReview(d) {
  if (!d || typeof d !== 'object') return false;
  var sheet = reviewSheet_();
  if (!sheet) return false;
  var name = String(d.name || '').slice(0, 60);
  var text = String(d.text || '').slice(0, 1000);
  if (!name || !text) return false;
  sheet.appendRow([
    new Date(),
    name,
    clampStars_(d.stars),
    text,
    '',                              // Показывать — пусто = на модерации
    d.page || d.host || ''
  ]);
  return true;
}

function isApproved_(v) {
  var s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'да' || s === 'yes' || s === 'true' || s === '1'
    || s === '✓' || s === 'x' || s === 'х' || s === '+';
}

function ruDate_(d) {
  try {
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.getDate() + ' ' + RU_MONTHS[dt.getMonth()];
  } catch (e) { return ''; }
}

// Возвращает одобренные отзывы, свежие сверху.
function getApprovedReviews() {
  var sheet = reviewSheet_();
  if (!sheet) return [];
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, REVIEW_COLUMNS.length).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!isApproved_(r[4])) continue;          // колонка «Показывать»
    var name = String(r[1] || '').trim();
    var text = String(r[3] || '').trim();
    if (!name || !text) continue;
    out.push({
      name: name,
      stars: clampStars_(r[2]),
      text: text,
      date: ruDate_(r[0])
    });
  }
  return out.reverse();                          // новые сверху
}

function sendReviewEmail(d) {
  if (!LEAD_EMAIL || !d) return false;
  var body = [
    'Новый отзыв с сайта PlataPay (на модерации).',
    '',
    'Имя: ' + (d.name || ''),
    'Оценка: ' + clampStars_(d.stars) + '/5',
    'Отзыв: ' + (d.text || ''),
    'Страница: ' + (d.page || ''),
    '',
    'Чтобы опубликовать — поставьте «да» в колонке «Показывать» на вкладке «Отзывы».'
  ].join('\n');
  MailApp.sendEmail(LEAD_EMAIL, 'Новый отзыв на сайте PlataPay', body, { name: 'PlataPay сайт' });
  return true;
}

function sendReviewTelegram(d) {
  if (!BOT_TOKEN || !CHAT_ID || !d) return false;
  var text = [
    'Новый отзыв на сайте PlataPay (на модерации)',
    'Имя: ' + (d.name || ''),
    'Оценка: ' + clampStars_(d.stars) + '/5',
    'Отзыв: ' + (d.text || ''),
    'Опубликовать: поставьте «да» в колонке «Показывать» (вкладка «Отзывы»).'
  ].join('\n');
  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: CHAT_ID, text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true
  });
  return resp.getResponseCode() === 200;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// JSONP — страница /reviews/ грузит одобренные отзывы через <script>, потому
// что Apps Script не отдаёт CORS-заголовки для обычного fetch.
function jsonp(callback, obj) {
  var safe = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
  return ContentService
    .createTextOutput(safe + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
