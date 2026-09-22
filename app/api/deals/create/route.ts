import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { canPostDeal } from '@/lib/billing/subscription'

export async function POST(request: Request) {
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
  const postType = body.post_type === 'open' ? 'open' : 'deal'
  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  }

  let { data: business } = await supabase
    .from('businesses')
    .select('id')
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
      })
      .select('id')
      .single()
    if (bizErr || !newBiz) {
      return NextResponse.json({ error: 'Failed to create business.' }, { status: 500 })
    }
    business = newBiz
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

  const { data: insertedDeal, error: dealErr } = await supabase
    .from('deals')
    .insert({
      business_id: business.id,
      owner_id: user.id,
      title,
      description,
      price_display: postType === 'deal' ? body.price_display || null : null,
      original_price: postType === 'deal' ? body.original_price || null : null,
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
