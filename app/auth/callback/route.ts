import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

const ALLOWED_NEXT = ['/post', '/account', '/', '/business', '/affiliate', '/welcome']

function safeNext(raw: string | null): string {
  if (!raw) return '/'
  return ALLOWED_NEXT.includes(raw) ? raw : '/'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = safeNext(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  const supabase = await createServerClient()
  let ok = false

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    ok = !error
  }

  if (ok) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  const params = new URLSearchParams()
  if (next !== '/') params.set('next', next)
  params.set('error', 'auth')
  return NextResponse.redirect(`${origin}/login?${params.toString()}`)
}
