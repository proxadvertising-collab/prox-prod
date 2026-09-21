-- 012_affiliate_ledger_sale_credit_uidx.sql
--
-- One sale_credit per Stripe subscription. Webhook retries and concurrent
-- checkout.session.completed deliveries must not double-credit.
--
-- WRITE ONLY — do not apply until confirmed. Relies on unique-violation
-- (23505) handling in lib/affiliates/ledger.ts.

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_ledger_sale_credit_subscription_uidx
  ON affiliate_ledger (stripe_subscription_id)
  WHERE kind = 'sale_credit' AND stripe_subscription_id IS NOT NULL;
