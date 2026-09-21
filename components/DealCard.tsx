'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { calculateDistance } from '@/lib/distance'
import { openGoNow } from '@/lib/maps'
import { useTheme } from '@/contexts/ThemeContext'
import ProfileSocials from '@/components/ProfileSocials'

const METERS_PER_MI = 1609.34
const WALK_M_PER_MIN = 80
const THUMB = 80
const GO_NOW = 80

function formatMiles(meters: number): string {
  const mi = meters / METERS_PER_MI
  if (mi < 10) return `${mi.toFixed(1)} mi`
  return `${Math.round(mi)} mi`
}

function walkMins(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_M_PER_MIN))
}

function statusLine(deal: any): string | null {
  if (deal.post_type === 'open') return 'Open'
  if (!deal.expires_at) return null
  const diff = new Date(deal.expires_at).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours >= 24) return `Ends in ${Math.floor(hours / 24)}d`
  if (hours > 0) return `Ends in ${hours}h ${minutes}m`
  return `Ends in ${minutes}m`
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
  const muted = isDark ? 'rgba(247,243,251,0.62)' : 'rgba(26,21,35,0.58)'

  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, Number(deal.lat), Number(deal.lng))
      : null

  const handleGoNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    openGoNow(Number(deal.lat), Number(deal.lng), distance)
  }

  const price = deal.price_display || deal.original_price || null
  const status = statusLine(deal)
  const distanceText =
    distance !== null
      ? `${formatMiles(distance)} · ${walkMins(distance)} min walk`
      : null

  return (
    <article
      onClick={() => router.push(`/deal/${deal.id}`)}
      className="flex items-center gap-3 cursor-pointer"
      style={{
        padding: 12,
        borderRadius: 16,
        background: isDark ? '#12121A' : '#FFFFFF',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(26,21,35,0.08)',
      }}
    >
      {deal.image_url ? (
        <img
          src={deal.image_url}
          alt=""
          className="shrink-0 object-cover"
          style={{ width: THUMB, height: THUMB, borderRadius: 14 }}
        />
      ) : (
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: 14,
            background: isDark ? '#1A1523' : '#EDE7F6',
          }}
        >
          <img src="/prox-radar-o.svg" alt="" width={36} height={36} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h3
          className="text-[15px] font-bold leading-snug line-clamp-2"
          style={{ color: titleColor }}
        >
          {deal.title}
        </h3>
        <p className="text-[12px] font-medium line-clamp-1" style={{ color: muted }}>
          {deal.businesses?.name || 'Local Business'}
        </p>
        {distanceText ? (
          <p className="text-[12px] font-semibold line-clamp-1" style={{ color: '#5D20B5' }}>
            {distanceText}
          </p>
        ) : null}
        {price ? (
          <p className="text-[12px] font-bold line-clamp-1" style={{ color: '#F25A17' }}>
            {price}
          </p>
        ) : null}
        {status ? (
          <p className="text-[11px] font-medium line-clamp-1" style={{ color: muted }}>
            {status}
          </p>
        ) : null}
        <ProfileSocials
          profile={deal.profiles || deal.profile}
          textColor={isDark ? '#F7F3FB' : '#1A1523'}
          compact
        />
      </div>

      <button
        type="button"
        onClick={handleGoNow}
        aria-label="GO NOW walking directions"
        className="shrink-0"
        style={{ width: GO_NOW, height: GO_NOW, padding: 0, background: 'transparent', border: 0 }}
      >
        <img src="/prox-go-now-button.svg" alt="GO NOW" width={GO_NOW} height={GO_NOW} />
      </button>
    </article>
  )
}
