'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createBrowserClient()

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
    <header className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-sm">
      <Link href="/" className="text-xl font-black text-black tracking-tight">
        Prox
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/business/post" className="text-sm font-semibold text-gray-700 hover:text-black">
          Post Deal
        </Link>
        {user ? (
          <Link href="/account" className="text-sm font-semibold bg-gray-100 text-black px-3 py-1.5 rounded-xl">
            Account
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-semibold bg-black text-white px-4 py-1.5 rounded-xl shadow-sm">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
