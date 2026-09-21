'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance } from '@/lib/distance'
import DealCard from '@/components/DealCard'
import ProxPinThumb from '@/components/ProxPinThumb'
import { useTheme } from '@/contexts/ThemeContext'

const CATEGORY_CHIPS = [
  { label: 'All', emoji: '' },
  { label: 'Restaurants', emoji: '🍴' },
  { label: 'Hotels', emoji: '🛏' },
  { label: 'Coffee', emoji: '☕' },
  { label: 'Attractions', emoji: '🎯' },
  { label: 'Bars', emoji: '🍺' },
  { label: 'Shopping', emoji: '🛍' },
  { label: 'Services', emoji: '💈' },
  { label: 'Wellness', emoji: '💪' },
  { label: 'Street Food', emoji: '🥤' },
  { label: 'Convenience', emoji: '📦' },
  { label: 'Deals', emoji: '🔥' },
  { label: 'Open Now', emoji: '📍' },
]

const METERS_PER_MI = 1609.34
const STEPS_MI = [0.1, 0.15, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25] as const
const HUA_HIN_LAT = 12.5684
const HUA_HIN_LNG = 99.9577

function DistanceSlider({
  miles,
  onChange,
  isDark,
}: {
  miles: number
  onChange: (mi: number) => void
  isDark: boolean
}) {
  const idx = STEPS_MI.findIndex((m) => Math.abs(m - miles) < 0.001)
  const currentIndex = idx === -1 ? 5 : idx
  const percent = (currentIndex / (STEPS_MI.length - 1)) * 100
  const surface = isDark ? '#12121A' : '#FFFFFF'
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)'
  const text = isDark ? '#F7F3FB' : '#1A1523'

  return (
    <div
      className="mx-4 mt-3 p-4 rounded-2xl"
      style={{ touchAction: 'none', userSelect: 'none', background: surface, border }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium opacity-60" style={{ color: text }}>
          Distance
        </span>
        <span className="text-sm font-bold" style={{ color: text }}>
          {STEPS_MI[currentIndex]} mi
        </span>
      </div>

      <div className="relative flex items-center" style={{ height: '44px', touchAction: 'none' }}>
        <div
          className="absolute w-full rounded-full"
          style={{ height: '12px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: '#5D20B5' }}
          />
        </div>

        <div
          className="absolute top-1/2 pointer-events-none"
          style={{ left: `${percent}%`, transform: 'translate(-50%,-50%)', zIndex: 5 }}
        >
          <ProxPinThumb size={36} />
        </div>

        <input
          type="range"
          min={0}
          max={STEPS_MI.length - 1}
          step={1}
          value={currentIndex}
          onChange={(e) => {
            const i = Number(e.target.value)
            onChange(STEPS_MI[i])
          }}
          className="absolute w-full cursor-pointer"
          style={{
            opacity: 0.01,
            height: '44px',
            margin: 0,
            zIndex: 10,
            WebkitAppearance: 'none',
            touchAction: 'none',
          }}
          aria-label="Distance filter in miles"
        />
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [userLat, setUserLat] = useState<number>(HUA_HIN_LAT)
  const [userLng, setUserLng] = useState<number>(HUA_HIN_LNG)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChip, setActiveChip] = useState('All')
  const [miles, setMiles] = useState(1)
  const supabase = useMemo(() => createBrowserClient(), [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported — showing Hua Hin')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setGeoError(null)
      },
      (err) => setGeoError(err.message),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchDeals() {
      const now = new Date().toISOString()
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*, businesses(name, currency)')
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gt.${now}`)
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (!error && data) setDeals(data)
        else setDeals([])
      } catch {
        if (!cancelled) setDeals([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDeals()
    const channel = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals())
      .subscribe()
    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const maxDistanceMeters = miles * METERS_PER_MI
  const processedDeals = deals
    .map((d) => ({
      ...d,
      distance: calculateDistance(userLat, userLng, Number(d.lat), Number(d.lng)),
    }))
    .filter((d) => {
      if (d.distance > maxDistanceMeters) return false
      if (activeChip === 'All') return true
      if (activeChip === 'Deals') return d.post_type === 'deal'
      if (activeChip === 'Open Now') return d.post_type === 'open'
      const cats: string[] = d.categories || []
      if (cats.length === 0) return true
      return cats.includes(activeChip)
    })
    .sort((a, b) => a.distance - b.distance)

  const textColor = isDark ? '#F7F3FB' : '#1A1523'
  const surface = isDark ? '#12121A' : '#FFFFFF'
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)'

  return (
    <main className="min-h-screen pb-20 flex flex-col">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 sticky top-14 z-30 backdrop-blur no-scrollbar">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeChip === chip.label
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => setActiveChip(chip.label)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={
                isActive
                  ? { background: '#5D20B5', color: '#F7F3FB', borderColor: '#5D20B5' }
                  : isDark
                    ? { background: 'rgba(255,255,255,0.08)', color: textColor, borderColor: 'rgba(255,255,255,0.1)' }
                    : { background: '#FFFFFF', color: textColor, borderColor: 'rgba(26,21,35,0.08)' }
              }
            >
              {chip.emoji ? <span>{chip.emoji}</span> : null}
              <span>{chip.label}</span>
            </button>
          )
        })}
      </div>

      <DistanceSlider miles={miles} onChange={setMiles} isDark={isDark} />

      <div className="px-4 mt-4">
        {geoError ? (
          <div className="mb-4 p-4 rounded-xl text-xs" style={{ color: textColor, background: surface, border }}>
            {geoError}
          </div>
        ) : null}
        {loading ? (
          <div className="text-center py-20 opacity-50" style={{ color: textColor }}>
            Loading...
          </div>
        ) : processedDeals.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-2xl" style={{ background: surface, border }}>
            <p className="font-bold" style={{ color: textColor }}>
              No deals in range
            </p>
            <p className="mt-2 text-sm opacity-70" style={{ color: textColor }}>
              Try widening the distance slider
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {processedDeals.map((d) => (
              <DealCard key={d.id} deal={d} userLat={userLat} userLng={userLng} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
