import express from 'express';
const router = express.Router();

// GET all customers
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all('SELECT * FROM customer ORDER BY id DESC');
  res.json(rows);
});

// POST new customer
router.post('/', async (req, res) => {
  const db = req.app.locals.db;
  const { name, company, address, phone, email } = req.body; // customer_id removed
  const stmt = `INSERT INTO customer (name, company, address, phone, email)
                VALUES (?, ?, ?, ?, ?)`;
  const result = await db.run(stmt, [name, company, address, phone, email]);
  res.json({ id: result.lastID });
});

// UPDATE customer
router.put('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const id = req.params.id;
  const { name, company, address, phone, email } = req.body;
  await db.run(
    `UPDATE customer SET name=?, company=?, address=?, phone=?, email=? WHERE id=?`,
    [name, company, address, phone, email, id]
  );
  res.json({ updated: true });
});

// SEARCH customer
router.get('/search', async (req, res) => {
  const db = req.app.locals.db;
  const q = `%${req.query.q || ''}%`;
  const rows = await db.all(
    `SELECT * FROM customer WHERE name LIKE ? OR company LIKE ? OR phone LIKE ? LIMIT 50`,
    [q, q, q]
  );
  res.json(rows);
});

export default router;
