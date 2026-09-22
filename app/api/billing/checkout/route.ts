import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripe, ANNUAL_PRICE_CENTS, ANNUAL_PRICE_CURRENCY } from '@/lib/billing/stripe'

const APP_URL = process.env.APP_URL || 'https://prox.app'

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout Session for the $199/year business subscription.
 * The caller must be logged in and already own a business.
 */
export async function POST() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json(
        { error: 'Create your business profile before subscribing.' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const admin = createServiceClient()

    const { data: existing } = await admin
      .from('subscriptions')
      .select('stripe_customer_id, status, current_period_end')
      .eq('business_id', business.id)
      .single()

    const liveStatus =
      existing?.status === 'active' ||
      existing?.status === 'trialing' ||
      existing?.status === 'past_due' ||
      existing?.status === 'unpaid'
    const paidThroughMs = existing?.current_period_end
      ? Date.parse(existing.current_period_end)
      : NaN
    const paidThroughInFuture = Number.isFinite(paidThroughMs) && paidThroughMs > Date.now()

    if (liveStatus || paidThroughInFuture) {
      return NextResponse.json(
        {
          error:
            'This business already has a live subscription. A new Checkout Session was not created.',
          code: 'already_subscribed',
          status: existing?.status ?? null,
          paid_through: existing?.current_period_end ?? null,
        },
        { status: 409 }
      )
    }

    let customerId = existing?.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { business_id: business.id, user_id: user.id },
      })
      customerId = customer.id
    }

    const trialDays = parseInt(process.env.BILLING_TRIAL_DAYS || '7', 10)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: process.env.STRIPE_PRICE_ID
        ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: ANNUAL_PRICE_CURRENCY,
                unit_amount: ANNUAL_PRICE_CENTS,
                recurring: { interval: 'year' },
                product_data: { name: 'Prox Annual — one live deal, unlimited foot traffic' },
              },
            },
          ],
      subscription_data: {
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
        metadata: { business_id: business.id },
      },
      success_url: `${APP_URL}/business?billing=success`,
      cancel_url: `${APP_URL}/business?billing=cancelled`,
    })

    // One row per business. The webhook later UPDATEs this same row by business_id.
    const { error: upsertError } = await admin.from('subscriptions').upsert(
      {
        business_id: business.id,
        stripe_customer_id: customerId,
        status: 'incomplete',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    )
    if (upsertError) {
      console.error('subscriptions upsert failed', upsertError)
      throw upsertError
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
