'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance } from '@/lib/distance'
import DealCard from '@/components/DealCard'
import BottomNav from '@/components/BottomNav'
import ProxPinThumb from '@/components/ProxPinThumb'

const CATEGORY_CHIPS: { label: string; emoji: string }[] = [
  { label: 'Restaurants', emoji: '🍴' },
  { label: 'Coffee', emoji: '☕' },
  { label: 'Bars', emoji: '🍺' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Services', emoji: '💈' },
  { label: 'Hotels', emoji: '🛏️' },
  { label: 'Attractions', emoji: '🎯' },
  { label: 'Street Food', emoji: '🥤' },
  { label: 'Wellness', emoji: '💪' },
  { label: 'Convenience', emoji: '📦' },
]

const MI_IN_METERS = 1609.34
const MAX_KM = 40
const MAX_MI = 25

function formatSliderLabel(meters: number, unit: 'km' | 'mi'): string {
  if (unit === 'mi') {
    const mi = meters / MI_IN_METERS
    return `within ${mi.toFixed(1)}mi`
  }
  if (meters < 1000) {
    return `within ${Math.round(meters)}m`
  }
  return `within ${(meters / 1000).toFixed(1)}km`
}

function DistanceSlider({
  distanceMeters,
  onChange,
  unit,
  onToggleUnit,
}: {
  distanceMeters: number
  onChange: (meters: number) => void
  unit: 'km' | 'mi'
  onToggleUnit: () => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  const maxMeters = unit === 'mi' ? MAX_MI * MI_IN_METERS : MAX_KM * 1000
  const percent = Math.min(100, Math.max(0, (distanceMeters / maxMeters) * 100))

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onChange(Math.round(ratio * maxMeters))
  }

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => updateFromClientX(e.clientX)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateFromClientX(e.touches[0].clientX)
    }
    const stopDrag = () => setDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchend', stopDrag)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchend', stopDrag)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, maxMeters])

  return (
    <div
      className="mx-4 p-4 rounded-2xl"
      style={{
        background: 'rgba(20,20,50,0.6)',
        boxShadow: '0 0 40px rgba(124,58,237,0.15)',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-white text-sm font-bold">{formatSliderLabel(distanceMeters, unit)}</span>
        <button
          type="button"
          onClick={onToggleUnit}
          className="text-[10px] font-bold text-violet-300 border border-violet-400/40 rounded-full px-2 py-0.5"
        >
          {unit === 'mi' ? 'mi' : 'km'}
        </button>
      </div>

      <div
        ref={trackRef}
        className="relative w-full rounded-full cursor-pointer"
        style={{ height: '10px', background: 'rgba(255,255,255,0.08)' }}
        onMouseDown={(e) => {
          setDragging(true)
          updateFromClientX(e.clientX)
        }}
        onTouchStart={(e) => {
          setDragging(true)
          if (e.touches[0]) updateFromClientX(e.touches[0].clientX)
        }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${percent}%`, background: '#7C3AED' }}
        />

        <div
          className="absolute top-1/2 flex items-center justify-center"
          style={{
            left: `${percent}%`,
            transform: 'translate(-50%, -50%)',
            width: '48px',
            height: '48px',
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            setDragging(true)
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            setDragging(true)
          }}
        >
          <ProxPinThumb size={36} />
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [unit, setUnit] = useState<'km' | 'mi'>('km')
  const [distanceMeters, setDistanceMeters] = useState(MAX_KM * 1000)
  const supabase = createBrowserClient()

  useEffect(() => {
    try {
      const isUS = navigator.language === 'en-US'
      setUnit(isUS ? 'mi' : 'km')
      setDistanceMeters(isUS ? MAX_MI * MI_IN_METERS : MAX_KM * 1000)
    } catch {}
  }, [])

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

  const toggleUnit = () => {
    const nextUnit = unit === 'mi' ? 'km' : 'mi'
    setUnit(nextUnit)
    setDistanceMeters(nextUnit === 'mi' ? MAX_MI * MI_IN_METERS : MAX_KM * 1000)
  }

  const processedDeals = deals
    .map((deal) => {
      const dist =
        userLat !== null && userLng !== null
          ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
          : null
      return { ...deal, distance: dist }
    })
    .filter((deal) => {
      if (deal.distance !== null && deal.distance > distanceMeters) return false

      if (!activeChip) return true
      if (activeChip === 'Deals') return deal.post_type === 'deal'
      if (activeChip === 'Open') return deal.post_type === 'open'

      const cats: string[] = deal.categories || []
      if (cats.length === 0) return true
      return cats.includes(activeChip)
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0
      return a.distance - b.distance
    })

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto pb-28 shadow-2xl relative flex flex-col">
      <header className="px-4 pt-6 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Prox Feed</h1>
          <p className="text-xs text-gray-500">Live deals near you</p>
        </div>
        <a
          href="/post"
          className="bg-black text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
        >
          + Post Deal
        </a>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
        {[{ label: 'Deals', emoji: '🔥' }, { label: 'Open', emoji: '📍' }, ...CATEGORY_CHIPS].map((chip) => {
          const isActive = activeChip === chip.label
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => setActiveChip(isActive ? null : chip.label)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
              style={
                isActive
                  ? {
                      background: '#7C3AED',
                      color: '#fff',
                      borderColor: '#7C3AED',
                      boxShadow: '0 0 16px rgba(124,58,237,0.6)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.08)',
                      color: '#374151',
                      borderColor: 'rgba(0,0,0,0.08)',
                    }
              }
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mb-4">
        <DistanceSlider
          distanceMeters={distanceMeters}
          onChange={setDistanceMeters}
          unit={unit}
          onToggleUnit={toggleUnit}
        />
      </div>

      <div className="px-4">
        {geoError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex flex-col gap-2">
            <span>Enable location to see deals near you</span>
            <button
              onClick={() => window.location.reload()}
              className="self-start bg-amber-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
            >
              Retry Location
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Loading live deals...</div>
        ) : processedDeals.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <p className="text-gray-500 font-bold mb-1">No live deals match your filters.</p>
            <p className="text-gray-400 text-xs">Try widening the distance or clearing category filters!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {processedDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} userLat={userLat} userLng={userLng} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
