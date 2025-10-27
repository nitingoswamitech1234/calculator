// backend/database/database.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data.sqlite");

let dbInstance = null;

export async function initDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      try {
        fs.unlinkSync(DB_PATH);
        console.log("✅ Old DB deleted");
      } catch (err) {
        console.warn(
          "⚠️ Could not delete old DB (maybe locked). Continuing anyway..."
        );
      }
    }
    // hello 
 

    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

    console.log("⚙️ Creating fresh tables...");

    await db.exec(`
      PRAGMA foreign_keys = ON;

      -- Masters: Paper
      CREATE TABLE IF NOT EXISTS paper_brand (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS paper_size (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        rate_per_kg REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (brand_id) REFERENCES paper_brand(id) ON DELETE CASCADE
      );

      -- Masters: Printing
      CREATE TABLE IF NOT EXISTS printing_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        printing_type TEXT NOT NULL,
        rate REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Masters: Lamination
      CREATE TABLE IF NOT EXISTS lamination_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lamination_type TEXT NOT NULL,
        rate_per_sqft REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Masters: Corrugation
      CREATE TABLE IF NOT EXISTS corrugation_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        corrugation_type TEXT NOT NULL,
        rate_per_kg REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Masters: Pasting & Pinning
      CREATE TABLE IF NOT EXISTS pasting_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        rate REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS pinning_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        rate_per_box REAL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Customer Master
      CREATE TABLE IF NOT EXISTS customer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT UNIQUE,
        name TEXT NOT NULL,
        company TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Backups table
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Admin
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Die Cutting
      CREATE TABLE IF NOT EXISTS die_cutting_machine (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS die_cutting_size (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machine_id INTEGER NOT NULL,
        size TEXT NOT NULL,
        rate_per_unit REAL NOT NULL,
        FOREIGN KEY(machine_id) REFERENCES die_cutting_machine(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS transport_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        rate REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS paper_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        gsm REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Orders
      CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT,
    customer_id INTEGER,
    box_name TEXT,
    quantity INTEGER,
    sheet_length REAL DEFAULT 0,
    sheet_breadth REAL DEFAULT 0,
    gsm REAL DEFAULT 0,
    total_sheets INTEGER DEFAULT 0,
    box_length REAL DEFAULT 0,
    box_breadth REAL DEFAULT 0,
    sheet_price REAL DEFAULT 0,
    corr_price REAL DEFAULT 0,
    printing_price REAL DEFAULT 0,
    lamination_price REAL DEFAULT 0,
    pin_price REAL DEFAULT 0,
    pasting_price REAL DEFAULT 0,
    die_cutting_price REAL DEFAULT 0,
    transport_price REAL DEFAULT 0,
    total_price REAL DEFAULT 0,
    extra_percent REAL DEFAULT 0,
    final_total REAL DEFAULT 0,
    remark TEXT,
    -- nayi columns
    corrType TEXT,
    pastingMethod TEXT,

    -- 🔹 Master IDs for proper joins
    paper_id INTEGER,
    printing_id INTEGER,
    lamination_id INTEGER,
    corrugation_id INTEGER,
    pasting_id INTEGER,
    transport_id INTEGER,

    order_date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
);
    `);

    console.log("✅ Fresh tables created successfully!");
    dbInstance = db;
    return db;
  } catch (err) {
    console.error("❌ DB init error:", err);
    throw err;
  }
}

export async function connectDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

initDB().catch((err) => {
  console.error("❌ DB initialization failed:", err);
});
