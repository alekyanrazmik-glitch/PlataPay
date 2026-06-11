'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV } from '@/data/site';
import { Logo } from './Logo';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/85 border-b border-line">
      <div className="container-pp flex items-center justify-between h-16">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const base = item.href.split('#')[0] || '/';
            const active =
              base === '/' ? pathname === '/' && !item.href.includes('#') : pathname === base || pathname.startsWith(base + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-[14px] transition ${
                  active
                    ? 'text-text bg-bg2'
                    : 'text-muted hover:text-text hover:bg-bg2/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#popupforma" className="hidden sm:inline-flex btn-primary !py-2 !px-4 !text-[14px]">
            Оплатить сервис
          </a>
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-line2 text-text"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block w-5 space-y-1">
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-bg/95">
          <div className="container-pp py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-[15px] text-muted hover:text-text hover:bg-bg2/60"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="#popupforma"
              className="btn-primary mt-2"
              onClick={() => setOpen(false)}
            >
              Оплатить сервис
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
