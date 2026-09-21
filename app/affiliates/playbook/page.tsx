'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import PlaybookGate from '@/components/PlaybookGate'

export default function PlaybookHub() {
  const [code, setCode] = useState('')
  const supabase = createBrowserClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('affiliates')
        .select('code')
        .eq('referrer_user_id', user.id)
        .limit(1)
      if (data && data.length > 0) setCode(data[0].code)
    }
    load()
  }, [supabase])

  return (
    <PlaybookGate>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Prox connector playbook</p>
          <h1 className="wordmark text-3xl">Start here</h1>
        </div>

        {code && (
          <div className="glass-card-dark p-4">
            <p className="text-sm opacity-70 mb-1">Your connector link — everything you bring in tracks to you:</p>
            <p className="font-mono text-[#7C3AED] break-all">prox.app/r/{code}</p>
          </div>
        )}

        <div className="glass-card-dark p-5 space-y-3">
          <h2 className="font-semibold text-lg">The two-sided game</h2>
          <p className="text-sm leading-relaxed opacity-90">
            Prox only works when both sides show up. Regular people download the app
            for free and see live deals near them, sorted by distance. Businesses pay
            $199 a year to post those deals — one live deal at a time.
          </p>
          <p className="text-sm leading-relaxed opacity-90">
            You are the bridge. You fill the town with users, then you sign the
            businesses. No users, no audience. No businesses, no deals. You build
            both sides and you get paid on the business side.
          </p>
          <p className="text-sm leading-relaxed opacity-90">
            Order matters: <strong>downloads first, businesses second.</strong> A
            business will not pay $199 a year for an audience of zero. When you walk
            in and say "40 of your neighbors already have Prox on their phones,"
            the pitch sells itself.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-3">Pick your lane</h2>
          <div className="space-y-3">
            <Link href="/affiliates/playbook/tier-2" className="block">
              <div className="glass-card-dark p-5">
                <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Tier 2 — Street seller</p>
                <h3 className="font-semibold mb-1">Sell to businesses you know</h3>
                <p className="text-sm opacity-80">
                  Start with your warm network. Keep the big cut of every sale.
                </p>
              </div>
            </Link>
            <Link href="/affiliates/playbook/tier-1" className="block">
              <div className="glass-card-dark p-5">
                <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Tier 1 — Recruiter</p>
                <h3 className="font-semibold mb-1">Build a team of sellers</h3>
                <p className="text-sm opacity-80">
                  Recruit Tier 2 sellers and earn a small override on everything your team closes.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/affiliates/playbook/getting-paid" className="block">
            <div className="glass-card-dark p-4 text-center">
              <p className="font-semibold text-sm">Getting paid</p>
              <p className="text-xs opacity-70 mt-1">How the money moves</p>
            </div>
          </Link>
          <Link href="/affiliates/playbook/rules" className="block">
            <div className="glass-card-dark p-4 text-center">
              <p className="font-semibold text-sm">Rules of the road</p>
              <p className="text-xs opacity-70 mt-1">Keep it clean</p>
            </div>
          </Link>
        </div>
      </div>
    </PlaybookGate>
  )
}
