'use strict';
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createInvoice } = require('../services/enot');
const { verifyWebhookSignature } = require('../utils/signature');
const { sendTelegramNotification } = require('../services/telegram');

// In-memory order store.
// For production with multiple instances, replace with Redis or Postgres.
const orders = new Map();

// POST /api/create-invoice
router.post('/create-invoice', async (req, res) => {
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

  const orderId = uuidv4();
  const description = `${String(service).trim()} — ${String(contact).trim()}`;

  try {
    const invoice = await createInvoice({
      orderId,
      amount: amountRub,
      description,
      service: String(service).trim(),
      contact: String(contact).trim(),
    });

    orders.set(orderId, {
      id: orderId,
      service: String(service).trim(),
      contact: String(contact).trim(),
      amount: amountRub,
      status: 'pending',
      enotInvoiceId: invoice.id,
      createdAt: new Date().toISOString(),
    });

    console.log(`[order:created] ${orderId} — ${service} — ${amountRub}₽`);
    return res.json({ orderId, paymentUrl: invoice.url });
  } catch (err) {
    console.error('[create-invoice]', err.message);
    return res.status(502).json({ error: 'Не удалось создать счёт. Попробуйте ещё раз.' });
  }
});

// POST /api/webhook/enot  — called by Enot after payment
router.post('/webhook/enot', async (req, res) => {
  const signature = req.headers['x-enot-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-enot-signature header' });
  }

  const rawBody = req.body; // Buffer, because express.raw() is applied on /api/webhook
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[webhook] invalid signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in webhook body' });
  }

  const { order_id, status, amount, credited, id: enotId, custom_fields } = payload;
  console.log(`[webhook] order=${order_id} status=${status} amount=${amount}`);

  if (status === 'success' || status === 'paid') {
    const order = orders.get(order_id);

    // Skip if we've already processed this order as paid (idempotency).
    if (order && order.status === 'paid') {
      return res.json({ status: 'ok' });
    }

    // Prefer the in-memory order; fall back to custom_fields from the
    // webhook payload so a container restart between invoice creation and
    // payment doesn't lose the service/contact details.
    const service = order?.service || custom_fields?.service || '—';
    const contact = order?.contact || custom_fields?.contact || '—';
    const paid    = credited ?? amount;

    if (order) {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
      order.enotId = enotId;
      order.creditedAmount = paid;
      orders.set(order_id, order);
    } else {
      console.warn(`[webhook] order ${order_id} not in memory — using custom_fields`);
    }

    const msk = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const msg =
      `✅ <b>Оплата получена!</b>\n\n` +
      `🛒 Сервис: <b>${service}</b>\n` +
      `📞 Контакт: <b>${contact}</b>\n` +
      `💰 Сумма: <b>${paid} ₽</b>\n` +
      `🆔 Заказ: <code>${order_id}</code>\n` +
      `🕐 Время: ${msk} МСК`;

    sendTelegramNotification(msg).catch((e) =>
      console.error('[telegram]', e.message)
    );
  }

  // Enot expects 200 OK to mark webhook as delivered
  return res.json({ status: 'ok' });
});

// GET /api/order/:id — check order status (used by success page)
router.get('/order/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({
    id: order.id,
    service: order.service,
    status: order.status,
    amount: order.amount,
    createdAt: order.createdAt,
    paidAt: order.paidAt ?? null,
  });
});

module.exports = router;
