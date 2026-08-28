'use client'

import React, { useEffect, useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { getLiveDeals } from '@/lib/deals/queries'
import { Deal } from '@/lib/deals/types'
import FeedList from '@/components/feed/FeedList'
import BottomNav from '@/components/BottomNav'

export default function Page() {
  const { lat, lng, error: geoError } = useGeolocation()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDeals() {
      const liveDeals = await getLiveDeals()
      setDeals(liveDeals)
      setLoading(false)
    }
    loadDeals()
  }, [])

  return (
    <main className="min-h-screen bg-white max-w-md mx-auto px-4 py-6 pb-24 shadow-2xl relative">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Prox Feed</h1>
          <p className="text-xs text-gray-500">Local live deals in meters</p>
        </div>
        <a
          href="/business/post"
          className="bg-black text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
        >
          + Post
        </a>
      </header>

      {geoError && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl">
          Geolocation warning: {geoError}. Distance unavailable.
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Loading live deals...</div>
      ) : (
        <FeedList deals={deals} userLat={lat} userLng={lng} />
      )}

      <BottomNav />
    </main>
  )
}
