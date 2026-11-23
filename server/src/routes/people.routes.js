const express = require('express');
const { db } = require('../db/connection');

const router = express.Router();

// GET /api/people?q=&page=&limit=
// Lists people, optionally filtered by a search term across name/address/phone,
// paginated (defaults to page 1, 50 per page).
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = (page - 1) * limit;

    let where = '';
    let args = [];
    if (q) {
      where = `WHERE lower(name) LIKE ? OR lower(address) LIKE ? OR lower(phone) LIKE ?`;
      args = [`%${q}%`, `%${q}%`, `%${q}%`];
    }

    const countResult = await db.execute({ sql: `SELECT COUNT(*) AS count FROM people ${where}`, args });
    const total = Number(countResult.rows[0].count);

    const results = await db.execute({
      sql: `SELECT * FROM people ${where} ORDER BY sno ASC, id ASC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    res.json({ results: results.rows, total, page, limit });
  } catch (error) {
    console.error('List/search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/people — create a new person
router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const maxSnoResult = await db.execute('SELECT MAX(sno) AS maxSno FROM people');
    const maxSno = maxSnoResult.rows[0].maxSno || 0;

    const insertResult = await db.execute({
      sql: 'INSERT INTO people (sno, name, address, phone) VALUES (?, ?, ?, ?)',
      args: [Number(maxSno) + 1, name.trim(), (address || '').trim(), (phone || '').trim()],
    });

    const personResult = await db.execute({
      sql: 'SELECT * FROM people WHERE id = ?',
      args: [insertResult.lastInsertRowid],
    });

    res.json({ success: true, message: 'Person added successfully', person: personResult.rows[0] });
  } catch (error) {
    console.error('Add person error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while adding the person.' });
  }
});

// PUT /api/people/:id — update an existing person
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existing = await db.execute({ sql: 'SELECT * FROM people WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await db.execute({
      sql: 'UPDATE people SET name = ?, address = ?, phone = ? WHERE id = ?',
      args: [name.trim(), (address || '').trim(), (phone || '').trim(), id],
    });

    const personResult = await db.execute({ sql: 'SELECT * FROM people WHERE id = ?', args: [id] });
    res.json({ success: true, message: 'Person updated successfully', person: personResult.rows[0] });
  } catch (error) {
    console.error('Update person error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while updating the person.' });
  }
});

// DELETE /api/people/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.execute({ sql: 'SELECT * FROM people WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await db.execute({ sql: 'DELETE FROM people WHERE id = ?', args: [id] });
    res.json({ success: true, message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while deleting the person.' });
  }
});

module.exports = router;
