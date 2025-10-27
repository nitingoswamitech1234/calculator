import express from "express";
const router = express.Router();

/**
 * Common Pattern:
 * - GET → Fetch all records
 * - POST → Insert new record
 * - PUT → Update record
 * - DELETE → Delete record
 *
 * Each uses SQLite db instance stored in req.app.locals.db
 */

/* ============ PAPER MASTER ============ */
// 📄 Get all brands with their sizes
router.get("/paper", async (req, res) => {
  const db = req.app.locals.db;
  const brands = await db.all("SELECT * FROM paper_brand ORDER BY id DESC");
  const data = [];

  for (const brand of brands) {
    const sizes = await db.all("SELECT * FROM paper_size WHERE brand_id=?", [brand.id]);
    data.push({ ...brand, sizes });
  }

  res.json(data);
});

// ➕ Add new brand
router.post("/paper/brand", async (req, res) => {
  const db = req.app.locals.db;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Brand name required" });

  const result = await db.run(
    `INSERT INTO paper_brand (name, created_at) VALUES (?, datetime('now'))`,
    [name]
  );
  res.json({ id: result.lastID });
});

// ➕ Add size to brand
router.post("/paper/size", async (req, res) => {
  const db = req.app.locals.db;
  const { brand_id, size, rate_per_kg } = req.body;
  if (!brand_id || !size || !rate_per_kg)
    return res.status(400).json({ error: "Brand, size, and rate are required" });

  const result = await db.run(
    `INSERT INTO paper_size (brand_id, size, rate_per_kg, created_at) VALUES (?, ?, ?, datetime('now'))`,
    [brand_id, size, rate_per_kg]
  );
  res.json({ id: result.lastID });
});

// ✏️ Edit size
router.put("/paper/size/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { size, rate_per_kg } = req.body;
  await db.run(
    `UPDATE paper_size SET size=?, rate_per_kg=?, created_at=datetime('now') WHERE id=?`,
    [size, rate_per_kg, req.params.id]
  );
  res.json({ updated: true });
});

// ❌ Delete size
router.delete("/paper/size/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM paper_size WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});


/* ============ PRINTING MASTER ============ */
// Get all printing masters
router.get("/printing", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM printing_master ORDER BY id DESC");
  res.json(rows);
});

// Add new printing master
router.post("/printing", async (req, res) => {
  const db = req.app.locals.db;
  const { printing_type, rate } = req.body;
  const result = await db.run(
    `INSERT INTO printing_master (printing_type, rate, created_at, updated_at)
     VALUES (?, ?, datetime('now'), datetime('now'))`,
    [printing_type, rate]
  );
  res.json({ id: result.lastID });
});

// Update existing printing master
router.put("/printing/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { printing_type, rate } = req.body;
  await db.run(
    `UPDATE printing_master 
     SET printing_type=?, rate=?, updated_at=datetime('now') 
     WHERE id=?`,
    [printing_type, rate, req.params.id]
  );
  res.json({ updated: true });
});

// Delete printing master
router.delete("/printing/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM printing_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});


/* ============ LAMINATION MASTER ============ */
router.get("/lamination", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM lamination_master ORDER BY id DESC");
  res.json(rows);
});

router.post("/lamination", async (req, res) => {
  const db = req.app.locals.db;
  const { lamination_type, rate_per_sqft } = req.body; // rate_per_sqft use karo
  const result = await db.run(
    `INSERT INTO lamination_master (lamination_type, rate_per_sqft, created_at)
     VALUES (?, ?, datetime('now'))`,
    [lamination_type, rate_per_sqft]
  );
  res.json({ id: result.lastID });
});

router.put("/lamination/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { lamination_type, rate_per_sqft } = req.body; // rate_per_sqft use karo
  await db.run(
    `UPDATE lamination_master SET lamination_type=?, rate_per_sqft=?, updated_at=datetime('now') WHERE id=?`,
    [lamination_type, rate_per_sqft, req.params.id]
  );
  res.json({ updated: true });
});

router.delete("/lamination/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM lamination_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});


/* ============ CORRUGATION MASTER ============ */
// GET all corrugations
router.get("/corrugation", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM corrugation_master ORDER BY id DESC");
  res.json(rows);
});

// CREATE new corrugation
router.post("/corrugation", async (req, res) => {
  const db = req.app.locals.db;
  const { corrugation_type, rate_per_kg } = req.body;  // updated key
  if (!corrugation_type || rate_per_kg == null) {
    return res.status(400).json({ error: "Corrugation type and rate_per_kg are required" });
  }
  const result = await db.run(
    `INSERT INTO corrugation_master (corrugation_type, rate_per_kg, created_at)
     VALUES (?, ?, datetime('now'))`,
    [corrugation_type, rate_per_kg]
  );
  res.json({ id: result.lastID });
});

// UPDATE existing corrugation
router.put("/corrugation/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { corrugation_type, rate_per_kg } = req.body;  // updated key
  if (!corrugation_type || rate_per_kg == null) {
    return res.status(400).json({ error: "Corrugation type and rate_per_kg are required" });
  }
  await db.run(
    `UPDATE corrugation_master SET corrugation_type=?, rate_per_kg=?, updated_at=datetime('now') WHERE id=?`,
    [corrugation_type, rate_per_kg, req.params.id]
  );
  res.json({ updated: true });
});

// DELETE corrugation
router.delete("/corrugation/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM corrugation_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});


/* ============ PASTING / PINNING MASTER ============ */
// GET all pasting records
router.get("/pasting", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM pasting_master ORDER BY id DESC");
  res.json(rows);
});

// POST new pasting record
router.post("/pasting", async (req, res) => {
  const db = req.app.locals.db;
  const { method, rate } = req.body; // changed from rate_per_box
  const result = await db.run(
    `INSERT INTO pasting_master (method, rate, created_at)
     VALUES (?, ?, datetime('now'))`,
    [method, rate]
  );
  res.json({ id: result.lastID });
});

// UPDATE pasting record
router.put("/pasting/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { method, rate } = req.body; // changed from rate_per_box
  await db.run(
    `UPDATE pasting_master SET method=?, rate=?, updated_at=datetime('now') WHERE id=?`,
    [method, rate, req.params.id]
  );
  res.json({ updated: true });
});

// DELETE pasting record
router.delete("/pasting/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM pasting_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});



/* ============ TRANSPORT MASTER ============ */
router.get("/transport", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM transport_master ORDER BY id DESC");
  res.json(rows);
});

router.post("/transport", async (req, res) => {
  const db = req.app.locals.db;
  const { vendor, rate_per_km, fixed_charge, contact } = req.body;
  const result = await db.run(
    `INSERT INTO transport_master (vendor, rate_per_km, fixed_charge, contact, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [vendor, rate_per_km, fixed_charge || 0, contact || ""]
  );
  res.json({ id: result.lastID });
});

router.put("/transport/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { vendor, rate_per_km, fixed_charge, contact } = req.body;
  await db.run(
    `UPDATE transport_master SET vendor=?, rate_per_km=?, fixed_charge=?, contact=?, updated_at=datetime('now') WHERE id=?`,
    [vendor, rate_per_km, fixed_charge || 0, contact || "", req.params.id]
  );
  res.json({ updated: true });
});

router.delete("/transport/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM transport_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});

/* ============ VENDOR MASTER (Optional) ============ */
// routes/masters.js
router.get("/vendor", async (req, res) => {
  const db = req.app.locals.db;
  const rows = await db.all("SELECT * FROM vendor_master ORDER BY id DESC");
  res.json(rows);
});

router.post("/vendor", async (req, res) => {
  const db = req.app.locals.db;
  const { vendor_name, contact, gst_no, address } = req.body; // gst_no mapped to material_type
  const result = await db.run(
    `INSERT INTO vendor_master (vendor_name, contact, material_type, address, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [vendor_name, contact, gst_no || "", address || ""]
  );
  res.json({ id: result.lastID });
});

router.put("/vendor/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { vendor_name, contact, gst_no, address } = req.body;
  await db.run(
    `UPDATE vendor_master SET vendor_name=?, contact=?, material_type=?, address=?, updated_at=datetime('now') WHERE id=?`,
    [vendor_name, contact, gst_no || "", address || "", req.params.id]
  );
  res.json({ updated: true });
});

router.delete("/vendor/:id", async (req, res) => {
  const db = req.app.locals.db;
  await db.run("DELETE FROM vendor_master WHERE id=?", [req.params.id]);
  res.json({ deleted: true });
});


// POST /api/auto-sheet
router.post("/auto-sheet", (req, res) => { 
  try {
    const { boxLength, boxWidth } = req.body;

    if (!boxLength || !boxWidth) {
      return res.status(400).json({ error: "boxLength and boxWidth required" });
    }

    // Hardcoded sheet options (inch)
    const sheets = [
      { length: 21, breadth: 26 },
      { length: 22, breadth: 28 },
      { length: 24, breadth: 28 },
      { length: 25, breadth: 30 },
      { length: 20, breadth: 30 },
      { length: 21, breadth: 36 },
      { length: 23, breadth: 36 },
      { length: 26, breadth: 36 },
      { length: 26, breadth: 38 },
      { length: 28, breadth: 40 },
      { length: 32, breadth: 37 },
      { length: 31, breadth: 41 }
    ];

    // Calculate total boxes for each sheet
    let bestSheet = null;
    let maxBoxes = 0;

    sheets.forEach(sheet => {
      const boxesAlongLength = Math.floor(sheet.length / boxLength);
      const boxesAlongWidth = Math.floor(sheet.breadth / boxWidth);
      const totalBoxes = boxesAlongLength * boxesAlongWidth;

      if (totalBoxes > maxBoxes) {
        maxBoxes = totalBoxes;
        bestSheet = {
          sheetLength: sheet.length,
          sheetWidth: sheet.breadth,
          boxesAlongLength,
          boxesAlongWidth,
          totalBoxes
        };
      }
    });

    res.json({
      boxLength,
      boxWidth,
      suggestedSheet: bestSheet
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



/* ============ CALCULATE GRAMMAGE / WEIGHT (INCH TO CM) ============ */
// POST /sheet-weight
router.post("/sheet-weight", (req, res) => {
  try {
    const length = Number(req.body.length);  // inch
    const breadth = Number(req.body.breadth); // inch
    const gsm = Number(req.body.gsm);
    const quantity = Number(req.body.sheets || 1);

    if (!length || !breadth || !gsm) {
      return res.status(400).json({ error: "All values required" });
    }

    // Customer standard formula
    const weightPerSheet = (length * breadth * gsm) / (1550 * 500); // in kg (customer formula)
    const totalWeight = weightPerSheet * quantity;

    res.json({
      success: true,
      weightPerSheet: Number(weightPerSheet.toFixed(3)), // kg
      totalWeight: Number(totalWeight.toFixed(3)),       // kg
      unit: "kg",
      formula: "(length * breadth * GSM) / 1550 / 500 × quantity"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});





// POST /sheet-price
router.post("/sheet-price", (req, res) => {
  try {
    const totalWeightKg = Number(req.body.totalWeight); // kg
    const rate_per_kg = Number(req.body.rate_per_kg);

    if (!totalWeightKg || !rate_per_kg) {
      return res.status(400).json({ error: "totalWeight and rate_per_kg required" });
    }

    const totalPrice = totalWeightKg * rate_per_kg;

    res.json({
      success: true,
      totalWeightKg: Number(totalWeightKg.toFixed(3)),
      totalPrice: Number(totalPrice.toFixed(2)), // ₹
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});








/* ============ CALCULATE CORRUGATION WEIGHT (INCH TO CM) ============ */

router.post("/corrugation/weight", async (req, res) => {
  try {
    const { length, breadth, type } = req.body;

    if (!length || !breadth || !type) {
      return res.status(400).json({ error: "length, breadth, and type are required" });
    }

    let constant = 0;

    switch (type.toLowerCase()) {
      case "rg":
        constant = 330;
        break;
      case "agro":
        constant = 285;
        break;
      case "dns":
        constant = 350;
        break;
      default:
        return res.status(400).json({ error: "Invalid corrugation type (use RG, AGRO, or DNS)" });
    }

    // ✅ Simple formula (in gram)
    const weight = (length * breadth * constant) / 1550;

    res.json({
      type: type.toUpperCase(),
      length_inch: length,
      breadth_inch: breadth,
      weight: parseFloat(weight.toFixed(2)), // in grams
      unit: "g",
      formula_used: `(${length} × ${breadth} × ${constant}) / 1550`
    });
  } catch (err) {
    console.error("Corrugation Weight Calculation Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ============ DIE-CUTTING MASTER ============ */
// Get all machines with their sizes
router.get("/die-cutting", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const machines = await db.all("SELECT * FROM die_cutting_machine");
    const data = [];

    for (const m of machines) {
      const sizes = await db.all("SELECT * FROM die_cutting_size WHERE machine_id=?", [m.id]);
      data.push({ ...m, sizes });
    }

    res.json(data);
  } catch (err) {
    console.error("Die-Cutting GET Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add machine
router.post("/die-cutting/brand", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { machine_name } = req.body;
    if (!machine_name) return res.status(400).json({ error: "Machine name required" });

    const result = await db.run(
      "INSERT INTO die_cutting_machine (machine_name) VALUES (?)",
      [machine_name]
    );
    res.json({ id: result.lastID, machine_name });
  } catch (err) {
    console.error("Die-Cutting Brand POST Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add size
router.post("/die-cutting/size", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { machine_id, size, rate_per_unit } = req.body;
    if (!machine_id || !size || rate_per_unit === undefined)
      return res.status(400).json({ error: "machine_id, size and rate_per_unit required" });

    const result = await db.run(
      "INSERT INTO die_cutting_size (machine_id, size, rate_per_unit) VALUES (?, ?, ?)",
      [machine_id, size, rate_per_unit]
    );
    res.json({ id: result.lastID, machine_id, size, rate_per_unit });
  } catch (err) {
    console.error("Die-Cutting Size POST Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update size
router.put("/die-cutting/size/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { size, rate_per_unit } = req.body;
    await db.run(
      "UPDATE die_cutting_size SET size=?, rate_per_unit=? WHERE id=?",
      [size, rate_per_unit, req.params.id]
    );
    res.json({ updated: true });
  } catch (err) {
    console.error("Die-Cutting Size PUT Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete size
router.delete("/die-cutting/size/:id", async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.run("DELETE FROM die_cutting_size WHERE id=?", [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    console.error("Die-Cutting Size DELETE Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
