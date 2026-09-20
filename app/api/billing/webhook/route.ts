import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/billing/stripe'
import { findAffiliateByCode, recordLedgerEntry } from '@/lib/affiliates/ledger'

/**
 * POST /api/billing/webhook
 * Stripe webhook receiver. Verifies the signature, dedupes redelivered
 * events via stripe_events, and upserts the subscriptions table.
 *
 * Configure the endpoint in the Stripe dashboard (or `stripe listen`) and
 * set STRIPE_WEBHOOK_SECRET. Never exposes anything to browsers.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured (missing STRIPE_WEBHOOK_SECRET)' },
      { status: 500 }
    )
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${error.message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // Idempotency: ignore redelivered events.
  const { data: seen } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single()
  if (seen) {
    return NextResponse.json({ received: true, deduped: true })
  }
  await supabase.from('stripe_events').insert({ id: event.id, type: event.type })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string | null
        if (subscriptionId) {
          const stripe = getStripe()
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const businessId = await upsertSubscription(supabase, subscription)
          await maybeCreditAffiliate(supabase, businessId, subscription.id)
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscription(supabase, subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertSubscription(supabase, subscription, 'canceled')
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string | null
        if (subscriptionId) {
          const stripe = getStripe()
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await upsertSubscription(supabase, subscription, 'past_due')
        }
        break
      }
      default:
        // Unhandled event types are logged (stripe_events) and ignored.
        break
    }
  } catch (error: any) {
    // Event is recorded; return 500 so Stripe retries the delivery.
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription,
  statusOverride?: string
): Promise<string> {
  const businessId =
    subscription.metadata?.business_id ||
    (await businessIdForCustomer(supabase, subscription.customer as string))

  if (!businessId) {
    throw new Error(
      `Cannot map subscription ${subscription.id} to a business (no metadata.business_id)`
    )
  }

  const item = subscription.items.data[0]
  await supabase.from('subscriptions').upsert(
    {
      business_id: businessId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: statusOverride || subscription.status,
      price_id: item?.price.id || null,
      current_period_start: (subscription as any).current_period_start
        ? new Date((subscription as any).current_period_start * 1000).toISOString()
        : null,
      current_period_end: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000).toISOString()
        : null,
      trial_end: (subscription as any).trial_end
        ? new Date((subscription as any).trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  )

  return businessId
}

/**
 * Affiliate sale-credit hook. When a referred business's checkout completes,
 * credit the referring affiliate. Gated by AFFILIATE_SALE_CREDIT_CENTS
 * (default 0 = disabled) until the Tier 1 / Tier 2 commission numbers land.
 * Idempotent: skips when a sale_credit already exists for this subscription.
 */
async function maybeCreditAffiliate(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  stripeSubscriptionId: string
) {
  const creditCents = parseInt(process.env.AFFILIATE_SALE_CREDIT_CENTS || '0', 10)
  if (creditCents <= 0) return

  const { data: business } = await supabase
    .from('businesses')
    .select('referred_by_code')
    .eq('id', businessId)
    .single()
  const affiliate = await findAffiliateByCode(business?.referred_by_code)
  if (!affiliate) return

  const { data: existing } = await supabase
    .from('affiliate_ledger')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .eq('kind', 'sale_credit')
    .limit(1)
  if (existing && existing.length > 0) return

  await recordLedgerEntry({
    affiliateId: affiliate.id,
    businessId,
    kind: 'sale_credit',
    amountCents: creditCents,
    stripeSubscriptionId,
    notes: `Sale credit for subscription ${stripeSubscriptionId}`,
  })
}

async function businessIdForCustomer(
  supabase: ReturnType<typeof createServiceClient>,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('business_id')
    .eq('stripe_customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return (data?.business_id as string) || null
}
