/**
 * PlataPay - dubl zayavok na pochtu i v Telegram (Google Apps Script).
 *
 * Sayt i ranshe otpravlyal dannye zayavki v etot veb-skript dlya zapisi v Google
 * Sheets. Teper skript vdobavok shlet kopiyu zayavki na pochtu i - pri
 * neobhodimosti - dubliruet ee v Telegram.
 *
 * Zachem dublirovat Telegram zdes: u chasti klientov (osobenno iz RF)
 * provayder blokiruet api.telegram.org, poetomu pryamaya otpravka iz brauzera
 * ne prohodit i zayavka "teryalas" (klient videl "Ne udalos otpravit").
 * Google-serveram Telegram dostupen, poetomu etot skript garantirovanno
 * donosit zayavku. Brauzer v pole tgSent soobschaet, udalos li emu otpravit
 * napryamuyu: esli da - skript Telegram ne dubliruet, chtoby ne prihodilo dva
 * odinakovyh soobscheniya; esli net - otpravlyaet sam.
 *
 * Chto delaet doPost na kazhduyu zayavku:
 *   1. pishet stroku v Google Sheets (vkladka "Zayavki", sozdaetsya sama);
 *   2. otpravlyaet kopiyu zayavki pismom na LEAD_EMAIL;
 *   3. dubliruet zayavku v Telegram, esli brauzer ne otpravil ee sam (tgSent).
 *
 * ??? USTANOVKA (odin raz) ????????????????????????????????????????????????
 * 1. Otkroyte vash Apps Script (v tablice: Rasshireniya -> Apps Script).
 * 2. Zamenite ves kod etim faylom.
 * 3. Proverte BOT_TOKEN i CHAT_ID nizhe (te zhe, chto na sayte).
 * 4. Deploy -> Manage deployments -> otkroyte tekuschiy deploy na redaktirovanie ()
 *    -> Version: New version -> Deploy.  Ostavte Execute as: Me,
 *    Who has access: Anyone.  URL /exec ostanetsya prezhnim - na sayte menyat
 *    nichego ne nuzhno.
 * 5. Pri pervom zapuske Google poprosit razreshit dostup (k tablice, pochte i
 *    vneshnim zaprosam) - razreshite. Pisma uhodyat s togo Google-akkaunta,
 *    pod kotorym skript.
 */

// Sekrety chitaem iz Script Properties (Project Settings -> Script Properties),
// chtoby ne derzhat ih v publichnom repozitorii. Folbek na prezhnie znacheniya
// ostavlen, chtoby posle zameny koda vse prodolzhalo rabotat bez nastroyki.
//
// VAZhNO pered Production (F1): tekuschiy token uzhe publichen (lezhal v repozitorii i
// v klientskom JS) - otzovite ego u @BotFather (/revoke), vypustite novyy,
// polozhite v Script Property BOT_TOKEN i udalite folbek-stroku nizhe.
var _PROPS = PropertiesService.getScriptProperties();
function _prop_(k, fallback) {
  var v = _PROPS.getProperty(k);
  return (v === null || v === '') ? fallback : v;
}

// Kuda dublirovat zayavki na pochtu (mozhno ukazat neskolko cherez zapyatuyu).
var LEAD_EMAIL = _prop_('LEAD_EMAIL', 'alekyan.razmik@gmail.com');

// Telegram-bot dlya rezervnoy dostavki zayavok (kogda brauzer klienta ne smog
// dostuchatsya do api.telegram.org sam).
var BOT_TOKEN = _prop_('BOT_TOKEN', '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg');
var CHAT_ID = _prop_('CHAT_ID', '523060537');

var COLUMNS = [
  '\u0414\u0430\u0442\u0430', '\u0422\u0438\u043f', '\u0421\u0435\u0440\u0432\u0438\u0441', '\u0422\u0430\u0440\u0438\u0444/\u041f\u043b\u0430\u043d', '\u0421\u0443\u043c\u043c\u0430', '\u0418\u043c\u044f', '\u0422\u0435\u043b\u0435\u0444\u043e\u043d',
  '\u0421\u043f\u043e\u0441\u043e\u0431 \u0441\u0432\u044f\u0437\u0438', '\u041a\u043e\u043d\u0442\u0430\u043a\u0442', '\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435', '\u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b', '\u0421\u0440\u043e\u043a',
  '\u0424\u0430\u0439\u043b', '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439', '\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430', '\u0418\u043d\u0442\u0435\u043d\u0442'
];

function doPost(e) {
  var out = { ok: true, sheet: false, email: false };
  try {
    var data = (e && e.postData && e.postData.contents)
      ? JSON.parse(e.postData.contents) : {};
    if (!data || typeof data !== 'object') data = {};

    // Honeypot (F2): skrytoe pole, kotoroe zapolnyayut tolko boty. Tiho
    // podtverzhdaem i vyhodim - nichego ne pishem i ne rassylaem.
    if (data.company) return json({ ok: true });

    // Myagkiy predohranitel ot fluda (F2): pri vspleske my PRODOLZhAEM pisat
    // zayavku v tablicu (eto deshevo i ne teryaet lid), no propuskaem rassylku v
    // pochtu/Telegram, chtoby ne vyzhech sutochnuyu kvotu MailApp atakoy.
    var throttled = isFlooding_();

    // Otzyv s sayta - otdelnaya vetka: pishem vo vkladku "Otzyvy" (na
    // moderacii), uvedomlyaem na pochtu i v Telegram. V "Zayavki" ne pishem.
    if (data.type === 'review') {
      try { out.sheet = appendReview(data); } catch (se) { out.sheetError = String(se); }
      if (throttled) { out.throttled = true; return json(out); }
      try { out.email = sendReviewEmail(data); } catch (me) { out.emailError = String(me); }
      try { if (!data.tgSent) out.telegram = sendReviewTelegram(data); } catch (te) { out.telegramError = String(te); }
      return json(out);
    }

    try { out.sheet = appendRow(data); } catch (se) { out.sheetError = String(se); }
    if (throttled) { out.throttled = true; return json(out); }
    try { out.email = sendEmailCopy(data); } catch (me) { out.emailError = String(me); }
    // Dubliruem v Telegram, tolko esli brauzer ne smog otpravit sam.
    try {
      if (!data.tgSent) out.telegram = sendTelegram(data);
    } catch (te) { out.telegramError = String(te); }
  } catch (err) {
    out.ok = false;
    out.error = String(err);
  }
  return json(out);
}

// GET:
//   ? /exec                       -> health check {ok:true,...}
//   ? /exec?reviews=1             -> JSON odobrennyh otzyvov
//   ? /exec?reviews=1&callback=fn -> to zhe, no JSONP (dlya stranicy /reviews/)
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

  // F4: serializuem zapis, inache dve odnovremennye zayavki mogut obe voyti v
  // vetku sozdaniya lista (vtoraya upadet "sheet already exists" -> lid poteryan).
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { /* ne vzyali lok - pishem best-effort */ }
  try {
    var sheet = ss.getSheetByName('\u0417\u0430\u044f\u0432\u043a\u0438');
    if (!sheet) {
      sheet = ss.insertSheet('\u0417\u0430\u044f\u0432\u043a\u0438');
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
      safeCell_(pick('type', 'source')),
      safeCell_(pick('service')),
      safeCell_(pick('tier', 'plan')),
      safeCell_(pick('price', 'amount')),
      safeCell_(pick('name')),
      safeCell_(pick('phone')),
      safeCell_(pick('channel')),
      safeCell_(pick('contact')),
      safeCell_(pick('purpose')),
      safeCell_(pick('bank')),
      safeCell_(pick('deadline')),
      safeCell_(pick('file')),
      safeCell_(pick('note')),
      safeCell_(pick('page', 'host')),
      safeCell_(pick('intent'))
    ]);
    return true;
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function sendEmailCopy(d) {
  if (!LEAD_EMAIL || !d || typeof d !== 'object') return false;

  var labels = {
    type: '\u0422\u0438\u043f', source: '\u0422\u0438\u043f', service: '\u0421\u0435\u0440\u0432\u0438\u0441', tier: '\u0422\u0430\u0440\u0438\u0444', plan: '\u0422\u0430\u0440\u0438\u0444/\u041f\u043b\u0430\u043d',
    price: '\u0421\u0443\u043c\u043c\u0430', amount: '\u0421\u0443\u043c\u043c\u0430', currency: '\u0412\u0430\u043b\u044e\u0442\u0430', name: '\u0418\u043c\u044f', phone: '\u0422\u0435\u043b\u0435\u0444\u043e\u043d',
    channel: '\u0421\u043f\u043e\u0441\u043e\u0431 \u0441\u0432\u044f\u0437\u0438', contact: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442', purpose: '\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435', bank: '\u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b',
    deadline: '\u0421\u0440\u043e\u043a', file: '\u0424\u0430\u0439\u043b', note: '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439', page: '\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430', host: '\u0421\u0430\u0439\u0442',
    intent: '\u0418\u043d\u0442\u0435\u043d\u0442'
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
  var subject = '\u0417\u0430\u044f\u0432\u043a\u0430 \u0441 \u0441\u0430\u0439\u0442\u0430 PlataPay' + (tag ? ' \u2014 ' + tag : '');
  MailApp.sendEmail(LEAD_EMAIL, subject, lines.join('\n'), { name: 'PlataPay \u0441\u0430\u0439\u0442' });
  return true;
}

// Rezervnaya dostavka zayavki v Telegram silami Google-servera (kogda pryamaya
// otpravka iz brauzera klienta ne proshla - naprimer, provayder v RF blokiruet
// api.telegram.org). Vozvraschaet true pri uspeshnoy dostavke.
function sendTelegram(d) {
  if (!BOT_TOKEN || !CHAT_ID || !d || typeof d !== 'object') return false;

  var labels = {
    type: '\u0422\u0438\u043f', source: '\u0422\u0438\u043f', service: '\u0421\u0435\u0440\u0432\u0438\u0441', tier: '\u0422\u0430\u0440\u0438\u0444', plan: '\u0422\u0430\u0440\u0438\u0444/\u041f\u043b\u0430\u043d',
    price: '\u0421\u0443\u043c\u043c\u0430', amount: '\u0421\u0443\u043c\u043c\u0430', currency: '\u0412\u0430\u043b\u044e\u0442\u0430', name: '\u0418\u043c\u044f', phone: '\u0422\u0435\u043b\u0435\u0444\u043e\u043d',
    channel: '\u0421\u043f\u043e\u0441\u043e\u0431 \u0441\u0432\u044f\u0437\u0438', contact: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442', purpose: '\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435', bank: '\u0420\u0435\u043a\u0432\u0438\u0437\u0438\u0442\u044b',
    deadline: '\u0421\u0440\u043e\u043a', file: '\u0424\u0430\u0439\u043b', note: '\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439', intent: '\u0418\u043d\u0442\u0435\u043d\u0442'
  };
  var order = ['type', 'source', 'service', 'tier', 'plan', 'price', 'amount', 'currency',
    'name', 'phone', 'channel', 'contact', 'purpose', 'bank', 'deadline', 'file', 'note',
    'intent'];

  var lines = ['\u0417\u0430\u044f\u0432\u043a\u0430 \u0441 \u0441\u0430\u0439\u0442\u0430 PlataPay'];
  for (var i = 0; i < order.length; i++) {
    var k = order[i];
    if (d[k] !== undefined && d[k] !== null && d[k] !== '' && labels[k]) {
      lines.push(labels[k] + ': ' + d[k]);
    }
  }
  var page = d.page || d.host;
  if (page) {
    lines.push('\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430: ' + (String(page).indexOf('http') === 0
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

// ??????????????????????????? OTZYVY ????????????????????????????????????
// Vkladka "Otzyvy". Kolonki:
//   Data | Imya | Ocenka | Otzyv | Pokazyvat | Stranica
// "Pokazyvat" - moderaciya: otzyv poyavlyaetsya na sayte (/reviews/) tolko
// kogda v etoy kolonke stoit "da" (takzhe podhodyat yes/true/1/v/x/da).
var REVIEW_SHEET = '\u041e\u0442\u0437\u044b\u0432\u044b';
var REVIEW_COLUMNS = ['\u0414\u0430\u0442\u0430', '\u0418\u043c\u044f', '\u041e\u0446\u0435\u043d\u043a\u0430', '\u041e\u0442\u0437\u044b\u0432', '\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c', '\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430'];
var RU_MONTHS = ['\u044f\u043d\u0432\u0430\u0440\u044f', '\u0444\u0435\u0432\u0440\u0430\u043b\u044f', '\u043c\u0430\u0440\u0442\u0430', '\u0430\u043f\u0440\u0435\u043b\u044f', '\u043c\u0430\u044f', '\u0438\u044e\u043d\u044f',
  '\u0438\u044e\u043b\u044f', '\u0430\u0432\u0433\u0443\u0441\u0442\u0430', '\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f', '\u043e\u043a\u0442\u044f\u0431\u0440\u044f', '\u043d\u043e\u044f\u0431\u0440\u044f', '\u0434\u0435\u043a\u0430\u0431\u0440\u044f'];

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
  var name = String(d.name || '').slice(0, 60);
  var text = String(d.text || '').slice(0, 1000);
  if (!name || !text) return false;

  // F4: ta zhe serializaciya, chto i dlya zayavok (sozdanie vkladki + zapis).
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { /* best-effort */ }
  try {
    var sheet = reviewSheet_();
    if (!sheet) return false;
    sheet.appendRow([
      new Date(),
      safeCell_(name),
      clampStars_(d.stars),
      safeCell_(text),
      '',                              // Pokazyvat - pusto = na moderacii
      safeCell_(String(d.page || d.host || ''))
    ]);
    return true;
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function isApproved_(v) {
  var s = String(v == null ? '' : v).trim().toLowerCase();
  return s === '\u0434\u0430' || s === 'yes' || s === 'true' || s === '1'
    || s === '\u2713' || s === 'x' || s === '\u0445' || s === '+';
}

function ruDate_(d) {
  try {
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.getDate() + ' ' + RU_MONTHS[dt.getMonth()];
  } catch (e) { return ''; }
}

// Vozvraschaet odobrennye otzyvy, svezhie sverhu.
// F6: rezultat keshiruetsya na 5 minut - publichnyy doGet inache chital by ves
// list na kazhduyu zagruzku /reviews/. Odobrennyy otzyv poyavlyaetsya na sayte v
// techenie ~5 minut (dlya moderacii priemlemo).
function getApprovedReviews() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('approved_reviews');
  if (hit) { try { return JSON.parse(hit); } catch (e) {} }

  var sheet = reviewSheet_();
  if (!sheet) return [];
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, REVIEW_COLUMNS.length).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!isApproved_(r[4])) continue;          // kolonka "Pokazyvat"
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
  out.reverse();                                 // novye sverhu
  try { cache.put('approved_reviews', JSON.stringify(out), 300); } catch (e) {}
  return out;
}

function sendReviewEmail(d) {
  if (!LEAD_EMAIL || !d) return false;
  var body = [
    '\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0437\u044b\u0432 \u0441 \u0441\u0430\u0439\u0442\u0430 PlataPay (\u043d\u0430 \u043c\u043e\u0434\u0435\u0440\u0430\u0446\u0438\u0438).',
    '',
    '\u0418\u043c\u044f: ' + (d.name || ''),
    '\u041e\u0446\u0435\u043d\u043a\u0430: ' + clampStars_(d.stars) + '/5',
    '\u041e\u0442\u0437\u044b\u0432: ' + (d.text || ''),
    '\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430: ' + (d.page || ''),
    '',
    '\u0427\u0442\u043e\u0431\u044b \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c \u2014 \u043f\u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u00ab\u0434\u0430\u00bb \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c\u00bb \u043d\u0430 \u0432\u043a\u043b\u0430\u0434\u043a\u0435 \u00ab\u041e\u0442\u0437\u044b\u0432\u044b\u00bb.'
  ].join('\n');
  MailApp.sendEmail(LEAD_EMAIL, '\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0437\u044b\u0432 \u043d\u0430 \u0441\u0430\u0439\u0442\u0435 PlataPay', body, { name: 'PlataPay \u0441\u0430\u0439\u0442' });
  return true;
}

function sendReviewTelegram(d) {
  if (!BOT_TOKEN || !CHAT_ID || !d) return false;
  var text = [
    '\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0437\u044b\u0432 \u043d\u0430 \u0441\u0430\u0439\u0442\u0435 PlataPay (\u043d\u0430 \u043c\u043e\u0434\u0435\u0440\u0430\u0446\u0438\u0438)',
    '\u0418\u043c\u044f: ' + (d.name || ''),
    '\u041e\u0446\u0435\u043d\u043a\u0430: ' + clampStars_(d.stars) + '/5',
    '\u041e\u0442\u0437\u044b\u0432: ' + (d.text || ''),
    '\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c: \u043f\u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u00ab\u0434\u0430\u00bb \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c\u00bb (\u0432\u043a\u043b\u0430\u0434\u043a\u0430 \u00ab\u041e\u0442\u0437\u044b\u0432\u044b\u00bb).'
  ].join('\n');
  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: CHAT_ID, text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true
  });
  return resp.getResponseCode() === 200;
}

// F3: neytralizuet znacheniya, kotorye Google Sheets mog by ispolnit kak
// formulu (=, +, -, @, tab, CR). Apostrof Sheets skryvaet pri otobrazhenii,
// poetomu vladelec vidit ishodnyy tekst, no formula ne vypolnitsya. Chisla i
// daty (ne stroki) vozvraschayutsya kak est - tip i format ne menyayutsya.
function safeCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string') return v;
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

// F2: priblizitelnyy globalnyy limit zaprosov ~45/min na ves sayt.
// Klyuch privyazan k minutnomu oknu po stennym chasam (rl_<minuta>), poetomu TTL
// ne "prodlevaetsya" na kazhdom zaprose i schetchik kazhduyu minutu startuet zanovo
// (inache pod nepreryvnym trafikom on nakaplivalsya by i navsegda "zalipal",
// glusha uvedomleniya). Vzyatie/zapis ne atomarny - eto osoznanno "myagkiy"
// limit. Porog mozhno podnyat pri roste legitimnogo trafika.
function isFlooding_() {
  try {
    var c = CacheService.getScriptCache();
    var key = 'rl_' + Math.floor(Date.now() / 60000);
    var n = parseInt(c.get(key) || '0', 10) + 1;
    c.put(key, String(n), 120);                  // okno zhivet ~2 min i samo istekaet
    return n > 45;                               // ~45 zaprosov/min na ves sayt
  } catch (e) {
    return false;                                // kesh nedostupen - ne meshaem zayavke
  }
}

// ??? SAMOPROVERKA DOSTAVKI (zapustite vruchnuyu iz redaktora) ???????????
// Zachem: zayavka pishetsya v Google Sheets, no NE prihodit ni na pochtu, ni v
// Telegram - eto klassicheskiy priznak, chto skript ne poluchil razreshenie na
// otpravku pochty (MailApp) i vneshnie zaprosy (UrlFetchApp), libo opublikovana
// staraya versiya. Etot test razom i vydaet zapros na razreshenie, i pokazyvaet,
// chto imenno lomaetsya.
//
// KAK ZAPUSTIT:
//   1. V redaktore Apps Script sverhu vyberite funkciyu "pp_selftest".
//   2. Nazhmite Run (Zapustit).
//   3. Pri pervom zapuske Google poprosit razreshit dostup - razreshite VSE
//      (tablica, otpravka pochty ot vashego imeni, podklyuchenie k vneshnim
//      servisam). Bez etogo pochta i Telegram rabotat ne budut.
//   4. Posmotrite rezultat: na pochtu LEAD_EMAIL i v Telegram CHAT_ID dolzhno
//      priyti soobschenie "PlataPay selftest". Podrobnosti - v View -> Logs.
//
// Rezultat (vozvraschaemyy obekt i log):
//   email:true / telegram:true   - dostavka rabotaet. Ostalos tolko OPUBLIKOVAT
//                                   novuyu versiyu: Deploy -> Manage deployments
//                                   -> karandash -> Version: New version -> Deploy.
//   emailError / telegramError   - tekst oshibki (naprimer, net razresheniya ili
//                                   nevernyy token) - po nemu vidno, chto chinit.
function pp_selftest() {
  var probe = {
    type: 'TEST', service: 'PlataPay selftest', tier: 'proverka dostavki',
    name: 'selftest', contact: 'pp_selftest', channel: 'Telegram',
    page: '/selftest', intent: 'selftest'
  };
  var res = {
    mailTo: LEAD_EMAIL,
    botPrefix: String(BOT_TOKEN).slice(0, 12) + '...',
    chatId: CHAT_ID,
    email: null, emailError: null,
    telegram: null, telegramError: null
  };
  try { res.email = sendEmailCopy(probe); } catch (e) { res.emailError = String(e); }
  try { res.telegram = sendTelegram(probe); } catch (e) { res.telegramError = String(e); }
  Logger.log(JSON.stringify(res, null, 2));
  return res;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// JSONP - stranica /reviews/ gruzit odobrennye otzyvy cherez <script>, potomu
// chto Apps Script ne otdaet CORS-zagolovki dlya obychnogo fetch.
function jsonp(callback, obj) {
  var safe = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
  return ContentService
    .createTextOutput(safe + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
