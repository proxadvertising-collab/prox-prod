'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { calculateDistance, formatDistance } from '@/lib/distance'
import { useTheme } from '@/contexts/ThemeContext'
import type { Deal, Profile, Business } from '@/types/database'

type DealWithJoins = Deal & { businesses: Business | null; profile?: Profile | null }

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createBrowserClient()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#F8F7F4' : '#12203c'

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
    return (
      <div className="text-center py-20 opacity-50 font-medium" style={{ color: textColor }}>
        Loading deal...
      </div>
    )
  }

  if (notFound || !deal) {
    return (
      <main className="min-h-screen max-w-[430px] mx-auto p-6 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold" style={{ color: textColor }}>Deal not found</h1>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#7C3AED' }}
        >
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
    <main className="min-h-screen max-w-[430px] mx-auto pb-24 flex flex-col">
      <div className="px-4 py-4">
        <button onClick={() => router.push('/')} className="text-sm font-semibold opacity-60" style={{ color: textColor }}>
          ← Back to Feed
        </button>
      </div>

      <div className="px-4">
        <div className={`p-4 ${isDark ? 'glass-card-dark' : 'glass-card-light'}`}>
          {deal.image_url ? (
            <img src={deal.image_url} alt={deal.title} className="w-full h-56 object-cover rounded-2xl" />
          ) : (
            <div
              className="w-full h-48 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #080813 100%)' }}
            >
              <span className="wordmark text-white text-2xl" style={{ opacity: 0.08 }}>PrOx</span>
            </div>
          )}

          <div className="pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs opacity-50" style={{ color: textColor }}>{deal.businesses?.name || 'Local Business'}</span>
              <div className="flex gap-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: deal.post_type === 'open' ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.15)',
                    color: deal.post_type === 'open' ? '#a78bfa' : '#60a5fa',
                  }}
                >
                  {deal.post_type === 'open' ? "We're Open" : 'Deal'}
                </span>
                {distance !== null && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                  >
                    {formatDistance(distance)}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-black" style={{ color: textColor }}>{deal.title}</h1>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: textColor }}>{deal.description}</p>

            {deal.price_display && (
              <div
                className="inline-block text-2xl font-black px-4 py-2 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.12)', color: textColor }}
              >
                {deal.price_display}
              </div>
            )}

            {profile && (profile.instagram_url || profile.facebook_url || profile.tiktok_url || profile.yelp_url || profile.google_maps_url || profile.website_url) && (
              <div className="pt-3 space-y-2" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
                <p className="text-xs font-bold opacity-50 uppercase" style={{ color: textColor }}>Business Socials</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>Instagram</a>}
                  {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>Facebook</a>}
                  {profile.tiktok_url && <a href={profile.tiktok_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>TikTok</a>}
                  {profile.yelp_url && <a href={profile.yelp_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>Yelp</a>}
                  {profile.google_maps_url && <a href={profile.google_maps_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>Google Maps</a>}
                  {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(124,58,237,0.1)', color: textColor }}>Website</a>}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleGoNow}
                className="w-full h-12 font-bold rounded-xl text-sm text-white"
                style={{ background: '#7C3AED', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}
              >
                GO NOW! 🚀
              </button>
              <button
                onClick={handleShare}
                className="w-full h-12 font-bold rounded-xl text-sm"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.1)', color: textColor }}
              >
                {copied ? 'Link Copied!' : 'Share Deal 🔗'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
