'use strict';
const crypto = require('crypto');

// Disable Vercel's automatic body parsing so we receive raw bytes.
// HMAC-SHA256 must be computed on the original request body.
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-enot-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-enot-signature header' });
  }

  // Collect raw bytes from the stream
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  // Verify HMAC-SHA256 signature
  const secret = process.env.ENOT_SECRET_KEY;
  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    let valid = false;
    try {
      valid = crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature.padEnd(expected.length, ' '), 'hex'),
      );
    } catch { /* length mismatch → invalid */ }

    if (!valid) {
      console.warn('[webhook] invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }
  } else {
    console.warn('[webhook] ENOT_SECRET_KEY not set — skipping signature check');
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { order_id, status, amount, credited, custom_fields } = payload;
  console.log(`[webhook] order=${order_id} status=${status} amount=${amount}`);

  if (status === 'success' || status === 'paid') {
    const service = custom_fields?.service || '—';
    const contact = custom_fields?.contact || '—';
    const paid    = credited ?? amount;
    const msk     = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    const token  = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const msg =
        `✅ <b>Оплата получена!</b>\n\n` +
        `🛒 Сервис: <b>${service}</b>\n` +
        `📞 Контакт: <b>${contact}</b>\n` +
        `💰 Сумма: <b>${paid} ₽</b>\n` +
        `🆔 Заказ: <code>${order_id}</code>\n` +
        `🕐 Время: ${msk} МСК`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: msg,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }).catch((e) => console.error('[telegram]', e.message));
    }
  }

  // Enot expects 200 OK to mark the webhook as delivered
  return res.json({ status: 'ok' });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;
