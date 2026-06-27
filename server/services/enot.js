'use strict';

const ENOT_CREATE_URL = 'https://api.enot.io/invoice/create';

async function createInvoice({ orderId, amount, description, service, contact }) {
  const apiKey = process.env.ENOT_API_KEY;
  const shopId = process.env.ENOT_SHOP_ID;

  if (!apiKey || !shopId) {
    throw new Error('ENOT_API_KEY or ENOT_SHOP_ID not configured in .env');
  }

  const serverUrl = process.env.SERVER_URL || '';
  const webhookUrl = process.env.WEBHOOK_URL || (serverUrl ? `${serverUrl}/api/webhook/enot` : '');

  const body = {
    amount,
    currency: 'RUB',
    order_id: orderId,
    description,
  };

  // Pass service/contact via custom_fields so the webhook can read them
  // back even if the in-memory order store was cleared by a restart.
  if (service || contact) {
    body.custom_fields = { service: service || '', contact: contact || '' };
  }

  if (webhookUrl) body.webhook_url = webhookUrl;
  if (serverUrl) {
    // Embed service+amount in the success URL so the success page can
    // show order details without a database lookup.
    const q = service ? `&service=${encodeURIComponent(service)}&amount=${amount}` : '';
    body.success_url = `${serverUrl}/success?order_id=${orderId}${q}`;
    body.fail_url    = `${serverUrl}/fail?order_id=${orderId}`;
  }

  const response = await fetch(ENOT_CREATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':  apiKey,
      'x-shop-id':  shopId,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Enot API ${response.status}: ${text}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Enot returned non-JSON: ${text}`);
  }

  // Enot v2 response: { status: 'success', data: { id, url, amount, ... } }
  const data = json.data ?? json;
  const url  = data.url ?? data.payment_url;
  const id   = data.id  ?? data.invoice_id ?? null;

  if (!url) {
    throw new Error(`No payment URL in Enot response: ${text}`);
  }

  return { url, id };
}

module.exports = { createInvoice };
