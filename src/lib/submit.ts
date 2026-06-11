import { SITE } from '@/data/site';

const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(
  SITE.email,
)}`;

/**
 * Submits form data to FormSubmit's AJAX endpoint so a copy of every
 * request arrives by email — fire-and-forget, no error blocks the
 * primary WhatsApp redirect. First request to a new address triggers a
 * confirmation email; click the link once to activate.
 */
export async function sendBackup(subject: string, fields: Record<string, string>) {
  try {
    await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        ...fields,
      }),
    });
  } catch {
    // network errors are non-fatal — WhatsApp is the primary channel
  }
}

export function openWhatsApp(text: string) {
  const url = `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
