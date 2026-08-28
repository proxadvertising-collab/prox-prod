import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId, refCode } = await request.json()
    if (!userId || !refCode) {
      return NextResponse.json({ error: 'Missing userId or refCode' }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Find referrer profile by referral_code
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id, credits')
      .eq('referral_code', refCode.trim().toUpperCase())
      .single()

    if (referrer) {
      // Update new user profile with referred_by
      await supabase
        .from('profiles')
        .update({ referred_by: referrer.id })
        .eq('id', userId)

      // Increment referrer credits
      await supabase
        .from('profiles')
        .update({ credits: (referrer.credits || 0) + 1 })
        .eq('id', referrer.id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
