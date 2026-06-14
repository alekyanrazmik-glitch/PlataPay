// Code injected into every Tilda page right before </body>:
//   1. Replaces the heavy 12-field #popupforma modal with a compact
//      two-line mini form that posts straight to the Telegram bot
//      and Google Sheets.
//   2. Adds an autocomplete dropdown to the hero search input so
//      typing "chat" / "spot" / "ado" surfaces the matching service
//      and links to its SEO landing page.

import { SERVICES } from './data.mjs';

const BOT = '8842294846:AAEYOKRa-M80_fnZGu1Qk_fbmB7fknIR8UE';
const CHAT = '523060537';
const SHEETS =
  'https://script.google.com/macros/s/AKfycbyy43Ff5kKivrUsaXWEkda7JXNwHrOI-3BJIJp3UG9H8K6cb4DxjpC8eXNPGNEXQEWt/exec';

export function buildEnhancement(baseHref) {
  // Trim services to only the fields the injected JS needs — keeps the
  // inlined payload small. ~98 entries * ~80 bytes ~ 8 KB.
  const slim = SERVICES.map((s) => ({
    n: s.name,
    s: s.slug,
    c: s.cat,
    l: s.logo,
  }));

  return `
<style>
  .pp-mm-mask{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;}
  .pp-mm-mask[hidden]{display:none;}
  .pp-mm-modal{position:relative;background:linear-gradient(180deg,#0c1f40,#13294e);border:1px solid #1d3a6b;border-radius:18px;padding:28px;max-width:480px;width:100%;color:#eef3ff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',system-ui,sans-serif;margin:auto;}
  .pp-mm-modal h3{margin:0 0 6px;font-size:22px;font-weight:600;}
  .pp-mm-modal .pp-mm-sub{color:#9fb2d4;font-size:14px;margin:0 0 18px;}
  .pp-mm-modal label{display:block;font-size:12px;color:#9fb2d4;margin:12px 0 6px;}
  .pp-mm-modal input{width:100%;background:#08172F;border:1px solid #1d3a6b;color:#eef3ff;border-radius:10px;padding:12px 14px;font-size:15px;box-sizing:border-box;font-family:inherit;}
  .pp-mm-modal input:focus{outline:none;border-color:#2e7bff;}
  .pp-mm-modal button.pp-mm-go{width:100%;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;border:none;border-radius:10px;padding:14px;font-weight:600;font-size:16px;cursor:pointer;margin-top:18px;font-family:inherit;}
  .pp-mm-modal button.pp-mm-go:hover{filter:brightness(1.08);}
  .pp-mm-modal button.pp-mm-go:disabled{opacity:.6;cursor:wait;}
  .pp-mm-modal .pp-mm-close{position:absolute;top:12px;right:12px;background:transparent;border:none;color:#9fb2d4;font-size:22px;cursor:pointer;width:32px;height:32px;border-radius:50%;}
  .pp-mm-modal .pp-mm-close:hover{background:#13294e;color:#fff;}
  .pp-mm-modal .pp-mm-alt{margin-top:16px;font-size:13px;color:#8499c0;text-align:center;}
  .pp-mm-modal .pp-mm-alt a{color:#2e7bff;text-decoration:none;}
  .pp-mm-modal .pp-mm-err{color:#ff8d8d;font-size:13px;margin-top:10px;text-align:center;}
  .pp-mm-modal .pp-mm-ok{text-align:center;padding:16px 0 8px;}
  .pp-mm-modal .pp-mm-ok h3{color:#22C55E;}
  .pp-mm-modal .pp-mm-consent{margin-top:14px;font-size:12px;color:#8499c0;text-align:center;}
  .pp-mm-modal .pp-mm-consent a{color:#7BAEFF;}

  /* autocomplete dropdown */
  /* The input we wrap had flex:1 inside the flex search form; mirror it
     here so the field still fills the row and the button stays on the
     right instead of collapsing toward the middle. */
  .pp-ac-wrap{position:relative;flex:1 1 auto;min-width:0;}
  .pp-ac-drop{position:absolute;left:0;right:0;top:calc(100% + 8px);background:#0c1f40;border:1px solid #1d3a6b;border-radius:12px;max-height:360px;overflow:auto;z-index:200;display:none;box-shadow:0 24px 60px -20px rgba(0,0,0,.6);}
  .pp-ac-drop[data-open="1"]{display:block;}
  .pp-ac-item{display:flex;align-items:center;gap:12px;padding:10px 14px;cursor:pointer;color:#eef3ff;font-size:14px;border-bottom:1px solid #16315f;text-decoration:none;}
  .pp-ac-item:last-child{border-bottom:none;}
  .pp-ac-item:hover,.pp-ac-item[data-active="1"]{background:#13294e;color:#eef3ff;}
  .pp-ac-item img{width:24px;height:24px;border-radius:4px;background:#fff;padding:2px;object-fit:contain;flex-shrink:0;}
  .pp-ac-item .pp-ac-meta{color:#8499c0;font-size:12px;margin-left:auto;}
  .pp-ac-empty{padding:14px;color:#8499c0;font-size:13px;text-align:center;}

  /* hide tilda popupforma — we use our own */
  #popupforma.t-popup,#popupforma{display:none !important;}
</style>

<div class="pp-mm-mask" id="pp-mm" hidden role="dialog" aria-modal="true">
  <div class="pp-mm-modal">
    <button class="pp-mm-close" aria-label="Закрыть">×</button>
    <h3>Оплатить сервис</h3>
    <p class="pp-mm-sub">Оставьте контакт — ответим в течение 5–15 минут.</p>
    <div class="pp-mm-body">
      <label for="pp-mm-srv">Какой сервис нужно оплатить?</label>
      <input type="text" id="pp-mm-srv" placeholder="ChatGPT, Spotify, Adobe…" autocomplete="off">
      <label for="pp-mm-ctc">Телефон, Telegram или email</label>
      <input type="text" id="pp-mm-ctc" placeholder="+7 999 123-45-67 или @username" autocomplete="off">
      <div class="pp-mm-err" id="pp-mm-err" hidden></div>
      <button class="pp-mm-go" id="pp-mm-go">Оплатить</button>
      <div class="pp-mm-alt">
        или напрямую:
        <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener">Telegram</a> ·
        <a href="https://wa.me/79676726909" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <div class="pp-mm-consent">Нажимая «Оплатить», вы соглашаетесь с <a href="#popuppolicy">политикой обработки данных</a>.</div>
    </div>
  </div>
</div>

<script>
(function(){
  var SERVICES = ${JSON.stringify(slim)};
  var BOT = '${BOT}';
  var CHAT = '${CHAT}';
  var SHEETS = '${SHEETS}';
  var LOGO_BASE = 'https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/';
  var BASE = '${baseHref}';

  // -------- Mini form override --------
  var mask = document.getElementById('pp-mm');
  var modal = mask.querySelector('.pp-mm-modal');
  var bodyEl = mask.querySelector('.pp-mm-body');
  var srv = document.getElementById('pp-mm-srv');
  var ctc = document.getElementById('pp-mm-ctc');
  var err = document.getElementById('pp-mm-err');
  var btn = document.getElementById('pp-mm-go');

  function openMini(prefill){
    if (prefill) srv.value = prefill;
    mask.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ (prefill ? ctc : srv).focus(); }, 50);
  }
  function closeMini(){
    mask.hidden = true;
    document.body.style.overflow = '';
  }
  mask.querySelector('.pp-mm-close').addEventListener('click', closeMini);
  mask.addEventListener('click', function(e){ if (e.target === mask) closeMini(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !mask.hidden) closeMini(); });

  // Intercept every link that targets the legacy popup, in capture
  // phase so we run before Tilda's own click handler.
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href*="#popupforma"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    // Try to detect the service from the surrounding card so the user
    // doesn't have to retype the name.
    var card = a.closest('.t-card, .t-row, .t-col');
    var hint = '';
    if (card) {
      var n = card.querySelector('.t-name, .t-card__title, .tn-atom__title, h3, h4');
      if (n) hint = n.textContent.trim();
    }
    openMini(hint);
  }, true);

  btn.addEventListener('click', function(){
    err.hidden = true;
    var sv = srv.value.trim();
    var cv = ctc.value.trim();
    if (!sv) { err.textContent='Укажите сервис'; err.hidden=false; srv.focus(); return; }
    if (cv.length < 4) { err.textContent='Введите контакт — телефон, @username или email'; err.hidden=false; ctc.focus(); return; }
    btn.disabled = true; btn.textContent = 'Отправляем…';

    var msg = [
      'Заявка с сайта PlataPay',
      'Сервис: ' + sv,
      'Контакт: ' + cv,
      'Страница: https://payoplata.ru' + location.pathname,
    ].join('\\n');

    var tg = fetch('https://api.telegram.org/bot' + BOT + '/sendMessage', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id:CHAT, text:msg, parse_mode:'HTML', disable_web_page_preview:true})
    }).then(function(r){return r.ok;}).catch(function(){return false;});

    var sh = fetch(SHEETS, {
      method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({source:'main', service:sv, contact:cv, page:location.pathname, ts:Date.now()})
    }).then(function(){return true;}).catch(function(){return false;});

    Promise.all([tg, sh]).then(function(r){
      if (r[0] || r[1]) {
        bodyEl.innerHTML = '<div class="pp-mm-ok"><h3>Заявка принята</h3><p style="color:#cfd9ef;margin:0;">Свяжемся в течение 5–15 минут. Если срочно — <a href="https://t.me/Kimzar_A" target="_blank" style="color:#2e7bff;">@Kimzar_A</a>.</p></div>';
        if (window.ym) window.ym(109522965, 'reachGoal', 'main_order');
      } else {
        err.textContent = 'Не удалось отправить. Напишите в Telegram: @Kimzar_A';
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = 'Оплатить';
      }
    });
  });

  // -------- Animated placeholder (typewriter) --------
  // Cycles service names in the search placeholder. Driven by a single
  // self-rescheduling setTimeout chain so there is never more than one
  // pending tick — no overlapping timers, no scrambled text. Pauses
  // while the field is focused or has a value, and is skipped entirely
  // for users who prefer reduced motion.
  var PH_WORDS = ['ChatGPT','Spotify','YouTube Premium','Adobe','Midjourney','Notion','Discord','Steam','Canva','Claude','Booking'];

  function animatePlaceholder(input){
    if (input.dataset.ppPh) return;       // never start twice on one input
    input.dataset.ppPh = '1';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;                    // keep the static placeholder

    var staticPH = input.getAttribute('placeholder') || 'Название сервиса';
    var wi = 0, ci = 0, deleting = false, timer = null;

    function set(text){ input.setAttribute('placeholder', text); }
    function tick(){
      var word = PH_WORDS[wi];
      if (!deleting){
        ci++;
        set(word.slice(0, ci));
        if (ci >= word.length){ deleting = true; timer = setTimeout(tick, 1500); return; }
        timer = setTimeout(tick, 95);
      } else {
        ci--;
        set(word.slice(0, ci));
        if (ci <= 0){ deleting = false; wi = (wi + 1) % PH_WORDS.length; timer = setTimeout(tick, 450); return; }
        timer = setTimeout(tick, 45);
      }
    }
    function start(){ if (timer) return; tick(); }
    function stop(){ if (timer){ clearTimeout(timer); timer = null; } }

    input.addEventListener('focus', function(){ stop(); set(staticPH); });
    input.addEventListener('blur', function(){
      if (!input.value.trim()){ wi = 0; ci = 0; deleting = false; start(); }
    });
    if (document.activeElement !== input) start();
  }

  // -------- Search autocomplete --------
  function norm(s){ return s.toLowerCase().replace(/[\\s\\-_]/g, ''); }

  function searchServices(q){
    if (!q || q.length < 2) return [];
    var nq = norm(q);
    var starts = [], contains = [];
    for (var i=0; i<SERVICES.length; i++) {
      var s = SERVICES[i];
      var n = norm(s.n);
      if (n.indexOf(nq) === 0) starts.push(s);
      else if (n.indexOf(nq) > -1 || norm(s.s).indexOf(nq) > -1) contains.push(s);
    }
    return starts.concat(contains).slice(0, 8);
  }

  function attachAutocomplete(input){
    if (input.dataset.ppAc) return;
    input.dataset.ppAc = '1';
    input.setAttribute('autocomplete', 'off');

    var wrap = document.createElement('div');
    wrap.className = 'pp-ac-wrap';
    var parent = input.parentNode;
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);

    var drop = document.createElement('div');
    drop.className = 'pp-ac-drop';
    wrap.appendChild(drop);

    var matches = [];
    var active = -1;

    function render(){
      if (!matches.length) {
        if (input.value.trim().length >= 2) {
          drop.innerHTML = '<div class="pp-ac-empty">Ничего не нашли — оставьте заявку, всё равно поможем</div>';
          drop.dataset.open = '1';
        } else {
          drop.dataset.open = '';
        }
        return;
      }
      var html = '';
      for (var i=0; i<matches.length; i++) {
        var s = matches[i];
        html += '<a class="pp-ac-item" href="' + BASE + 'oplata-' + s.s + '/" data-idx="' + i + '"' + (i===active?' data-active="1"':'') + '>';
        html += '<img src="' + LOGO_BASE + s.l + '" alt="" onerror="this.style.visibility=\\'hidden\\'">';
        html += '<span>' + s.n + '</span>';
        html += '<span class="pp-ac-meta">' + s.c + '</span>';
        html += '</a>';
      }
      drop.innerHTML = html;
      drop.dataset.open = '1';
    }

    input.addEventListener('input', function(){
      matches = searchServices(input.value.trim());
      active = -1;
      render();
    });
    input.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown') {
        if (matches.length) { active = Math.min(active + 1, matches.length - 1); e.preventDefault(); render(); }
      } else if (e.key === 'ArrowUp') {
        if (matches.length) { active = Math.max(active - 1, 0); e.preventDefault(); render(); }
      } else if (e.key === 'Enter') {
        if (active >= 0 && matches[active]) {
          e.preventDefault();
          location.href = BASE + 'oplata-' + matches[active].s + '/';
        }
      } else if (e.key === 'Escape') {
        drop.dataset.open = '';
      }
    });
    input.addEventListener('focus', function(){
      if (input.value.trim().length >= 2) {
        matches = searchServices(input.value.trim());
        render();
      }
    });
    document.addEventListener('click', function(e){
      if (!wrap.contains(e.target)) drop.dataset.open = '';
    });

    animatePlaceholder(input);
  }

  function wireSearch(){
    // Hero search on home page submits to /catalog with name="q".
    // Catalog page has its own #ppSearch input. Both qualify.
    var inputs = document.querySelectorAll('input[name="q"], #ppSearch, input[placeholder*="ChatGPT"], input[placeholder*="Найти"]');
    for (var i=0; i<inputs.length; i++) attachAutocomplete(inputs[i]);
  }

  // Tilda renders some inputs after DOMContentLoaded — try a few times.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSearch);
  } else {
    wireSearch();
  }
  setTimeout(wireSearch, 500);
  setTimeout(wireSearch, 1500);
})();
</script>
`;
}
