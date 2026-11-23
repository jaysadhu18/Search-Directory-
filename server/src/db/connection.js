const path = require('path');
const { createClient } = require('@libsql/client');

// In production, point at a hosted Turso database:
//   TURSO_DATABASE_URL=libsql://<db-name>-<org>.turso.io
//   TURSO_AUTH_TOKEN=<token>
// Locally (both vars unset) it falls back to a plain file on disk — the
// libSQL client talks to both the same way, so the rest of the app never
// needs to know which one it's using.
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '..', '..', 'data', 'samaj.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient(authToken ? { url, authToken } : { url });

const ready = db.execute(`
  CREATE TABLE IF NOT EXISTS people (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sno        INTEGER,
    name       TEXT NOT NULL,
    address    TEXT,
    phone      TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).then(() =>
  db.execute('CREATE INDEX IF NOT EXISTS idx_people_name ON people(name)')
);

module.exports = { db, ready };
