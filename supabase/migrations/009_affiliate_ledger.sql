-- 009_affiliate_ledger.sql
--
-- Real money ledger for the two-tier affiliate model. The old `credits`
-- counters were gameable and unauditable; this table is the source of truth
-- the Auditor bot reconciles against.
--
-- Design:
--   * Append-only: a trigger rejects UPDATE/DELETE. Corrections are new
--     reversing entries, never edits.
--   * Signed amount_cents: positive = owed TO the affiliate (sale_credit),
--     negative = money OUT (payout, clawback).
--   * Payouts are human-approved: created_by records which user approved.
--     No bot or route may create a payout without a human approver.
--   * Tier splits (Tier 1 override vs Tier 2 street share) are NOT encoded
--     here; amounts are recorded per entry when the commission numbers land.

CREATE TABLE IF NOT EXISTS affiliate_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('sale_credit', 'payout', 'adjustment', 'clawback')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents <> 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  stripe_subscription_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_ledger_affiliate_idx ON affiliate_ledger (affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_ledger_business_idx ON affiliate_ledger (business_id);

-- Append-only enforcement.
CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'affiliate_ledger is append-only: post a reversing entry instead of editing.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ledger_append_only ON affiliate_ledger;
CREATE TRIGGER ledger_append_only
  BEFORE UPDATE OR DELETE ON affiliate_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

-- Current balance per affiliate (cents). Positive = owed to affiliate.
-- security_invoker so ledger RLS applies; default view grants would leak balances.
CREATE OR REPLACE VIEW affiliate_balances
WITH (security_invoker = true) AS
SELECT affiliate_id, SUM(amount_cents)::BIGINT AS balance_cents
FROM affiliate_ledger
GROUP BY affiliate_id;

REVOKE ALL ON affiliate_balances FROM PUBLIC, anon, authenticated;
GRANT SELECT ON affiliate_balances TO service_role;

ALTER TABLE affiliate_ledger ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own ledger rows (future dashboard).
-- All writes go through the service-role client.
DROP POLICY IF EXISTS "Affiliates can read own ledger" ON affiliate_ledger;
CREATE POLICY "Affiliates can read own ledger" ON affiliate_ledger
  FOR SELECT TO authenticated USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE referrer_user_id = auth.uid())
  );
