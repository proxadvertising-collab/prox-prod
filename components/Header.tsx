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
      <Link href="/" className="text-xl font-extrabold text-blue-600 tracking-tight">
        Prox
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/business/post" className="text-sm font-semibold text-gray-700 hover:text-blue-600">
          Post Deal
        </Link>
        {user ? (
          <Link href="/account" className="text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
            Account
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-sm">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
