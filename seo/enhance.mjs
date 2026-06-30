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
<style id="pp-mobile-hardening">
  /* Kill horizontal scroll site-wide and keep media within the viewport.
     position:relative + width:100% on body is required for iOS Safari to
     actually clamp horizontal overflow — overflow-x:hidden alone lets the
     page shift right with clipped edges. overflow-x:clip is a stronger
     modern fallback that does not create a scroll container. */
  html{overflow-x:hidden;overflow-x:clip;}
  body{max-width:100%;width:100%;position:relative;overflow-x:hidden;overflow-x:clip;}
  img,svg,video{max-width:100%;height:auto;}
  /* Crisp, snappy taps: kill the grey tap-flash on every interactive
     control and set touch-action:manipulation to drop the double-tap
     delay / accidental zoom — taps register instantly without a flash. */
  a,button,[role="button"],input,select,textarea,
  .pp-cat,.pp-q,.pp-nav-link,.pp-hdr-cta,.pp-burger,
  .pp-pc-pay a,.pp-pay a,.pp-card a,.pp-cta a,.pp-search-btn,
  .pp-tariff-card,.pp-tariff-pick,.pp-checkout-submit,.pp-mm-go{
    -webkit-tap-highlight-color:transparent;
    touch-action:manipulation;
  }
  @media(max-width:768px){
    .pp-cats{display:flex;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
    .pp-cats::-webkit-scrollbar{display:none;}
    .pp-cat{flex:0 0 auto;white-space:nowrap;min-height:40px;display:inline-flex;align-items:center;}
    .pp-sec-grid{grid-template-columns:1fr !important;}
    /* Catalog cards have a fixed height:150px; on mobile the 44px tap-target
       "Оплатить" button makes the content taller, so it spilled past the card
       border. Let the card grow to fit its content here. */
    .pp-card{width:100% !important;max-width:100% !important;height:auto !important;min-height:150px;}
    .pp-card a,.pp-pay a,.pp-cta a{min-height:44px;display:inline-flex;align-items:center;}
    /* "Оплатить" link on home service cards was only ~30px tall — bump it
       to a comfortable 44px tap target. */
    .pp-pc-pay a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;}
    .pp-q{min-height:44px;}
    .pp-search{width:100% !important;max-width:100% !important;}
    /* 16px input font stops iOS Safari from auto-zooming the page */
    .pp-search input{min-height:44px;font-size:16px;}
  }
  /* PlataPay mini-form modal as a bottom sheet on phones */
  @media(max-width:520px){
    .pp-mm-mask{align-items:flex-end !important;padding:0 !important;}
    .pp-mm-modal{max-width:100% !important;border-radius:20px 20px 0 0 !important;margin:0 !important;padding-bottom:calc(24px + env(safe-area-inset-bottom)) !important;}
  }
  /* Footer "finish": the footer uses the same background as the page with
     no separator, so the bottom of the page reads as unfinished. Add a
     top divider + subtle gradient lift so the footer looks intentional. */
  .pp-foot{
    border-top:1px solid #16315f !important;
    background:linear-gradient(180deg,#0a1c39,#08172F) !important;
  }
  /* Hide the leftover native Tilda T898 floating-contact block. It needs
     Tilda's external CSS/JS to render as a corner bubble; without it the
     block dumps inline as a raw white band at the bottom of the page. The
     footer + Telegram/WhatsApp buttons already cover these contacts. */
  [data-record-type="898"], .t898{display:none !important;}
  /* Drop the leading shield icon from the hero eyebrow and the "О нас"
     badge — it read as a stray figure on the left. On phones, centre the
     eyebrow and keep it on a single line (was wrapping "· от 99₽"). */
  .pp-eyebrow svg, .pp-badge svg{display:none !important;}
  @media(max-width:520px){
    .pp-eyebrow{
      display:flex !important; width:100%;
      justify-content:center; text-align:center;
      white-space:nowrap; font-size:clamp(9.5px,2.9vw,12.5px) !important;
    }
  }
  /* The 2-column "Популярные сервисы" grid overflowed the viewport on
     phones (right cards clipped) because grid items default to
     min-width:auto and won't shrink below their content (e.g. "YouTube
     Premium"). Let them shrink and wrap long names so both columns fit. */
  .pp-pop-grid{min-width:0;}
  .pp-pop-grid>.pp-pc,.pp-pc{min-width:0;}
  .pp-pc-name,.pp-pc-desc{overflow-wrap:anywhere;}
  /* The home "Отзывы клиентов" + mini-FAQ (.pp-rf) live inside a Tilda Zero
     artboard (#rec2293276911) whose fixed height clips overflow (so expanded
     FAQ answers got cut off) and which still carries leftover native elements
     that duplicate the block and bleed green text on mobile. Flatten the
     artboard so .pp-rf flows in normal document flow, and hide every native
     artboard element except the one that holds .pp-rf (data-elem-id 1779965803134). */
  #rec2293276911 .t396__elem:not([data-elem-id="1779965803134"]){display:none !important;}
  #rec2293276911 .t396__carrier,
  #rec2293276911 .t396__filter{display:none !important;}
  #rec2293276911 .t396,
  #rec2293276911 .t396__artboard{position:static !important;height:auto !important;min-height:0 !important;max-height:none !important;overflow:visible !important;transform:none !important;width:100% !important;max-width:100% !important;margin:0 !important;left:0 !important;}
  #rec2293276911 .tn-elem[data-elem-id="1779965803134"]{position:static !important;top:auto !important;left:0 !important;right:auto !important;width:100% !important;max-width:100% !important;height:auto !important;transform:none !important;display:block !important;margin:0 !important;}
  #rec2293276911 .tn-elem[data-elem-id="1779965803134"] .tn-atom{position:static !important;display:block !important;width:100% !important;max-width:100% !important;height:auto !important;left:0 !important;margin:0 !important;}
  #rec2293276911 .tn-elem[data-elem-id="1779965803134"] .pp-rf{width:100% !important;}
  /* Stretch the reviews/FAQ block to the same width as the upper feature card
     and the footer (≈1200px centered), so its edges line up with them. */
  .pp-rf .pp-rf-inner{max-width:1200px !important;margin:0 auto !important;padding-left:24px !important;padding-right:24px !important;}
  /* Align the two columns: make them equal height (stretch) so their bottoms
     line up. The FAQ column (6 questions) is the taller one and sets the height,
     so it never gets an empty gap; the reviews list fills its column and scrolls
     softly when there are more reviews than fit. "Смотреть все отзывы" → Avito. */
  .pp-rf .pp-rf-inner{align-items:stretch !important;}
  .pp-rf .pp-rf-col{display:flex;flex-direction:column;}
  .pp-rf .pp-rev-list{flex:1 1 auto;min-height:0;max-height:420px;overflow-y:auto;padding-right:8px;scrollbar-width:thin;scrollbar-color:#2e5bff transparent;}
  .pp-rf .pp-rev-list::-webkit-scrollbar{width:6px;}
  .pp-rf .pp-rev-list::-webkit-scrollbar-track{background:transparent;}
  .pp-rf .pp-rev-list::-webkit-scrollbar-thumb{background:#1d3a6b;border-radius:6px;}
  @media(max-width:860px){.pp-rf .pp-rf-inner{align-items:start !important;}.pp-rf .pp-rev-list{flex:none;max-height:480px;}}
  /* Home FAQ as an inline accordion (replaces Tilda popups that jumped the
     page to the top when a question was closed). Scoped to .pp-rf so it does
     NOT collide with the /faq page, which reuses the .pp-faq-a class. */
  .pp-rf .pp-faq-a{display:none;padding:16px 18px;margin-top:-4px;color:#cfd9ef;font-size:14px;line-height:1.55;background:rgba(46,123,255,.07);border:1px solid #1d3a6b;border-radius:14px;}
  .pp-rf .pp-faq-a.open{display:block;}
  .pp-rf .pp-faq-q svg{transition:transform .2s;}
  .pp-rf .pp-faq-q.open svg{transform:rotate(180deg);}
  .pp-rf .pp-faq-q.open{background:rgba(46,123,255,.10);border-color:#2e7bff;}
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
  var mask  = document.getElementById('pp-mm');
  var modal = mask.querySelector('.pp-mm-modal');
  var bodyEl = mask.querySelector('.pp-mm-body');
  var srv   = document.getElementById('pp-mm-srv');
  var ctc   = document.getElementById('pp-mm-ctc');
  var err   = document.getElementById('pp-mm-err');
  var btn   = document.getElementById('pp-mm-go');

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

  // -------- Header nav: active highlight (basePath-aware) --------
  // The inline Tilda script compares data-path ("/", "/catalog"…) to
  // location.pathname. Under a GitHub Pages project basePath (/PlataPay/)
  // pathname never matches, so no item gets ".active" and they all look
  // identical. Compare the link's RESOLVED pathname (via <base>) to the
  // current pathname instead, which works under any base.
  function cleanPath(p){ return (p||'').replace(/index\\.html$/,'').replace(/\\/+$/,'') || '/'; }
  function fixNav(){
    var links = document.querySelectorAll('.pp-nav-link');
    if(!links.length) return;
    var here = cleanPath(location.pathname);
    for(var i=0;i<links.length;i++){
      var a = links[i];
      var raw = a.getAttribute('href') || '';
      // "Отзывы" → reviews section. Normalise href to the home anchor for
      // cross-page use, and on the home page smooth-scroll to the reviews
      // block directly (the bare #Otzivi anchor sits in a hidden record and
      // didn't scroll reliably on desktop).
      if(/#Otzivi/i.test(raw)){
        a.setAttribute('href', BASE + '#Otzivi');
        a.classList.remove('active');
        if(!a.dataset.ppRev){
          a.dataset.ppRev='1';
          a.addEventListener('click', function(e){
            var rf = document.querySelector('.pp-rf');
            if(!rf) return; // not home — let the href navigate to home + anchor
            e.preventDefault();
            var hdr = document.querySelector('.pp-hdr');
            var off = (hdr ? hdr.offsetHeight : 0) + 8;
            var y = rf.getBoundingClientRect().top + window.pageYOffset - off;
            window.scrollTo({ top: y, behavior: 'smooth' });
          });
        }
        continue;
      }
      if(raw.charAt(0) === '#'){ a.classList.remove('active'); continue; }
      if(cleanPath(a.pathname) === here) a.classList.add('active');
      else a.classList.remove('active');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixNav);
  else fixNav();
  setTimeout(fixNav, 500);
})();
</script>
<script>
(function(){
  // Home FAQ: turn the popup-linked questions into an inline accordion so
  // closing one no longer jumps the page to the top.
  var ANSWERS = {
    'насколькоэтобезопасно':'Мы работаем только через официальные способы оплаты и не запрашиваем лишние данные. Все детали заказа согласовываются заранее, а подтверждение оплаты предоставляется после выполнения услуги.',
    'какиеспособыоплатыдоступны':'Мы принимаем оплату удобным для вас способом: через СБП, банковские карты российских и зарубежных банков, а также переводы на банковский счёт. После оформления заявки менеджер предложит доступные варианты и поможет выбрать наиболее удобный и выгодный способ оплаты.',
    'какбыстропроисходитоплата':'Большинство заказов выполняется в течение 5–15 минут после подтверждения оплаты и получения необходимых данных. В отдельных случаях срок может зависеть от особенностей конкретного сервиса, проверки платежа или времени обработки со стороны поставщика, но мы всегда стараемся выполнить заказ максимально быстро и держим вас в курсе статуса.',
    'какаякомиссия':'Комиссия — от 5% от суммы платежа. Точную сумму с учётом курса и комиссии мы сообщаем до оплаты: никаких скрытых платежей, вы заранее видите итоговую стоимость.',
    'нужнолипередаватьлогинипароль':'Только если оплата требует входа в ваш аккаунт сервиса — и в большинстве случаев это не нужно. Мы запрашиваем минимум данных и работаем конфиденциально, ничего лишнего не храним.',
    'чтоеслиоплатанепройдёт':'Если по какой-то причине оплату провести не удастся, мы вернём средства в полном объёме. Такие случаи редки, и мы всегда предупреждаем заранее, если есть сложности с конкретным сервисом.'
  };
  function key(s){ return (s||'').toLowerCase().replace(/[^а-яё]/gi,''); }
  function init(){
    // Scope to the home reviews/FAQ block only — the /faq page has its own
    // accordion (same class names) that must not be touched.
    var qs = document.querySelectorAll('.pp-rf .pp-faq-q');
    if(!qs.length) return;
    for(var i=0;i<qs.length;i++){
      (function(q){
        if(q.dataset.ppFaq) return; q.dataset.ppFaq='1';
        var label = (q.querySelector('span') || q).textContent;
        var ans = ANSWERS[key(label)];
        // Drop the popup href so Tilda's popup (and its scroll-to-top on
        // close) never fires.
        q.removeAttribute('href');
        q.setAttribute('role','button');
        q.style.cursor='pointer';
        if(!ans) return;
        var panel = document.createElement('div');
        panel.className = 'pp-faq-a';
        panel.textContent = ans;
        q.parentNode.insertBefore(panel, q.nextSibling);
        q.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          if(e.stopImmediatePropagation) e.stopImmediatePropagation();
          var open = panel.classList.toggle('open');
          q.classList.toggle('open', open);
        }, true);
      })(qs[i]);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 500);
  setTimeout(init, 1500);
})();
</script>
`;
}
