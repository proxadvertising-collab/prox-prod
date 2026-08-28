'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance } from '@/lib/distance'
import DealCard from '@/components/DealCard'
import BottomNav from '@/components/BottomNav'
import ProxPinThumb from '@/components/ProxPinThumb'
import { useTheme } from '@/contexts/ThemeContext'

const CATEGORY_CHIPS = [
  { label: 'All', emoji: '' },
  { label: 'Restaurants', emoji: '🍴' },
  { label: 'Hotels', emoji: '🛏️' },
  { label: 'Coffee', emoji: '☕' },
  { label: 'Attractions', emoji: '🎯' },
  { label: 'Bars', emoji: '🍺' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Services', emoji: '💈' },
  { label: 'Wellness', emoji: '💪' },
  { label: 'Street Food', emoji: '🥤' },
  { label: 'Convenience', emoji: '📦' },
  { label: 'Deals', emoji: '🔥' },
  { label: 'Open Now', emoji: '📍' },
]

const KM_PER_MI = 1.60934
const MIN_MI = 0.1
const MAX_MI = 25
const MIN_KM = MIN_MI * KM_PER_MI // ~0.16km / 160m
const MAX_KM = MAX_MI * KM_PER_MI // ~40.23km
const LOG_MIN_KM = Math.log(MIN_KM)
const LOG_MAX_KM = Math.log(MAX_KM)

function roundKm(km: number): number {
  const clamped = Math.min(MAX_KM, Math.max(MIN_KM, km))
  if (clamped < 1) return Math.round(clamped * 100) / 100 // ~10m steps
  if (clamped < 10) return Math.round(clamped * 10) / 10 // 100m steps
  return Math.round(clamped) // 1km steps
}

function formatSliderLabel(km: number, unit: 'km' | 'mi'): string {
  if (unit === 'mi') {
    const miles = km * 0.621371
    if (miles < 0.2) return `${Math.round(miles * 5280)}ft away`
    return `${miles.toFixed(1)}mi away`
  }
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)}km away`
}

function DistanceSlider({
  distanceKm,
  onChange,
  unit,
  onToggleUnit,
  isDark,
}: {
  distanceKm: number
  onChange: (km: number) => void
  unit: 'km' | 'mi'
  onToggleUnit: () => void
  isDark: boolean
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)

  // Log-scale mapping so the useful hyperlocal range (100m-2km) isn't
  // crushed into a tiny sliver of the track at the low end.
  const kmToPercent = (km: number) => {
    const clamped = Math.min(MAX_KM, Math.max(MIN_KM, km))
    return ((Math.log(clamped) - LOG_MIN_KM) / (LOG_MAX_KM - LOG_MIN_KM)) * 100
  }

  const percentToKm = (percent: number) => {
    const clampedPercent = Math.min(100, Math.max(0, percent))
    const logKm = LOG_MIN_KM + (clampedPercent / 100) * (LOG_MAX_KM - LOG_MIN_KM)
    return roundKm(Math.exp(logKm))
  }

  const percent = kmToPercent(distanceKm)

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = ((clientX - rect.left) / rect.width) * 100
    onChange(percentToKm(ratio))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    updateFromClientX(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    updateFromClientX(e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setDragging(false)
  }

  return (
    <div className={`mx-4 mt-3 p-4 ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ opacity: 0.6, color: isDark ? '#F8F7F4' : '#12203c' }}>
          Distance
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: isDark ? '#F8F7F4' : '#12203c' }}>
            {formatSliderLabel(distanceKm, unit)}
          </span>
          <button
            type="button"
            onClick={onToggleUnit}
            className="text-[10px] font-bold rounded-full px-2 py-0.5"
            style={{
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.4)',
            }}
          >
            {unit === 'mi' ? 'mi' : 'km'}
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative w-full rounded-full mt-3"
        style={{
          height: '12px',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          touchAction: 'none',
          cursor: 'pointer',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: '#7C3AED',
            boxShadow: '0 0 12px rgba(124,58,237,0.6)',
          }}
        />

        <div
          className="absolute top-1/2 flex items-center justify-center"
          style={{
            left: `${percent}%`,
            transform: 'translate(-50%, -50%)',
            width: '44px',
            height: '44px',
            touchAction: 'none',
          }}
        >
          <ProxPinThumb size={36} />
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChip, setActiveChip] = useState('All')
  const [unit, setUnit] = useState<'km' | 'mi'>('km')
  const [distanceKm, setDistanceKm] = useState(MAX_KM)
  const supabase = createBrowserClient()

  useEffect(() => {
    try {
      const isUS = navigator.language === 'en-US'
      setUnit(isUS ? 'mi' : 'km')
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
      (err) => setGeoError(err.message),
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

      if (!error && data) setDeals(data)
      setLoading(false)
    }

    fetchDeals()

    const channel = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'mi' ? 'km' : 'mi'))
  }

  const maxDistanceMeters = distanceKm * 1000

  const processedDeals = deals
    .map((deal) => {
      const dist =
        userLat !== null && userLng !== null
          ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
          : null
      return { ...deal, distance: dist }
    })
    .filter((deal) => {
      if (deal.distance !== null && deal.distance > maxDistanceMeters) return false

      if (activeChip === 'All') return true
      if (activeChip === 'Deals') return deal.post_type === 'deal'
      if (activeChip === 'Open Now') return deal.post_type === 'open'

      const cats: string[] = deal.categories || []
      if (cats.length === 0) return true
      return cats.includes(activeChip)
    })
    .sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0
      return a.distance - b.distance
    })

  const textColor = isDark ? '#F8F7F4' : '#12203c'

  return (
    <main className="min-h-screen pb-28 relative flex flex-col">
      <header className="px-4 pt-4 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black" style={{ color: textColor }}>Prox Feed</h1>
          <p className="text-xs opacity-60" style={{ color: textColor }}>Live deals near you</p>
        </div>
        <a
          href="/post"
          className="text-xs font-bold px-3 py-2 rounded-xl text-white"
          style={{ background: '#7C3AED', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}
        >
          + Post Deal
        </a>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 sticky top-14 z-30 backdrop-blur no-scrollbar">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeChip === chip.label
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => setActiveChip(chip.label)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
              style={
                isActive
                  ? {
                      background: '#7C3AED',
                      color: '#F8F7F4',
                      borderColor: '#7C3AED',
                      boxShadow: '0 0 24px rgba(124,58,237,0.6)',
                    }
                  : isDark
                  ? {
                      background: 'rgba(255,255,255,0.08)',
                      color: textColor,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.6)',
                      color: textColor,
                      borderColor: 'rgba(124,58,237,0.15)',
                    }
              }
            >
              {chip.emoji && <span>{chip.emoji}</span>}
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      <DistanceSlider
        distanceKm={distanceKm}
        onChange={setDistanceKm}
        unit={unit}
        onToggleUnit={toggleUnit}
        isDark={isDark}
      />

      <div className="px-4 mt-4">
        {geoError && (
          <div
            className={`mb-4 p-4 rounded-xl flex flex-col gap-2 text-xs ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}
            style={{ color: textColor }}
          >
            <span>Enable location to see deals near you</span>
            <button
              onClick={() => window.location.reload()}
              className="self-start font-bold text-[10px] px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#7C3AED' }}
            >
              Retry Location
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 opacity-50 font-medium" style={{ color: textColor }}>
            Loading live deals...
          </div>
        ) : processedDeals.length === 0 ? (
          <div className={`text-center py-20 p-8 ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
            <p className="font-bold mb-1" style={{ color: textColor }}>No live deals match your filters.</p>
            <p className="text-xs opacity-60" style={{ color: textColor }}>
              Try widening the distance or clearing category filters!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
