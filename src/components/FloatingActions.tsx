import { SITE } from '@/data/site';

export function FloatingActions() {
  const base =
    'w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition hover:scale-105';
  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-3">
      <a
        href={SITE.telegram}
        target="_blank"
        rel="noreferrer"
        aria-label="Telegram"
        className={`${base} bg-[#26A5E4] text-white`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.7l-.36 4.04c.52 0 .75-.22 1.02-.5l2.45-2.34 5.07 3.71c.93.51 1.59.24 1.83-.86l3.32-15.55h.01c.29-1.37-.5-1.91-1.4-1.57L1.07 9.06C-.27 9.58-.25 10.34.84 10.67l4.92 1.53 11.43-7.2c.54-.34 1.03-.15.62.2L9.04 15.7z"/></svg>
      </a>
      <a
        href={SITE.whatsappOrder}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className={`${base} bg-[#25D366] text-white`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.4L2 22l4.7-1.5A11 11 0 1 0 20.5 3.5zM12 20.1a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3a8 8 0 1 1 6.5 3.4zm4.6-5.8c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9s2 3.1 5 4.4c1.8.8 2.5.8 3.4.7a2.6 2.6 0 0 0 1.8-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>
      </a>
      <a
        href={`mailto:${SITE.email}`}
        aria-label="Email"
        className={`${base} bg-bg2 border border-line2 text-text`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>
      </a>
      <a
        href={`tel:${SITE.phone}`}
        aria-label="Позвонить"
        className={`${base} bg-bg2 border border-line2 text-text`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.4.6 3.7.6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2A19 19 0 0 1 1.2 2.2C1.2 1.5 1.7 1 2.4 1H6c.7 0 1.2.5 1.2 1.2 0 1.3.2 2.6.6 3.7.1.4 0 .8-.3 1z"/></svg>
      </a>
    </div>
  );
}
