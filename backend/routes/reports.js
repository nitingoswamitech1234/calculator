import express from 'express';
const router = express.Router();

router.get('/monthly', async (req, res) => {
  // params: month (1-12), year (YYYY)
  const db = req.app.locals.db;
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: 'month & year required' });
  const start = `${year}-${String(month).padStart(2,'0')}-01`;
  const end = `${year}-${String(month).padStart(2,'0')}-31`;
  const rows = await db.all(`SELECT customer_id, COUNT(*) as total_orders, SUM(quantity) as total_quantity, SUM(total_cost) as total_value
                             FROM orders WHERE order_date BETWEEN ? AND ? GROUP BY customer_id`, [start, end]);
  // enrich with customer names
  for (let r of rows) {
    if (r.customer_id) {
      const c = await db.get('SELECT name, company FROM customer WHERE id=?', [r.customer_id]);
      r.customer_name = c ? c.name : null;
      r.company = c ? c.company : null;
    } else {
      r.customer_name = 'Unknown';
    }
  }
  res.json(rows);
});

router.get('/history/:customerId', async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all('SELECT * FROM orders WHERE customer_id=? ORDER BY order_date DESC', [req.params.customerId]);
  res.json(rows);
});

export default router;
