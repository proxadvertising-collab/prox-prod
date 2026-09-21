'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

const ALLOWED_NEXT = ['/post', '/account', '/', '/business', '/affiliate']

function safeNext(raw: string | null): string {
  if (!raw) return '/'
  return ALLOWED_NEXT.includes(raw) ? raw : '/'
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export default function AuthButton({ initialTab = 'signin' }: { initialTab?: 'signin' | 'signup' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [refCode, setRefCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nextPath, setNextPath] = useState('/')

  const text = isDark ? '#F7F3FB' : '#1A1523'
  const muted = isDark ? 'rgba(247,243,251,0.6)' : 'rgba(26,21,35,0.55)'
  const field = {
    background: isDark ? '#0B0B12' : '#FFFFFF',
    color: text,
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(26,21,35,0.14)',
  }

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setNextPath(safeNext(params.get('next')))
    const ref = params.get('ref')
    if (ref) {
      document.cookie = `prox_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 7}`
      setRefCode(ref)
      return
    }
    const match = document.cookie.match(/(^| )prox_ref=([^;]+)/)
    if (match) setRefCode(decodeURIComponent(match[2]))
  }, [])

  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    const { error: pwError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (pwError) {
      setError(pwError.message)
      return
    }
    router.push(nextPath)
    router.refresh()
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    })
    setLoading(false)
    if (otpError) setError(otpError.message)
    else setMessage('Check your email for the magic link.')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const { data, error: signError } = await supabase.auth.signUp({ email, password })
    if (signError) {
      setLoading(false)
      setError(signError.message)
      return
    }

    if (refCode && data.user) {
      const { data: biz } = await supabase
        .from('businesses')
        .insert({
          name: email.split('@')[0] + "'s Business",
          owner_id: data.user.id,
          referred_by_code: refCode,
          credits: 1,
        })
        .select('id')
        .single()

      if (biz) {
        await fetch('/api/affiliates/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode, businessId: biz.id }),
        })
      }
    }

    setLoading(false)
    router.push(nextPath)
    router.refresh()
  }

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-2 rounded-xl p-1 mb-5"
        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,21,35,0.06)' }}
      >
        {(['signin', 'signup'] as const).map((key) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key)
                setError('')
                setMessage('')
              }}
              className="h-10 rounded-lg text-sm font-bold"
              style={{
                background: active ? '#5D20B5' : 'transparent',
                color: active ? '#F7F3FB' : text,
              }}
            >
              {key === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          )
        })}
      </div>

      {refCode && tab === 'signup' ? (
        <p className="mb-3 text-center text-xs font-medium" style={{ color: '#F25A17' }}>
          Referred by a friend — 1 month free
        </p>
      ) : null}

      {tab === 'signin' ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: isDark ? '#FFFFFF' : '#FFFFFF',
              color: '#1A1523',
              border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(26,21,35,0.14)',
            }}
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,21,35,0.12)' }} />
            <span className="text-[11px] uppercase tracking-wide" style={{ color: muted }}>or</span>
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,21,35,0.12)' }} />
          </div>

          <form onSubmit={handlePasswordSignIn} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-3 rounded-xl text-sm"
              style={field}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-3 rounded-xl text-sm"
              style={field}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-bold text-white"
              style={{ background: '#F25A17' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,21,35,0.12)' }} />
            <span className="text-[11px] uppercase tracking-wide" style={{ color: muted }}>or</span>
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(26,21,35,0.12)' }} />
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-xl text-sm font-bold text-white"
              style={{ background: '#5D20B5' }}
            >
              {loading ? 'Sending link…' : 'Email me a sign-in link'}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
          {refCode ? <input type="hidden" name="referred_by_code" value={refCode} /> : null}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-3 rounded-xl text-sm"
            style={field}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-3 rounded-xl text-sm"
            style={field}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-bold text-white"
            style={{ background: '#F25A17' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      {error ? (
        <p className="mt-3 text-xs text-center font-medium" style={{ color: '#F25A17' }}>
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-xs text-center font-medium" style={{ color: muted }}>
          {message}
        </p>
      ) : null}

      <p className="mt-5 text-center text-xs" style={{ color: muted }}>
        {tab === 'signin' ? (
          <>
            New here?{' '}
            <button type="button" className="font-bold" style={{ color: '#5D20B5' }} onClick={() => setTab('signup')}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" className="font-bold" style={{ color: '#5D20B5' }} onClick={() => setTab('signin')}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  )
}
