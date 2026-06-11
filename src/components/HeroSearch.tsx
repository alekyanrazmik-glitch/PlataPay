'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const search = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    router.push(`/catalog${search}`);
  };

  return (
    <form onSubmit={submit} className="mt-8 flex gap-2 max-w-2xl">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="input flex-1 !py-4 !text-[16px]"
        placeholder="ChatGPT, Netflix, Spotify, Adobe…"
        aria-label="Поиск сервиса"
      />
      <button type="submit" className="btn-primary !py-4 !px-6">
        Найти
      </button>
    </form>
  );
}
