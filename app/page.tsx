'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance } from '@/lib/distance'
import DealCard from '@/components/DealCard'
import BottomNav from '@/components/BottomNav'

export default function FeedPage() {
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
      },
      (err) => {
        setGeoError(err.message)
        setUserLat(13.7563) // Default Bangkok fallback for testing if denied
        setUserLng(100.5018)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  useEffect(() => {
    async function fetchDeals() {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('deals')
        .select('*, businesses(name, currency)')
        .gt('expires_at', now)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setDeals(data)
      }
      setLoading(false)
    }

    fetchDeals()

    // Realtime channel subscription
    const channel = supabase
      .channel('public:deals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        () => {
          fetchDeals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Filter within 5km (5000 meters) and sort nearest first if user location exists
  const processedDeals = deals
    .map((deal) => {
      const dist =
        userLat !== null && userLng !== null
          ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
          : null
      return { ...deal, distance: dist }
    })
    .filter((deal) => {
      if (deal.distance === null) return true
      return deal.distance <= 5000
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0
      return a.distance - b.distance
    })

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto px-4 py-6 pb-28 shadow-2xl relative flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Prox Feed</h1>
          <p className="text-xs text-gray-500">Live deals within 5km</p>
        </div>
        <a
          href="/post"
          className="bg-black text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
        >
          + Post Deal
        </a>
      </header>

      {geoError && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl">
          Geolocation warning: {geoError}. Showing fallback view.
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Loading live deals...</div>
      ) : processedDeals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <p className="text-gray-500 font-bold mb-1">No live deals within 5km.</p>
          <p className="text-gray-400 text-xs">Be the first to post a deal nearby!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {processedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} userLat={userLat} userLng={userLng} />
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  )
}
