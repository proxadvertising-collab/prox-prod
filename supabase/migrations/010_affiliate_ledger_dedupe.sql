-- 010_affiliate_ledger_dedupe.sql
--
-- Idempotency for affiliate intake (Mission 10).
--
-- The webhook's app-level "does a sale_credit already exist?" check is a
-- check-then-act race: two concurrent deliveries can both pass the check and
-- both insert. The UNIQUE constraint below is the arbiter — the second
-- insert fails with 23505 and the intake path returns the existing row.
--
-- NULL dedupe_keys never conflict in Postgres, so unkeyed entries
-- (manual adjustments, corrections) stay unconstrained while keyed intakes
-- are protected. Existing rows keep NULL keys; they predate the constraint
-- and never collide with keyed inserts.

ALTER TABLE affiliate_ledger
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_ledger_dedupe_key_uidx
  ON affiliate_ledger (dedupe_key);

COMMENT ON COLUMN affiliate_ledger.dedupe_key IS
  'Idempotency key for intake paths, e.g. sale_credit:<stripe_subscription_id>. NULL = not dedupe-protected.';
