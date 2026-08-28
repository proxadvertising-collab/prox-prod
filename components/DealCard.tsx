'use client'

import React, { useState } from 'react'
import { calculateDistance, formatDistance } from '@/lib/distance'

interface DealCardProps {
  deal: any
  userLat: number | null
  userLng: number | null
  profile?: any
}

export default function DealCard({ deal, userLat, userLng, profile }: DealCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
      : null

  const handleGoNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `https://prox.to/d/${deal.id}`
    if (navigator.share) {
      navigator.share({ title: deal.title, text: deal.description, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
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

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-sm">✕</button>

            {deal.image_url && <img src={deal.image_url} alt={deal.title} className="w-full h-40 object-cover rounded-xl" />}

            <div>
              <span className="text-xs font-bold text-gray-500">{deal.businesses?.name}</span>
              <h2 className="text-xl font-black text-gray-900 mt-1 mb-2">{deal.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
            </div>

            {deal.price_display && (
              <div className="inline-block bg-gray-100 text-gray-900 text-xl font-black px-3 py-1 rounded-xl">
                {deal.price_display}
              </div>
            )}

            {profile && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Business Socials</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">Instagram</a>}
                  {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">Facebook</a>}
                  {profile.tiktok_url && <a href={profile.tiktok_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">TikTok</a>}
                  {profile.yelp_url && <a href={profile.yelp_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">Yelp</a>}
                  {profile.google_maps_url && <a href={profile.google_maps_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">Google Maps</a>}
                  {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="bg-gray-100 px-3 py-1.5 rounded-lg font-medium text-gray-800 hover:bg-gray-200">Website</a>}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button onClick={handleGoNow} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center justify-center gap-2">
                GO NOW! 🚀
              </button>
              <button onClick={handleShare} className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl text-sm transition-colors">
                {copied ? 'Link Copied!' : 'Share Deal 🔗'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
