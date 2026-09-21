'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = useMemo(() => createBrowserClient(), [])
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <header
      className="h-14 px-4 flex justify-between items-center sticky top-0 z-50"
      style={{
        background: isDark ? '#0B0B12' : '#F7F3FB',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Link href="/" className="flex items-center gap-2 min-w-0">
        <img
          src={isDark ? '/prox-logo-dark.svg' : '/prox-logo-light.svg'}
          alt="PrOx"
          style={{ height: 28, width: 'auto' }}
        />
        <span
          className="text-[9px] font-semibold uppercase shrink-0"
          style={{ letterSpacing: '0.18em', color: isDark ? '#FF6B24' : '#5D20B5' }}
        >
          Get Local
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {user ? (
          <Link
            href="/account"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
              color: isDark ? '#F7F3FB' : '#1A1523',
              border: isDark ? 'none' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
            style={{ background: '#5D20B5' }}
          >
            Login
          </Link>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
          style={{ background: isDark ? '#FF6B24' : '#5D20B5', minWidth: 64 }}
          aria-label="Toggle theme"
        >
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}
