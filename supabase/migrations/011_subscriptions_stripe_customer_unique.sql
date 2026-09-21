-- 011_subscriptions_stripe_customer_unique.sql
--
-- NOTE: UNSAFE TO APPLY until this returns 0 rows:
--   SELECT stripe_customer_id, COUNT(*) AS n
--   FROM subscriptions
--   GROUP BY stripe_customer_id
--   HAVING COUNT(*) > 1;
-- Duplicate stripe_customer_id would make UNIQUE fail, or worse, let one
-- customer map to multiple businesses. Do not apply. Audit only.
--
-- 008 left stripe_customer_id NOT unique. This index is the intended
-- end state after duplicates are confirmed absent.

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_uidx
  ON subscriptions (stripe_customer_id);
