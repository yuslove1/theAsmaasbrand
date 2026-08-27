-- ============================================================
--  Run this in the Supabase SQL editor (Project → SQL Editor)
--  Adds the payment_accounts table used for showing buyers
--  where to send bank transfers.
-- ============================================================

CREATE TABLE payment_accounts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name      TEXT NOT NULL,
  account_name   TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

-- Buyers (anon key) can read only active accounts
CREATE POLICY "Public can read active payment accounts"
  ON payment_accounts FOR SELECT USING (is_active = TRUE);

GRANT SELECT ON payment_accounts TO anon;
GRANT ALL ON payment_accounts TO service_role;
