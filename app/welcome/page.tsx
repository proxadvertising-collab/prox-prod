'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'
import { getDoor, setDoor, type ProxDoor } from '@/lib/door'

const DOORS: { id: ProxDoor; title: string; copy: string }[] = [
  {
    id: 'shopper',
    title: 'Shopper',
    copy: 'See live deals near you. Walk or drive over. Tap GO NOW.',
  },
  {
    id: 'business',
    title: 'Business',
    copy: 'Post one live deal. Locals find you. First post creates your business.',
  },
  {
    id: 'affiliate',
    title: 'Affiliate',
    copy: 'Share your link or QR. Businesses sign up with your code. You earn free post credits.',
  },
]

export default function WelcomePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])
  const text = isDark ? '#F7F3FB' : '#1A1523'
  const muted = isDark ? 'rgba(247,243,251,0.62)' : 'rgba(26,21,35,0.58)'
  const card = {
    background: isDark ? '#12121A' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)',
  }

  useEffect(() => {
    const door = getDoor()
    if (!door) return
    if (door === 'shopper') {
      router.replace('/')
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (door === 'business') {
        router.replace(data.user ? '/business' : '/login?next=/business')
      } else {
        router.replace(data.user ? '/account' : '/login?next=/account')
      }
    })
  }, [router, supabase])

  const openDoor = async (picked: ProxDoor) => {
    setDoor(picked)
    if (picked === 'shopper') {
      router.replace('/')
      return
    }
    const { data } = await supabase.auth.getUser()
    if (picked === 'business') {
      router.replace(data.user ? '/business' : '/login?next=/business')
    } else {
      router.replace(data.user ? '/account' : '/login?next=/account')
    }
  }

  return (
    <main className="px-4 py-8">
      <div className="flex flex-col items-center mb-6">
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
        <h1 className="mt-5 text-xl font-black text-center" style={{ color: text }}>
          Pick how you’re here
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {DOORS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => openDoor(d.id)}
            className="w-full rounded-2xl text-left px-5 py-4"
            style={card}
          >
            <span className="text-base font-black block" style={{ color: text }}>
              {d.title}
            </span>
            <span className="mt-1 text-sm leading-relaxed block" style={{ color: muted }}>
              {d.copy}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
