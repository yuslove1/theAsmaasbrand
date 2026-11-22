-- ============================================================
--  Run in the Supabase SQL editor (already applied to production)
--  Optional "old price" for a product. When it's set and higher than
--  price, the shop shows it struck through next to the current price.
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2)
  CHECK (compare_at_price IS NULL OR compare_at_price > 0);
