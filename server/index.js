'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook endpoint needs raw body BEFORE express.json() parses it,
// so signature verification works on the original bytes.
app.use('/api/webhook', express.raw({ type: '*/*' }));
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', paymentRoutes);

// success.html / fail.html served from server/public/
app.use(express.static(path.join(__dirname, 'public')));

// Built static site from ./out (project root)
const OUT = path.join(__dirname, '../out');
app.use(express.static(OUT));

// Fallback: serve index.html for SPA-style routes
app.get('*', (_req, res) => {
  const index = path.join(OUT, 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.status(503).send('Static site not built. Run: node build.mjs');
  }
});

// Bind to 0.0.0.0 so the server is reachable from outside the container.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PlataPay server started on port ${PORT}`);
});
