import { createServiceClient } from '@/lib/supabase/service'

export type AccessState = 'active' | 'trialing' | 'past_due' | 'none'

/**
 * Read a business's billing access state. Uses the service-role client
 * (server only). The paywall itself is not wired yet — call this from the
 * post page / API once Stripe is configured and tested.
 */
export async function getBusinessAccess(businessId: string): Promise<AccessState> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('business_id', businessId)
    .single()

  if (!data) return 'none'
  if (data.status === 'active' || data.status === 'trialing') return data.status
  if (data.status === 'past_due' || data.status === 'unpaid') return 'past_due'
  return 'none'
}

/** True when the business may post deals (paid or in trial). */
export async function hasPostingAccess(businessId: string): Promise<boolean> {
  const access = await getBusinessAccess(businessId)
  return access === 'active' || access === 'trialing'
}

export type CanPostResult =
  | { ok: true }
  | { ok: false; reason: 'paywall'; checkoutHint: true }

/**
 * First deal for a business is free. Later posts need active or trialing access.
 */
export async function canPostDeal(businessId: string): Promise<CanPostResult> {
  const supabase = createServiceClient()
  const { count, error } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
  if (error) throw error
  if (!count) return { ok: true }
  if (await hasPostingAccess(businessId)) return { ok: true }
  return { ok: false, reason: 'paywall', checkoutHint: true }
}
