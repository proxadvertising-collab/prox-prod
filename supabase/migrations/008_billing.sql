-- 008_billing.sql
--
-- Billing foundation for the $199/year per-business model.
-- Written by the Stripe webhook (service-role client); never written
-- directly by browser clients.
--
-- Flow:
--   1. Business owner hits POST /api/billing/checkout -> Stripe Checkout
--      Session (subscription, $199/yr, trial from BILLING_TRIAL_DAYS).
--   2. Stripe fires webhooks -> POST /api/billing/webhook upserts this table.
--   3. App checks access via lib/billing/subscription.ts.
--
-- The post-page paywall itself is intentionally NOT wired here; enable it
-- after the Stripe price + webhook endpoint are configured and tested.

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'incomplete',
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook idempotency log. Stripe may redeliver events; the event id is the
-- natural primary key so replays are no-ops.
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Owners can read their own business's subscription (account page).
-- All writes happen via the service-role client in the webhook route.
DROP POLICY IF EXISTS "Owners can read own subscription" ON subscriptions;
CREATE POLICY "Owners can read own subscription" ON subscriptions
  FOR SELECT TO authenticated USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
