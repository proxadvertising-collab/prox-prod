'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ProxPinThumb from '@/components/ProxPinThumb'
import { useTheme } from '@/contexts/ThemeContext'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()
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
      className={`h-14 px-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur ${
        isDark ? 'border-b border-white/10' : 'border-b border-violet-900/10'
      }`}
    >
      <Link href="/" className="flex items-center gap-2">
        <ProxPinThumb size={28} />
        <div className="flex flex-col leading-none">
          <span
            className="wordmark text-lg"
            style={{ color: isDark ? '#F8F7F4' : '#12203c' }}
          >
            PrOx
          </span>
          <span
            className="text-[8px] uppercase opacity-40"
            style={{ letterSpacing: '0.3em', color: isDark ? '#F8F7F4' : '#12203c' }}
          >
            Precision Proximity
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <Link
            href="/account"
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
              isDark ? 'bg-white/10 text-white' : 'bg-violet-100 text-violet-900'
            }`}
          >
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
            style={{ background: '#7C3AED' }}
          >
            Login
          </Link>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className="relative flex items-center rounded-full transition-colors"
          style={{
            width: 44,
            height: 28,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(124,58,237,0.2)',
          }}
          aria-label="Toggle theme"
        >
          <span
            className="absolute flex items-center justify-center rounded-full transition-transform"
            style={{
              width: 22,
              height: 22,
              left: 2,
              transform: isDark ? 'translateX(16px)' : 'translateX(0px)',
              background: isDark ? '#141432' : '#ffffff',
              boxShadow: '0 0 8px rgba(124,58,237,0.4)',
            }}
          >
            <span className="text-[11px]">{isDark ? '🌙' : '☀️'}</span>
          </span>
        </button>
      </div>
    </header>
  )
}
