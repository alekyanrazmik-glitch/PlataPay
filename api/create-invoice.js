'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { service, contact, amount } = req.body || {};

  if (!service || !String(service).trim()) {
    return res.status(400).json({ error: 'Укажите сервис' });
  }
  const amountRub = Math.round(Number(amount));
  if (!amountRub || amountRub < 100) {
    return res.status(400).json({ error: 'Сумма должна быть не менее 100 ₽' });
  }
  if (!contact || String(contact).trim().length < 4) {
    return res.status(400).json({ error: 'Укажите контакт для связи' });
  }

  const svc = String(service).trim();
  const ctc = String(contact).trim();
  const orderId = uuidv4();

  // Derive the public URL of this deployment so Enot can call back and redirect users.
  // VERCEL_URL is injected automatically by Vercel (no https:// prefix).
  const serverUrl =
    process.env.SERVER_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `https://${req.headers.host}`);

  const body = {
    amount: amountRub,
    currency: 'RUB',
    order_id: orderId,
    description: `${svc} — ${ctc}`,
    webhook_url: `${serverUrl}/api/webhook/enot`,
    // Encode service/amount in success URL so the page can display them
    // without needing a database (serverless functions are stateless).
    success_url: `${serverUrl}/success?order_id=${orderId}&service=${encodeURIComponent(svc)}&amount=${amountRub}`,
    fail_url: `${serverUrl}/fail?order_id=${orderId}`,
    // Store service+contact in Enot custom_fields so the webhook handler
    // can include them in the Telegram notification without a database.
    custom_fields: { service: svc, contact: ctc },
  };

  try {
    const enotRes = await fetch('https://api.enot.io/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ENOT_API_KEY,
        'x-shop-id': process.env.ENOT_SHOP_ID,
      },
      body: JSON.stringify(body),
    });

    const text = await enotRes.text();
    if (!enotRes.ok) throw new Error(`Enot ${enotRes.status}: ${text}`);

    const json = JSON.parse(text);
    const data = json.data ?? json;
    const paymentUrl = data.url ?? data.payment_url;
    if (!paymentUrl) throw new Error(`No payment URL in Enot response: ${text}`);

    console.log(`[order:created] ${orderId} — ${svc} — ${amountRub}₽`);
    return res.json({ orderId, paymentUrl });
  } catch (err) {
    console.error('[create-invoice]', err.message);
    return res.status(502).json({ error: 'Не удалось создать счёт. Попробуйте ещё раз.' });
  }
};
