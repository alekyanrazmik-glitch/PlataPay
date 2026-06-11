'use client';

import { useState } from 'react';
import { SITE } from '@/data/site';

export function InvoiceForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = [
      'Заявка на оплату инвойса',
      `Имя: ${fd.get('name') || ''}`,
      `Связь: ${fd.get('contact_type') || ''} — ${fd.get('contact') || ''}`,
      `Телефон: ${fd.get('phone') || ''}`,
      `Получатель: ${fd.get('payee') || ''}`,
      `Сумма: ${fd.get('amount') || ''} ${fd.get('currency') || ''}`,
      `Назначение: ${fd.get('purpose') || ''}`,
      `Реквизиты: ${fd.get('details') || ''}`,
      `Срок: ${fd.get('deadline') || ''}`,
      `Комментарий: ${fd.get('note') || ''}`,
      'Инвойс приложите в WhatsApp/Telegram отдельным сообщением.',
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
          Приложите файл инвойса отдельным сообщением. Также можно написать в{' '}
          <a className="text-accent" href={SITE.telegram} target="_blank" rel="noreferrer">Telegram</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
      <Field label="Ваше имя" required>
        <input name="name" className="input" placeholder="Как к вам обращаться" required />
      </Field>
      <Field label="Способ связи" required>
        <select name="contact_type" className="select" required defaultValue="">
          <option value="" disabled>Выберите способ</option>
          <option>Telegram</option>
          <option>WhatsApp</option>
          <option>Телефон (звонок)</option>
          <option>Email</option>
        </select>
      </Field>

      <Field label="Телефон" required>
        <input name="phone" type="tel" className="input" placeholder="+7 999 123-45-67" required />
      </Field>
      <Field label="Telegram / WhatsApp / Email">
        <input name="contact" className="input" placeholder="@username, ссылка или email" />
      </Field>

      <Field full label="Получатель платежа (только латиницей)" required>
        <input name="payee" className="input" placeholder="Company name / University / Supplier" required />
      </Field>

      <Field label="Сумма" required>
        <input name="amount" className="input" placeholder="Например: 1500" required />
      </Field>
      <Field label="Валюта" required>
        <select name="currency" className="select" required defaultValue="">
          <option value="" disabled>Выберите</option>
          <option>USD ($)</option>
          <option>EUR (€)</option>
          <option>GBP (£)</option>
          <option>CNY (¥)</option>
          <option>TRY (₺)</option>
          <option>CHF</option>
          <option>JPY</option>
          <option>AED</option>
          <option>Другая</option>
        </select>
      </Field>

      <Field full label="Назначение платежа (только латиницей)" required>
        <input name="purpose" className="input" placeholder="Payment for tuition / services / goods" required />
      </Field>

      <Field full label="Реквизиты получателя (IBAN / SWIFT / счёт, только латиницей)">
        <textarea
          name="details"
          rows={3}
          className="textarea"
          placeholder={"IBAN: ...\nSWIFT/BIC: ...\nAccount number / Bank name"}
        />
      </Field>

      <Field label="Срок оплаты">
        <input name="deadline" className="input" placeholder="Например: до 5 июня" />
      </Field>
      <Field label="Файл инвойса">
        <p className="text-[13px] text-muted3">
          После отправки заявки приложите файл инвойса в WhatsApp/Telegram (PDF, JPG, PNG, до 20 МБ).
        </p>
      </Field>

      <Field full label="Дополнительная информация">
        <textarea name="note" rows={3} className="textarea" placeholder="Реквизиты, особенности, что важно учесть" />
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
