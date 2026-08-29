'use client'

import React, { useEffect, useState } from 'react'
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

const KM_PER_MI = 1.60934
const STEPS_MI = [0.1, 0.15, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25] as const
const STEPS_KM = STEPS_MI.map(m => m * KM_PER_MI)

function formatLabel(distanceKm: number, unit: 'km' | 'mi', mi: number) {
  if (unit === 'mi') return `${mi}mi away`
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`
  return `${distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm)}km away`
}

function DistanceSlider({ distanceKm, onChange, unit, onToggleUnit, isDark }: {
  distanceKm: number; onChange: (km: number) => void; unit: 'km'|'mi'; onToggleUnit: () => void; isDark: boolean
}) {
  const idx = STEPS_KM.findIndex(k => Math.abs(k - distanceKm) < 0.001)
  const currentIndex = idx === -1? 5 : idx
  const percent = (currentIndex / (STEPS_MI.length - 1)) * 100

  const handleToggle = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleUnit()
  }

  return (
    <div
      className={`mx-4 mt-3 p-4 rounded-2xl ${isDark? 'glass-card-dark' : 'glass-card-light'}`}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs opacity-60" style={{ color: isDark? '#F8F7F4' : '#12203c' }}>Distance</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: isDark? '#F8F7F4' : '#12203c' }}>{formatLabel(distanceKm, unit, STEPS_MI[currentIndex])}</span>
          <button
            type="button"
            onClick={handleToggle}
            onTouchEnd={handleToggle}
            className="font-bold rounded-full"
            style={{
              position: 'relative',
              zIndex: 20,
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.1)',
              fontSize: '11px',
              padding: '6px 12px',
              minHeight: '32px',
              touchAction: 'manipulation',
            }}
          >
            {unit}
          </button>
        </div>
      </div>

      <div className="relative flex items-center" style={{ height: '44px', touchAction: 'none' }}>
        {/* background track */}
        <div
          className="absolute w-full rounded-full"
          style={{ height: '12px', background: isDark? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: '#7C3AED', boxShadow: '0 0 12px rgba(124,58,237,0.6)' }}
          />
        </div>

        {/* pin - visual only */}
        <div
          className="absolute top-1/2 pointer-events-none"
          style={{ left: `${percent}%`, transform: 'translate(-50%,-50%)', zIndex: 5 }}
        >
          <ProxPinThumb size={36} />
        </div>

        {/* real native slider on top - invisible but handles all touch/mouse */}
        <input
          type="range"
          min={0}
          max={STEPS_MI.length - 1}
          step={1}
          value={currentIndex}
          onChange={(e) => {
            const i = Number(e.target.value)
            onChange(STEPS_KM[i])
          }}
          className="absolute w-full opacity-0 cursor-pointer"
          style={{
            height: '44px',
            margin: 0,
            zIndex: 10,
            WebkitAppearance: 'none',
            touchAction: 'none',
          }}
          aria-label="Distance filter"
        />
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
  const [distanceKm, setDistanceKm] = useState(STEPS_KM[5])
  const supabase = createBrowserClient()

  useEffect(() => { try { setUnit(navigator.language === 'en-US'? 'mi' : 'km') } catch {} }, [])

  useEffect(() => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude) }, err => setGeoError(err.message), { enableHighAccuracy: true })
  }, [])

  useEffect(() => {
    async function fetchDeals() {
      const now = new Date().toISOString()
      const { data, error } = await supabase.from('deals').select('*, businesses(name, currency)').gt('expires_at', now).eq('is_active', true).order('created_at', { ascending: false })
      if (!error && data) setDeals(data)
      setLoading(false)
    }
    fetchDeals()
    const channel = supabase.channel('public:deals').on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const maxDistanceMeters = distanceKm * 1000
  const processedDeals = deals.map(d => ({...d, distance: userLat!== null && userLng!== null? calculateDistance(userLat, userLng, d.lat, d.lng) : null })).filter(d => {
    if (d.distance!== null && d.distance > maxDistanceMeters) return false
    if (activeChip === 'All') return true
    if (activeChip === 'Deals') return d.post_type === 'deal'
    if (activeChip === 'Open Now') return d.post_type === 'open'
    const cats: string[] = d.categories || []
    if (cats.length === 0) return true
    return cats.includes(activeChip)
  }).sort((a, b) => (a.distance === null || b.distance === null? 0 : a.distance - b.distance))

  const textColor = isDark? '#F8F7F4' : '#12203c'

  return (
    <main className="min-h-screen pb-20 flex flex-col">
      <header className="px-4 pt-4 pb-2 flex justify-between items-center">
        <div><h1 className="text-2xl font-black" style={{ color: textColor }}>Prox Feed</h1><p className="text-xs opacity-60" style={{ color: textColor }}>Live deals near you</p></div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 sticky top-0 z-30 backdrop-blur no-scrollbar">
        {CATEGORY_CHIPS.map(chip => {
          const isActive = activeChip === chip.label
          return <button key={chip.label} type="button" onClick={() => setActiveChip(chip.label)} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border" style={isActive? { background: '#7C3AED', color: '#F8F7F4', borderColor: '#7C3AED' } : isDark? { background: 'rgba(255,255,255,0.08)', color: textColor, borderColor: 'rgba(255,255,255,0.1)' } : { background: 'rgba(255,255,255,0.6)', color: textColor, borderColor: 'rgba(124,58,237,0.15)' }}>{chip.emoji && <span>{chip.emoji}</span>}<span>{chip.label}</span></button>
        })}
      </div>

      <DistanceSlider distanceKm={distanceKm} onChange={setDistanceKm} unit={unit} onToggleUnit={() => setUnit(p => p === 'mi'? 'km' : 'mi')} isDark={isDark} />

      <div className="px-4 mt-4">
        {geoError && <div className={`mb-4 p-4 rounded-xl text-xs ${isDark? 'glass-card-dark' : 'glass-card-light'}`} style={{ color: textColor }}>{geoError}</div>}
        {loading? <div className="text-center py-20 opacity-50" style={{ color: textColor }}>Loading...</div> : processedDeals.length === 0? <div className={`text-center py-20 p-8 ${isDark? 'glass-card-dark' : 'glass-card-light'}`}><p className="font-bold" style={{ color: textColor }}>No deals in range</p></div> : <div className="flex flex-col gap-3">{processedDeals.map(d => <DealCard key={d.id} deal={d} userLat={userLat} userLng={userLng} />)}</div>}
      </div>
    </main>
  )
}