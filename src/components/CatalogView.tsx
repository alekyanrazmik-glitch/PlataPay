'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SERVICES, CATEGORIES, logoUrl } from '@/data/services';

function CatalogViewInner() {
  const params = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return SERVICES.filter((s) => {
      if (cat !== 'all' && s.cat !== cat) return false;
      if (qq && !s.name.toLowerCase().includes(qq) && !s.desc.toLowerCase().includes(qq)) return false;
      return true;
    });
  }, [q, cat]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: SERVICES.length };
    for (const s of SERVICES) m[s.cat] = (m[s.cat] || 0) + 1;
    return m;
  }, []);

  return (
    <div className="mt-8 grid md:grid-cols-[240px_1fr] gap-6">
      <aside>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input mb-4"
          placeholder="Найти сервис…"
          aria-label="Поиск"
        />
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-left transition ${
                  active ? 'bg-bg3 text-text' : 'text-muted hover:bg-bg2/60 hover:text-text'
                }`}
              >
                <span>{c.label}</span>
                <span className="text-[11px] text-muted3">{counts[c.key] || 0}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div>
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-text font-semibold">Ничего не найдено</div>
            <p className="text-muted text-[14px] mt-2 max-w-md mx-auto">
              Попробуйте другое слово или напишите нам — оплатим практически любой
              зарубежный сервис.
            </p>
            <a href="#popupforma" className="btn-primary mt-5">
              Оставить заявку
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.name} className="card hover:border-accent transition group">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                    s.bg ? 'bg-white' : 'bg-bg3'
                  }`}
                >
                  <img
                    src={logoUrl(s.logo)}
                    alt={s.name}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="font-semibold text-text">{s.name}</div>
                <div className="text-muted text-[13px] mt-1">{s.desc}</div>
                <div className="text-accent text-[14px] font-semibold mt-3">от 650 ₽</div>
                <a
                  href="#popupforma"
                  className="mt-3 inline-flex text-[13px] text-text group-hover:text-accent"
                >
                  Оплатить ›
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-8 text-center py-8">
          <div className="text-text font-semibold">Нет нужного сервиса?</div>
          <p className="text-muted text-[14px] mt-2 max-w-md mx-auto">
            Напишите нам — оплатим практически любой зарубежный сервис или счёт.
          </p>
          <a href="#popupforma" className="btn-primary mt-4">
            Оставить заявку
          </a>
        </div>
      </div>
    </div>
  );
}

export function CatalogView() {
  return (
    <Suspense fallback={<div className="mt-8 text-muted">Загрузка…</div>}>
      <CatalogViewInner />
    </Suspense>
  );
}
