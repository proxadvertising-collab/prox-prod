import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { canPostDeal } from '@/lib/billing/subscription'
import { isPostType } from '@/lib/post-type'

function cookieRef(request: NextRequest, body: any): string {
  const fromCookie = request.cookies.get('prox_ref')?.value
  const fromBody = body?.ref || body?.code || body?.referred_by_code
  const raw = String(fromCookie || fromBody || '').trim()
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

async function validReferralCode(raw: string): Promise<string | null> {
  const code = raw.trim()
  if (!code) return null
  try {
    const admin = createServiceClient()
    const upper = code.toUpperCase()
    const { data: aff } = await admin
      .from('affiliates')
      .select('code')
      .eq('code', upper)
      .maybeSingle()
    if (aff?.code) return aff.code
    const { data: prof } = await admin
      .from('profiles')
      .select('referral_code')
      .eq('referral_code', upper)
      .maybeSingle()
    if (prof?.referral_code) return prof.referral_code
  } catch {
    return null
  }
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Please provide location.' }, { status: 400 })
  }

  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  const postTypeRaw = String(body.post_type || 'deal')
  if (!isPostType(postTypeRaw)) {
    return NextResponse.json({ error: 'Unknown post type.' }, { status: 400 })
  }
  const postType = postTypeRaw
  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  }

  const refStamp = await validReferralCode(cookieRef(request, body))

  let { data: business } = await supabase
    .from('businesses')
    .select('id, referred_by_code')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    const { data: newBiz, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: user.email?.split('@')[0] + "'s Business",
        lat,
        lng,
        ...(refStamp ? { referred_by_code: refStamp } : {}),
      })
      .select('id, referred_by_code')
      .single()
    if (bizErr || !newBiz) {
      return NextResponse.json({ error: 'Failed to create business.' }, { status: 500 })
    }
    business = newBiz
  } else if (!business.referred_by_code && refStamp) {
    const { data: stamped } = await supabase
      .from('businesses')
      .update({ referred_by_code: refStamp })
      .eq('id', business.id)
      .is('referred_by_code', null)
      .select('id, referred_by_code')
      .single()
    if (stamped) business = stamped
  }

  let access
  try {
    access = await canPostDeal(business.id)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Could not check posting access.' },
      { status: 500 }
    )
  }

  if (!access.ok) {
    return NextResponse.json(
      { code: 'paywall', checkoutPath: '/api/billing/checkout' },
      { status: 402 }
    )
  }

  // v1 = replace-to-update: one live deal; expires_at null means until replaced.
  const { error: pauseErr } = await supabase
    .from('deals')
    .update({ is_active: false })
    .eq('business_id', business.id)
    .eq('is_active', true)
  if (pauseErr) {
    return NextResponse.json({ error: pauseErr.message }, { status: 500 })
  }

  const { data: insertedDeal, error: dealErr } = await supabase
    .from('deals')
    .insert({
      business_id: business.id,
      owner_id: user.id,
      title,
      description,
      price_display: postType === 'deal' || postType === 'special' ? body.price_display || null : null,
      original_price: postType === 'deal' || postType === 'special' ? body.original_price || null : null,
      post_type: postType,
      categories: Array.isArray(body.categories) ? body.categories : [],
      image_url: body.image_url || null,
      lat,
      lng,
      expires_at: null,
      is_active: true,
    })
    .select('id')
    .single()

  if (dealErr || !insertedDeal) {
    return NextResponse.json({ error: dealErr?.message || 'Failed to post deal.' }, { status: 500 })
  }

  return NextResponse.json({ id: insertedDeal.id })
}
