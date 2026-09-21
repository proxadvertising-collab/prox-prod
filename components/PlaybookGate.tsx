'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function PlaybookGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'noconnect' | 'ok'>('loading')
  const [claiming, setClaiming] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referrer_user_id', user.id)
        .limit(1)
      setState(data && data.length > 0 ? 'ok' : 'noconnect')
    }
    check()
  }, [router, supabase])

  async function claimCode() {
    setClaiming(true)
    try {
      const res = await fetch('/api/affiliates/create', { method: 'POST' })
      if (res.ok) setState('ok')
    } finally {
      setClaiming(false)
    }
  }

  if (state === 'loading') {
    return <div className="p-6 text-center opacity-70">Loading the playbook…</div>
  }

  if (state === 'noconnect') {
    return (
      <div className="p-4">
        <div className="glass-card-dark p-6 text-center">
          <h1 className="wordmark text-2xl mb-3">Connectors only</h1>
          <p className="opacity-80 mb-5">
            The playbook lives behind a connector code. Grab yours — one tap, free,
            and it unlocks everything below.
          </p>
          <button
            onClick={claimCode}
            disabled={claiming}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-semibold rounded-xl px-6 py-3"
          >
            {claiming ? 'Grabbing your code…' : 'Get my connector code'}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
