-- ============================================================
--  Run this in the Supabase SQL editor (Project → SQL Editor)
--  1. Promo popup: an image "ad" shown as an overlay on the site
--  2. Payment receipts: buyers upload proof of transfer before
--     reporting payment
--  Safe to run more than once.
-- ============================================================

-- ─── Promo popup (stored on the existing single promo_banner row) ───
ALTER TABLE promo_banner ADD COLUMN IF NOT EXISTS popup_image_url    TEXT    NOT NULL DEFAULT '';
ALTER TABLE promo_banner ADD COLUMN IF NOT EXISTS popup_link         TEXT    NOT NULL DEFAULT '';
ALTER TABLE promo_banner ADD COLUMN IF NOT EXISTS popup_is_active    BOOLEAN NOT NULL DEFAULT FALSE;
-- How long to wait before showing the popup again to a visitor who closed it
ALTER TABLE promo_banner ADD COLUMN IF NOT EXISTS popup_repeat_hours INTEGER NOT NULL DEFAULT 6
  CHECK (popup_repeat_hours BETWEEN 1 AND 720);

-- ─── Payment receipts ───────────────────────────────────────
-- { public_id, resource_type, format, uploaded_at } of the private Cloudinary upload
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_receipt JSONB;
