'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance, formatDistance } from '@/lib/distance'
import type { Deal, Profile, Business } from '@/types/database'

type DealWithJoins = Deal & { businesses: Business | null; profile?: Profile | null }

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createBrowserClient()

  const [deal, setDeal] = useState<DealWithJoins | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude)
          setUserLng(pos.coords.longitude)
        },
        () => {},
        { enableHighAccuracy: true }
      )
    }
  }, [])

  useEffect(() => {
    async function loadDeal() {
      const { data: dealData, error } = await supabase
        .from('deals')
        .select('*, businesses(*)')
        .eq('id', id)
        .single()

      if (error || !dealData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      let profile: Profile | null = null
      if (dealData.owner_id) {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', dealData.owner_id)
          .single()
        profile = profData || null
      }

      setDeal({ ...dealData, profile })
      setLoading(false)
    }

    loadDeal()
  }, [id, supabase])

  const handleGoNow = () => {
    if (!deal) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.lat},${deal.lng}&travelmode=walking`
    window.open(url, '_blank')
  }

  const handleShare = () => {
    if (!deal) return
    const shareUrl = `https://prox.to/d/${deal.id}`
    if (navigator.share) {
      navigator.share({ title: deal.title, text: deal.description, url: shareUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-medium">Loading deal...</div>
  }

  if (notFound || !deal) {
    return (
      <main className="min-h-screen bg-white max-w-[430px] mx-auto p-6 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800">Deal not found</h1>
        <button onClick={() => router.push('/')} className="mt-4 bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold">
          Back to Feed
        </button>
      </main>
    )
  }

  const distance =
    userLat !== null && userLng !== null
      ? calculateDistance(userLat, userLng, deal.lat, deal.lng)
      : null

  const profile = deal.profile

  return (
    <main className="min-h-screen bg-white max-w-[430px] mx-auto pb-24 shadow-2xl flex flex-col">
      <div className="px-4 py-4">
        <button onClick={() => router.push('/')} className="text-sm font-semibold text-gray-500 hover:text-black">
          ← Back to Feed
        </button>
      </div>

      {deal.image_url ? (
        <img src={deal.image_url} alt={deal.title} className="w-full h-64 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center text-white font-black text-2xl tracking-wider">
          PROX LIVE
        </div>
      )}

      <div className="px-4 py-6 space-y-5">
        <div className="flex justify-between items-center">
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

        <h1 className="text-2xl font-black text-gray-900">{deal.title}</h1>
        <p className="text-gray-700 text-sm leading-relaxed">{deal.description}</p>

        {deal.price_display && (
          <div className="inline-block bg-gray-100 text-gray-900 text-2xl font-black px-4 py-2 rounded-xl">
            {deal.price_display}
          </div>
        )}

        {profile && (profile.instagram_url || profile.facebook_url || profile.tiktok_url || profile.yelp_url || profile.google_maps_url || profile.website_url) && (
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
          <button onClick={handleGoNow} className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors">
            GO NOW! 🚀
          </button>
          <button onClick={handleShare} className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl text-sm transition-colors">
            {copied ? 'Link Copied!' : 'Share Deal 🔗'}
          </button>
        </div>
      </div>
    </main>
  )
}
