import Link from 'next/link';
import { HeroSearch } from '@/components/HeroSearch';
import { HOME_CARDS, HERO_QUICK_LINKS, logoUrl } from '@/data/services';
import { REVIEWS, HOME_FAQ_LINKS, AVITO_REVIEWS_URL } from '@/data/faq';
import { SITE } from '@/data/site';

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only-pp">Оплата зарубежных сервисов и подписок</h1>

      {/* HERO */}
      <section className="container-pp pt-12 md:pt-20 pb-10">
        <p className="eyebrow">
          Оплата зарубежных сервисов и подписок · 5–15 минут · от 99₽
        </p>
        <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-text leading-[1.05]">
          Какой сервис нужно оплатить?
        </h2>

        <HeroSearch />

        <div className="mt-6 flex flex-wrap gap-2">
          {HERO_QUICK_LINKS.map((l) => (
            <Link
              key={l.q}
              href={`/catalog?q=${l.q}`}
              className="inline-flex items-center gap-2 rounded-full bg-bg2 border border-line2 px-3 py-2 text-[13px] text-text hover:border-accent"
            >
              <img
                src={logoUrl(l.logo)}
                alt={l.name}
                className="w-5 h-5 rounded-sm object-contain bg-white p-0.5"
              />
              {l.name}
            </Link>
          ))}
          <a
            href="#popupinvoice"
            className="inline-flex items-center gap-2 rounded-full bg-cta-grad px-3 py-2 text-[13px] font-semibold text-white"
          >
            Оплата Invoice
          </a>
        </div>

        <p className="mt-6 text-muted text-[13px]">
          Без автосписаний · Возврат, если не оплатили · Поддержка с 08:00 до 24:00 МСК
        </p>
      </section>

      {/* POPULAR SERVICES */}
      <section className="container-pp pt-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="h-section">Популярные сервисы</h2>
          <Link href="/catalog" className="text-accent text-[14px] hover:underline">
            Все 90+ сервисов →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {HOME_CARDS.map((c) => (
            <div key={c.name} className="card hover:border-accent transition group">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                  c.bg ? 'bg-white' : 'bg-bg3'
                }`}
              >
                <img
                  src={logoUrl(c.logo)}
                  alt={c.name}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="font-semibold text-text">{c.name}</div>
              <div className="text-muted text-[13px] mt-1">{c.desc}</div>
              <div className="text-accent text-[14px] font-semibold mt-3">{c.price}</div>
              <a
                href="#popupforma"
                className="mt-3 inline-flex text-[13px] text-text group-hover:text-accent"
              >
                Оплатить ›
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* INVOICE CTA */}
      <section className="container-pp mt-20">
        <div className="rounded-3xl bg-gradient-to-br from-bg2 to-bg3 border border-line2 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex-1">
            <span className="eyebrow">Дополнительная услуга</span>
            <h2 className="mt-3 text-2xl md:text-4xl font-semibold text-text">
              Оплачиваем счета от иностранных компаний
            </h2>
            <p className="sub mt-3 max-w-2xl">
              Инвойсы за обучение, услуги, товары. USD, EUR, GBP и другие
              валюты. SWIFT-перевод напрямую получателю.
            </p>
          </div>
          <a href="#popupinvoice" className="btn-primary !px-6 !py-4 !text-[16px] shrink-0">
            Оплатить инвойс
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="container-pp mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { n: '5.0 ★', l: 'Рейтинг на Avito' },
          { n: '5–15 мин', l: 'От заявки до оплаты' },
          { n: '90 +', l: 'Сервисов в каталоге' },
          { n: '7/7', l: 'Дней на связи с 08:00' },
        ].map((s) => (
          <div key={s.l} className="card text-center">
            <div className="text-2xl md:text-3xl font-semibold text-accent">{s.n}</div>
            <div className="text-muted text-[13px] mt-2">{s.l}</div>
          </div>
        ))}
      </section>

      {/* ABOUT */}
      <section className="container-pp mt-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="eyebrow">О нас</span>
          <div className="mt-2 text-accent2 text-[13px]">
            Платформа оплаты зарубежных сервисов и подписок
          </div>
          <h2 className="h-section mt-4">
            Оплата зарубежных сервисов и подписок из России
          </h2>
          <p className="sub mt-4">
            ChatGPT, Netflix, Booking, Spotify, Adobe, Discord и многие другие.
            Помогаем клиентам из России оплачивать иностранные сервисы и счета —
            быстро, безопасно, без автосписаний.
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden border border-line2 bg-bg2 aspect-[5/4] flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-7xl mb-4">💳</div>
            <div className="text-text font-semibold text-lg">PlataPay</div>
            <div className="text-muted text-sm">
              платформа оплаты зарубежных сервисов
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-pp mt-24">
        <div className="card text-center py-10 px-6">
          <h2 className="h-section">Не нашли свой сервис?</h2>
          <p className="sub mt-3 max-w-xl mx-auto">
            Напишите нам — оплатим практически любой зарубежный сервис или счёт.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="btn-primary">
              Открыть каталог →
            </Link>
            <a href={SITE.telegram} target="_blank" rel="noreferrer" className="btn-tg">
              Написать в Telegram
            </a>
          </div>
          <p className="text-muted text-[13px] mt-5">
            Работаем ежедневно с 08:00 до 24:00 по МСК · ответ за 1–15 минут
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-pp mt-24">
        <h2 className="h-section text-center">Как это работает?</h2>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { t: 'Оставляете заявку', d: 'Выбираете нужный сервис в каталоге' },
            { t: 'Уточняем детали', d: 'Связываемся и согласовываем оплату' },
            { t: 'Оплачиваете удобно', d: 'Картой или через СБП — как удобно' },
            { t: 'Получаете доступ', d: 'Оплачиваем сервис и подтверждаем' },
          ].map((s, i) => (
            <div key={s.t} className="card">
              <div className="w-9 h-9 rounded-full bg-cta-grad flex items-center justify-center text-white font-semibold mb-3">
                {i + 1}
              </div>
              <div className="font-semibold text-text">{s.t}</div>
              <div className="text-muted text-[13px] mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="container-pp mt-24">
        <h2 className="h-section text-center">Почему выбирают нас?</h2>
        <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { t: 'Безопасные платежи', d: 'Гарантия безопасности и конфиденциальности' },
            { t: 'Работаем с РФ картами', d: 'Оплата российскими картами и СБП' },
            { t: 'Грамотные специалисты', d: 'Поможем, даже если сервиса нет в каталоге' },
            { t: 'Быстро и удобно', d: 'Оформим за 5 минут удобным способом' },
            { t: 'Поддержка с 08:00', d: 'На связи каждый день без выходных' },
            { t: 'Без автосписаний', d: 'Платите только за конкретную заявку' },
          ].map((f) => (
            <div key={f.t} className="card">
              <div className="font-semibold text-text">{f.t}</div>
              <div className="text-muted text-[13px] mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS + QUICK FAQ */}
      <section id="otzivi" className="container-pp mt-24 grid md:grid-cols-2 gap-10">
        <div>
          <div className="flex items-end justify-between mb-5">
            <h2 className="h-section">Отзывы клиентов</h2>
            <a
              href={AVITO_REVIEWS_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-[14px] hover:underline"
            >
              Все отзывы →
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="card">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ background: r.bg }}
                  >
                    {r.letter}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-text">{r.name}</div>
                    <div className="text-muted text-[12px]">
                      <span className="text-star">{'★'.repeat(r.stars)}</span> · {r.date}
                    </div>
                  </div>
                  <span className="text-[11px] text-bg font-semibold rounded px-2 py-1" style={{ background: '#9bc736' }}>
                    Avito
                  </span>
                </div>
                <p className="text-muted mt-3 text-[14px]">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="h-section mb-5">Часто задаваемые вопросы</h2>
          <div className="flex flex-col gap-3">
            {HOME_FAQ_LINKS.map((f, i) => {
              const id =
                i === 0 ? '#popup:infoblock' : i === 1 ? '#popup2' : '#popup3';
              return (
                <a
                  key={f.q}
                  href={id}
                  className="card flex items-center justify-between hover:border-accent transition"
                >
                  <span className="text-text font-medium">{f.q}</span>
                  <span className="text-accent">›</span>
                </a>
              );
            })}
            <Link href="/faq" className="text-accent text-[14px] hover:underline mt-2 self-end">
              Все вопросы →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
