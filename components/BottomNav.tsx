'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const items = [
    { href: '/', icon: '🏠', label: 'Feed', match: (p: string) => p === '/' },
    { href: '/post', icon: '➕', label: 'Post', match: (p: string) => p === '/post' || p === '/business/post' },
    { href: '/account', icon: '👤', label: 'Account', match: (p: string) => p === '/account' },
  ]

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 h-16 max-w-[430px] mx-auto flex items-center justify-around px-4 ${
        isDark ? 'glass-card-dark' : 'glass-card-light'
      }`}
      style={{ borderRadius: 0 }}
    >
      {items.map((item) => {
        const active = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full h-full text-xs font-bold transition-colors"
            style={{
              color: active ? '#a78bfa' : isDark ? 'rgba(248,247,244,0.4)' : 'rgba(18,32,60,0.4)',
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
