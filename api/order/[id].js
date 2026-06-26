'use strict';

// Vercel Functions are stateless — there is no shared in-memory store.
// Order details are embedded in the success page URL by create-invoice.js
// and do not require a separate lookup endpoint.
// Add Vercel KV / Postgres here if persistent order history is needed.
module.exports = function handler(_req, res) {
  return res.status(404).json({
    error: 'Order lookup not available in serverless mode.',
    hint: 'Order details are passed via URL parameters to the success page.',
  });
};
