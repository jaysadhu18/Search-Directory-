const express = require('express');
const cors = require('cors');
const peopleRoutes = require('./routes/people.routes');

const app = express();

// CORS_ORIGIN: comma-separated list of allowed origins (e.g. your Vercel URL).
// Left unset, all origins are allowed — fine for local dev.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : null;

app.use(cors(allowedOrigins ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.use('/api/people', peopleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

module.exports = app;
