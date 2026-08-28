'use client'

import React, { useState } from 'react'

interface LocationButtonProps {
  onLocation: (lat: number, lng: number, accuracy: number) => void
}

export default function LocationButton({ onLocation }: LocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        onLocation(pos.coords.latitude, pos.coords.longitude, Math.round(pos.coords.accuracy))
      },
      (err) => {
        setLoading(false)
        setError(err.message)
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-gray-200 transition-colors"
      >
        <span>📍</span> {loading ? 'Locating...' : 'Use My Current Location'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
