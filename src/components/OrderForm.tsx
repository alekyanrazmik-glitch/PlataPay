'use client';

import { useState } from 'react';
import { SITE } from '@/data/site';

export function OrderForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = [
      'Заявка с сайта PlataPay',
      `Сервис: ${fd.get('service_select') || ''} ${fd.get('service_custom') || ''}`.trim(),
      `Тариф: ${fd.get('plan_select') || ''} ${fd.get('plan_custom') || ''}`.trim(),
      `Сумма: ${fd.get('amount') || ''} ${fd.get('currency') || ''}`.trim(),
      `Связь: ${fd.get('contact_type') || ''} — ${fd.get('contact') || ''}`,
      `Имя: ${fd.get('name') || ''}`,
      `Телефон: ${fd.get('phone') || ''}`,
      `Комментарий: ${fd.get('note') || ''}`,
    ].join('\n');
    const url = `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-xl bg-bg3 border border-line2 p-6 text-center">
        <p className="text-text font-semibold">Заявка отправлена в WhatsApp</p>
        <p className="text-muted text-[14px] mt-2">
          Если окно не открылось — напишите нам в{' '}
          <a className="text-accent" href={SITE.telegram} target="_blank" rel="noreferrer">Telegram</a>{' '}
          или на{' '}
          <a className="text-accent" href={`mailto:${SITE.email}`}>{SITE.emailDisplay}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
      <Field full label="Какой сервис нужно оплатить?" required>
        <select name="service_select" className="select" required defaultValue="">
          <option value="" disabled>Выберите сервис</option>
          <option>ChatGPT</option>
          <option>Claude</option>
          <option>Spotify</option>
          <option>YouTube Premium</option>
          <option>Adobe CC</option>
          <option>Canva</option>
          <option>Discord</option>
          <option>Booking</option>
          <option>Figma</option>
          <option>Zoom</option>
          <option>Notion</option>
          <option>Stripe</option>
          <option>Другой</option>
        </select>
      </Field>
      <Field full label="Укажите название сервиса (если выбрали «Другой»)">
        <input name="service_custom" className="input" placeholder="Например: Midjourney" />
      </Field>

      <Field label="Тариф / вариант подписки" required>
        <select name="plan_select" className="select" required defaultValue="">
          <option value="" disabled>Выберите тариф</option>
          <option>Месяц</option>
          <option>3 месяца</option>
          <option>Год</option>
          <option>Pro</option>
          <option>Plus</option>
          <option>Premium</option>
          <option>Другой</option>
        </select>
      </Field>
      <Field label="Тариф (своё значение)">
        <input name="plan_custom" className="input" placeholder="Например: Pro, годовая, $20" />
      </Field>

      <Field label="Сумма пополнения">
        <input name="amount" className="input" placeholder="Например: 20" inputMode="decimal" />
      </Field>
      <Field label="Валюта">
        <select name="currency" className="select" defaultValue="USD">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="RUB">RUB</option>
        </select>
      </Field>

      <Field label="Желаемый способ связи" required>
        <select name="contact_type" className="select" required defaultValue="">
          <option value="" disabled>Выберите способ</option>
          <option>Telegram</option>
          <option>WhatsApp</option>
          <option>Телефон</option>
          <option>Email</option>
        </select>
      </Field>
      <Field label="Контакт (username / email)">
        <input name="contact" className="input" placeholder="@username" />
      </Field>

      <Field label="Ваше имя" required>
        <input name="name" className="input" placeholder="Как к вам обращаться" required />
      </Field>
      <Field label="Телефон" required>
        <input name="phone" type="tel" className="input" placeholder="+7 (___) ___-__-__" required />
      </Field>

      <Field full label="Дополнительная информация">
        <textarea name="note" rows={3} className="textarea" placeholder="Если есть, что уточнить" />
      </Field>

      <label className="md:col-span-2 flex items-start gap-3 text-[13px] text-muted">
        <input type="checkbox" required className="mt-1 accent-accent" />
        <span>
          Согласие на{' '}
          <a href="#popuppolicy" className="text-accent">обработку персональных данных</a>
        </span>
      </label>

      <div className="md:col-span-2">
        <button type="submit" className="btn-primary w-full md:w-auto">
          Отправить заявку
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <span className="label">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </span>
      {children}
    </div>
  );
}
