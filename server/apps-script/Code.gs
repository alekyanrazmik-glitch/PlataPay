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

// Health check: откройте /exec в браузере → {ok:true,service:"platapay-mail"}.
function doGet() {
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

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
