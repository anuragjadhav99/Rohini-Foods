-- ============================================================
--  Rohini Foods India — SQLite Database Schema
--  This schema is compatible with SQLite database
-- ============================================================

-- ------------------------------------------------------------
--  PRODUCTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  price       REAL NOT NULL,
  image_url   TEXT,
  category    TEXT DEFAULT 'Pickles',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  CONTACTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  ORDERS TABLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT NOT NULL,
  total_amount  REAL NOT NULL DEFAULT 0.00,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL,
  product_id   INTEGER,
  product_name TEXT NOT NULL,
  price        REAL NOT NULL,
  qty          INTEGER NOT NULL DEFAULT 1,
  image_url    TEXT,
  category     TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  phone       TEXT UNIQUE,
  name        TEXT,
  provider    TEXT NOT NULL DEFAULT 'local',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  AUTH OTPs TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_otps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  target      TEXT NOT NULL,
  type        TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  DATETIME NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  SEED DATA — sample products
-- ------------------------------------------------------------
INSERT OR IGNORE INTO products (name, description, price, image_url, category) VALUES
('Mango Aachar',
 'A classic North Indian mango pickle made with raw Alphonso mangoes, mustard oil, and hand-ground spices. Sun-cured the traditional way.',
 249.00,
 'product.heic',
 'Pickles'),

('Lemon Aachar',
 'Tangy, bright, and full of zing. Fresh lemons slow-cured with rock salt, fenugreek, and a whisper of asafoetida.',
 199.00,
 'https://images.unsplash.com/photo-1589533610925-1cffc309ebcd?w=800',
 'Pickles'),

('Green Chilli Aachar',
 'For the brave-hearted. Plump green chillies packed with mustard seeds and mustard oil — fiery, flavourful, unforgettable.',
 229.00,
 'https://images.unsplash.com/photo-1599909533730-ed5e19e1ec92?w=800',
 'Pickles'),

('Mixed Vegetable Aachar',
 'A celebration of the season — carrots, cauliflower, turnip, and green chillies pickled in warm, aromatic spices.',
 269.00,
 'https://images.unsplash.com/photo-1571950006418-f226dc106482?w=800',
 'Pickles'),

('Garlic Aachar',
 'Peeled garlic pods mellowed in mustard oil with red chilli powder and hing. A powerful, warming pickle.',
 239.00,
 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800',
 'Pickles'),

('Homemade Ghee',
 'Pure cow ghee, slow-churned from cultured cream. Golden, nutty, and made in small batches.',
 599.00,
 'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=800',
 'Homemade'),

('Masala Papad',
 'Hand-rolled, sun-dried papads seasoned with cracked pepper and cumin. Fry or roast — both delicious.',
 149.00,
 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
 'Homemade'),

('Gunpowder Chutney',
 'The iconic South Indian molagapodi — roasted lentils, sesame, red chillies. Sprinkle over idlis with ghee.',
 179.00,
 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
 'Homemade');
