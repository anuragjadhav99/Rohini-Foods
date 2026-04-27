-- ============================================================
--  Rohini Foods India — SQLite Database Schema
--  This file sets up the database tables for the application.
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
  total_amount  REAL NOT NULL DEFAULT 0.0,
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
 'Pure, golden ghee made from fresh cow milk. Slow-cooked the traditional way for that authentic, nutty flavour.',
 399.00,
 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800',
 'Dairy'),

('Pure Honey',
 'Raw, unfiltered honey from local apiaries. Rich in natural enzymes and antioxidants.',
 299.00,
 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
 'Honey'),

('Organic Jaggery',
 'Traditional sugarcane jaggery made without chemicals. Perfect for festive sweets and everyday cooking.',
 149.00,
 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
 'Sweeteners'),

('Spice Mix (Garam Masala)',
 'Aromatic blend of 12 spices — cinnamon, cardamom, cloves, and more. Ground fresh for maximum flavour.',
 189.00,
 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
 'Spices'),

('Turmeric Powder',
 'Premium quality turmeric from organic farms. High curcumin content for health benefits.',
 129.00,
 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
 'Spices');