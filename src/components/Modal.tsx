'use client';

import { useEffect, useState } from 'react';

export function Modal({
  id,
  children,
  width = 'md',
}: {
  id: string;
  children: React.ReactNode;
  width?: 'md' | 'lg';
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setOpen(window.location.hash === '#' + id);
    };
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [id]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const close = () => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setOpen(false);
  };

  if (!open) return null;

  const w = width === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${w} rounded-2xl bg-bg2 border border-line2 shadow-2xl my-8`}
      >
        <button
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full text-muted hover:text-text hover:bg-bg3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6"/></svg>
        </button>
        {children}
      </div>
    </div>
  );
}
