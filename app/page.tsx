'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance } from '@/lib/distance'
import DealCard from '@/components/DealCard'
import { useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { getDoor } from '@/lib/door'

const CATEGORY_CHIPS = [
  { key: 'All', label: 'All' },
  { key: 'Restaurants', label: 'Food' },
  { key: 'Coffee', label: 'Coffee' },
  { key: 'Bars', label: 'Bars' },
  { key: 'Street Food', label: 'Street food' },
  { key: 'Hotels', label: 'Stay' },
  { key: 'Attractions', label: 'See' },
  { key: 'Shopping', label: 'Shop' },
  { key: 'Services', label: 'Services' },
  { key: 'Wellness', label: 'Wellness' },
  { key: 'Convenience', label: 'Store' },
  { key: 'Deals', label: 'Deals' },
  { key: 'Open Now', label: 'Open' },
]

const METERS_PER_MI = 1609.34
const STEPS_MI = [0.1, 0.15, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25] as const
const HUA_HIN_LAT = 12.5684
const HUA_HIN_LNG = 99.9577

const DISTANCE_LINES = [
  "Let's go find some treasure!",
  'Proximity ALERT!',
  "Let's get some steps in",
  "Where we going, boss?",
  'Hunt mode: ON',
  "What's cooking near you?",
  'GO NOW energy',
  'Pocket radar locked',
  'Walkable wins only',
  'Round the corner?',
  'Feed the map gremlin',
  "Local or it didn't happen",
  'Boss wants options',
  'Steps → snacks',
  'Tiny quest radius',
  "Who's open near us?",
  'Pull the pin closer',
  'Neighborhood roulette',
  'Fresh air + deals',
  'Make the phone useful',
  'Check the block',
  'Treasure within walking',
  'Dial in the hunt',
  'Prox is curious',
  'Ready when you are',
  'Keep it close',
  'Stretch the legs',
  'Find the good stuff',
  'One mile miracles',
  "Let's roll, captain",
] as const

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
  const [line] = useState(
    () => DISTANCE_LINES[Math.floor(Math.random() * DISTANCE_LINES.length)]
  )
  const surface = isDark ? '#12121A' : '#FFFFFF'
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)'
  const text = isDark ? '#F7F3FB' : '#1A1523'

  return (
    <div
      className="mx-4 mt-2 px-4 pt-4 pb-3 rounded-2xl"
      style={{ touchAction: 'none', userSelect: 'none', background: surface, border }}
    >
      <div className="flex justify-between items-baseline gap-3 mb-3">
        <span className="text-[13px] font-semibold min-w-0" style={{ color: text }}>
          {line}
        </span>
        <span className="text-[15px] font-bold tabular-nums" style={{ color: '#5D20B5' }}>
          {STEPS_MI[currentIndex]} mi
        </span>
      </div>

      <div className="relative flex items-center" style={{ height: 44, touchAction: 'none' }}>
        <div
          className="absolute w-full rounded-full"
          style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26,21,35,0.1)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: '#5D20B5' }}
          />
        </div>

        <div
          className="absolute top-1/2 pointer-events-none"
          style={{
            left: `${percent}%`,
            transform: 'translate(-50%,-50%)',
            zIndex: 5,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: '#5D20B5',
            boxShadow: `0 0 0 3px ${isDark ? '#12121A' : '#FFFFFF'}`,
          }}
        />

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
            height: 44,
            margin: 0,
            zIndex: 10,
            WebkitAppearance: 'none',
            touchAction: 'none',
          }}
          aria-label="Distance filter in miles"
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(247,243,251,0.45)' : 'rgba(26,21,35,0.4)' }}>
          {STEPS_MI[0]} mi
        </span>
        <span className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(247,243,251,0.45)' : 'rgba(26,21,35,0.4)' }}>
          {STEPS_MI[STEPS_MI.length - 1]} mi
        </span>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const [doorReady, setDoorReady] = useState(false)
  const [userLat, setUserLat] = useState<number>(HUA_HIN_LAT)
  const [userLng, setUserLng] = useState<number>(HUA_HIN_LNG)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChip, setActiveChip] = useState('All')
  const [miles, setMiles] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [pullPx, setPullPx] = useState(0)
  const pullStartY = useRef(0)
  const pulling = useRef(false)
  const supabase = useMemo(() => createBrowserClient(), [])

  const requestGeo = useCallback(() => {
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
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [])

  const fetchDeals = useCallback(async () => {
    const now = new Date().toISOString()
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*, businesses(name, currency)')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
      if (!error && data) setDeals(data)
      else setDeals([])
    } catch {
      setDeals([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    const door = getDoor()
    if (!door) {
      router.replace('/welcome')
      return
    }
    if (door === 'shopper') {
      setDoorReady(true)
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (door === 'business') {
        router.replace(data.user ? '/business' : '/login?next=/business')
      } else {
        router.replace(data.user ? '/account' : '/login?next=/account')
      }
    })
  }, [router, supabase])

  useEffect(() => {
    if (!doorReady) return
    requestGeo()
  }, [doorReady, requestGeo])

  useEffect(() => {
    if (!doorReady) return
    fetchDeals()
    const channel = supabase
      .channel('public:deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => fetchDeals())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchDeals, doorReady])

  const onRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    requestGeo()
    await fetchDeals()
  }, [refreshing, requestGeo, fetchDeals])

  const onListTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 8 || refreshing) {
      pulling.current = false
      return
    }
    pulling.current = true
    pullStartY.current = e.touches[0].clientY
  }

  const onListTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return
    if (window.scrollY > 8) {
      pulling.current = false
      setPullPx(0)
      return
    }
    const dy = e.touches[0].clientY - pullStartY.current
    setPullPx(dy > 0 ? Math.min(dy * 0.45, 72) : 0)
  }

  const onListTouchEnd = () => {
    if (!pulling.current) return
    pulling.current = false
    const shouldRefresh = pullPx >= 52
    setPullPx(0)
    if (shouldRefresh) onRefresh()
  }

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

  if (!doorReady) return null

  return (
    <main className="min-h-screen pb-20 flex flex-col">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 sticky top-14 z-30 backdrop-blur no-scrollbar">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeChip === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setActiveChip(chip.key)}
              className="shrink-0 rounded-full text-[13px] font-semibold"
              style={{
                minHeight: 40,
                padding: '0 16px',
                background: isActive ? '#5D20B5' : isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                color: isActive ? '#F7F3FB' : textColor,
                border: isActive
                  ? '1px solid #5D20B5'
                  : isDark
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(26,21,35,0.08)',
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <DistanceSlider miles={miles} onChange={setMiles} isDark={isDark} />

      <div
        className="px-4 mt-4"
        style={{ overscrollBehaviorY: 'contain' }}
        onTouchStart={onListTouchStart}
        onTouchMove={onListTouchMove}
        onTouchEnd={onListTouchEnd}
        onTouchCancel={onListTouchEnd}
      >
        <div
          className="flex items-center justify-center overflow-hidden text-xs font-semibold"
          style={{
            height: refreshing ? 36 : pullPx,
            color: '#5D20B5',
            opacity: refreshing || pullPx > 12 ? 1 : 0,
          }}
        >
          {refreshing ? 'Refreshing…' : pullPx >= 52 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
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
