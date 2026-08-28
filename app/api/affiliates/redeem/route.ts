import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { code, businessId } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('referrer_user_id')
      .eq('code', code)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 })
    }

    // Add +1 credit to businesses owned by referrer
    const { data: referrerBusinesses } = await supabase
      .from('businesses')
      .select('id, credits')
      .eq('owner_id', affiliate.referrer_user_id)

    if (referrerBusinesses && referrerBusinesses.length > 0) {
      const biz = referrerBusinesses[0]
      await supabase
        .from('businesses')
        .update({ credits: (biz.credits || 0) + 1 })
        .eq('id', biz.id)
    }

    if (businessId) {
      const { data: targetBiz } = await supabase
        .from('businesses')
        .select('credits')
        .eq('id', businessId)
        .single()

      if (targetBiz) {
        await supabase
          .from('businesses')
          .update({ credits: (targetBiz.credits || 0) + 1, referred_by_code: code })
          .eq('id', businessId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
