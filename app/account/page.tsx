'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ReferralCard from '@/components/ReferralCard'
import BottomNav from '@/components/BottomNav'
import { clearDoor } from '@/lib/door'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [referredCount, setReferredCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        router.push('/login')
        return
      }
      setUser(user)

      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (!prof) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email, referral_code: randomCode, credits: 0 })
          .select('*')
          .single()
        prof = newProf
      }
      setProfile(prof)

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id)
      setReferredCount(count || 0)
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Loading account...</div>
  }

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-6 pb-28 shadow-2xl relative flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Affiliate</h1>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-3 py-2 rounded-xl transition-colors">
          Logout
        </button>
      </div>

      {profile && (
        <ReferralCard
          referralCode={profile.referral_code || 'PROX12'}
          credits={profile.credits || 0}
          referredCount={referredCount}
        />
      )}

      <button
        type="button"
        onClick={() => {
          clearDoor()
          router.push('/welcome')
        }}
        className="text-xs font-semibold text-gray-400 text-center"
      >
        Change role
      </button>

      <BottomNav />
    </main>
  )
}
