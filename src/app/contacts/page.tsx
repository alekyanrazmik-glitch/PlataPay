import { SITE } from '@/data/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты — PlataPay',
  description: 'Telegram, WhatsApp, Email — свяжитесь с нами в любое время.',
};

export default function ContactsPage() {
  return (
    <section className="container-pp pt-12 md:pt-16 pb-16">
      <h1 className="h-section">Свяжитесь с нами</h1>
      <p className="sub mt-3 max-w-2xl">
        Ответим на любой вопрос и поможем оплатить нужный сервис. На связи
        каждый день, без выходных.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ContactCard
          color="#26A5E4"
          title="Telegram"
          line={SITE.telegramHandle}
          href={SITE.telegram}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.7l-.36 4.04c.52 0 .75-.22 1.02-.5l2.45-2.34 5.07 3.71c.93.51 1.59.24 1.83-.86l3.32-15.55h.01c.29-1.37-.5-1.91-1.4-1.57L1.07 9.06C-.27 9.58-.25 10.34.84 10.67l4.92 1.53 11.43-7.2c.54-.34 1.03-.15.62.2L9.04 15.7z"/></svg>
          }
        />
        <ContactCard
          color="#25D366"
          title="WhatsApp"
          line={SITE.whatsappDisplay}
          href={SITE.whatsapp}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.4L2 22l4.7-1.5A11 11 0 1 0 20.5 3.5zM12 20.1a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3a8 8 0 1 1 6.5 3.4zm4.6-5.8c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9s2 3.1 5 4.4c1.8.8 2.5.8 3.4.7a2.6 2.6 0 0 0 1.8-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>
          }
        />
        <ContactCard
          color="#2e7bff"
          title="Email"
          line={SITE.emailDisplay}
          href={`mailto:${SITE.email}`}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>
          }
        />
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        <div className="card">
          <h4 className="text-text font-semibold">Время работы</h4>
          <p className="text-muted text-[14px] mt-2 leading-relaxed">
            Ежедневно с 08:00 до 24:00 по МСК · без выходных
            <br />
            Среднее время ответа — от 1 до 15 минут
          </p>
        </div>
        <div className="card">
          <h4 className="text-text font-semibold">Работаем официально</h4>
          <p className="text-muted text-[14px] mt-2 leading-relaxed">
            {SITE.legal.name}
            <br />
            ИНН {SITE.legal.inn} · КПП {SITE.legal.kpp} · ОГРН {SITE.legal.ogrn}
            <br />
            {SITE.legal.address}
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  color,
  title,
  line,
  href,
  icon,
}: {
  color: string;
  title: string;
  line: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="card hover:border-accent transition group block"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
        style={{ background: color }}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-text font-semibold text-xl">{title}</h3>
      <p className="text-muted text-[14px] mt-1 break-all">{line}</p>
      <span className="text-accent text-[14px] mt-4 inline-flex group-hover:translate-x-1 transition-transform">
        Написать →
      </span>
    </a>
  );
}
