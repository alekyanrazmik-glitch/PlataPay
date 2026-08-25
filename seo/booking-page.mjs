// Посадочная страница оплаты Booking.com — /booking/.
//
// Отдельный лендинг под один интент («оплатите мою бронь») с главным
// элементом — калькулятором стоимости брони. Собирается статически в
// build.mjs, как /reviews/, и использует общий каркас app-shell.mjs
// (шапка, футер, css/pp-app.css, js/pp-app.js) — свой только небольшой
// блок стилей калькулятора и его скрипт.
//
// ВАЖНО: механика цены — внутренняя. Клиент видит только итоговую сумму
// в рублях; ни курс, ни процент наценки, ни её минимум на странице не
// показываются и не называются словами. Константы ниже нужны только для
// расчёта (и для примеров стоимости, которые считаются той же функцией).
//
//     итог = X$ × RATE_RUB_PER_USD + max(MARKUP_PCT%, MARKUP_MIN_RUB)

import {
  CONTACTS,
  LEAD_DELIVERY,
  breadcrumbLd,
  breadcrumbs,
  catSticker,
  escapeHtml,
  faqDetails,
  money,
  stickyBar,
  whyCards,
  wrapPage,
} from './app-shell.mjs';

// ---------------------------------------------- формула (не для показа)

/** Внутренний курс: сколько рублей берём за $1 брони. */
export const RATE_RUB_PER_USD = 90;
/** Наценка сервиса, % от суммы брони в рублях. */
export const MARKUP_PCT = 10;
/** Минимальная наценка в рублях — порог для маленьких броней. */
export const MARKUP_MIN_RUB = 1500;

/**
 * Расчёт стоимости брони.
 * @param {number} usd сумма брони на Booking.com в долларах
 * @returns {{usd:number, base:number, markup:number, total:number}}
 *   total — единственное, что уходит на страницу; base и markup нужны
 *   внутри сборки и в заявке оператору.
 */
export function calcBooking(usd) {
  const amount = Number(usd) > 0 ? Number(usd) : 0;
  const base = Math.round(amount * RATE_RUB_PER_USD);
  const pct = Math.round((base * MARKUP_PCT) / 100);
  const markup = amount > 0 ? Math.max(pct, MARKUP_MIN_RUB) : 0;
  return { usd: amount, base, markup, total: base + markup };
}

// Примеры стоимости — считаются той же функцией, поэтому разъехаться с
// калькулятором не могут. Показываем только «бронь → итог».
const EXAMPLES = [50, 100, 200, 400, 800, 1500];

const CANONICAL = 'https://payoplata.ru/booking/';

const KINDS = [
  'Отель или апарт-отель',
  'Апартаменты, вилла, дом',
  'Хостел или гестхаус',
  'Трансфер из аэропорта',
  'Аренда авто на Booking',
  'Другое бронирование',
];

const FAQ = [
  {
    q: 'Что входит в сумму, которую показывает калькулятор?',
    a: 'Всё: оплата самой брони на Booking.com, конвертация валюты, комиссии платёжных систем и работа оператора. Это финальная сумма в рублях — сверху ничего не добавляется, доплат после оплаты не бывает.',
  },
  {
    q: 'Сумма может измениться после того, как я оставлю заявку?',
    a: 'Оператор проверяет бронь и подтверждает сумму в рублях до того, как вы что-то переводите. После подтверждения она фиксируется и не меняется — даже если валюта за это время подорожает. Измениться цена может только в одном случае: если сам объект поднял стоимость брони или вы поменяли даты.',
  },
  {
    q: 'А если бронь в евро, фунтах или местной валюте?',
    a: 'Тоже оплачиваем. Booking.com умеет показывать цену в долларах — переключите валюту в правом верхнем углу сайта и посчитайте по калькулятору. Если переключить не получается, пришлите ссылку на бронь: посчитаем сами и назовём точную сумму в рублях.',
  },
  {
    q: 'Бронь оформляете вы или я сам?',
    a: 'Как удобнее. Можно забронировать самому и прислать номер брони — мы оплатим её как гость. Можно прислать ссылку на объект, даты и количество гостей — оформим и оплатим бронирование с нуля, подтверждение придёт на вашу почту.',
  },
  {
    q: 'Что я получу после оплаты?',
    a: 'Письмо-подтверждение бронирования от Booking.com на вашу почту и статус «Оплачено» в личном кабинете. Скриншот подтверждения дублируем в Telegram — его достаточно на стойке регистрации отеля и для визы.',
  },
  {
    q: 'Можно оплатить бронь, где оплата на месте?',
    a: 'Если объект просит гарантию картой без списания — привяжем зарубежную карту к брони, чтобы она не отменилась. Если нужна предоплата или невозвратный тариф со скидкой — оплачиваем полностью, тариф сохраняется.',
  },
  {
    q: 'Сколько это занимает по времени?',
    a: 'Обычно 5–15 минут от заявки до подтверждения — если объект не требует дополнительной верификации. Работаем ежедневно с 08:00 до 24:00 МСК.',
  },
  {
    q: 'Чем платить вам?',
    a: 'Картой любого российского банка, переводом по СБП или USDT. Данные вашей карты нам не нужны — вы переводите сумму по реквизитам, которые оператор пришлёт после подтверждения расчёта.',
  },
  {
    q: 'А если бронь не пройдёт?',
    a: 'Возвращаем деньги полностью, ничего не удерживая. Такое бывает редко — как правило, когда объект уже снял номер с продажи или сменилась цена. В этом случае предложим альтернативу или вернём перевод.',
  },
];

// --------------------------------------------------------------- стили

const CALC_CSS = `
#calc,#zakaz{scroll-margin-top:84px}
.bk-hero{position:relative;overflow:hidden;border-radius:26px;border:1px solid var(--line);
  background:linear-gradient(180deg,#1a2e4e 0%,#142543 100%);padding:28px;margin:16px 0 0}
.bk-hero .veil{position:absolute;inset:0;opacity:.16;pointer-events:none}
.bk-hero .in{position:relative;display:flex;gap:20px;align-items:flex-start}
.bk-hero .tile{flex:none;width:64px;height:64px;border-radius:20px;display:grid;place-items:center;
  border:1px solid var(--line-soft);background:#101e33;color:var(--brand-ice);font-size:19px;font-weight:700}
.bk-hero h1{margin:0 0 8px}
.bk-hero .sub{color:var(--muted);font-size:15px;margin:0;max-width:640px}
@media(max-width:640px){.bk-hero{padding:22px 18px}.bk-hero .tile{display:none}}

.bk-calc{position:relative;border:1px solid var(--line-strong);border-radius:26px;
  background:linear-gradient(180deg,#13294e 0%,#0f2144 100%);padding:24px;margin:18px 0 0}
.bk-calc .kicker{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.bk-calc h2{margin:6px 0 4px}
.bk-calc .sub{color:var(--muted);font-size:13.5px;margin:0}
.bk-grid{display:grid;gap:18px;grid-template-columns:1fr 1fr;align-items:stretch;margin-top:18px}
@media(max-width:860px){.bk-grid{grid-template-columns:1fr}.bk-calc{padding:20px 18px}}

.bk-lbl{display:block;font-size:12px;color:var(--muted);margin:0 0 8px}
.bk-field{display:flex;align-items:center;gap:10px;height:66px;padding:0 18px;
  border:1px solid var(--line);border-radius:18px;background:var(--panel2);transition:border-color .2s}
.bk-field:focus-within{border-color:var(--brand)}
.bk-field .cur{font-size:24px;font-weight:700;color:var(--brand-soft);line-height:1}
.bk-field input{flex:1;min-width:0;height:100%;background:none;border:0;color:var(--ice);
  font-family:inherit;font-size:28px;font-weight:800;letter-spacing:-.6px}
.bk-field input:focus{outline:none}
.bk-field input::-webkit-outer-spin-button,.bk-field input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.bk-field input[type=number]{-moz-appearance:textfield}
.bk-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;margin:18px 0 4px;
  border-radius:999px;background:linear-gradient(90deg,var(--brand) 0%,var(--brand) var(--fill,20%),#1b2f52 var(--fill,20%),#1b2f52 100%);cursor:pointer}
.bk-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:999px;
  background:#fff;border:5px solid var(--brand);box-shadow:0 2px 10px rgba(0,0,0,.45);cursor:pointer}
.bk-range::-moz-range-thumb{width:24px;height:24px;border-radius:999px;background:#fff;border:5px solid var(--brand);cursor:pointer}
.bk-scale{display:flex;justify-content:space-between;font-size:11.5px;color:var(--faint)}
.bk-note{grid-column:1/-1;font-size:12.5px;color:var(--dim);margin:2px 0 0;line-height:1.5}

.bk-out{display:flex;flex-direction:column;border:1px solid var(--line);background:rgba(8,23,47,.72);
  border-radius:20px;padding:22px 20px}
.bk-cap{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--dim)}
.bk-sum-big{font-size:clamp(34px,8vw,46px);font-weight:800;letter-spacing:-1.6px;color:var(--gold);
  line-height:1.05;margin:8px 0 2px;white-space:nowrap}
.bk-sum-for{font-size:13px;color:var(--muted);margin:0 0 16px;min-height:19px}
.bk-incl{list-style:none;padding:0;margin:0 0 18px}
.bk-incl li{position:relative;padding-left:26px;font-size:13.5px;color:var(--text3);line-height:1.5;margin:0 0 8px}
.bk-incl li::before{content:"";position:absolute;left:2px;top:5px;width:13px;height:8px;
  border-left:2px solid var(--mint);border-bottom:2px solid var(--mint);transform:rotate(-45deg)}
.bk-out .pp-btn{width:100%;margin-top:auto}
.bk-out .fine{font-size:11.5px;color:var(--faint);margin:12px 0 0;line-height:1.5;text-align:center}

.bk-form{display:grid;gap:12px;grid-template-columns:1fr 1fr;margin-top:4px}
.bk-form .wide{grid-column:1/-1}
.bk-form label{display:block;font-size:12px;color:var(--muted);margin:0 0 6px}
.bk-form label i{font-style:normal;color:var(--faint)}
.bk-form select,.bk-form input{width:100%;height:48px;background:var(--panel2);border:1px solid var(--line);
  border-radius:14px;color:var(--ice);font-family:inherit;font-size:14px;padding:0 14px}
.bk-form select:focus,.bk-form input:focus{outline:none;border-color:var(--brand)}
.bk-form .pp-btn{grid-column:1/-1;width:100%}
.bk-form .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0}
@media(max-width:640px){.bk-form{grid-template-columns:1fr}}
.bk-sum{margin-top:12px;font-size:13px;color:var(--muted)}
.bk-sum b{color:var(--gold)}
`;

// --------------------------------------------------------------- скрипт

// Калькулятор + отправка заявки. Коэффициенты подставляются из модуля,
// чтобы клиентский расчёт совпадал с примерами стоимости на странице.
// Наружу скрипт отдаёт только итог: разбивки в интерфейсе нет.
const calcJs = ({ page }) => `<script>
(function(){
  var A=${RATE_RUB_PER_USD}, B=${MARKUP_PCT}, C=${MARKUP_MIN_RUB};
  var MAX_USD=100000, RANGE_MAX=3000;
  var nf=new Intl.NumberFormat('ru-RU');
  function rub(n){return nf.format(Math.round(n)).replace(/ /g,'\\u00a0')+'\\u00a0\\u20bd';}

  function calc(usd){
    var a=usd>0?usd:0;
    var b=Math.round(a*A);
    var m=a>0?Math.max(Math.round(b*B/100),C):0;
    return {usd:a,total:b+m};
  }

  var input=document.getElementById('bkUsd');
  var range=document.getElementById('bkRange');
  var elTotal=document.getElementById('bkTotal');
  var elFor=document.getElementById('bkFor');
  var formUsd=document.getElementById('bkFormUsd');
  var formSum=document.getElementById('bkFormSum');
  var state=calc(0);

  function render(usd){
    state=calc(usd);
    var shown=state.usd?nf.format(state.usd):'';
    elTotal.textContent=state.usd?rub(state.total):'\\u2014';
    elFor.textContent=state.usd
      ? 'за бронь '+shown+'\\u00a0$ на Booking.com'
      : 'Введите стоимость брони, чтобы увидеть сумму';
    range.style.setProperty('--fill',Math.min(100,state.usd/RANGE_MAX*100)+'%');
    if(formUsd) formUsd.value=state.usd||'';
    if(formSum) formSum.innerHTML=state.usd
      ? 'По калькулятору: бронь '+shown+'\\u00a0$ \\u2192 к оплате <b>'+rub(state.total)+'</b>'
      : 'Не знаете сумму? Пришлите ссылку на бронь — посчитаем сами.';
  }

  function readInput(){
    var v=parseFloat(String(input.value).replace(',','.'));
    if(!isFinite(v)||v<0) v=0;
    if(v>MAX_USD){v=MAX_USD;input.value=String(MAX_USD);}
    return v;
  }

  input.addEventListener('input',function(){
    var v=readInput();
    range.value=String(Math.min(v,RANGE_MAX));
    render(v);
  });
  range.addEventListener('input',function(){
    var v=parseFloat(range.value)||0;
    input.value=String(v);
    render(v);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-usd]'),function(chip){
    chip.addEventListener('click',function(){
      var v=parseFloat(chip.getAttribute('data-usd'))||0;
      input.value=String(v);
      range.value=String(Math.min(v,RANGE_MAX));
      render(v);
      if(window.ym){window.ym(109522965,'reachGoal','booking_calc_chip');}
    });
  });
  if(formUsd) formUsd.addEventListener('input',function(){
    var v=parseFloat(String(formUsd.value).replace(',','.'));
    if(!isFinite(v)||v<0) v=0;
    input.value=v?String(v):'';
    range.value=String(Math.min(v,RANGE_MAX));
    render(v);
  });

  var goBtn=document.getElementById('bkGo');
  if(goBtn) goBtn.addEventListener('click',function(){
    var form=document.getElementById('zakaz');
    if(!form) return;
    form.scrollIntoView({behavior:'smooth',block:'center'});
    var c=document.getElementById('bkContact');
    if(c) setTimeout(function(){try{c.focus({preventScroll:true});}catch(e){c.focus();}},520);
    if(window.ym){window.ym(109522965,'reachGoal','booking_calc_cta');}
  });

  render(readInput());

  // ---- заявка: напрямую в Telegram + резервом в Apps Script ----
  var BOT=${JSON.stringify(LEAD_DELIVERY.bot)};
  var CHAT=${JSON.stringify(LEAD_DELIVERY.chat)};
  var SHEETS=${JSON.stringify(LEAD_DELIVERY.sheets)};
  var PAGE=${JSON.stringify(page)};
  var sending=false;

  window.ppBookingSubmit=function(ev){
    ev.preventDefault();
    if(sending) return false;
    var form=ev.target;
    var card=document.getElementById('zakaz');
    var err=card.querySelector('.err');
    var btn=form.querySelector('button[type="submit"]');
    var kind=form.querySelector('[name="kind"]').value;
    var link=(form.querySelector('[name="link"]').value||'').trim();
    var contact=(form.querySelector('[name="contact"]').value||'').trim();
    var company=(form.querySelector('[name="company"]').value||'').trim();
    if(err) err.hidden=true;
    if(company) return false; // honeypot — тихо игнорируем ботов
    if(contact.length<4){
      if(err){err.textContent='Введите контакт — телефон, @username или email';err.hidden=false;}
      return false;
    }
    sending=true;btn.disabled=true;
    var btnText=btn.textContent;btn.textContent='Отправляем…';

    var msg=['Заявка на оплату брони Booking (страница /booking/)',
      'Что бронируют: '+kind,
      'Сумма брони: '+(state.usd?nf.format(state.usd)+' $':'не указана'),
      'К оплате: '+(state.usd?rub(state.total):'по калькулятору не считали'),
      (link?'Бронь: '+link:null),
      'Контакт: '+contact,
      'Страница: https://payoplata.ru'+PAGE].filter(Boolean).join('\\n');

    var payload={type:'booking',source:'booking-landing',service:'Booking.com',
      tier:kind,amount:state.usd||'',currency:'USD',price:state.usd?rub(state.total):'',
      contact:contact,note:link,page:PAGE,intent:'booking-calc',ts:Date.now()};

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
          sending=false;
          if(tgSent||reached){
            card.innerHTML='<div class="ok"><div class="ring"><svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M6 13.6l4.6 4.4L20 7.6" stroke="#2FCF9A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
              '<h3>Заявка принята</h3><p>Оператор напишет в течение 5–15 минут: подтвердит сумму'+(state.usd?' — '+rub(state.total):'')+' и пришлёт реквизиты (карта РФ, СБП или USDT). Если срочно — Telegram: <a href="${CONTACTS.telegram}" target="_blank" rel="noopener">@Kimzar_A</a>.</p></div>';
            if(window.ym){window.ym(109522965,'reachGoal','booking_order');window.ym(109522965,'reachGoal','zayavka_service');}
          }else{
            if(err){err.textContent='Не удалось отправить. Напишите нам в Telegram: @Kimzar_A';err.hidden=false;}
            btn.disabled=false;btn.textContent=btnText;
          }
        });
    });
    return false;
  };
})();
</script>`;

// ----------------------------------------------------------- страница

export function renderBookingPage({ base, verifyTags = '' }) {
  const st = catSticker('Путешествия');
  const demo = calcBooking(120);

  const crumbs = breadcrumbs([
    { name: 'Главная', href: base },
    { name: 'Каталог', href: `${base}catalog/` },
    { name: 'Оплата брони Booking' },
  ]);

  const hero = `<section class="bk-hero">
<div class="veil" style="background:${st.g}"></div>
<div class="in">
<span class="tile">BK</span>
<div>
<h1>Оплата брони Booking.com из России</h1>
<p class="sub">Российская карта на Booking.com не проходит — мы оплачиваем бронь зарубежной картой за вас. Введите стоимость брони в долларах: калькулятор сразу покажет итоговую сумму в рублях, в которую уже входят оплата и все комиссии. Подтверждение от отеля придёт вам на почту.</p>
<div class="pp-cta-row">
<a class="pp-btn" href="#calc">Рассчитать стоимость</a>
<a class="pp-btn-ghost" href="${CONTACTS.telegram}" target="_blank" rel="noopener">Написать в Telegram</a>
</div>
</div>
</div>
</section>`;

  const stats = `<div class="pp-stats">
<div><b class="g">5.0</b><span>рейтинг на Avito</span></div>
<div><b>5–15 мин</b><span>от заявки до брони</span></div>
<div><b>0 ₽</b><span>скрытых комиссий</span></div>
<div><b>08–24</b><span>ежедневно, МСК</span></div>
</div>`;

  const chips = [50, 100, 200, 500, 1000]
    .map((v) => `<button type="button" class="pp-chip" data-usd="${v}">$${v}</button>`)
    .join('');

  const calc = `<section class="bk-calc" id="calc">
<div class="kicker">Калькулятор</div>
<h2>Сколько будет стоить ваша бронь</h2>
<p class="sub">Возьмите итоговую цену с сайта Booking.com в долларах и введите её ниже — покажем сумму в рублях, которую нужно перевести нам.</p>
<div class="bk-grid">
<div>
<label class="bk-lbl" for="bkUsd">Стоимость брони на Booking.com</label>
<div class="bk-field"><span class="cur">$</span><input id="bkUsd" type="number" inputmode="decimal" min="0" max="100000" step="1" value="120" aria-label="Стоимость брони в долларах"></div>
<input class="bk-range" id="bkRange" type="range" min="0" max="3000" step="10" value="120" aria-label="Стоимость брони, ползунок">
<div class="bk-scale"><span>$0</span><span>$1 500</span><span>$3 000+</span></div>
<div class="pp-chips">${chips}</div>
</div>
<div class="bk-out">
<div class="bk-cap">Итого к оплате</div>
<div class="bk-sum-big" id="bkTotal">${money(demo.total)}</div>
<p class="bk-sum-for" id="bkFor">за бронь 120 $ на Booking.com</p>
<ul class="bk-incl">
<li>Оплата брони и все комиссии уже включены</li>
<li>Сумма фиксируется до оплаты и больше не меняется</li>
<li>Подтверждение от Booking.com — вам на почту</li>
</ul>
<button class="pp-btn" type="button" id="bkGo">Оформить оплату брони</button>
<noscript><p class="fine">Калькулятор считает в браузере — включите JavaScript или посмотрите готовые примеры стоимости ниже.</p></noscript>
<p class="fine">Расчёт предварительный. Точную сумму оператор подтверждает в заявке — после подтверждения она не меняется.</p>
</div>
<p class="bk-note">Цена на Booking.com показана в другой валюте? Переключите её на USD в правом верхнем углу сайта — или просто пришлите нам ссылку на бронь, посчитаем сами.</p>
</div>
</section>`;

  const table = `<div class="tbl-wrap"><table>
<thead><tr><th>Бронь на Booking.com</th><th>Итого к оплате</th></tr></thead>
<tbody>
${EXAMPLES.map((usd) => {
  const r = calcBooking(usd);
  return `<tr><td>$${usd.toLocaleString('ru-RU')}</td><td><b>${money(r.total)}</b></td></tr>`;
}).join('\n')}
</tbody></table></div>`;

  const included = `<section class="pp-sec"><h2>Что входит в стоимость</h2>
<div class="block">
<p>Сумма в калькуляторе — финальная. В неё уже включено всё:</p>
<ul class="check">
<li><b>Оплата самой брони</b> на Booking.com зарубежной картой.</li>
<li><b>Конвертация валюты</b> и комиссии платёжных систем — отдельной строкой ничего не добавляется.</li>
<li><b>Работа оператора</b>: оформление, оплата, проверка подтверждения и поддержка до заезда.</li>
<li><b>Возврат</b>, если бронь по каким-то причинам не пройдёт.</li>
</ul>
<p class="hint">Оператор подтверждает сумму до оплаты. После подтверждения она не меняется — доплат не будет.</p>
</div>
</section>`;

  const examples = `<section class="pp-sec"><h2>Примеры стоимости</h2>
<p>Так выглядит итог для типичных броней — от одной ночи в городском отеле до недели в апартаментах:</p>
${table}
<p class="hint">Вашей суммы нет в таблице? Посчитайте точно в <a href="#calc">калькуляторе</a> — он работает для любой суммы.</p>
</section>`;

  const steps = `<section class="pp-sec"><h2>Как проходит оплата</h2>
<div class="block">
<ol class="pp-steps">
<li>Считаете стоимость в калькуляторе и оставляете заявку — контакт, сумма брони и ссылка на объект или номер бронирования.</li>
<li>Оператор проверяет бронь, подтверждает итоговую сумму в рублях и присылает реквизиты: карта российского банка, СБП или USDT.</li>
<li>Вы переводите сумму — данные вашей карты нам не нужны, автосписаний нет.</li>
<li>Оплачиваем бронь зарубежной картой. Подтверждение от Booking.com приходит вам на почту, копию дублируем в Telegram.</li>
</ol>
<p class="hint">Обычно всё занимает 5–15 минут. Работаем ежедневно с 08:00 до 24:00 МСК.</p>
</div>
</section>`;

  const what = `<section class="pp-sec"><h2>Что оплачиваем на Booking.com</h2>
<div class="pc-grid">
<div class="pc"><b>Проживание</b><ul class="plus">
<li>Отели и апарт-отели по всему миру</li>
<li>Апартаменты, виллы и дома целиком</li>
<li>Хостелы и гестхаусы</li>
<li>Невозвратные тарифы со скидкой</li>
</ul></div>
<div class="pc"><b>Дополнительно</b><ul class="plus">
<li>Трансфер из аэропорта</li>
<li>Аренда автомобиля через Booking</li>
<li>Гарантия картой без списания</li>
<li>Доплата за раннее заселение и завтраки</li>
</ul></div>
</div>
<p class="hint">Бронь может быть уже оформлена на вас — тогда нужен только номер бронирования. Если объекта ещё нет, пришлите ссылку и даты: подберём тот же вариант и оформим сами.</p>
</section>`;

  const prefill = encodeURIComponent('Привет! Хочу оплатить бронь на Booking.com');
  const order = `<section class="pp-order" id="zakaz">
<div class="kicker">Заявка</div>
<h2>Оплатить бронь Booking.com</h2>
<p class="sub">Оставьте контакт — ответим за 5–15 минут, подтвердим сумму и пришлём реквизиты.</p>
<form class="bk-form" onsubmit="return ppBookingSubmit(event)">
<div><label for="bkKind">Что бронируете</label><select id="bkKind" name="kind">${KINDS.map((k) => `<option>${escapeHtml(k)}</option>`).join('')}</select></div>
<div><label for="bkFormUsd">Сумма брони, $</label><input id="bkFormUsd" name="usd" type="number" inputmode="decimal" min="0" step="1" placeholder="120"></div>
<div class="wide"><label for="bkLink">Ссылка на объект или номер брони <i>(если есть)</i></label><input id="bkLink" name="link" type="text" placeholder="booking.com/hotel/… или 1234567890"></div>
<div class="wide"><label for="bkContact">Телефон, Telegram или email</label><input id="bkContact" name="contact" type="text" placeholder="+7 999… или @username" required autocomplete="off"></div>
<div class="hp" aria-hidden="true"><label>Компания<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>
<button class="pp-btn" type="submit">Отправить заявку</button>
</form>
<p class="bk-sum" id="bkFormSum">По калькулятору: бронь 120 $ → к оплате <b>${money(demo.total)}</b></p>
<div class="alt">Или сразу напишите: <a href="${CONTACTS.telegram}?text=${prefill}" target="_blank" rel="noopener">Telegram</a> · <a href="${CONTACTS.whatsapp}?text=${prefill}" target="_blank" rel="noopener">WhatsApp</a></div>
<div class="err" hidden></div>
</section>`;

  const related = `<section class="pp-sec"><h2>Ещё про Booking и путешествия</h2>
<div class="rel-grid">
<a class="rel-card" href="${base}oplata-booking/">Оплата Booking из России</a>
<a class="rel-card" href="${base}kak-oplatit-booking/">Как оплатить Booking</a>
<a class="rel-card" href="${base}booking-cena/">Booking: цена и тарифы</a>
<a class="rel-card" href="${base}oplata-airbnb/">Оплата Airbnb</a>
<a class="rel-card" href="${base}oplata-agoda/">Оплата Agoda</a>
<a class="rel-card" href="https://travel.payoplata.ru" target="_blank" rel="noopener">Авиабилеты за рубеж</a>
</div>
</section>`;

  const body = `<main class="wrap">
${crumbs}
${hero}
${calc}
${included}
${examples}
${steps}
${what}
${order}
<section class="pp-sec"><h2>Почему оплачивают через PlataPay</h2>${whyCards()}${stats}</section>
<section class="pp-sec"><h2>Частые вопросы</h2>${faqDetails(FAQ)}</section>
${related}
</main>
${stickyBar({ title: 'Оплатить бронь Booking' })}`;

  const faqLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  })}</script>`;

  const serviceLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Оплата брони Booking.com из России',
    serviceType: 'Оплата бронирования отелей и апартаментов зарубежной картой',
    provider: { '@type': 'Organization', name: 'PlataPay', url: 'https://payoplata.ru/' },
    areaServed: 'RU',
    url: CANONICAL,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      url: CANONICAL,
      description:
        'Итоговая сумма в рублях зависит от стоимости брони и рассчитывается в калькуляторе на странице. Оплата брони и все комиссии включены; сумма подтверждается до оплаты.',
    },
  })}</script>`;

  const crumbLd = breadcrumbLd([
    { name: 'Главная', item: 'https://payoplata.ru/' },
    { name: 'Каталог', item: 'https://payoplata.ru/catalog/' },
    { name: 'Оплата брони Booking.com', item: CANONICAL },
  ]);

  return wrapPage({
    base,
    canonical: CANONICAL,
    title: 'Оплата брони Booking.com из России — калькулятор стоимости | PlataPay',
    description:
      'Оплатим бронь Booking.com из России зарубежной картой. Калькулятор покажет итоговую сумму в рублях — оплата и все комиссии включены. Подтверждение за 5–15 минут.',
    verifyTags,
    ld: crumbLd + serviceLd + faqLd,
    body,
    noscriptPixel: true,
    extraHead: `<style>${CALC_CSS}</style>`,
    extraBodyEnd: calcJs({ page: '/booking/' }),
  });
}
