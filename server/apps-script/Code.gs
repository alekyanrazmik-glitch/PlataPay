/**
 * PlataPay — дубль заявок на почту (Google Apps Script).
 *
 * Сайт и раньше отправлял данные заявки в этот веб-скрипт для записи в Google
 * Sheets. Теперь скрипт вдобавок шлёт копию заявки на почту. Telegram сайт
 * по-прежнему шлёт сам, напрямую — этот скрипт его не трогает.
 *
 * Что делает doPost на каждую заявку:
 *   1. пишет строку в Google Sheets (вкладка «Заявки», создаётся сама);
 *   2. отправляет копию письмом на LEAD_EMAIL.
 *
 * ─── УСТАНОВКА (один раз) ────────────────────────────────────────────────
 * 1. Откройте ваш Apps Script (в таблице: Расширения → Apps Script).
 * 2. Замените весь код этим файлом.
 * 3. Deploy → Manage deployments → откройте текущий деплой на редактирование (✎)
 *    → Version: New version → Deploy.  Оставьте Execute as: Me,
 *    Who has access: Anyone.  URL /exec останется прежним — на сайте менять
 *    ничего не нужно.
 * 4. При первом запуске Google попросит разрешить доступ (к таблице и почте) —
 *    разрешите. Письма уходят с того Google-аккаунта, под которым скрипт.
 *
 * Токен бота здесь НЕ нужен и НЕ хранится.
 */

// Куда дублировать заявки на почту (можно указать несколько через запятую).
var LEAD_EMAIL = 'alekyan.razmik@gmail.com';

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

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
