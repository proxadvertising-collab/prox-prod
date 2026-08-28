'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { calculateDistance, formatDistance } from '@/lib/distance'

interface DealCardProps {
  deal: any
  userLat: number | null
  userLng: number | null
}

export default function DealCard({ deal, userLat, userLng }: DealCardProps) {
  const router = useRouter()

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
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col"
    >
      {deal.image_url ? (
        <img src={deal.image_url} alt={deal.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center text-white font-black text-xl tracking-wider">
          PROX LIVE
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500">{deal.businesses?.name || 'Local Business'}</span>
            <div className="flex gap-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deal.post_type === 'open' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {deal.post_type === 'open' ? "We're Open" : 'Deal'}
              </span>
              {distance !== null && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {formatDistance(distance)}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-black text-gray-900 mb-1">{deal.title}</h3>
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">{deal.description}</p>

          {deal.price_display && (
            <div className="inline-block bg-gray-100 text-gray-900 text-lg font-black px-3 py-1 rounded-xl">
              {deal.price_display}
            </div>
          )}
        </div>

        <button
          onClick={handleGoNow}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
        >
          GO NOW! 🚀
        </button>
      </div>
    </div>
  )
}
