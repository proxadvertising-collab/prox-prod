import Stripe from 'stripe'

let stripe: Stripe | null = null

/**
 * Lazy Stripe client. Throws a clear error when STRIPE_SECRET_KEY is missing
 * instead of failing obscurely deep in a route handler.
 */
export function getStripe(): Stripe {
  if (stripe) return stripe
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'Missing STRIPE_SECRET_KEY. Billing routes require a Stripe secret key.'
    )
  }
  stripe = new Stripe(secretKey)
  return stripe
}

/** $199/year in cents. Overridden when STRIPE_PRICE_ID is set. */
export const ANNUAL_PRICE_CENTS = 19900
export const ANNUAL_PRICE_CURRENCY = 'usd'
