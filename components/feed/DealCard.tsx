'use client'

import React from 'react'
import Link from 'next/link'
import { Deal } from '@/lib/deals/types'
import { calculateDistance } from '@/lib/geo/distance'
import GoToDealButton from './GoToDealButton'

interface DealCardProps {
  deal: Deal
  userLat: number | null
  userLng: number | null
}

export default function DealCard({ deal, userLat, userLng }: DealCardProps) {
  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
      : null

  return (
    <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {distance !== null && (
        <span className="absolute top-4 right-4 bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {distance}m away
        </span>
      )}

      <Link href={`/deal/${deal.id}`} className="block mb-2 pr-20">
        <h3 className="text-xl font-black text-gray-900 hover:text-blue-600 transition-colors">{deal.title}</h3>
      </Link>

      <p className="text-gray-600 text-sm mb-4">{deal.description}</p>

      {deal.price_display && (
        <div className="mb-4 inline-block bg-gray-100 text-gray-900 text-2xl font-black px-3 py-1.5 rounded-xl">
          {deal.price_display} {deal.currency_code}
        </div>
      )}

      <div className="space-y-3">
        <GoToDealButton lat={deal.lat} lng={deal.lng} distanceMeters={distance} />
        <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
          <span>Expires: {new Date(deal.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-medium">Live Ad</span>
        </div>
      </div>
    </div>
  )
}
