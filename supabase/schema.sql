-- ============================================================
--  THE ASMAA'S BRAND — Supabase Database Schema
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  gender      TEXT[] NOT NULL DEFAULT '{women}' CHECK (gender <@ ARRAY['women', 'men']::TEXT[] AND array_length(gender, 1) > 0),
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO categories (name, slug, gender) VALUES
  ('Abayas',          'abayas',         '{women}'),
  ('Hijabs',          'hijabs',         '{women}'),
  ('Scarves',         'scarves',        '{women}'),
  ('Hijab Pins',      'hijab-pins',     '{women}'),
  ('Islamic Art',     'islamic-art',    '{women,men}'),
  ('Gift Items',      'gift-items',     '{women,men}'),
  ('Jalabias',        'jalabias',       '{men}'),
  ('Inner Caps',      'inner-caps',     '{men}'),
  ('Islamic Essentials', 'islamic-essentials', '{men}');

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL,
  category     TEXT[] NOT NULL DEFAULT '{women}' CHECK (category <@ ARRAY['women', 'men']::TEXT[] AND array_length(category, 1) > 0),
  subcategory  TEXT,
  images       TEXT[] DEFAULT '{}',
  video_url    TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_products_category    ON products USING GIN(category);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_available ON products(is_available);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT NOT NULL UNIQUE,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_whatsapp TEXT,
  delivery_address  TEXT NOT NULL,
  delivery_city     TEXT NOT NULL,
  delivery_state    TEXT NOT NULL,
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10, 2) NOT NULL,
  delivery_fee      NUMERIC(10, 2) DEFAULT 0,
  total             NUMERIC(10, 2) NOT NULL,
  payment_method    TEXT DEFAULT 'bank_transfer',
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
  order_status      TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_order_status   ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at     ON orders(created_at DESC);

-- ─── FEATURED COLLECTIONS ────────────────────────────────────
CREATE TABLE featured_collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL DEFAULT 'Items of the Week',
  subtitle    TEXT,
  share_token TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: which products are in a featured collection
CREATE TABLE featured_collection_products (
  collection_id UUID REFERENCES featured_collections(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, product_id)
);

-- Seed one default active collection
INSERT INTO featured_collections (title, active) VALUES ('This Week''s Picks', TRUE);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collection_products ENABLE ROW LEVEL SECURITY;

-- PUBLIC read access (anon key) for products, categories, featured
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Public can read available products"
  ON products FOR SELECT USING (is_available = TRUE);

CREATE POLICY "Public can read featured collections"
  ON featured_collections FOR SELECT USING (active = TRUE);

CREATE POLICY "Public can read featured collection products"
  ON featured_collection_products FOR SELECT USING (TRUE);

-- Public can INSERT orders (customers placing orders)
CREATE POLICY "Public can place orders"
  ON orders FOR INSERT WITH CHECK (TRUE);

-- Service role (admin) has full access — handled server-side via SUPABASE_SERVICE_ROLE_KEY
-- No additional policies needed since service role bypasses RLS

-- ─── AUTO UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
