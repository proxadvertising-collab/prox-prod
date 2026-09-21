import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'

const ATTRIBUTION_COOKIE = 'affiliate_attribution'
// 30 days: the durable channel. Survives auth redirects, tab closes, and
// the user wandering off before signing up.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/** Open-redirect protection: only same-app relative paths, never //evil. */
function safeDestination(to: string | string[] | undefined): string {
  const raw = Array.isArray(to) ? to[0] : to
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) {
    return raw
  }
  return '/signup'
}

/**
 * Referral link entry: /r/CODE[?to=/path].
 * Validates the code against the affiliates table, then stamps the
 * attribution cookie BEFORE any auth redirect — the query param never
 * survives a login round-trip, the cookie does.
 */
export default async function ReferralLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { code } = await params
  const query = await searchParams
  const destination = safeDestination(query.to)

  const normalized = code.trim().toUpperCase()
  const supabase = createServiceClient()
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, code')
    .eq('code', normalized)
    .single()

  if (affiliate) {
    const cookieStore = await cookies()
    cookieStore.set(
      ATTRIBUTION_COOKIE,
      encodeURIComponent(JSON.stringify({ code: affiliate.code, affiliateId: affiliate.id })),
      { maxAge: COOKIE_MAX_AGE, path: '/', sameSite: 'lax' }
    )
  }
  // Unknown code: still send them to signup, just without attribution.
  // A typo'd code must never mint a phantom referral.

  redirect(destination)
}
