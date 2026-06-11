import { CatalogView } from '@/components/CatalogView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Все сервисы — PlataPay',
  description:
    'Каталог зарубежных сервисов и подписок: ChatGPT Plus, Claude, Netflix, Spotify, Steam, PlayStation, Booking, Canva, Midjourney и другие.',
};

export default function CatalogPage() {
  return (
    <section className="container-pp pt-12 md:pt-16 pb-10">
      <h1 className="h-section">Все сервисы</h1>
      <p className="sub mt-3 max-w-2xl">
        Не нашли подходящий зарубежный сервис? Свяжитесь с нами, чтобы уточнить
        возможность его оплаты.
      </p>
      <CatalogView />
    </section>
  );
}
