// One-time import: reads the legacy Samaj.xlsx and loads every row into the
// `people` table (local file or Turso, whichever connection.js resolves to).
// Safe to re-run — it clears the table first so it never double-inserts.
//
// Usage (from server/):  npm run migrate
// Against production Turso, run with TURSO_DATABASE_URL / TURSO_AUTH_TOKEN set.

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { db, ready } = require('./connection');

const EXCEL_FILE = path.join(__dirname, '..', '..', '..', 'legacy', 'Samaj.xlsx');

async function migrate() {
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`Excel file not found at ${EXCEL_FILE}`);
    process.exit(1);
  }

  await ready;

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  await db.execute('DELETE FROM people');

  const statements = rows.map((row) => {
    const sno = parseInt(row['S. No.'], 10);
    return {
      sql: 'INSERT INTO people (sno, name, address, phone) VALUES (?, ?, ?, ?)',
      args: [
        isNaN(sno) ? null : sno,
        (row['Name'] || '').toString().trim(),
        (row['Address'] || '').toString().trim(),
        (row['Phone Number(s)'] || '').toString().trim(),
      ],
    };
  });

  // Batch in chunks — some hosted SQLite backends cap how many statements a
  // single batch can hold.
  const CHUNK_SIZE = 200;
  for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
    await db.batch(statements.slice(i, i + CHUNK_SIZE), 'write');
  }

  const countResult = await db.execute('SELECT COUNT(*) AS count FROM people');
  console.log(`Migrated ${countResult.rows[0].count} rows from ${EXCEL_FILE} into the database.`);
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
