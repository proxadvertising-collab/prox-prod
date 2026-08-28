'use client'

import React from 'react'
import { Deal } from '@/lib/deals/types'
import DealCard from './DealCard'

interface FeedListProps {
  deals: Deal[]
  userLat: number | null
  userLng: number | null
}

export default function FeedList({ deals, userLat, userLng }: FeedListProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <p className="text-gray-500 font-medium">No live deals available right now.</p>
        <p className="text-gray-400 text-sm mt-1">Check back later for nearby offers!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} userLat={userLat} userLng={userLng} />
      ))}
    </div>
  )
}
