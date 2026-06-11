import { FaqAccordion } from '@/components/FaqAccordion';
import { SITE } from '@/data/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — PlataPay',
  description: 'Вопросы и ответы о работе сервиса оплаты зарубежных подписок.',
};

export default function FaqPage() {
  return (
    <section className="container-pp pt-12 md:pt-16 pb-16">
      <h1 className="h-section">Частые вопросы</h1>
      <p className="sub mt-3 max-w-2xl">
        Собрали ответы на главные вопросы об оплате зарубежных сервисов.
        Не нашли нужный — напишите нам, ответим лично.
      </p>

      <FaqAccordion />

      <div className="card text-center mt-12 py-10">
        <div className="text-text font-semibold text-xl">Остались вопросы?</div>
        <p className="text-muted text-[14px] mt-3 max-w-md mx-auto">
          Ежедневно с 08:00 до 24:00 по МСК · ответ за 1–15 минут
        </p>
        <a href={SITE.telegram} target="_blank" rel="noreferrer" className="btn-tg mt-5">
          Написать в Telegram
        </a>
      </div>
    </section>
  );
}
