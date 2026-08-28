'use client'

import React from 'react'
import { calculateDistance } from '@/lib/geo/distance'

interface GoToDealButtonProps {
  lat: number
  lng: number
  distanceMeters: number | null
}

export default function GoToDealButton({ lat, lng, distanceMeters }: GoToDealButtonProps) {
  const go = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIOS
      ? `http://maps.apple.com/?daddr=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  const distText = distanceMeters !== null ? `${distanceMeters}m away` : 'View on map'

  return (
    <button
      onClick={go}
      className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
    >
      🧭 Go to Deal - {distText}
    </button>
  )
}
