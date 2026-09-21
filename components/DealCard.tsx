'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { calculateDistance } from '@/lib/distance'
import { useTheme } from '@/contexts/ThemeContext'
import ProfileSocials from '@/components/ProfileSocials'

const METERS_PER_MI = 1609.34

function formatMiles(meters: number): string {
  const mi = meters / METERS_PER_MI
  if (mi < 10) return `${mi.toFixed(1)} mi`
  return `${Math.round(mi)} mi`
}

interface DealCardProps {
  deal: any
  userLat: number | null
  userLng: number | null
}

export default function DealCard({ deal, userLat, userLng }: DealCardProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const titleColor = isDark ? '#F7F3FB' : '#1A1523'
  const muted = isDark ? 'rgba(247,243,251,0.65)' : 'rgba(26,21,35,0.62)'

  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, Number(deal.lat), Number(deal.lng))
      : null

  const handleGoNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  const price = deal.price_display || deal.original_price || null

  return (
    <article
      onClick={() => router.push(`/deal/${deal.id}`)}
      className="flex flex-col overflow-hidden cursor-pointer"
      style={{
        borderRadius: 20,
        background: isDark ? '#12121A' : '#FFFFFF',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)',
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(26,21,35,0.06)',
      }}
    >
      {deal.image_url ? (
        <img
          src={deal.image_url}
          alt={deal.title}
          className="w-full object-cover"
          style={{ height: 180 }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{ height: 180, background: isDark ? '#1A1523' : '#EDE7F6' }}
        >
          <img src="/prox-radar-o.svg" alt="" width={56} height={56} />
        </div>
      )}

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[17px] font-bold leading-snug line-clamp-2"
            style={{ color: titleColor }}
          >
            {deal.title}
          </h3>
          {distance !== null && (
            <span
              className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(93,32,181,0.14)',
                color: isDark ? '#E9D5FF' : '#5D20B5',
              }}
            >
              {formatMiles(distance)}
            </span>
          )}
        </div>

        <p className="text-[13px] font-medium line-clamp-1" style={{ color: muted }}>
          {deal.businesses?.name || 'Local Business'}
        </p>

        {price && (
          <p className="text-[15px] font-bold" style={{ color: '#F25A17' }}>
            {price}
            {deal.original_price && deal.price_display && deal.original_price !== deal.price_display ? (
              <span className="ml-2 text-[12px] font-medium line-through" style={{ color: muted }}>
                {deal.original_price}
              </span>
            ) : null}
          </p>
        )}

        <div className="min-h-[24px]">
          <ProfileSocials
            profile={deal.profiles || deal.profile}
            textColor={isDark ? '#F7F3FB' : '#1A1523'}
            compact
          />
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{
              background:
                deal.post_type === 'open' ? 'rgba(93,32,181,0.16)' : 'rgba(242,90,23,0.14)',
              color: deal.post_type === 'open' ? (isDark ? '#D8B4FE' : '#5D20B5') : '#F25A17',
            }}
          >
            {deal.post_type === 'open' ? "We're Open" : 'Deal'}
          </span>

          <button
            type="button"
            onClick={handleGoNow}
            aria-label="GO NOW walking directions"
            className="shrink-0"
            style={{ width: 64, height: 64, padding: 0, background: 'transparent', border: 0 }}
          >
            <img src="/prox-go-now-button.svg" alt="GO NOW" width={64} height={64} />
          </button>
        </div>
      </div>
    </article>
  )
}
