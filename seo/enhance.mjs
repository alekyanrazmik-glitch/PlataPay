// Code injected into every Tilda page right before </body>:
//   1. Replaces the heavy 12-field #popupforma modal with a compact
//      two-line mini form that posts straight to the Telegram bot
//      and Google Sheets.
//   2. Adds an autocomplete dropdown to the hero search input so
//      typing "chat" / "spot" / "ado" surfaces the matching service
//      and links to its SEO landing page.

import { SERVICES } from './data.mjs';

export function buildEnhancement(baseHref) {
  // Trim services to only the fields the injected JS needs — keeps the
  // inlined payload small. ~98 entries * ~90 bytes ~ 9 KB.
  const slim = SERVICES.map((s) => ({
    n: s.name,
    s: s.slug,
    c: s.cat,
    l: s.logo,
    p: s.price || 0,  // starting price in RUB for payment auto-fill
  }));

  return `
<style id="pp-mobile-hardening">
  /* Kill horizontal scroll site-wide and keep media within the viewport.
     position:relative + width:100% on body is required for iOS Safari to
     actually clamp horizontal overflow — overflow-x:hidden alone lets the
     page shift right with clipped edges. overflow-x:clip is a stronger
     modern fallback that does not create a scroll container. */
  html{overflow-x:hidden;overflow-x:clip;}
  body{max-width:100%;width:100%;position:relative;overflow-x:hidden;overflow-x:clip;}
  img,svg,video{max-width:100%;height:auto;}
  /* No grey tap flash on touch controls */
  .pp-cat,.pp-card a,.pp-pay a,.pp-cta a{-webkit-tap-highlight-color:transparent;}
  @media(max-width:768px){
    .pp-cats{display:flex;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
    .pp-cats::-webkit-scrollbar{display:none;}
    .pp-cat{flex:0 0 auto;white-space:nowrap;min-height:40px;display:inline-flex;align-items:center;}
    .pp-sec-grid{grid-template-columns:1fr !important;}
    .pp-card{width:100% !important;max-width:100% !important;}
    .pp-card a,.pp-pay a,.pp-cta a{min-height:44px;display:inline-flex;align-items:center;}
    .pp-search{width:100% !important;max-width:100% !important;}
    /* 16px input font stops iOS Safari from auto-zooming the page */
    .pp-search input{min-height:44px;font-size:16px;}
  }
  /* PlataPay mini-form modal as a bottom sheet on phones */
  @media(max-width:520px){
    .pp-mm-mask{align-items:flex-end !important;padding:0 !important;}
    .pp-mm-modal{max-width:100% !important;border-radius:20px 20px 0 0 !important;margin:0 !important;padding-bottom:calc(24px + env(safe-area-inset-bottom)) !important;}
  }
</style>
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
  .pp-ac-wrap{position:relative;}
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
    <p class="pp-mm-sub">Укажите сервис, сумму и контакт — счёт создаётся автоматически.</p>
    <div class="pp-mm-body">
      <label for="pp-mm-srv">Какой сервис нужно оплатить?</label>
      <input type="text" id="pp-mm-srv" placeholder="ChatGPT, Spotify, Adobe…" autocomplete="off">
      <label for="pp-mm-amt">Сумма оплаты, ₽</label>
      <input type="number" id="pp-mm-amt" placeholder="например, 3200" min="100" step="1">
      <label for="pp-mm-ctc">Telegram, телефон или email</label>
      <input type="text" id="pp-mm-ctc" placeholder="+7 999 123-45-67 или @username" autocomplete="off">
      <div class="pp-mm-err" id="pp-mm-err" hidden></div>
      <button class="pp-mm-go" id="pp-mm-go">Перейти к оплате</button>
      <div class="pp-mm-alt">
        или напрямую:
        <a href="https://t.me/Kimzar_A" target="_blank" rel="noopener">Telegram</a> ·
        <a href="https://wa.me/79676726909" target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <div class="pp-mm-consent">Нажимая «Перейти к оплате», вы соглашаетесь с <a href="#popuppolicy">политикой обработки данных</a>.</div>
    </div>
  </div>
</div>

<script>
(function(){
  var SERVICES = ${JSON.stringify(slim)};
  var LOGO_BASE = 'https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/';
  var BASE = '${baseHref}';

  // -------- Mini form override --------
  var mask  = document.getElementById('pp-mm');
  var modal = mask.querySelector('.pp-mm-modal');
  var bodyEl = mask.querySelector('.pp-mm-body');
  var srv   = document.getElementById('pp-mm-srv');
  var amtEl = document.getElementById('pp-mm-amt');
  var ctc   = document.getElementById('pp-mm-ctc');
  var err   = document.getElementById('pp-mm-err');
  var btn   = document.getElementById('pp-mm-go');

  // Build a price lookup map from the inlined SERVICES array
  var PRICE_MAP = {};
  for (var _pi = 0; _pi < SERVICES.length; _pi++) {
    if (SERVICES[_pi].p) PRICE_MAP[SERVICES[_pi].n.toLowerCase()] = SERVICES[_pi].p;
  }

  function findPrice(name) {
    if (!name) return 0;
    var n = name.toLowerCase().trim();
    if (PRICE_MAP[n]) return PRICE_MAP[n];
    for (var k in PRICE_MAP) {
      if (n.indexOf(k) === 0 || k.indexOf(n) === 0) return PRICE_MAP[k];
    }
    return 0;
  }

  // Auto-fill price when user types a service name
  if (srv && amtEl) {
    srv.addEventListener('input', function() {
      if (!amtEl.dataset.userEdited) {
        var p = findPrice(srv.value);
        amtEl.value = p > 0 ? p : '';
      }
    });
    amtEl.addEventListener('input', function() { amtEl.dataset.userEdited = '1'; });
  }

  function openMini(prefill){
    if (prefill) srv.value = prefill;
    mask.hidden = false;
    document.body.style.overflow = 'hidden';
    // Push a history entry so the phone "Back" button closes the form
    // rather than navigating away from the site.
    if (!(window.history.state && window.history.state.ppMini)) {
      try { history.pushState({ ppMini: true }, ''); } catch (e) {}
    }
    setTimeout(function(){ (prefill ? ctc : srv).focus(); }, 50);
  }
  function closeMini(fromPop){
    mask.hidden = true;
    document.body.style.overflow = '';
    if (!fromPop && window.history.state && window.history.state.ppMini) {
      try { history.back(); } catch (e) {}
    }
  }
  mask.querySelector('.pp-mm-close').addEventListener('click', function(){ closeMini(); });
  mask.addEventListener('click', function(e){ if (e.target === mask) closeMini(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !mask.hidden) closeMini(); });
  window.addEventListener('popstate', function(){ if (!mask.hidden) closeMini(true); });

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
    var av = amtEl ? parseInt(amtEl.value, 10) : 0;
    var cv = ctc.value.trim();

    if (!sv) { err.textContent = 'Укажите сервис'; err.hidden = false; srv.focus(); return; }
    if (!av || av < 100) { err.textContent = 'Укажите сумму оплаты (минимум 100 ₽)'; err.hidden = false; amtEl && amtEl.focus(); return; }
    if (cv.length < 4) { err.textContent = 'Введите контакт — телефон, @username или email'; err.hidden = false; ctc.focus(); return; }

    btn.disabled = true;
    btn.textContent = 'Создаём счёт…';

    fetch('/api/create-invoice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({service: sv, amount: av, contact: cv})
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.paymentUrl) {
        btn.textContent = 'Переходим к оплате…';
        if (window.ym) window.ym(109522965, 'reachGoal', 'payment_created');
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Не удалось получить ссылку на оплату');
      }
    })
    .catch(function() {
      err.innerHTML = 'Ошибка создания счёта. Напишите нам в ' +
        '<a href="https://t.me/Kimzar_A" target="_blank" rel="noopener" style="color:#7BAEFF">Telegram @Kimzar_A</a>';
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Перейти к оплате';
    });
  });

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
  }

  function wireSearch(){
    var inputs = document.querySelectorAll('input[name="q"], #ppSearch, input[placeholder*="ChatGPT"], input[placeholder*="Найти"]');
    for (var i=0; i<inputs.length; i++) {
      // Skip the mini-form service input — it has its own price-fill logic and
      // should not navigate to an SEO page when a suggestion is clicked.
      if (inputs[i].closest && inputs[i].closest('#pp-mm')) continue;
      attachAutocomplete(inputs[i]);
    }
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
