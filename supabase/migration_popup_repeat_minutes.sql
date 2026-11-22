-- ============================================================
--  Run in the Supabase SQL editor AFTER migration_promo_popup_and_receipts.sql
--  The popup "show again" interval is now in minutes (visitors rarely stay for hours)
-- ============================================================
ALTER TABLE promo_banner DROP CONSTRAINT IF EXISTS promo_banner_popup_repeat_hours_check;
ALTER TABLE promo_banner RENAME COLUMN popup_repeat_hours TO popup_repeat_minutes;
UPDATE promo_banner SET popup_repeat_minutes = 5;
ALTER TABLE promo_banner ALTER COLUMN popup_repeat_minutes SET DEFAULT 5;
ALTER TABLE promo_banner ADD CONSTRAINT promo_banner_popup_repeat_minutes_check
  CHECK (popup_repeat_minutes BETWEEN 1 AND 1440);
