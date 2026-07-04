# PlataPay payment backend (Cloudflare Worker)

The rest of PlataPay is a static export deployed to GitHub Pages — it has
no server and can't hold secrets or receive webhooks. This Worker is the
one place that talks to Enot with the real secret keys, and the one place
Enot's webhook can call.

## What it does

- `POST /api/create-payment` — the site's checkout form calls this with
  `{ service, tariff, amount, name, contact, comment }`. It stores the
  order in KV, signs an Enot payment link, and returns
  `{ order_id, payment_url }` for the browser to redirect to.
- `POST /api/enot-webhook` — Enot calls this when a payment's status
  changes. Verifies the signature, updates the order in KV, and sends the
  Telegram notification once (paid orders are idempotent — repeat
  webhooks for an already-paid order are acknowledged without
  re-notifying).
- `GET /api/order-status?order_id=...` — small helper the success page can
  use to show which order it's confirming.

## One-time setup

1. Install wrangler if you don't have it: `npm install -g wrangler`
2. `cd worker && wrangler login`
3. Create the KV namespace for order storage:
   ```
   wrangler kv namespace create ORDERS
   ```
   Copy the `id` it prints into `wrangler.toml`'s `kv_namespaces` entry.
4. Set the secrets (never put real values in `wrangler.toml` — `vars` there
   are plaintext, `secret put` is encrypted):
   ```
   wrangler secret put ENOT_SHOP_ID
   wrangler secret put ENOT_SECRET_KEY
   wrangler secret put ENOT_SECRET_KEY_2
   wrangler secret put TELEGRAM_BOT_TOKEN
   wrangler secret put TELEGRAM_CHAT_ID
   ```
   `ENOT_SHOP_ID`/`ENOT_SECRET_KEY` = "ID проекта" / "Секретный ключ" from
   the Enot dashboard. `ENOT_SECRET_KEY_2` = "Дополнительный ключ" (used
   only to verify the webhook signature).
5. Deploy:
   ```
   wrangler deploy
   ```
   This prints your Worker's URL, something like
   `https://platapay-payments.<your-subdomain>.workers.dev`. A custom
   domain (e.g. `api.payoplata.ru`, added under the Worker's Triggers tab
   in the Cloudflare dashboard) is nicer but not required to get started.

6. Point the frontend at it: open `seo/pricing-ui.mjs`, find the
   `PAYMENTS_API` constant near the top of `buildPricingUiPatch()`, and set
   it to the URL from step 5. Rebuild the site (`node build.mjs`).

7. In the Enot merchant dashboard, set the webhook/postback URL to:
   ```
   https://<your-worker-url>/api/enot-webhook
   ```

## ⚠️ One thing to verify before going live

The payment-link signing (`m/oa/o/s/cr/c` query string, `sign =
md5(shop_id:secret_key:amount:order_id)`) is confirmed against a working
third-party Enot client and matches the field descriptions in the Enot
dashboard itself.

The **webhook signature** (`sign_2`) is implemented from the best available
public documentation, but Enot's official docs blocked automated fetching
while building this, so the exact field names/order couldn't be fully
confirmed. Before relying on this in production:

1. Deploy the Worker and trigger one real (small) test payment.
2. Run `wrangler tail` while it completes, so you see the *actual* raw
   webhook payload Enot sends (the handler logs it in full before doing
   anything else).
3. Compare the field names in that log to what `handleWebhook` in
   `src/index.mjs` reads (`order_id`/`o`/`pay_id`, `amount`/`oa`/`sum`,
   `sign_2`/`sign2`, etc.) and to the `sign_2` formula
   (`md5(merchant_id:amount:secret_key_2:order_id)`), and adjust if Enot's
   real payload differs. The function is small and isolated specifically
   so this is a quick fix if needed.

## Local development

```
cp .dev.vars.example .dev.vars   # fill in real values, never commit this file
wrangler dev
```

## Order lifecycle

Orders are stored in KV as `order:<order_id>` → JSON:
`created` (just built) → `pending` (link handed to the browser) →
`paid` | `failed` | `cancelled` (from the webhook).
