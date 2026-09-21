'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import { createBrowserClient } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const supabase = useMemo(() => createBrowserClient(), [])
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
  }, [supabase])
  const text = isDark ? '#F7F3FB' : '#1A1523'
  const muted = isDark ? 'rgba(247,243,251,0.62)' : 'rgba(26,21,35,0.58)'
  const card = {
    background: isDark ? '#12121A' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)',
  }
  const sideBtn = {
    background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    color: text,
    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(26,21,35,0.12)',
  }

  return (
    <main className="px-4 py-8 flex flex-col items-center">
      <div className="w-full rounded-2xl p-6" style={card}>
        <div className="flex flex-col items-center mb-5">
          <img
            src={isDark ? '/prox-logo-dark.svg' : '/prox-logo-light.svg'}
            alt="PrOx"
            style={{ height: 36, width: 'auto' }}
          />
          <p
            className="mt-2 text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.18em', color: isDark ? '#FF6B24' : '#5D20B5' }}
          >
            Get Local
          </p>
          <h1 className="mt-4 text-xl font-black" style={{ color: text }}>
            Welcome to Prox
          </h1>
          <p className="mt-1 text-sm text-center" style={{ color: muted }}>
            Get Local deals near you
          </p>
        </div>
        <AuthButton initialTab="signin" />
      </div>

      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <Link
          href={loggedIn ? '/account' : '/signup?next=/account'}
          className="h-11 rounded-xl text-sm font-semibold flex items-center justify-center"
          style={sideBtn}
        >
          Affiliate
        </Link>
        <Link
          href={loggedIn ? '/business' : '/signup?next=/business'}
          className="h-11 rounded-xl text-sm font-semibold flex items-center justify-center"
          style={sideBtn}
        >
          Business
        </Link>
      </div>
    </main>
  )
}
