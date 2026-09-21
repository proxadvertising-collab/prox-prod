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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: `Signature verification failed: ${errorMessage(error)}` },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // A row exists only after fulfillment succeeded, so retries still run the work.
  const { data: seen } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .single()
  if (seen) {
    return NextResponse.json({ received: true, deduped: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = stripeId(session.subscription)
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
        const subscriptionId = stripeId(
          invoice.parent?.subscription_details?.subscription
        )
        if (subscriptionId) {
          const stripe = getStripe()
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await upsertSubscription(supabase, subscription, 'past_due')
        }
        break
      }
      default:
        break
    }
  } catch (error: unknown) {
    console.error('webhook fulfillment failed', error)
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
  }

  const { error: eventInsertError } = await supabase
    .from('stripe_events')
    .insert({ id: event.id, type: event.type })
  if (eventInsertError) {
    if (eventInsertError.code === '23505') {
      return NextResponse.json({ received: true, deduped: true })
    }
    console.error('stripe_events insert failed', eventInsertError)
    return NextResponse.json({ error: eventInsertError.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription,
  statusOverride?: string
): Promise<string> {
  const customerId = stripeId(subscription.customer)
  if (!customerId) {
    throw new Error(`Subscription ${subscription.id} has no customer id`)
  }
  const businessId = await businessIdForCustomer(supabase, customerId)

  if (!businessId) {
    throw new Error(
      `Cannot map subscription ${subscription.id} to a business (no row for customer ${customerId})`
    )
  }

  const item = subscription.items.data[0]
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      status: statusOverride || subscription.status,
      price_id: item?.price.id || null,
      current_period_start: unixToIso(item?.current_period_start),
      current_period_end: unixToIso(item?.current_period_end),
      trial_end: unixToIso(subscription.trial_end),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)
    .select('id')

  if (error) {
    console.error('subscriptions update failed', error)
    throw error
  }
  if (!data?.length) {
    throw new Error(`No subscription row to update for business ${businessId}`)
  }

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
    // One credit per subscription, ever. The UNIQUE constraint on dedupe_key
    // is the arbiter against retried/racing webhook deliveries; the
    // existence check above is just a fast path.
    dedupeKey: `sale_credit:${stripeSubscriptionId}`,
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

function stripeId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

function unixToIso(seconds: number | null | undefined): string | null {
  return seconds == null ? null : new Date(seconds * 1000).toISOString()
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Webhook failed'
}
