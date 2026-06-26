'use strict';
const crypto = require('crypto');

function verifyWebhookSignature(rawBody, receivedSignature) {
  const secret = process.env.ENOT_SECRET_KEY;
  if (!secret) {
    console.warn('[signature] ENOT_SECRET_KEY not configured — skipping verification (UNSAFE in production!)');
    return true;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    // timingSafeEqual prevents timing attacks; both buffers must be same length
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(receivedSignature.padEnd(expected.length, ' '), 'hex')
    );
  } catch {
    return false;
  }
}

module.exports = { verifyWebhookSignature };
