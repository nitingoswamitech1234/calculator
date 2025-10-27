import express from "express";
const router = express.Router();

// ======================
// 📦 Save Full Order Data
// ======================
router.post("/save", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const o = req.body;

    // auto order number generate
    const orderNumber = o.order_number || `ORD-${Date.now()}`;

    const stmt = `
      INSERT INTO orders (
        order_number, customer_id, box_name, quantity,
        sheet_length, sheet_breadth, gsm, total_sheets, box_length, box_breadth,
        sheet_price, corr_price, printing_price, lamination_price,
        pin_price, pasting_price, die_cutting_price, transport_price,
        total_price, extra_percent, final_total, remark,
        corrType, pastingMethod,
        paper_id, printing_id, lamination_id, corrugation_id, pasting_id, transport_id,
        order_date, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `;

    const result = await db.run(stmt, [
      orderNumber,
      o.customer_id || null,
      o.box_name || "Unnamed Box",
      o.quantity || 0,

      // Sheet/Box details
      o.sheetLength || 0,
      o.sheetBreadth || 0,
      o.gsm || 0,
      o.totalSheets || 0,
      o.boxLength || 0,
      o.boxBreadth || 0,

      // Price details
      o.sheetPrice || 0,
      o.corrPrice || 0,
      o.printingPrice || 0,
      o.laminationPrice || 0,
      o.pinPrice || 0,
      o.pastingPrice || 0,
      o.dieCuttingPrice || 0,
      o.transportPrice || 0,

      o.totalPrice || 0,
      o.extraPercent || 0,
      o.finalTotal || 0,
      o.remark || "",

      // 📝 corrType + pastingMethod
      o.corrType || null,
      o.pastingMethod || null,

      // Masters IDs
      o.paper_id || null,
      o.printing_id || null,
      o.lamination_id || null,
      o.corrugation_id || null,
      o.pasting_id || null,
      o.transport_id || null,

      "pending" // status
    ]);

    res.json({
      success: true,
      message: "✅ Order saved successfully!",
      order_id: result.lastID,
      order_number: orderNumber,
    });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// GET all orders with optional search (only required details + total)
// ======================
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const q = `%${req.query.search || ""}%`;

    const rows = await db.all(`
      SELECT 
        o.id, o.order_number, o.box_name, o.quantity, o.status,
        c.name AS customer_name,
        COALESCE(p.method, 'N/A') AS paper_name,
        COALESCE(co.corrugation_type, 'N/A') AS corrugation_name,
        COALESCE(pa.method, 'N/A') AS pasting_name,
        COALESCE(pr.printing_type, 'N/A') AS printing_name,
        COALESCE(l.lamination_type, 'N/A') AS lamination_name,
        COALESCE(t.method, 'N/A') AS transport_name,
        o.corrType AS corrType,
        o.pastingMethod AS pastingMethod,
        o.sheet_length, o.sheet_breadth, o.box_length, o.box_breadth,
        o.total_price
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      LEFT JOIN paper_master p ON o.paper_id = p.id
      LEFT JOIN corrugation_master co ON o.corrugation_id = co.id
      LEFT JOIN pasting_master pa ON o.pasting_id = pa.id
      LEFT JOIN printing_master pr ON o.printing_id = pr.id
      LEFT JOIN lamination_master l ON o.lamination_id = l.id
      LEFT JOIN transport_master t ON o.transport_id = t.id
      WHERE c.name LIKE ? OR o.box_name LIKE ?
      ORDER BY o.id DESC
    `, [q, q]);

    res.json(rows);
  } catch (err) {
    console.error("Orders GET Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// ======================
// GET single order by ID (only required details + total)
// ======================
router.get("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const id = req.params.id;

    const row = await db.get(`
      SELECT 
        o.*,
        c.name AS customer_name,
        COALESCE(p.method, 'N/A') AS paper_name,
        COALESCE(co.corrugation_type, 'N/A') AS corrugation_name,
        COALESCE(pa.method, 'N/A') AS pasting_name,
        COALESCE(pr.printing_type, 'N/A') AS printing_name,
        COALESCE(l.lamination_type, 'N/A') AS lamination_name,
        COALESCE(t.method, 'N/A') AS transport_name
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      LEFT JOIN paper_master p ON o.paper_id = p.id
      LEFT JOIN corrugation_master co ON o.corrugation_id = co.id
      LEFT JOIN pasting_master pa ON o.pasting_id = pa.id
      LEFT JOIN printing_master pr ON o.printing_id = pr.id
      LEFT JOIN lamination_master l ON o.lamination_id = l.id
      LEFT JOIN transport_master t ON o.transport_id = t.id
      WHERE o.id = ?
    `, [id]);

    if (!row) return res.status(404).json({ error: "Order not found" });

    // agar corrType ya pastingMethod null ho, default de de
    row.corrType = row.corrType || 'N/A';
    row.pastingMethod = row.pastingMethod || 'N/A';

    res.json(row);
  } catch (err) {
    console.error("Orders GET by ID Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});








// ======================
// PATCH update order status
// ======================
router.patch("/status/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status } = req.body;
    await db.run("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ updated: true });
  } catch (err) {
    console.error("Orders PATCH Status Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ======================
// ✅ PATCH update remark
// ======================
router.patch("/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { remark } = req.body;

    if (remark === undefined) {
      return res.status(400).json({ success: false, error: "Remark is required" });
    }

    await db.run("UPDATE orders SET remark=? WHERE id=?", [remark, req.params.id]);
    res.json({ success: true, message: "Remark updated successfully!" });
  } catch (err) {
    console.error("Orders PATCH Remark Error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
