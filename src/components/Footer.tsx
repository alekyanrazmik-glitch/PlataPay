import Link from 'next/link';
import { SITE } from '@/data/site';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg mt-24">
      <div className="container-pp py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 text-muted text-[14px] leading-relaxed max-w-xs">
            {SITE.tagline}
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={SITE.telegram}
              aria-label="Telegram"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-bg2 border border-line2 text-muted hover:text-accent hover:border-accent"
              target="_blank"
              rel="noreferrer"
            >
              <TgIcon />
            </a>
            <a
              href={SITE.whatsapp}
              aria-label="WhatsApp"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-bg2 border border-line2 text-muted hover:text-green hover:border-green"
              target="_blank"
              rel="noreferrer"
            >
              <WaIcon />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label="Email"
              className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-bg2 border border-line2 text-muted hover:text-accent hover:border-accent"
            >
              <MailIcon />
            </a>
          </div>
        </div>

        <FooterCol title="Навигация">
          <Link href="/" className="footer-link">Главная</Link>
          <Link href="/catalog" className="footer-link">Каталог</Link>
          <Link href="/#otzivi" className="footer-link">Отзывы</Link>
          <Link href="/faq" className="footer-link">FAQ</Link>
          <Link href="/contacts" className="footer-link">Контакты</Link>
        </FooterCol>

        <FooterCol title="Сервисы">
          <Link href="/catalog" className="footer-link">Нейросети</Link>
          <Link href="/catalog" className="footer-link">Видео и дизайн</Link>
          <Link href="/catalog" className="footer-link">Музыка и кино</Link>
          <Link href="/catalog" className="footer-link">Игры</Link>
          <Link href="/catalog" className="footer-link">Все сервисы</Link>
        </FooterCol>

        <FooterCol title="Важно">
          <p className="text-muted text-[13px] leading-relaxed">
            PlataPay не является банком или платёжной системой. Мы оказываем
            консультационную и посредническую помощь в оплате зарубежных
            сервисов.
          </p>
        </FooterCol>
      </div>

      <div className="border-t border-line">
        <div className="container-pp py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[12px] text-muted3">
          <p>{SITE.copyright}</p>
          <div className="flex gap-4">
            <a href="#popupoferta" className="hover:text-text">Публичная оферта</a>
            <a href="#popuppolicy" className="hover:text-text">Политика конфиденциальности</a>
          </div>
        </div>
      </div>

      <style>{`.footer-link{color:#9fb2d4;font-size:14px;display:block;padding:4px 0;}
        .footer-link:hover{color:#eef3ff;}`}</style>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-text font-semibold text-[14px] mb-4">{title}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function TgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.04 15.7l-.36 4.04c.52 0 .75-.22 1.02-.5l2.45-2.34 5.07 3.71c.93.51 1.59.24 1.83-.86l3.32-15.55h.01c.29-1.37-.5-1.91-1.4-1.57L1.07 9.06C-.27 9.58-.25 10.34.84 10.67l4.92 1.53 11.43-7.2c.54-.34 1.03-.15.62.2L9.04 15.7z"/>
    </svg>
  );
}
function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 3.6 17.4L2 22l4.7-1.5A11 11 0 1 0 20.5 3.5zM12 20.1a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3a8 8 0 1 1 6.5 3.4zm4.6-5.8c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9s2 3.1 5 4.4c1.8.8 2.5.8 3.4.7a2.6 2.6 0 0 0 1.8-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.1-.3-.2-.5-.3z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  );
}
