import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { makeCode } from '@/lib/affiliates/generate'

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('affiliates')
    .select('code')
    .eq('referrer_user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ code: existing.code })
  }

  let code = makeCode()
  let isUnique = false

  while (!isUnique) {
    const { data: check } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', code)
      .single()

    if (!check) {
      isUnique = true
    } else {
      code = makeCode()
    }
  }

  const { error } = await supabase
    .from('affiliates')
    .insert({ referrer_user_id: user.id, code })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ code })
}
