// PlataPay payment backend (Cloudflare Worker).
//
// The rest of the site is a static export (GitHub Pages) with no server —
// this Worker is the only place that ever sees Enot secret keys or handles
// the Enot webhook. It exposes three endpoints:
//
//   POST /api/create-payment   — frontend calls this to start a payment
//   POST /api/enot-webhook     — Enot calls this to report payment status
//   GET  /api/order-status     — optional lookup used by the success page
//
// Order records live in the ORDERS KV namespace, keyed by our own order_id
// (not Enot's internal id), so the webhook can find the order regardless
// of exactly which id fields Enot echoes back.
import { createHash } from 'node:crypto';

const ORDER_KEY_PREFIX = 'order:';
const MIN_AMOUNT_RUB = 10;
const MAX_AMOUNT_RUB = 1_000_000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function withCors(response, origin, env) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin, env))) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

function corsHeaders(origin, env) {
  const allowed = allowedOrigins(env);
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function allowedOrigins(env) {
  const site = (env.SITE_URL || 'https://payoplata.ru').replace(/\/$/, '');
  // Local dev servers used while testing the static build (see README).
  return [site, 'https://payoplata.ru', 'http://localhost:8934', 'http://localhost:3000'];
}

function md5Hex(input) {
  return createHash('md5').update(String(input), 'utf8').digest('hex');
}

// Constant-time-ish comparison so a mismatched signature can't be probed
// character-by-character via response timing.
function safeEqual(a, b) {
  const strA = String(a || '');
  const strB = String(b || '');
  if (strA.length !== strB.length) return false;
  let diff = 0;
  for (let i = 0; i < strA.length; i++) diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  return diff === 0;
}

function genOrderId() {
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  return `PP${Date.now().toString(36).toUpperCase()}${rand}`;
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function saveOrder(env, order) {
  await env.ORDERS.put(ORDER_KEY_PREFIX + order.order_id, JSON.stringify(order));
}

async function loadOrder(env, orderId) {
  const raw = await env.ORDERS.get(ORDER_KEY_PREFIX + orderId);
  return raw ? JSON.parse(raw) : null;
}

// Enot's classic payment-link scheme (confirmed against a working PHP
// client and against the field descriptions in the merchant's own Enot
// dashboard): the browser is sent straight to a signed GET link, there is
// no server-to-server "create invoice" call for this flow.
//   https://enot.io/pay?m=<shop_id>&oa=<amount>&o=<order_id>&s=<sign>&cr=<currency>&c=<comment>
//   sign = md5(`${shop_id}:${secret_key}:${amount}:${order_id}`)
function buildEnotPaymentUrl(env, order) {
  const shopId = env.ENOT_SHOP_ID;
  const secret = env.ENOT_SECRET_KEY;
  const sign = md5Hex(`${shopId}:${secret}:${order.amount}:${order.order_id}`);
  const params = new URLSearchParams({
    m: String(shopId),
    oa: String(order.amount),
    o: order.order_id,
    s: sign,
    cr: order.currency,
    c: `${order.service}${order.tariff ? ' — ' + order.tariff : ''}`.slice(0, 150),
  });
  return `https://enot.io/pay?${params.toString()}`;
}

async function sendTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.error('sendTelegram: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not configured');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error('sendTelegram: Telegram API returned', res.status, await res.text());
  } catch (err) {
    console.error('sendTelegram: request failed', err);
  }
}

async function handleCreatePayment(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const service = String(body.service || '').trim().slice(0, 100);
  const tariff = String(body.tariff || '').trim().slice(0, 150);
  const name = String(body.name || '').trim().slice(0, 100);
  const contact = String(body.contact || '').trim().slice(0, 200);
  const comment = String(body.comment || '').trim().slice(0, 500);
  const amount = Math.round(Number(body.amount));

  if (!service) return json({ error: 'missing_service' }, 400);
  if (!name) return json({ error: 'missing_name' }, 400);
  if (!contact || contact.length < 3) return json({ error: 'missing_contact' }, 400);
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_RUB || amount > MAX_AMOUNT_RUB) {
    return json({ error: 'invalid_amount' }, 400);
  }
  if (!env.ENOT_SHOP_ID || !env.ENOT_SECRET_KEY) {
    console.error('handleCreatePayment: Enot credentials not configured');
    return json({ error: 'payments_not_configured' }, 500);
  }

  const now = new Date().toISOString();
  const order = {
    order_id: genOrderId(),
    service,
    tariff,
    amount,
    currency: 'RUB',
    name,
    contact,
    comment,
    status: 'created',
    created_at: now,
    updated_at: now,
    paid_at: null,
    enot_intid: null,
    source_page: request.headers.get('referer') || '',
  };

  const payment_url = buildEnotPaymentUrl(env, order);
  order.status = 'pending';
  order.updated_at = new Date().toISOString();
  await saveOrder(env, order);

  return json({ order_id: order.order_id, payment_url });
}

// Field names below cover the aliases seen across Enot/AnyPay-family
// integrations. The raw payload is always logged (`wrangler tail`) so the
// mapping can be corrected against a real test webhook if Enot's actual
// field names differ — see worker/README.md.
async function handleWebhook(request, env) {
  const contentType = request.headers.get('content-type') || '';
  let data;
  try {
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries(new URLSearchParams(await request.text()));
    }
  } catch (err) {
    console.error('webhook: failed to parse body', err);
    return new Response('bad request', { status: 400 });
  }

  console.log('enot webhook payload:', JSON.stringify(data));

  const orderId = data.order_id || data.o || data.pay_id || data.merchant_order_id;
  const amount = data.amount ?? data.oa ?? data.sum;
  const merchantId = data.merchant_id ?? data.merchant ?? data.m ?? env.ENOT_SHOP_ID;
  const sign2 = data.sign_2 ?? data.sign2;
  const statusField = String(data.status || '').toLowerCase();
  const credited = data.credited === true || data.credited === 'true' || data.credited === '1';

  if (!orderId) {
    console.error('webhook: no order id found in payload');
    return new Response('missing order id', { status: 400 });
  }
  if (!env.ENOT_SECRET_KEY_2) {
    console.error('webhook: ENOT_SECRET_KEY_2 not configured — refusing to trust unverifiable webhook');
    return new Response('server not configured', { status: 500 });
  }

  const expectedSign2 = md5Hex(`${merchantId}:${amount}:${env.ENOT_SECRET_KEY_2}:${orderId}`);
  if (!sign2 || !safeEqual(String(sign2).toLowerCase(), expectedSign2.toLowerCase())) {
    console.error('webhook: signature mismatch', { orderId, got: sign2, expected: expectedSign2 });
    return new Response('invalid signature', { status: 403 });
  }

  const order = await loadOrder(env, orderId);
  if (!order) {
    console.error('webhook: unknown order_id', orderId);
    return new Response('unknown order', { status: 404 });
  }

  // Idempotency: Enot may retry the same notification. Once an order is
  // marked paid we never re-process it or re-notify Telegram.
  if (order.status === 'paid') {
    return new Response('ok', { status: 200 });
  }

  if (amount !== undefined && Number(amount) !== order.amount) {
    console.error('webhook: amount mismatch', { orderId, expected: order.amount, got: amount });
    return new Response('amount mismatch', { status: 400 });
  }

  const isPaid = credited || statusField === 'paid' || statusField === 'success';
  order.status = isPaid ? 'paid' : statusField === 'cancel' ? 'cancelled' : statusField || 'failed';
  order.updated_at = new Date().toISOString();
  if (isPaid) order.paid_at = new Date().toISOString();
  order.enot_intid = data.intid || null;
  await saveOrder(env, order);

  if (isPaid) {
    const moscowTime = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    await sendTelegram(
      env,
      [
        '✅ <b>Новая оплаченная заявка PlataPay</b>',
        '',
        `Сервис: ${escapeHtml(order.service)}`,
        order.tariff ? `Тариф: ${escapeHtml(order.tariff)}` : null,
        `Сумма: ${order.amount} ₽`,
        `Order ID: <code>${order.order_id}</code>`,
        `Имя клиента: ${escapeHtml(order.name)}`,
        `Контакт: ${escapeHtml(order.contact)}`,
        order.comment ? `Комментарий: ${escapeHtml(order.comment)}` : null,
        'Статус оплаты: Оплачено',
        `Дата: ${moscowTime} МСК`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return new Response('ok', { status: 200 });
}

async function handleOrderStatus(url, env) {
  const orderId = url.searchParams.get('order_id');
  if (!orderId) return json({ error: 'missing_order_id' }, 400);
  const order = await loadOrder(env, orderId);
  if (!order) return json({ error: 'not_found' }, 404);
  return json({
    order_id: order.order_id,
    status: order.status,
    service: order.service,
    amount: order.amount,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    if (url.pathname === '/api/create-payment' && request.method === 'POST') {
      return withCors(await handleCreatePayment(request, env), origin, env);
    }

    if (url.pathname === '/api/enot-webhook' && request.method === 'POST') {
      // Server-to-server — no CORS needed, Enot isn't a browser.
      return handleWebhook(request, env);
    }

    if (url.pathname === '/api/order-status' && request.method === 'GET') {
      return withCors(await handleOrderStatus(url, env), origin, env);
    }

    return new Response('Not found', { status: 404 });
  },
};
