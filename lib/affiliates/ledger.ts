import { createServiceClient } from '@/lib/supabase/service'

export type LedgerKind = 'sale_credit' | 'payout' | 'adjustment' | 'clawback'

export interface LedgerEntry {
  affiliateId: string
  businessId?: string | null
  kind: LedgerKind
  /** Signed cents: positive = owed TO the affiliate, negative = paid out. */
  amountCents: number
  currency?: string
  stripeSubscriptionId?: string | null
  notes?: string | null
  /** Required for payouts: the human who approved the money move. */
  createdBy?: string | null
  /**
   * Idempotency key, e.g. `sale_credit:<stripe_subscription_id>`.
   * When set, a retried/racing insert with the same key hits the UNIQUE
   * constraint and this function returns the existing row instead of
   * double-crediting. NULL = not dedupe-protected.
   */
  dedupeKey?: string | null
}

export interface LedgerRow {
  id: string
  affiliate_id: string
  business_id: string | null
  kind: LedgerKind
  amount_cents: number
  currency: string
  stripe_subscription_id: string | null
  dedupe_key: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

/**
 * Append one entry to the affiliate ledger. Server only (service role).
 * Payouts require a human approver id — bots never pay out on their own.
 *
 * Idempotent when `dedupeKey` is set: a duplicate key (retried webhook,
 * racing requests) raises 23505 on the UNIQUE constraint, and this returns
 * the already-written row instead of throwing. The constraint — not an
 * app-level existence check — is the arbiter.
 */
export async function recordLedgerEntry(entry: LedgerEntry): Promise<LedgerRow> {
  if (!entry.amountCents || entry.amountCents === 0) {
    throw new Error('Ledger entry amount_cents must be non-zero.')
  }
  if (entry.kind === 'payout' && !entry.createdBy) {
    throw new Error('Payouts require createdBy: a human must approve money moves.')
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('affiliate_ledger')
    .insert({
      affiliate_id: entry.affiliateId,
      business_id: entry.businessId || null,
      kind: entry.kind,
      amount_cents: entry.amountCents,
      currency: entry.currency || 'USD',
      stripe_subscription_id: entry.stripeSubscriptionId || null,
      dedupe_key: entry.dedupeKey || null,
      notes: entry.notes || null,
      created_by: entry.createdBy || null,
    })
    .select('*')
    .single()

  if (!error) return data as LedgerRow

  // Idempotent intake: someone already wrote this key. Return their row.
  if (error.code === '23505' && entry.dedupeKey) {
    const { data: existing, error: fetchError } = await supabase
      .from('affiliate_ledger')
      .select('*')
      .eq('dedupe_key', entry.dedupeKey)
      .single()
    if (!fetchError && existing) return existing as LedgerRow
  }

  throw new Error(`Ledger write failed: ${error.message}`)
}

/** Current balance owed to an affiliate, in cents. */
export async function getAffiliateBalance(affiliateId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('affiliate_balances')
    .select('balance_cents')
    .eq('affiliate_id', affiliateId)
    .single()
  if (error) return 0
  return Number(data?.balance_cents || 0)
}

/** Full ledger history for one affiliate (newest first). Server only. */
export async function getAffiliateLedger(affiliateId: string): Promise<LedgerRow[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('affiliate_ledger')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Ledger read failed: ${error.message}`)
  return (data || []) as LedgerRow[]
}

/**
 * Resolve the affiliate behind a referral code, if any.
 * Returns the affiliate row or null when the code is unknown/blank.
 */
export async function findAffiliateByCode(
  code: string | null | undefined
): Promise<{ id: string; referrer_user_id: string } | null> {
  if (!code) return null
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('affiliates')
    .select('id, referrer_user_id')
    .eq('code', code.trim().toUpperCase())
    .single()
  return data || null
}
