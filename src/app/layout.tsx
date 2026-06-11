import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { ModalsRoot } from '@/components/ModalsRoot';

const YM_ID = 109522965;

export const metadata: Metadata = {
  title: {
    default: 'PlataPay — оплата зарубежных сервисов',
    template: '%s — PlataPay',
  },
  description:
    'Помогаем оплатить зарубежные подписки, сервисы, игры, AI-инструменты и бронирования.',
  metadataBase: new URL('https://payoplata.ru'),
  applicationName: 'PlataPay',
  keywords: [
    'оплата зарубежных сервисов',
    'оплата подписок',
    'ChatGPT',
    'Claude',
    'Spotify',
    'Netflix',
    'Adobe',
    'инвойс',
    'оплата из России',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'PlataPay',
    title: 'PlataPay — оплата зарубежных сервисов',
    description:
      'Оплачиваем ChatGPT, Netflix, Adobe, Booking и сотни других зарубежных сервисов из России. 5–15 минут, без автосписаний.',
    url: 'https://payoplata.ru',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlataPay — оплата зарубежных сервисов',
    description:
      'Оплачиваем ChatGPT, Netflix, Adobe, Booking и сотни других зарубежных сервисов из России.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
        <ModalsRoot />

        <Script id="ym-counter" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${YM_ID}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
        `}</Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
