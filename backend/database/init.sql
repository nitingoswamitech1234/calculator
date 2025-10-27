PRAGMA foreign_keys = ON;

-- Drop old tables
DROP TABLE IF EXISTS paper_master;
DROP TABLE IF EXISTS printing_master;
DROP TABLE IF EXISTS lamination_master;
DROP TABLE IF EXISTS corrugation_master;
DROP TABLE IF EXISTS pasting_master;
DROP TABLE IF EXISTS transport_master;
DROP TABLE IF EXISTS vendor_master;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS pinning_master;
DROP TABLE IF EXISTS backups;

-- Masters: Paper
-- Paper Brand Table
CREATE TABLE IF NOT EXISTS paper_brand (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Paper Size Table (linked to brand)
CREATE TABLE IF NOT EXISTS paper_size (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_id INTEGER NOT NULL,
  size TEXT NOT NULL,
  rate_per_kg REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (brand_id) REFERENCES paper_brand(id) ON DELETE CASCADE
);


-- Masters: Printing
DROP TABLE IF EXISTS printing_master;

CREATE TABLE printing_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  printing_type TEXT NOT NULL,
  rate REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
-- Masters: Lamination
CREATE TABLE lamination_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lamination_type TEXT NOT NULL,
  rate_per_sqft REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Masters: Corrugation
CREATE TABLE corrugation_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  corrugation_type TEXT NOT NULL,
  rate_per_kg REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Masters: Pasting & Pinning
CREATE TABLE pasting_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  rate REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);




-- Customer Master
CREATE TABLE customer (
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
CREATE TABLE backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);


-- Table for machines
CREATE TABLE IF NOT EXISTS die_cutting_machine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_name TEXT NOT NULL
);

-- Table for sizes linked to machine
CREATE TABLE IF NOT EXISTS die_cutting_size (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER NOT NULL,
    size TEXT NOT NULL,
    rate_per_unit REAL NOT NULL,
    FOREIGN KEY(machine_id) REFERENCES die_cutting_machine(id) ON DELETE CASCADE
);


DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT,
    customer_id INTEGER,
    box_name TEXT,
    quantity INTEGER,

    -- 📏 Sheet & Box Dimensions
    sheet_length REAL DEFAULT 0,
    sheet_breadth REAL DEFAULT 0,
    gsm REAL DEFAULT 0,
    total_sheets INTEGER DEFAULT 0,
    box_length REAL DEFAULT 0,
    box_breadth REAL DEFAULT 0,

    -- 💰 Price Fields
    sheet_price REAL DEFAULT 0,
    corr_price REAL DEFAULT 0,
    printing_price REAL DEFAULT 0,
    lamination_price REAL DEFAULT 0,
    pin_price REAL DEFAULT 0,
    pasting_price REAL DEFAULT 0,
    die_cutting_price REAL DEFAULT 0,
    transport_price REAL DEFAULT 0,

    -- 🧮 Totals
    total_price REAL DEFAULT 0,
    extra_percent REAL DEFAULT 0,
    final_total REAL DEFAULT 0,

    remark TEXT,
    order_date TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
);
