'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ATTRIBUTION_COOKIE = 'affiliate_attribution'

/**
 * Read the referral code from the attribution cookie — the durable channel.
 * Prefers the validated `affiliate_attribution` JSON cookie; falls back to
 * the legacy `prox_ref` cookie for links stamped before the migration.
 * Never reads the URL param: it dies on auth redirects, the cookie doesn't.
 */
function readAttributionCode(): string {
  const get = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
  }
  const attributed = get(ATTRIBUTION_COOKIE)
  if (attributed) {
    try {
      const parsed = JSON.parse(decodeURIComponent(attributed)) as { code?: string }
      if (parsed.code) return parsed.code
    } catch {
      // Corrupt cookie: fall through to legacy.
    }
  }
  return get('prox_ref') || ''
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Read once at mount: the cookie is the durable channel (the URL param
  // dies on auth redirects). Guarded for SSR — server renders blank.
  const [refCode] = useState(() =>
    typeof document === 'undefined' ? '' : readAttributionCode()
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    if (refCode && data.user) {
      const { data: biz } = await supabase.from('businesses').insert({
        name: email.split('@')[0] + "'s Business",
        owner_id: data.user.id,
        referred_by_code: refCode,
        credits: 1,
      }).select('id').single()

      if (biz) {
        await fetch('/api/affiliates/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode, businessId: biz.id }),
        })
      }
    }

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Prox Account</h2>
        {refCode && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg text-center font-medium">
            Referred by friend - get 1 month free!
          </div>
        )}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          {refCode && <input type="hidden" name="referred_by_code" value={refCode} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm">
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </main>
  )
}
