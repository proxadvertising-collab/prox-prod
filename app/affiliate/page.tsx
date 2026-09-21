'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function AffiliatePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const text = isDark ? '#F7F3FB' : '#1A1523'
  const muted = isDark ? 'rgba(247,243,251,0.62)' : 'rgba(26,21,35,0.58)'
  const card = {
    background: isDark ? '#12121A' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)',
  }

  return (
    <main className="px-4 py-8">
      <div className="rounded-2xl p-6" style={card}>
        <img
          src={isDark ? '/prox-logo-dark.svg' : '/prox-logo-light.svg'}
          alt="PrOx"
          style={{ height: 32, width: 'auto' }}
        />
        <h1 className="mt-5 text-xl font-black" style={{ color: text }}>
          Earn by referring businesses
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: muted }}>
          Sign in, open Account, and share your referral link. When a business signs up with your code, it shows up on your Account page.
        </p>
        <Link
          href="/signup"
          className="mt-6 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center"
          style={{ background: '#F25A17' }}
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="mt-3 h-12 rounded-xl text-sm font-semibold flex items-center justify-center"
          style={{
            color: text,
            border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(26,21,35,0.16)',
          }}
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
