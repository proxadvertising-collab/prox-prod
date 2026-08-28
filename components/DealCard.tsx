'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { calculateDistance, formatDistance } from '@/lib/distance'
import { useTheme } from '@/contexts/ThemeContext'

interface DealCardProps {
  deal: any
  userLat: number | null
  userLng: number | null
}

export default function DealCard({ deal, userLat, userLng }: DealCardProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
      : null

  const handleGoNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  const handleCardClick = () => {
    router.push(`/deal/${deal.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`h-[110px] flex flex-row p-[10px] gap-3 cursor-pointer ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}
    >
      {deal.image_url ? (
        <img
          src={deal.image_url}
          alt={deal.title}
          className="w-[90px] h-[90px] rounded-[16px] object-cover shrink-0"
        />
      ) : (
        <div
          className="w-[90px] h-[90px] rounded-[16px] shrink-0 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #080813 100%)' }}
        >
          <span className="wordmark text-white text-xs" style={{ opacity: 0.08 }}>PrOx</span>
        </div>
      )}

      <div className="flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-[14px] font-semibold line-clamp-1"
              style={{ color: isDark ? '#F8F7F4' : '#12203c' }}
            >
              {deal.title}
            </h3>
            {distance !== null && (
              <span
                className="text-[11px] px-2 py-[3px] rounded-full shrink-0"
                style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: isDark ? '#c4b5fd' : '#6d28d9',
                }}
              >
                {formatDistance(distance)}
              </span>
            )}
          </div>
          <p
            className="text-[12px] line-clamp-1"
            style={{ opacity: 0.5, color: isDark ? '#F8F7F4' : '#12203c' }}
          >
            {deal.businesses?.name || 'Local Business'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold px-2 py-[2px] rounded-full"
            style={{
              background: deal.post_type === 'open' ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.15)',
              color: deal.post_type === 'open' ? '#a78bfa' : '#60a5fa',
            }}
          >
            {deal.post_type === 'open' ? "We're Open" : 'Deal'}
          </span>

          <button
            onClick={handleGoNow}
            className="text-xs font-bold px-3 py-[6px] rounded-full text-white"
            style={{
              background: '#7C3AED',
              boxShadow: '0 0 16px rgba(124,58,237,0.5)',
            }}
          >
            GO NOW
          </button>
        </div>
      </div>
    </div>
  )
}
