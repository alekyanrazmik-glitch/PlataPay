// Отдельная страница отзывов — /reviews/.
//
// Собирается статически в build.mjs (как хаб /seo/ и 404). Показывает:
//   • сводный рейтинг (средняя оценка + количество) как на Avito;
//   • кнопку «Смотреть все отзывы на Avito» (переход сохранён как был);
//   • список отзывов: вшитые SEED + одобренные отзывы посетителей,
//     подгружаемые из Google-таблицы по JSONP (см. server/apps-script/Code.gs);
//   • форму «Оставить отзыв»: имя, оценка звёздами, текст. Отправка идёт в
//     тот же Apps Script (Google Sheets + Telegram + почта), что и заявки.
//
// Отзыв посетителя попадает в таблицу со статусом «на модерации» и
// появляется на странице только после того, как владелец проставит «да»
// в колонке «Показывать».

import { SEED_REVIEWS, AVITO_URL } from './reviews-data.mjs';

// Те же значения, что в seo/enhance.mjs (форма заявки). Прямая отправка в
// Telegram — быстрый путь; резервно всё уходит в Apps Script.
const BOT = '8842294846:AAGU2BA3RNFSWugpwKlFbnS9ucMluKzP4pg';
const CHAT = '523060537';
const SHEETS =
  'https://script.google.com/macros/s/AKfycbyy43Ff5kKivrUsaXWEkda7JXNwHrOI-3BJIJp3UG9H8K6cb4DxjpC8eXNPGNEXQEWt/exec';

export function renderReviewsPage({ base, verifyTags = '' }) {
  const seedJson = JSON.stringify(SEED_REVIEWS);

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${base}">
<title>Отзывы клиентов PlataPay — оплата зарубежных сервисов из России</title>
<meta name="description" content="Отзывы клиентов PlataPay об оплате зарубежных сервисов, подписок и счетов из России. Реальные оценки и истории. Оставьте свой отзыв прямо на странице.">
<link rel="canonical" href="https://payoplata.ru/reviews/">
<meta property="og:title" content="Отзывы клиентов PlataPay">
<meta property="og:description" content="Реальные отзывы об оплате зарубежных сервисов и подписок из России.">
<meta property="og:url" content="https://payoplata.ru/reviews/">
<meta property="og:type" content="website">
${verifyTags}
<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(109522965,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});</script>
<noscript><div><img src="https://mc.yandex.ru/watch/109522965" style="position:absolute;left:-9999px;" alt=""/></div></noscript>
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<style>
  :root{
    --bg:#08172F;--card:#0d1f44;--card2:#0c1f40;--line:#1d3a6b;
    --text:#eef3ff;--muted:#9fb2d4;--accent:#2e7bff;--avito:#9bc736;--star:#FFC107;
    color-scheme:dark;
  }
  *{box-sizing:border-box;}
  html{overflow-x:hidden;}
  body{
    margin:0;background:var(--bg);color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  a{color:var(--accent);text-decoration:none;}
  img,svg{max-width:100%;}
  .wrap{max-width:1100px;margin:0 auto;padding:24px 20px 64px;}

  /* header */
  .pp-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:6px 0 28px;flex-wrap:wrap;}
  .pp-back{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:14px;font-weight:600;}
  .pp-back:hover{color:var(--text);}
  .pp-logo{font-size:18px;font-weight:800;letter-spacing:-.01em;color:var(--text);}
  .pp-logo b{color:var(--accent);}

  /* hero summary */
  .pp-hero{background:linear-gradient(180deg,rgba(46,123,255,.10),rgba(46,123,255,.02));border:1px solid var(--line);border-radius:24px;padding:30px 28px;margin-bottom:26px;}
  .pp-hero h1{font-size:clamp(26px,5vw,38px);font-weight:800;letter-spacing:-.02em;margin:0 0 6px;}
  .pp-hero p{color:var(--muted);margin:0 0 20px;font-size:15px;max-width:640px;line-height:1.5;}
  .pp-sum{display:flex;align-items:center;gap:20px;flex-wrap:wrap;}
  .pp-sum-score{display:flex;align-items:baseline;gap:10px;}
  .pp-sum-num{font-size:44px;font-weight:800;line-height:1;}
  .pp-sum-stars{color:var(--star);font-size:22px;letter-spacing:2px;}
  .pp-sum-cnt{color:var(--muted);font-size:14px;}
  .pp-hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;}
  .pp-btn{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:13px 22px;font-size:15px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:filter .15s,transform .15s;}
  .pp-btn:active{transform:translateY(1px);}
  .pp-btn-primary{background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;}
  .pp-btn-primary:hover{filter:brightness(1.08);}
  .pp-btn-avito{background:var(--avito);color:#0e2a00;}
  .pp-btn-avito:hover{filter:brightness(1.05);}

  /* layout: list + form */
  .pp-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:24px;align-items:start;}
  @media(max-width:880px){.pp-grid{grid-template-columns:1fr;}}
  .pp-sec-title{font-size:20px;font-weight:800;margin:0 0 16px;}

  /* review cards */
  .pp-rev-list{display:flex;flex-direction:column;gap:14px;}
  .pp-rev-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;}
  .pp-rev-head2{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
  .pp-rev-ava{width:44px;height:44px;border-radius:50%;flex:0 0 auto;overflow:hidden;display:grid;place-items:center;color:#fff;font-weight:800;font-size:18px;}
  .pp-rev-ava img{width:100%;height:100%;object-fit:cover;display:block;}
  .pp-rev-name{font-size:15px;font-weight:700;color:var(--text);}
  .pp-rev-stars{color:var(--star);font-size:14px;letter-spacing:1px;margin-top:2px;}
  .pp-rev-text{margin:2px 0 12px;font-size:14.5px;line-height:1.55;color:#dbe4f7;}
  .pp-rev-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--muted);}
  .pp-rev-foot .ver{display:inline-flex;align-items:center;gap:5px;color:#5fbf6a;font-weight:600;}
  .pp-rev-foot .ver svg{width:13px;height:13px;}
  .pp-rev-foot .avito{margin-left:auto;color:var(--avito);font-weight:700;}
  .pp-rev-foot .site{margin-left:auto;color:var(--accent);font-weight:700;}
  .pp-rev-more{margin-top:16px;text-align:center;}
  .pp-rev-more button{background:var(--card2);border:1px solid var(--line);color:var(--text);border-radius:999px;padding:11px 20px;font-size:14px;font-weight:600;cursor:pointer;}
  .pp-rev-more button:hover{border-color:var(--accent);}

  /* form */
  .pp-form-card{background:var(--card2);border:1px solid var(--line);border-radius:20px;padding:24px 22px;position:sticky;top:16px;}
  @media(max-width:880px){.pp-form-card{position:static;}}
  .pp-form-card h2{font-size:19px;font-weight:800;margin:0 0 4px;}
  .pp-form-card .sub{color:var(--muted);font-size:13.5px;margin:0 0 18px;line-height:1.5;}
  .pp-form label{display:block;font-size:12px;color:var(--muted);margin:14px 0 6px;font-weight:600;}
  .pp-form input[type=text],.pp-form textarea{
    width:100%;background:var(--bg);border:1px solid var(--line);color:var(--text);
    border-radius:12px;padding:12px 14px;font-size:15px;font-family:inherit;resize:vertical;
  }
  .pp-form input:focus,.pp-form textarea:focus{outline:none;border-color:var(--accent);}
  .pp-form textarea{min-height:104px;}
  .pp-stars-in{display:flex;gap:6px;margin-top:2px;}
  .pp-stars-in button{background:none;border:none;padding:2px;cursor:pointer;font-size:32px;line-height:1;color:#31456f;transition:color .12s,transform .1s;}
  .pp-stars-in button:hover{transform:scale(1.12);}
  .pp-stars-in button.on{color:var(--star);}
  .pp-form .go{width:100%;background:linear-gradient(180deg,#2e7bff,#1e5fd6);color:#fff;border:none;border-radius:12px;padding:14px;font-weight:700;font-size:16px;cursor:pointer;margin-top:20px;font-family:inherit;}
  .pp-form .go:hover{filter:brightness(1.08);}
  .pp-form .go:disabled{opacity:.6;cursor:wait;}
  .pp-form .agree{display:flex;align-items:flex-start;gap:9px;margin-top:16px;font-size:12.5px;line-height:1.45;color:var(--muted);cursor:pointer;}
  .pp-form .agree input{width:18px;height:18px;min-width:18px;margin:1px 0 0;accent-color:var(--accent);cursor:pointer;}
  .pp-form .err{color:#ff8d8d;font-size:13px;margin-top:12px;}
  .pp-form .hp{position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;}
  .pp-ok{text-align:center;padding:18px 4px;}
  .pp-ok .ic{width:56px;height:56px;border-radius:50%;background:rgba(34,197,94,.15);display:grid;place-items:center;margin:0 auto 14px;}
  .pp-ok .ic svg{width:30px;height:30px;color:#22C55E;}
  .pp-ok h3{margin:0 0 6px;font-size:19px;color:#22C55E;}
  .pp-ok p{color:var(--muted);font-size:14px;margin:0;line-height:1.5;}
</style>
</head>
<body>
<div class="wrap">
  <div class="pp-top">
    <a class="pp-back" href="${base}">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6"/></svg>
      На главную
    </a>
    <a class="pp-logo" href="${base}">Plata<b>Pay</b></a>
  </div>

  <section class="pp-hero">
    <h1>Отзывы клиентов</h1>
    <p>Мы помогаем оплачивать зарубежные сервисы, подписки и счета из России. Здесь — реальные отзывы клиентов. Оставьте свой прямо на этой странице.</p>
    <div class="pp-sum">
      <div class="pp-sum-score">
        <span class="pp-sum-num" id="ppAvg">5.0</span>
        <span>
          <span class="pp-sum-stars" id="ppAvgStars">★★★★★</span><br>
          <span class="pp-sum-cnt" id="ppCnt">отзывов</span>
        </span>
      </div>
    </div>
    <div class="pp-hero-btns">
      <button class="pp-btn pp-btn-primary" id="ppLeaveBtn" type="button">Оставить отзыв</button>
      <a class="pp-btn pp-btn-avito" id="ppAvitoLink" href="${AVITO_URL}" target="_blank" rel="noopener">
        Смотреть все отзывы на Avito
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg>
      </a>
    </div>
  </section>

  <div class="pp-grid">
    <div>
      <h2 class="pp-sec-title">Что говорят клиенты</h2>
      <div class="pp-rev-list" id="ppRevList"></div>
      <div class="pp-rev-more" id="ppMoreWrap" hidden>
        <button type="button" id="ppMoreBtn">Показать ещё</button>
      </div>
    </div>

    <div>
      <div class="pp-form-card" id="ppFormCard">
        <div class="pp-form" id="ppFormBody">
          <h2>Оставить отзыв</h2>
          <p class="sub">Расскажите, как прошла оплата — это помогает другим клиентам. Отзыв появится на странице после проверки.</p>

          <label>Ваша оценка</label>
          <div class="pp-stars-in" id="ppStarsIn" role="radiogroup" aria-label="Оценка">
            <button type="button" data-v="1" aria-label="1 звезда">★</button>
            <button type="button" data-v="2" aria-label="2 звезды">★</button>
            <button type="button" data-v="3" aria-label="3 звезды">★</button>
            <button type="button" data-v="4" aria-label="4 звезды">★</button>
            <button type="button" data-v="5" aria-label="5 звёзд">★</button>
          </div>

          <label for="ppName">Ваше имя</label>
          <input type="text" id="ppName" maxlength="40" placeholder="Как вас зовут" autocomplete="name">

          <label for="ppText">Отзыв</label>
          <textarea id="ppText" maxlength="600" placeholder="Что оплачивали, как быстро помогли, всё ли понравилось"></textarea>

          <div class="hp" aria-hidden="true"><label>Компания<input type="text" id="ppHp" tabindex="-1" autocomplete="off"></label></div>

          <label class="agree"><input type="checkbox" id="ppAgree"><span>Я согласен на обработку персональных данных и публикацию отзыва</span></label>

          <div class="err" id="ppErr" hidden></div>
          <button class="go" id="ppGo" type="button">Отправить отзыв</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
(function(){
  var AVITO_URL=${JSON.stringify(AVITO_URL)};
  var SEED=${seedJson};
  var SHEETS=${JSON.stringify(SHEETS)};
  var BOT=${JSON.stringify(BOT)};
  var CHAT=${JSON.stringify(CHAT)};
  var PAGE_SIZE=6;

  var listEl=document.getElementById('ppRevList');
  var moreWrap=document.getElementById('ppMoreWrap');
  var moreBtn=document.getElementById('ppMoreBtn');
  var all=SEED.slice();
  var shown=0;

  function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}

  function cardHTML(r){
    var n=Math.max(0,Math.min(5,r.stars|0));
    var stars='★'.repeat(n)+'☆'.repeat(5-n);
    var ava;
    if(r.ava && String(r.ava).length<=2){
      ava='<span class="pp-rev-ava" style="background:'+esc(r.avaBg||'#2e7bff')+'">'+esc(r.ava)+'</span>';
    } else if(r.ava){
      ava='<span class="pp-rev-ava"><img src="'+esc(r.ava)+'" alt="'+esc(r.name)+'"></span>';
    } else {
      var letter=(r.name||'?').trim().charAt(0).toUpperCase();
      var palette=['#EC407A','#26A69A','#FFB300','#5C6BC0','#66BB6A','#7E57C2','#E91E63','#42A5F5'];
      var bg=palette[(letter.charCodeAt(0)||0)%palette.length];
      ava='<span class="pp-rev-ava" style="background:'+bg+'">'+esc(letter)+'</span>';
    }
    var srcTag=r.site
      ? '<span class="site">PlataPay</span>'
      : '<span class="avito">Avito</span>';
    return '<div class="pp-rev-head2">'+ava+
      '<div><div class="pp-rev-name">'+esc(r.name)+'</div><div class="pp-rev-stars">'+stars+'</div></div></div>'+
      '<p class="pp-rev-text">'+esc(r.text)+'</p>'+
      '<div class="pp-rev-foot">'+
        '<span class="ver"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.5z"/></svg>Проверенный отзыв</span>'+
        (r.date?'<span>· '+esc(r.date)+'</span>':'')+srcTag+
      '</div>';
  }

  function renderMore(){
    var next=Math.min(all.length,shown+PAGE_SIZE);
    for(var i=shown;i<next;i++){
      var el=document.createElement('div');
      el.className='pp-rev-card';
      el.innerHTML=cardHTML(all[i]);
      listEl.appendChild(el);
    }
    shown=next;
    moreWrap.hidden = shown>=all.length;
  }

  function updateSummary(){
    var sum=0,cnt=all.length;
    for(var i=0;i<cnt;i++) sum+=Math.max(0,Math.min(5,all[i].stars|0));
    var avg=cnt?(sum/cnt):5;
    document.getElementById('ppAvg').textContent=avg.toFixed(1).replace('.',',');
    var full=Math.round(avg);
    document.getElementById('ppAvgStars').textContent='★'.repeat(full)+'☆'.repeat(5-full);
    document.getElementById('ppCnt').textContent=cnt+' '+plural(cnt,'отзыв','отзыва','отзывов');
  }
  function plural(n,one,few,many){
    var m10=n%10,m100=n%100;
    if(m10===1&&m100!==11)return one;
    if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few;
    return many;
  }

  updateSummary();
  renderMore();
  moreBtn.addEventListener('click',renderMore);

  // Одобренные отзывы из Google-таблицы (JSONP).
  window.ppReviewsCb=function(extra){
    if(!extra||!extra.length) return;
    // Новые отзывы посетителей — в начало списка (после уже показанных карточек
    // проще пересобрать: добавим их в общий массив и дорисуем).
    var mapped=extra.map(function(r){
      return {name:r.name, stars:r.stars, text:r.text, date:r.date, site:true};
    });
    all=mapped.concat(SEED);
    listEl.innerHTML='';shown=0;
    updateSummary();
    renderMore();
  };
  (function(){
    var s=document.createElement('script');
    s.src=SHEETS+'?reviews=1&callback=ppReviewsCb&_='+(new Date().getTime());
    s.onerror=function(){};
    document.body.appendChild(s);
  })();

  // ---- Форма ----
  var stars=0;
  var starBtns=[].slice.call(document.querySelectorAll('#ppStarsIn button'));
  function paintStars(v){
    starBtns.forEach(function(b){
      b.classList.toggle('on', (b.getAttribute('data-v')|0)<=v);
    });
  }
  starBtns.forEach(function(b){
    b.addEventListener('click',function(){stars=b.getAttribute('data-v')|0;paintStars(stars);});
    b.addEventListener('mouseenter',function(){paintStars(b.getAttribute('data-v')|0);});
  });
  document.getElementById('ppStarsIn').addEventListener('mouseleave',function(){paintStars(stars);});

  var leaveBtn=document.getElementById('ppLeaveBtn');
  var formCard=document.getElementById('ppFormCard');
  leaveBtn.addEventListener('click',function(){
    formCard.scrollIntoView({behavior:'smooth',block:'start'});
    var ni=document.getElementById('ppName');
    setTimeout(function(){try{ni.focus({preventScroll:true});}catch(e){ni.focus();}},350);
  });

  var go=document.getElementById('ppGo');
  var err=document.getElementById('ppErr');
  var sending=false;

  go.addEventListener('click',function(){
    if(sending) return;
    var name=(document.getElementById('ppName').value||'').trim();
    var text=(document.getElementById('ppText').value||'').trim();
    var hp=(document.getElementById('ppHp').value||'').trim();
    var agree=document.getElementById('ppAgree').checked;
    err.hidden=true;
    if(hp) {return;} // honeypot — тихо игнорируем ботов
    if(!stars){err.textContent='Поставьте оценку звёздами';err.hidden=false;return;}
    if(name.length<2){err.textContent='Укажите ваше имя';err.hidden=false;return;}
    if(text.length<8){err.textContent='Напишите пару слов об отзыве';err.hidden=false;return;}
    if(!agree){err.textContent='Подтвердите согласие на публикацию отзыва';err.hidden=false;return;}

    sending=true;go.disabled=true;go.textContent='Отправляем…';

    var payload={type:'review', name:name, stars:stars, text:text, page:location.pathname, ts:Date.now()};
    var msg=['Новый отзыв на сайте PlataPay (на модерации)',
      'Имя: '+name,'Оценка: '+stars+'/5','Отзыв: '+text].join('\\n');

    var tgDirect=new Promise(function(resolve){
      var done=false,fin=function(v){if(!done){done=true;resolve(v);}};
      setTimeout(function(){fin(false);},7000);
      fetch('https://api.telegram.org/bot'+BOT+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:CHAT,text:msg,disable_web_page_preview:true})
      }).then(function(r){fin(r.ok);}).catch(function(){fin(false);});
    });

    tgDirect.then(function(tgSent){
      payload.tgSent=tgSent;
      fetch(SHEETS,{
        method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(payload)
      }).then(function(){return true;}).catch(function(){return false;}).then(function(reached){
        sending=false;
        if(tgSent||reached){
          try{if(typeof ym==='function'){ym(109522965,'reachGoal','review_submit');}}catch(e){}
          showThanks();
        } else {
          err.textContent='Не удалось отправить. Напишите в Telegram: @Kimzar_A';
          err.hidden=false;go.disabled=false;go.textContent='Отправить отзыв';
        }
      });
    });
  });

  function showThanks(){
    document.getElementById('ppFormBody').innerHTML=
      '<div class="pp-ok">'+
      '<div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>'+
      '<h3>Спасибо за отзыв!</h3>'+
      '<p>Мы получили ваш отзыв. После короткой проверки он появится на этой странице.</p>'+
      '</div>';
  }
})();
</script>
</body>
</html>`;
}
