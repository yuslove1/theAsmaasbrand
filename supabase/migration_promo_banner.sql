-- ============================================================
--  Run this in the Supabase SQL editor (Project → SQL Editor)
--  Adds a single-row settings table for the site-wide promo/sale
--  announcement banner shown in the top bar.
-- ============================================================

CREATE TABLE promo_banner (
  id         TEXT PRIMARY KEY DEFAULT 'main',
  message    TEXT NOT NULL DEFAULT '',
  is_active  BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO promo_banner (id, message, is_active) VALUES ('main', '', FALSE);

ALTER TABLE promo_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active promo banner"
  ON promo_banner FOR SELECT USING (is_active = TRUE);

GRANT SELECT ON promo_banner TO anon;
GRANT ALL ON promo_banner TO service_role;
