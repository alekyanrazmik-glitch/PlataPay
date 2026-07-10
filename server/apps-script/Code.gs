/**
 * PlataPay — заявки в Google Sheets + почта + Telegram (Google Apps Script).
 *
 * Сайт шлёт каждую заявку в этот веб-скрипт. Скрипт:
 *   1. пишет строку в Google Sheets (вкладка «Заявки») и оформляет таблицу
 *      (цветная шапка, заморозка строки, подсветка типа заявки);
 *   2. отправляет копию заявки письмом на LEAD_EMAIL;
 *   3. отправляет уведомление в Telegram со стороны Google-сервера
 *      (у части клиентов из РФ провайдер блокирует api.telegram.org, поэтому
 *      браузер не всегда может отправить сам — сервер доносит гарантированно).
 *
 * Дополнительно:
 *   • Клики по ссылкам «Написать в Telegram»/WhatsApp сайт присылает как
 *     event:"click" — они попадают в таблицу отдельной строкой «Переход в
 *     Telegram», но НЕ шлют письмо и уведомление, чтобы не спамить.
 *   • Видно, откуда пришёл человек: колонки «Источник» (utm_source или сайт-
 *     реферер), «Кампания» (utm_campaign/utm_medium) и «Реферер».
 *   • Заявки с почты администратора (ADMIN_CONTACTS) помечаются в таблице,
 *     письме и Telegram как «Тестовая заявка от администратора».
 *
 * ─── УСТАНОВКА / ОБНОВЛЕНИЕ (один раз) ───────────────────────────────────
 * 1. Откройте ваш Apps Script (в таблице: Расширения → Apps Script).
 * 2. Замените весь код этим файлом.
 * 3. Проверьте LEAD_EMAIL, BOT_TOKEN, CHAT_ID и ADMIN_CONTACTS ниже.
 * 4. Deploy → Manage deployments → откройте текущий деплой на редактирование (✎)
 *    → Version: New version → Deploy.  Оставьте Execute as: Me,
 *    Who has access: Anyone.  URL /exec останется прежним — на сайте менять
 *    ничего не нужно.
 * 5. При первом запуске Google попросит разрешить доступ (к таблице, почте и
 *    внешним запросам) — разрешите. Таблица переформатируется автоматически
 *    при первой же заявке после обновления.
 */

// Куда дублировать заявки на почту (можно указать несколько через запятую).
var LEAD_EMAIL = 'alekyan.razmik@gmail.com';

// Telegram-бот для доставки заявок со стороны Google-сервера.
var BOT_TOKEN = '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg';
var CHAT_ID = '523060537';

// Почты/контакты администратора. Заявки с ними помечаются как тестовые.
var ADMIN_CONTACTS = ['stroy_remgel@mail.ru'];

// Версия оформления таблицы. Меняете значение — и при следующей заявке
// таблица переоформляется один раз (шапка, цвета, ширины, заморозка строки).
var FORMAT_VERSION = '2026-07-10-1';

var COLUMNS = [
  'Дата', 'Тип', 'Сервис', 'Тариф/План', 'Сумма', 'Имя', 'Телефон',
  'Способ связи', 'Контакт', 'Назначение', 'Реквизиты', 'Срок',
  'Файл', 'Комментарий', 'Страница', 'Интент',
  'Источник', 'Кампания', 'Реферер'
];

function doPost(e) {
  var out = { ok: true };
  try {
    var data = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents) : {};

    var isClick = data.event === 'click';

    try { out.sheet = appendRow(data); } catch (se) { out.sheetError = String(se); }

    // Клики по ссылкам «Написать в Telegram» пишем только в таблицу — без
    // письма и уведомления в Telegram, чтобы не приходило по сообщению на
    // каждый переход.
    if (!isClick) {
      try { out.email = sendEmailCopy(data); } catch (me) { out.emailError = String(me); }
      // Telegram дублируем, только если браузер не отправил сам (tgSent).
      try { if (!data.tgSent) out.telegram = sendTelegram(data); }
      catch (te) { out.telegramError = String(te); }
    }
  } catch (err) {
    out.error = String(err);
  }
  return json(out);
}

// Health check: откройте /exec в браузере → {ok:true,service:"platapay-mail"}.
function doGet() {
  return json({ ok: true, service: 'platapay-mail' });
}

// ─── Разметка заявки ─────────────────────────────────────────────────────

// true, если заявка пришла с контакта администратора (тестовая).
function isAdminTest(d) {
  if (!d) return false;
  var hay = [d.contact, d.email, d.phone, d.contactLine].join(' ').toLowerCase();
  for (var i = 0; i < ADMIN_CONTACTS.length; i++) {
    var a = (ADMIN_CONTACTS[i] || '').toLowerCase();
    if (a && hay.indexOf(a) > -1) return true;
  }
  return false;
}

// Значение колонки «Тип»: тест / переход / обычная заявка.
function eventLabel(d) {
  if (isAdminTest(d)) return 'Тестовая заявка от администратора';
  if (d && d.event === 'click') return d.type || 'Переход в Telegram';
  return 'Заявка';
}

// «Источник» — откуда пришёл человек: utm_source, иначе домен реферера.
function sourceLabel(d) {
  if (!d) return '';
  if (d.utm_source) return d.utm_source;
  if (d.ref) {
    try {
      var host = String(d.ref).replace(/^https?:\/\//i, '').split('/')[0];
      if (host) return host;
    } catch (e) {}
  }
  return 'прямой заход';
}

function campaignLabel(d) {
  if (!d) return '';
  return d.utm_campaign || d.utm_medium || '';
}

// ─── Запись в таблицу ────────────────────────────────────────────────────

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

  ensureFormat(sheet);

  var pick = function () {
    for (var i = 0; i < arguments.length; i++) {
      var v = d[arguments[i]];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };
  sheet.appendRow([
    new Date(),
    eventLabel(d),
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
    pick('intent'),
    sourceLabel(d),
    campaignLabel(d),
    (d.ref || '')
  ]);
  return true;
}

// ─── Оформление таблицы (цветная шапка, подсветка типа) ──────────────────

// Переоформляет таблицу один раз после смены FORMAT_VERSION.
function ensureFormat(sheet) {
  try {
    var props = PropertiesService.getDocumentProperties();
    if (props.getProperty('fmtVer') === FORMAT_VERSION) return;
    applyFormatting(sheet);
    props.setProperty('fmtVer', FORMAT_VERSION);
  } catch (e) {}
}

function applyFormatting(sheet) {
  var lastCol = COLUMNS.length;

  // Актуализируем шапку (могли добавиться новые колонки).
  sheet.getRange(1, 1, 1, lastCol).setValues([COLUMNS]);

  var header = sheet.getRange(1, 1, 1, lastCol);
  header
    .setBackground('#1a56db')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // Ширины колонок под содержимое.
  var widths = [150, 220, 150, 150, 90, 120, 120, 130, 210, 150, 150, 90,
    120, 220, 240, 130, 150, 150, 240];
  for (var c = 0; c < lastCol; c++) {
    if (widths[c]) sheet.setColumnWidth(c + 1, widths[c]);
  }

  var rows = Math.max(sheet.getMaxRows() - 1, 1000);
  var body = sheet.getRange(2, 1, rows, lastCol);

  // Чередование строк для читаемости (сначала снимаем старое, чтобы не
  // дублировалось при повторном форматировании).
  try {
    var bs = sheet.getBandings();
    for (var i = 0; i < bs.length; i++) bs[i].remove();
  } catch (e) {}
  try {
    body.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
  } catch (e2) {}

  // Подсветка ячейки «Тип» по содержимому: тест — жёлтый, переход — синий,
  // заявка — зелёный. setConditionalFormatRules заменяет все правила разом.
  var typeCol = sheet.getRange(2, 2, rows, 1);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('администратор')
      .setBackground('#fff3cd').setFontColor('#8a6d00').setBold(true)
      .setRanges([typeCol]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('Переход')
      .setBackground('#dbe9ff').setFontColor('#173a7a')
      .setRanges([typeCol]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains('Заявка')
      .setBackground('#d6f5e1').setFontColor('#0b6b3a').setBold(true)
      .setRanges([typeCol]).build()
  ];
  sheet.setConditionalFormatRules(rules);
}

// Ручной прогон оформления (можно запустить из редактора Apps Script, если
// хочется переоформить таблицу немедленно, не дожидаясь новой заявки).
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  var sheet = ss.getSheetByName('Заявки') || ss.insertSheet('Заявки');
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  applyFormatting(sheet);
  PropertiesService.getDocumentProperties().setProperty('fmtVer', FORMAT_VERSION);
}

// ─── Копия на почту ──────────────────────────────────────────────────────

var FIELD_LABELS = {
  service: 'Сервис', tier: 'Тариф', plan: 'Тариф/План',
  price: 'Сумма', amount: 'Сумма', currency: 'Валюта', name: 'Имя', phone: 'Телефон',
  channel: 'Способ связи', contact: 'Контакт', purpose: 'Назначение', bank: 'Реквизиты',
  deadline: 'Срок', file: 'Файл', note: 'Комментарий', page: 'Страница', host: 'Сайт',
  intent: 'Интент', utm_source: 'Источник', utm_medium: 'Канал',
  utm_campaign: 'Кампания', ref: 'Реферер'
};
var FIELD_ORDER = ['service', 'tier', 'plan', 'price', 'amount', 'currency',
  'name', 'phone', 'channel', 'contact', 'purpose', 'bank', 'deadline', 'file', 'note',
  'page', 'host', 'intent', 'utm_source', 'utm_medium', 'utm_campaign', 'ref'];

function leadLines(d) {
  var lines = [];
  for (var i = 0; i < FIELD_ORDER.length; i++) {
    var k = FIELD_ORDER[i];
    if (d[k] !== undefined && d[k] !== null && d[k] !== '' && FIELD_LABELS[k]) {
      lines.push(FIELD_LABELS[k] + ': ' + d[k]);
    }
  }
  return lines;
}

function sendEmailCopy(d) {
  if (!LEAD_EMAIL || !d || typeof d !== 'object') return false;

  var label = eventLabel(d);
  var lines = [label].concat(leadLines(d));
  if (lines.length <= 1) lines.push(JSON.stringify(d));

  var subject;
  if (isAdminTest(d)) {
    subject = 'Тестовая заявка от администратора';
  } else {
    var tag = d.service || d.type || d.source || '';
    subject = 'Заявка с сайта PlataPay' + (tag ? ' — ' + tag : '');
  }
  MailApp.sendEmail(LEAD_EMAIL, subject, lines.join('\n'), { name: 'PlataPay сайт' });
  return true;
}

// ─── Уведомление в Telegram ──────────────────────────────────────────────

function sendTelegram(d) {
  if (!BOT_TOKEN || !CHAT_ID || !d || typeof d !== 'object') return false;

  var lines = [eventLabel(d)].concat(leadLines(d));

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

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
