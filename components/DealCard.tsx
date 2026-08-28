'use client'

import React from 'react'
import { calculateDistance, formatDistance, formatTimeLeft } from '@/lib/distance'

interface DealCardProps {
  deal: any
  userLat: number | null
  userLng: number | null
}

export default function DealCard({ deal, userLat, userLng }: DealCardProps) {
  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
      : null

  const handleGoToDeal = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${deal.lat},${deal.lng}&dirflg=w`
      : `https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-gray-900">{deal.title}</h3>
          {distance !== null && (
            <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {formatDistance(distance)}
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3">{deal.description}</p>
        {deal.price_display && (
          <div className="inline-block bg-gray-100 text-gray-900 text-xl font-black px-3 py-1 rounded-xl mb-2">
            {deal.price_display}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-50">
        <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
          <span>{deal.businesses?.name || 'Local Business'}</span>
          <span className="text-amber-600 font-semibold">{formatTimeLeft(deal.expires_at)}</span>
        </div>
        <button
          onClick={handleGoToDeal}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          Go to Deal →
        </button>
      </div>
    </div>
  )
}
