import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { ModalsRoot } from '@/components/ModalsRoot';

export const metadata: Metadata = {
  title: 'PlataPay — оплата зарубежных сервисов',
  description:
    'Помогаем оплатить зарубежные подписки, сервисы, игры, AI-инструменты и бронирования.',
  metadataBase: new URL('https://payoplata.ru'),
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
      </body>
    </html>
  );
}
