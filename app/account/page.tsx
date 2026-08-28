'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [affiliateCode, setAffiliateCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data: bizData } = await supabase.from('businesses').select('*').eq('owner_id', user.id)
      setBusinesses(bizData || [])

      const res = await fetch('/api/affiliates/create', { method: 'POST' })
      const json = await res.json()
      if (json.code) setAffiliateCode(json.code)

      setLoading(false)
    }
    loadUserData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const referralLink = affiliateCode ? `https://prox.app/r/${affiliateCode}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading account...</div>

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-base font-semibold text-gray-900">{user?.email}</p>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Businesses</h2>
          {businesses.length === 0 ? (
            <p className="text-sm text-gray-400">No businesses registered yet.</p>
          ) : (
            <div className="space-y-3">
              {businesses.map((b) => (
                <div key={b.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">{b.name}</span>
                    <span className="text-xs text-gray-400">Credits: {b.credits || 0}</span>
                  </div>
                  <span className="text-xs text-gray-400">{b.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Affiliate section */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your referral code</h2>
          <p className="text-sm text-gray-500 mb-4">Share your link and earn 1 free month credit when businesses sign up!</p>
          <div className="flex items-center gap-2 mb-4">
            <input type="text" readOnly value={referralLink} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700" />
            <button onClick={copyLink} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-2">
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Join Prox using my referral link: ' + referralLink)}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-2 rounded-lg text-sm">
              WhatsApp
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="flex-1 bg-blue-800 hover:bg-blue-900 text-white text-center font-semibold py-2 rounded-lg text-sm">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
