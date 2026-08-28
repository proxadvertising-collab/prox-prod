'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ReferralCard from '@/components/ReferralCard'
import BottomNav from '@/components/BottomNav'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [referredCount, setReferredCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch or create profile
      let { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!prof) {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            referral_code: randomCode,
            credits: 0,
          })
          .select('*')
          .single()
        prof = newProf
      }
      setProfile(prof)

      // Fetch referred count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id)

      setReferredCount(count || 0)

      // Fetch user deals
      const { data: userDeals } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setDeals(userDeals || [])
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Account</h1>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
        >
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

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-black text-gray-900">My Deals</h2>
        {deals.length === 0 ? (
          <p className="text-xs text-gray-400">You haven't posted any deals yet.</p>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{deal.title}</h4>
                  <span className="text-[10px] text-gray-500">
                    Expires: {new Date(deal.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deal.is_active && new Date(deal.expires_at) > new Date() ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {deal.is_active && new Date(deal.expires_at) > new Date() ? 'Live' : 'Expired'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
